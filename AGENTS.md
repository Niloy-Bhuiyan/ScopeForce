# ScopeForce contributor guidance

- Keep the Engineering Graph as the single source for engineering, execution, impact, and proof lenses.
- Preserve truth labels: deterministic build orchestration is simulated; the OpenAI RAG path is real only when configured.
- Keep source identifiers stable across every view.
- Validate changes with `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `pytest`, and `ruff check`.
- Never commit credentials or generated environment files.
- When writing or refactoring code, invoke the `karpathy-guidelines` skill first.

