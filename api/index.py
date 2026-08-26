import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from ai.providers import ProviderError
from ai.rag import RagService
from ai.schemas import (
    ClarificationResponse,
    ContextRequest,
    HealthResponse,
    IngestRequest,
    IngestResponse,
    RequirementsResponse,
    RetrievalRequest,
    RetrievalResponse,
)

app = FastAPI(
    title="ScopeForce Project Context Intelligence",
    version="0.1.0",
    docs_url="/api/ai/docs",
    openapi_url="/api/ai/openapi.json",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
service = RagService()


@app.get("/api/ai/health", response_model=HealthResponse)
def health() -> HealthResponse:
    configured = bool(os.getenv("OPENAI_API_KEY"))
    return HealthResponse(
        ai_provider="openai" if configured else "not-configured",
        embedding_provider=service.embedding_provider,
    )


@app.post("/api/ai/ingest", response_model=IngestResponse)
def ingest(request: IngestRequest) -> IngestResponse:
    try:
        return service.ingest(request)
    except Exception as exc:
        raise HTTPException(
            status_code=503, detail="Context indexing failed; project was not changed"
        ) from exc


@app.post("/api/ai/retrieve", response_model=RetrievalResponse)
def retrieve(request: RetrievalRequest) -> RetrievalResponse:
    return service.retrieve(request.project_id, request.query, request.top_k)


@app.post("/api/ai/clarify", response_model=ClarificationResponse)
async def clarify(request: ContextRequest) -> ClarificationResponse:
    try:
        return await service.clarify(request.project_id, request.topic, request.top_k)
    except ProviderError as exc:
        raise HTTPException(
            status_code=503, detail="AI provider unavailable; no questions generated"
        ) from exc


@app.post("/api/ai/requirements", response_model=RequirementsResponse)
async def requirements(request: ContextRequest) -> RequirementsResponse:
    try:
        return await service.requirements(request.project_id, request.topic, request.top_k)
    except ProviderError as exc:
        raise HTTPException(
            status_code=503, detail="AI provider unavailable; no requirements generated"
        ) from exc
