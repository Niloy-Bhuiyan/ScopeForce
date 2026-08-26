# Architecture decisions

1. Use one canonical graph and derived lenses; duplicate models create drift.
2. Use Zustand only for cross-view demo state and persistence; domain rules remain pure functions.
3. Use a Vercel FastAPI function at `/api/index.py`; Vercel Services remains private beta and is unnecessary.
4. Use an in-memory vector protocol for the deployed demonstration and document its ephemerality.
5. Keep OpenAI optional so missing credit cannot block the product; fallback output remains grounded and labelled.
6. Simulate coding execution deterministically and truthfully.

