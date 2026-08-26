# Provider architecture

Context intelligence and coding execution are separate boundaries. The Python AI provider supports embeddings and structured generation. The TypeScript `ProviderAdapter` describes future coding execution capabilities and truthful connection states. The MVP does not call coding-agent providers; its engine is deterministic and marked simulated.

Future adapters must implement status checks, execution, cancellation, idempotency, audit evidence, and capability discovery without moving deterministic dependency or permission logic into an LLM.

