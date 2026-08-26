# Build state

## Current phase

Foundation complete; product implementation in progress.

## Completed

- Audited Windows 10, PowerShell 7.6, Node 24, npm 11, Python 3.13, Git 2.51, GitHub CLI, Vercel CLI, and all eight references.
- GitHub authenticated as `Niloy-Bhuiyan`; Vercel authenticated as `niloybhuiyann-5710`.
- Initialized repository with local Git identity `Niloy-Bhuiyan <niloybhuiyann@gmail.com>`.
- Confirmed current Vercel Python/FastAPI entrypoint and Python 3.12+ support.
- Established Next/FastAPI architecture, design tokens, typed CampusLink domain, graph algorithms, build rules, initial tests, and project documentation.

## Decisions

- One Next.js project plus `/api/index.py` FastAPI function.
- One canonical Engineering Graph, multiple lenses.
- Ephemeral vector storage for MVP with adapter boundary; do not claim durable production persistence.
- Local deterministic RAG fallback because `OPENAI_API_KEY` is absent.

## Pending

Product UI, Python AI service, complete tests, visual QA, GitHub creation/push, preview and production Vercel deployments, production QA.

## Authentication and release state

- GitHub: authenticated; private repository not yet created.
- Vercel: authenticated; project not yet linked.
- OpenAI: environment key missing; live smoke test unavailable until securely configured.

## Commands

See README quality gates. Important paths: `app/`, `components/`, `lib/domain/`, `api/`, `tests/`, `docs/`, `references/`.

## Real vs simulated

The graph/state/application and forthcoming RAG/vector path are real. Coding-agent build execution is simulated. Provider API execution beyond optional OpenAI RAG is planned.

