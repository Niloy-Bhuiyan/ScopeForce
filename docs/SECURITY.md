# Security

Inputs are validated and size-limited; only plain-text project context is accepted by the current API. Retrieved context is treated as untrusted data and wrapped in grounding instructions. The UI avoids raw HTML rendering. Provider keys remain in runtime environment variables and are never returned. `.env*`, Vercel state, credentials, and caches are ignored.

MVP limitations: demo auth is not an identity system, the in-memory index lacks tenant-grade persistence controls, rate limiting is not included, and uploaded content is not malware-scanned. Production requires durable authorization, rate limits, encrypted storage, retention/deletion controls, audit logging, and content scanning.

