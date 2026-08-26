from __future__ import annotations

import hashlib
import math
import re
from dataclasses import dataclass
from typing import Protocol

from langchain_core.embeddings import Embeddings


class LocalHashEmbeddings(Embeddings):
    """Deterministic local embedding for credential-free development and evaluation."""

    dimensions = 384
    stopwords = {
        "a",
        "an",
        "and",
        "are",
        "as",
        "at",
        "be",
        "by",
        "does",
        "for",
        "from",
        "how",
        "in",
        "is",
        "it",
        "of",
        "on",
        "or",
        "the",
        "to",
        "what",
        "when",
        "where",
        "which",
        "who",
        "with",
    }

    def _embed(self, text: str) -> list[float]:
        vector = [0.0] * self.dimensions
        tokens = [
            token for token in re.findall(r"[a-z0-9]+", text.lower()) if token not in self.stopwords
        ]
        for token in tokens:
            digest = hashlib.sha256(token.encode("utf-8")).digest()
            index = int.from_bytes(digest[:4], "big") % self.dimensions
            vector[index] += 1.0
        magnitude = math.sqrt(sum(value * value for value in vector)) or 1.0
        return [value / magnitude for value in vector]

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [self._embed(text) for text in texts]

    def embed_query(self, text: str) -> list[float]:
        return self._embed(text)


@dataclass(frozen=True)
class VectorRecord:
    project_id: str
    chunk_id: str
    source_id: str
    source_name: str
    content: str
    vector: list[float]


@dataclass(frozen=True)
class VectorMatch:
    record: VectorRecord
    score: float


class VectorStore(Protocol):
    def replace_source(
        self, project_id: str, source_id: str, records: list[VectorRecord]
    ) -> None: ...

    def similarity_search(
        self, project_id: str, query_vector: list[float], top_k: int
    ) -> list[VectorMatch]: ...


def cosine_similarity(left: list[float], right: list[float]) -> float:
    if len(left) != len(right):
        raise ValueError("Embedding dimensions do not match")
    left_norm = math.sqrt(sum(value * value for value in left))
    right_norm = math.sqrt(sum(value * value for value in right))
    if not left_norm or not right_norm:
        return 0.0
    score = sum(a * b for a, b in zip(left, right, strict=True)) / (left_norm * right_norm)
    return max(0.0, min(1.0, score))


class InMemoryVectorStore:
    """Real vector similarity retrieval; deliberately ephemeral across function instances."""

    def __init__(self) -> None:
        self._records: list[VectorRecord] = []

    def replace_source(self, project_id: str, source_id: str, records: list[VectorRecord]) -> None:
        self._records = [
            record
            for record in self._records
            if not (record.project_id == project_id and record.source_id == source_id)
        ]
        self._records.extend(records)

    def similarity_search(
        self, project_id: str, query_vector: list[float], top_k: int
    ) -> list[VectorMatch]:
        matches = [
            VectorMatch(record, cosine_similarity(query_vector, record.vector))
            for record in self._records
            if record.project_id == project_id
        ]
        return sorted(matches, key=lambda match: match.score, reverse=True)[:top_k]
