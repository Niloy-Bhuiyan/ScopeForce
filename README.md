# ScopeForce

ScopeForce is the engineering control plane between a software idea and AI-built production software. It converts rough context into a persistent Engineering Graph that connects user needs, requirements, architecture, tasks, code, tests, evidence, and results.

The CampusLink MVP demonstrates the complete product loop: intake, grounded clarification, structured scope, system design, graph traceability, controlled build simulation, collision handling, proof, drift repair, blast-radius planning, provider boundaries, and an exportable handoff.

## Live release

- Production: [scopeforce.vercel.app](https://scopeforce.vercel.app)
- Source: [github.com/Niloy-Bhuiyan/ScopeForce](https://github.com/Niloy-Bhuiyan/ScopeForce) (private)

The production deployment uses deterministic local embeddings and grounded fallback responses until `OPENAI_API_KEY` is configured. Its vector index is in-memory and ephemeral by design for the MVP.

## What is real

- Responsive Next.js product with shared application state and interactive React Flow graph lenses.
- Deterministic lineage, collision, build-state, drift-repair, and blast-radius logic.
- File/text intake, browser voice recording where supported, notifications, and structured JSON export.
- FastAPI endpoints for ingestion, retrieval, clarification, and requirements.
- LangChain document chunking, prompt composition, OpenAI structured output, OpenAI embeddings, and similarity retrieval when `OPENAI_API_KEY` is configured.
- Deterministic local embeddings and grounded responses when no provider is configured; these are labelled demo mode.

## What is simulated or planned

Coding-provider execution and build progress are deterministic simulations; no claim is made that Codex, Claude, Gemini, or Grok executed code. The deployed in-memory vector index is ephemeral. Durable multi-tenant persistence, repository-wide continuous verification, and live provider orchestration are planned.

## Stack

Next.js 16, React 19, TypeScript, React Flow, Motion, Zustand, Zod, FastAPI, Pydantic, LangChain, `langchain-openai`, and a vector-store adapter with OpenAI or local hash embeddings.

## Run locally

```bash
npm install
npm run dev
```

For the combined UI and Python API, install Python dependencies and use Vercel CLI:

```bash
python -m venv .venv
.venv/Scripts/python -m pip install -e ".[test]"
npx vercel dev
```

Copy `.env.example` to `.env.local` only when using a live provider. Never commit it. Without a key, ingestion and retrieval remain functional with deterministic local embeddings.

## Quality gates

```bash
npm run lint
npm run typecheck
npm run test
npm run build
.venv/Scripts/python -m pytest
.venv/Scripts/python -m ruff check api tests/python
```

## API

- `GET /api/ai/health`
- `POST /api/ai/ingest`
- `POST /api/ai/retrieve`
- `POST /api/ai/clarify`
- `POST /api/ai/requirements`

See [docs/AI_RAG_ARCHITECTURE.md](docs/AI_RAG_ARCHITECTURE.md) for grounding and persistence details, and [docs/BUILD_STATE.md](docs/BUILD_STATE.md) for the current release state.
