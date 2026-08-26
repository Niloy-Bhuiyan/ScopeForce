# Architecture

One repository deploys as one Vercel project. Next.js serves the React product. `api/index.py` exports FastAPI as one Python function under `/api`; the Python runtime is pinned to 3.12-compatible dependencies. Frontend domain rules live under `lib/domain`, state transitions under `lib/store`, and visual lenses consume the same entity/relationship collection.

The browser calls `/api/ai/*`. In development, `vercel dev` serves both runtimes. The server chooses an OpenAI or deterministic local embedding/provider path based on environment configuration. The vector-store protocol prevents HTTP routes from knowing persistence details.

