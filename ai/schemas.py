from typing import Literal

from pydantic import BaseModel, Field, field_validator


class SourceInput(BaseModel):
    source_id: str = Field(min_length=3, max_length=80, pattern=r"^[A-Za-z0-9._-]+$")
    name: str = Field(min_length=1, max_length=160)
    content: str = Field(min_length=1, max_length=200_000)

    @field_validator("content")
    @classmethod
    def reject_binary_content(cls, value: str) -> str:
        if "\x00" in value:
            raise ValueError("Binary content is not supported")
        return value


class IngestRequest(BaseModel):
    project_id: str = Field(min_length=2, max_length=80, pattern=r"^[A-Za-z0-9._-]+$")
    documents: list[SourceInput] = Field(min_length=1, max_length=10)


class IngestResponse(BaseModel):
    project_id: str
    document_count: int
    chunk_count: int
    embedding_provider: Literal["openai", "local-hash"]
    persistence: Literal["ephemeral"] = "ephemeral"


class RetrievalRequest(BaseModel):
    project_id: str = Field(min_length=2, max_length=80)
    query: str = Field(min_length=2, max_length=2_000)
    top_k: int = Field(default=4, ge=1, le=8)


class ContextRequest(BaseModel):
    project_id: str = Field(min_length=2, max_length=80, pattern=r"^[A-Za-z0-9._-]+$")
    topic: str = Field(min_length=2, max_length=2_000)
    top_k: int = Field(default=4, ge=1, le=8)


class RetrievalMatch(BaseModel):
    chunk_id: str
    source_id: str
    source_name: str
    content: str
    score: float = Field(ge=0, le=1)


class RetrievalResponse(BaseModel):
    matches: list[RetrievalMatch]
    sufficient_context: bool


class ClarificationQuestion(BaseModel):
    id: str
    category: Literal[
        "users", "permissions", "workflow", "data", "integrations", "constraints", "quality"
    ]
    question: str = Field(min_length=8)
    why_it_matters: str = Field(min_length=8)
    impact: Literal["high", "medium", "low"]
    source_ids: list[str] = Field(min_length=1)


class ClarificationResponse(BaseModel):
    questions: list[ClarificationQuestion]
    uncertainty: str | None = None
    mode: Literal["openai", "deterministic-fallback"]


class GeneratedRequirement(BaseModel):
    id: str
    statement: str = Field(min_length=8)
    acceptance_criteria: list[str] = Field(min_length=1)
    assumptions: list[str]
    source_ids: list[str] = Field(min_length=1)
    confidence: Literal["high", "medium", "low"]


class RequirementsResponse(BaseModel):
    requirements: list[GeneratedRequirement]
    uncertainty: str | None = None
    mode: Literal["openai", "deterministic-fallback"]


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    service: Literal["scopeforce-context-intelligence"] = "scopeforce-context-intelligence"
    ai_provider: Literal["openai", "not-configured"]
    embedding_provider: Literal["openai", "local-hash"]
    vector_store: Literal["in-memory-ephemeral"] = "in-memory-ephemeral"
