# `@smartguide/api` — trip planning and Khiva guide

Node.js 20+, Express 5, Drizzle/PostgreSQL, Zod, Groq text/vision and Gemini speech via server-side REST. Port 4000. No API credentials are sent to the frontend.

Implemented routes: health; landmark list/detail; guide ask; analytics summary; `POST /api/trips/generate`; `POST /api/audio/speech`. Guide uses the existing five-landmark Khiva dossier. The national planner ranks curated places through Groq and computes costs in integer USD cents on the server. The national frontend still runs its local planner. Historical accuracy is not guaranteed by RAG alone.

Not implemented: trip storage, nearby GPS, legacy roadmap generation, guide feedback, landmark visit, analytics export, contribution moderation and payments. [API contract](../../documentation/API_CONTRACT.md) separates proposals from runtime. [AI handoff](../../documentation/AI_BACKEND_HANDOFF.md) covers model checks, quota handling, environment and the staged JSON import. No DB migration is included.

```bash
npm run db:push
npm run db:seed
npm run dev:api
npm run typecheck --workspace=@smartguide/api
npm run build --workspace=@smartguide/api
npm run test --workspace=@smartguide/api
npm run ai:check --workspace=@smartguide/api
# Optional live generation (uses provider quota):
npm run ai:smoke --workspace=@smartguide/api
```

Database changes belong to the backend owner. Seed data is not evidence of real visitor research or transactions. [Architecture](../../documentation/ARCHITECTURE.md)
