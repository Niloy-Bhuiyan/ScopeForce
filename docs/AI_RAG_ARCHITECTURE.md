# Project Context Intelligence

Documents enter as validated text with source IDs. LangChain’s recursive splitter produces overlapping chunks with source metadata. An embedding adapter selects `OpenAIEmbeddings` when `OPENAI_API_KEY` exists or a deterministic token-hash embedding otherwise. The vector-store protocol supports top-k cosine retrieval and project isolation.

Clarification and requirement generation retrieve only relevant chunks, cap context, attach source IDs, and use dedicated grounding prompts. `ChatOpenAI.with_structured_output` validates live provider responses against Pydantic schemas. With no provider, a labelled deterministic path returns grounded output; no live model call is implied. Empty retrieval returns uncertainty rather than fabricated content.

The in-memory store is genuine vector retrieval but is not durable across Vercel cold starts. The production replacement is a tenant-scoped pgvector or Qdrant adapter with encrypted document storage, deletion, retention, and authorization controls.

