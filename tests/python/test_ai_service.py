from typing import Literal, cast

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from ai.prompts import CLARIFICATION_PROMPT
from ai.providers import GenerationProvider, ProviderError, format_context
from ai.rag import RagService
from ai.schemas import (
    ClarificationResponse,
    ContextRequest,
    IngestRequest,
    SourceInput,
)
from api.index import app


@pytest.fixture
def service() -> RagService:
    instance = RagService()
    instance.ingest(
        IngestRequest(
            project_id="CAMPUSLINK",
            documents=[
                SourceInput(
                    source_id="SRC-AUTH",
                    name="Auth brief",
                    content=(
                        "Students must verify their unique campus email before protected access. "
                        "Verification links expire after 20 minutes and cannot be replayed."
                    ),
                ),
                SourceInput(
                    source_id="SRC-DINING",
                    name="Dining brief",
                    content="The dining hall publishes a vegetarian lunch menu every weekday.",
                ),
            ],
        )
    )
    return instance


def test_health_route_is_truthful_without_key(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    response = TestClient(app).get("/api/ai/health")
    assert response.status_code == 200
    assert response.json()["ai_provider"] == "not-configured"
    assert response.json()["vector_store"] == "in-memory-ephemeral"


def test_ingestion_preserves_source_and_retrieves_relevant_chunk(service: RagService) -> None:
    result = service.retrieve("CAMPUSLINK", "When does the verification link expire?", 3)
    assert result.sufficient_context is True
    assert result.matches[0].source_id == "SRC-AUTH"
    assert "20 minutes" in result.matches[0].content


def test_irrelevant_input_returns_no_match(service: RagService) -> None:
    result = service.retrieve("CAMPUSLINK", "quantum telescope orbital propulsion", 3)
    assert result.sufficient_context is False
    assert result.matches == []


@pytest.mark.asyncio
async def test_no_context_does_not_invent_requirements() -> None:
    result = await RagService().requirements("EMPTY", "identity", 3)
    assert result.requirements == []
    assert "not invented" in (result.uncertainty or "")


@pytest.mark.asyncio
async def test_fallback_output_is_structured_and_cited(service: RagService) -> None:
    result = await service.clarify("CAMPUSLINK", "email verification access", 3)
    assert result.mode == "deterministic-fallback"
    assert result.questions
    assert result.questions[0].source_ids == ["SRC-AUTH"]


def test_malformed_provider_response_fails_schema_validation() -> None:
    with pytest.raises(ValidationError):
        ClarificationResponse.model_validate(
            {"questions": [{"question": "too short"}], "mode": "openai"}
        )


class FailingProvider:
    mode: Literal["test"] = "test"

    async def clarify(self, topic: str, matches: list[object]) -> ClarificationResponse:
        raise ProviderError("provider timeout")

    async def requirements(self, topic: str, matches: list[object]) -> object:
        raise ProviderError("provider timeout")


@pytest.mark.asyncio
async def test_provider_timeout_is_exposed_as_controlled_error(service: RagService) -> None:
    service.provider = cast(GenerationProvider, FailingProvider())
    with pytest.raises(ProviderError, match="timeout"):
        await service.clarify("CAMPUSLINK", "email verification", 2)


def test_prompt_marks_context_untrusted_and_preserves_sources(service: RagService) -> None:
    matches = service.retrieve("CAMPUSLINK", "verification", 2).matches
    rendered = CLARIFICATION_PROMPT.invoke(
        {"topic": "verification", "context": format_context(matches)}
    ).to_string()
    assert "untrusted data" in rendered
    assert "SRC-AUTH" in rendered


def test_request_validation_rejects_bad_project_id() -> None:
    with pytest.raises(ValidationError):
        ContextRequest(project_id="bad id!", topic="auth")
