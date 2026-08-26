from __future__ import annotations

import os
from typing import Protocol

from langchain_openai import ChatOpenAI

from ai.prompts import CLARIFICATION_PROMPT, REQUIREMENTS_PROMPT
from ai.schemas import (
    ClarificationQuestion,
    ClarificationResponse,
    GeneratedRequirement,
    RequirementsResponse,
    RetrievalMatch,
)


class ProviderError(RuntimeError):
    pass


class GenerationProvider(Protocol):
    mode: str

    async def clarify(self, topic: str, matches: list[RetrievalMatch]) -> ClarificationResponse: ...

    async def requirements(
        self, topic: str, matches: list[RetrievalMatch]
    ) -> RequirementsResponse: ...


def format_context(matches: list[RetrievalMatch], character_limit: int = 8_000) -> str:
    blocks: list[str] = []
    used = 0
    for match in matches:
        block = f"[SOURCE {match.source_id} | CHUNK {match.chunk_id}]\n{match.content.strip()}"
        if used + len(block) > character_limit:
            break
        blocks.append(block)
        used += len(block)
    return "\n\n".join(blocks)


class OpenAIGenerationProvider:
    mode = "openai"

    def __init__(self) -> None:
        self.model = ChatOpenAI(
            model=os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
            timeout=20,
            max_retries=1,
            temperature=0,
        )

    async def clarify(self, topic: str, matches: list[RetrievalMatch]) -> ClarificationResponse:
        try:
            chain = CLARIFICATION_PROMPT | self.model.with_structured_output(ClarificationResponse)
            result = await chain.ainvoke({"topic": topic, "context": format_context(matches)})
            return result.model_copy(update={"mode": "openai"})
        except Exception as exc:
            raise ProviderError("OpenAI clarification generation failed") from exc

    async def requirements(self, topic: str, matches: list[RetrievalMatch]) -> RequirementsResponse:
        try:
            chain = REQUIREMENTS_PROMPT | self.model.with_structured_output(RequirementsResponse)
            result = await chain.ainvoke({"topic": topic, "context": format_context(matches)})
            return result.model_copy(update={"mode": "openai"})
        except Exception as exc:
            raise ProviderError("OpenAI requirement generation failed") from exc


class DeterministicGroundedProvider:
    mode = "deterministic-fallback"

    async def clarify(self, topic: str, matches: list[RetrievalMatch]) -> ClarificationResponse:
        if not matches:
            return ClarificationResponse(
                questions=[],
                uncertainty=(
                    "No relevant project context was found. Add source material before "
                    "generating questions."
                ),
                mode="deterministic-fallback",
            )
        source_ids = sorted({match.source_id for match in matches})
        context = " ".join(match.content.lower() for match in matches)
        questions = [
            ClarificationQuestion(
                id="Q-AI-001",
                category="permissions",
                question="Which exact routes or capabilities remain available before verification?",
                why_it_matters=(
                    "The answer defines route guards, the authentication boundary, and "
                    "required tests."
                ),
                impact="high",
                source_ids=source_ids,
            )
        ]
        if "expire" in context or "minute" in context or "token" in context:
            questions.append(
                ClarificationQuestion(
                    id="Q-AI-002",
                    category="quality",
                    question="What should happen when a verification token expires or is replayed?",
                    why_it_matters=(
                        "The answer changes token state, recovery workflow, and security "
                        "test cases."
                    ),
                    impact="medium",
                    source_ids=source_ids,
                )
            )
        return ClarificationResponse(
            questions=questions,
            uncertainty=(
                f"Deterministic fallback used for topic: {topic}. Configure OpenAI for "
                "live synthesis."
            ),
            mode="deterministic-fallback",
        )

    async def requirements(self, topic: str, matches: list[RetrievalMatch]) -> RequirementsResponse:
        if not matches:
            return RequirementsResponse(
                requirements=[],
                uncertainty=(
                    "No relevant project context was found. Requirements were not invented."
                ),
                mode="deterministic-fallback",
            )
        source_ids = sorted({match.source_id for match in matches})
        return RequirementsResponse(
            requirements=[
                GeneratedRequirement(
                    id="REQ-AI-001",
                    statement="Students must verify a unique campus email before protected access.",
                    acceptance_criteria=[
                        "An unverified student is denied access to protected routes.",
                        "A verified student can access protected routes.",
                    ],
                    assumptions=["The source material does not enumerate every protected route."],
                    source_ids=source_ids,
                    confidence="medium",
                )
            ],
            uncertainty=(
                f"Deterministic fallback used for topic: {topic}. Review unresolved route scope."
            ),
            mode="deterministic-fallback",
        )
