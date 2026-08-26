# Build state

## Current phase

MVP implemented, quality-gated, and deployed to production; GitHub push is awaiting an account privacy-setting change.

## Completed

- Audited Windows 10, PowerShell 7.6, Node 24, npm 11, Python 3.13, Git 2.51, GitHub CLI, Vercel CLI, and all eight references.
- GitHub authenticated as `Niloy-Bhuiyan`; Vercel authenticated as `niloybhuiyann-5710`.
- Initialized repository with local Git identity `Niloy-Bhuiyan <niloybhuiyann@gmail.com>`.
- Confirmed current Vercel Python/FastAPI entrypoint and Python 3.12+ support.
- Established Next/FastAPI architecture, design tokens, typed CampusLink domain, graph algorithms, build rules, initial tests, and project documentation.
- Implemented every primary view, shared state transitions, responsive layouts, notifications, structured export, and four graph lenses.
- Implemented FastAPI/LangChain ingestion, chunking, embedding, retrieval, grounded generation, source citations, and deterministic fallback.
- Passed ESLint, strict TypeScript, four frontend/domain tests, production Next build, Ruff, nine Python evaluations, and FastAPI import smoke test.
- Completed desktop visual QA across every primary product route.
- Created the private GitHub repository at `https://github.com/Niloy-Bhuiyan/ScopeForce` and configured it as `origin`.
- Linked and deployed the Vercel project at `https://scopeforce.vercel.app`.
- Verified production UI deep links, API routing, ingestion, retrieval, grounded clarification, grounded requirements, and truthful provider health metadata.
- Completed responsive production QA at a 390 × 844 viewport across all primary and authentication routes, including graph search, build conflict repair, proof repair, blast-radius planning, and intake indexing.
- Confirmed the production browser console has no warnings or errors during the tested flows.

## Decisions

- One Next.js project plus `/api/index.py` FastAPI function.
- One canonical Engineering Graph, multiple lenses.
- Ephemeral vector storage for MVP with adapter boundary; do not claim durable production persistence.
- Local deterministic RAG fallback because `OPENAI_API_KEY` is absent.

## Pending

Push the existing local commits after GitHub command-line email protection is adjusted for the mandated commit identity. Optionally configure `OPENAI_API_KEY` later for a live OpenAI smoke test.

## Authentication and release state

- GitHub: authenticated; private repository created and remote configured. Push is blocked by GitHub error `GH007` because the prompt-mandated commit email is private and command-line email protection is enabled.
- Vercel: authenticated, linked, and production deployment ready at `https://scopeforce.vercel.app`.
- OpenAI: environment key missing; the deployed API truthfully reports `ai_provider=not-configured`, `embedding_provider=local-hash`, and `vector_store=in-memory-ephemeral`.

## Commands

See README quality gates. Important paths: `app/`, `components/`, `lib/domain/`, `api/`, `tests/`, `docs/`, `references/`.

## Real vs simulated

The graph/state/application and forthcoming RAG/vector path are real. Coding-agent build execution is simulated. Provider API execution beyond optional OpenAI RAG is planned.
