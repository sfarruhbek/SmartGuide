# `@smartguide/api` — Uzbekistan Full-City Travel Roadmap & AI Guide API

> **Scope:** Primary API generates full day-by-day city/multi-city travel roadmaps across Uzbekistan (`POST /api/trips/generate`, 16+ cities + custom city). Khiva Ichan-Qala (`/api/landmarks`, `/api/guide/ask`, `/api/roadmap/generate`) is the Phase 1 deep-RAG & Vision pilot zone, not the entire product.

Node.js 20+, Express 5, Drizzle/PostgreSQL, Zod, Groq text/vision and Gemini speech via server-side REST. Port 4000. No API credentials are sent to the frontend.

Implemented routes: health; landmark list/detail; guide ask; analytics summary; `POST /api/trips/generate`; `POST /api/audio/speech`; `POST /api/roadmap/generate`. The national frontend now calls the API planner. `LANDMARK_STORE=json` enables real AI with file-based dossiers before PostgreSQL setup; it does not save analytics. [Live setup](../../documentation/LIVE_API_SETUP.md). Historical accuracy is not guaranteed by RAG alone.

Not implemented: trip storage, nearby GPS, guide feedback, landmark visit, analytics export, contribution moderation and payments. [API contract](../../documentation/API_CONTRACT.md) separates proposals from runtime. [AI handoff](../../documentation/AI_BACKEND_HANDOFF.md) covers model checks, quota handling, environment and the staged JSON import. No DB migration is included.

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

Next implementation tasks: [Backend tasks](../../documentation/BACKEND_TASKS.md). The frontend adapter is implemented; PostgreSQL, persistence, a shared guide deadline and the public HTTPS staging address remain.
