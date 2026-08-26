# Data model

The TypeScript model contains `Project`, `SourceDocument`, `GraphEntity`, `GraphRelationship`, `AcceptanceCriterion`, `ClarificationQuestion`, `BuildTask`, `Notification`, and `ProviderAdapter`. Entity kinds cover User Need, Requirement, Architecture, Task, Code, Test, and Result. Pydantic models mirror the API boundary for documents, chunks, retrieval matches, questions, and generated requirements.

Stable IDs are user-facing and immutable within a project. Relationships are directed and typed; derived views compute lineage and impact instead of duplicating graph data.

