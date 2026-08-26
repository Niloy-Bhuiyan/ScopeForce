from __future__ import annotations

import os
import re

from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

from ai.providers import DeterministicGroundedProvider, GenerationProvider, OpenAIGenerationProvider
from ai.schemas import (
    ClarificationResponse,
    IngestRequest,
    IngestResponse,
    RequirementsResponse,
    RetrievalMatch,
    RetrievalResponse,
)
from ai.vector_store import InMemoryVectorStore, LocalHashEmbeddings, VectorRecord, VectorStore


def clean_text(content: str) -> str:
    content = content.replace("\r\n", "\n").replace("\r", "\n")
    content = re.sub(r"[\t ]+", " ", content)
    content = re.sub(r"\n{3,}", "\n\n", content)
    return content.strip()


class RagService:
    minimum_relevance = 0.08

    def __init__(
        self,
        store: VectorStore | None = None,
        embeddings: LocalHashEmbeddings | OpenAIEmbeddings | None = None,
        provider: GenerationProvider | None = None,
    ) -> None:
        has_openai = bool(os.getenv("OPENAI_API_KEY"))
        self.store = store or InMemoryVectorStore()
        self.embeddings = embeddings or (
            OpenAIEmbeddings(model=os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small"))
            if has_openai
            else LocalHashEmbeddings()
        )
        self.embedding_provider = (
            "openai" if isinstance(self.embeddings, OpenAIEmbeddings) else "local-hash"
        )
        self.provider = provider or (
            OpenAIGenerationProvider() if has_openai else DeterministicGroundedProvider()
        )
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=700,
            chunk_overlap=100,
            separators=["\n\n", "\n", ". ", " ", ""],
        )

    def ingest(self, request: IngestRequest) -> IngestResponse:
        chunk_total = 0
        for source in request.documents:
            document = Document(
                page_content=clean_text(source.content),
                metadata={
                    "project_id": request.project_id,
                    "source_id": source.source_id,
                    "source_name": source.name,
                },
            )
            chunks = self.splitter.split_documents([document])
            texts = [chunk.page_content for chunk in chunks]
            vectors = self.embeddings.embed_documents(texts)
            records = [
                VectorRecord(
                    project_id=request.project_id,
                    chunk_id=f"{source.source_id}-CH-{index + 1:03d}",
                    source_id=source.source_id,
                    source_name=source.name,
                    content=chunk.page_content,
                    vector=vector,
                )
                for index, (chunk, vector) in enumerate(zip(chunks, vectors, strict=True))
            ]
            self.store.replace_source(request.project_id, source.source_id, records)
            chunk_total += len(records)
        return IngestResponse(
            project_id=request.project_id,
            document_count=len(request.documents),
            chunk_count=chunk_total,
            embedding_provider=self.embedding_provider,
        )

    def retrieve(self, project_id: str, query: str, top_k: int) -> RetrievalResponse:
        vector = self.embeddings.embed_query(clean_text(query))
        matches = self.store.similarity_search(project_id, vector, top_k)
        relevant = [match for match in matches if match.score >= self.minimum_relevance]
        return RetrievalResponse(
            matches=[
                RetrievalMatch(
                    chunk_id=match.record.chunk_id,
                    source_id=match.record.source_id,
                    source_name=match.record.source_name,
                    content=match.record.content,
                    score=round(match.score, 4),
                )
                for match in relevant
            ],
            sufficient_context=bool(relevant),
        )

    async def clarify(self, project_id: str, topic: str, top_k: int) -> ClarificationResponse:
        retrieval = self.retrieve(project_id, topic, top_k)
        return await self.provider.clarify(topic, retrieval.matches)

    async def requirements(self, project_id: str, topic: str, top_k: int) -> RequirementsResponse:
        retrieval = self.retrieve(project_id, topic, top_k)
        return await self.provider.requirements(topic, retrieval.matches)
