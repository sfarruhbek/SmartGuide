# `@smartguide/api` — trip planning and Khiva guide

Node.js 20+, Express 5, Drizzle/PostgreSQL, Zod, Groq text/vision, Gemini speech and a Gemini Live WebSocket relay. Port 4000. Provider credentials stay on the server; the browser receives a one-use Live session token.

Implemented routes: health; landmark list/detail; guide ask; analytics summary; `POST /api/trips/generate`; `POST /api/audio/speech`; `POST /api/roadmap/generate`. The national frontend now calls the API planner. `LANDMARK_STORE=json` enables real AI with file-based dossiers before PostgreSQL setup; it does not save analytics. [Live setup](../../documentation/LIVE_API_SETUP.md). Historical accuracy is not guaranteed by RAG alone.

Map assistant routes: `GET /api/explore/places`, `POST /api/explore/live/session`, WebSocket `/api/explore/live`. Voice, photos and optional GPS use national source records and a persistent public Wikipedia cache. [Live configuration and backend handoff](../../documentation/LIVE_VOICE_ASSISTANT.md).

Not implemented: trip storage, legacy `/api/landmarks/nearby`, guide feedback, landmark visit, analytics export, contribution moderation and payments. [API contract](../../documentation/API_CONTRACT.md) separates proposals from runtime. [AI handoff](../../documentation/AI_BACKEND_HANDOFF.md) covers model checks, quota handling, environment and the staged JSON import. No DB migration is included.

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
