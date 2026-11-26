# `@smartguide/api` — Uzbekistan Full-City Travel Roadmap & AI Guide API

> **Scope:** Primary API generates full day-by-day city/multi-city travel roadmaps across Uzbekistan (`POST /api/trips/compose`, 16+ cities + custom city; `/generate` retained for compatibility). Khiva Ichan-Qala (`/api/landmarks`, `/api/guide/ask`, `/api/roadmap/generate`) is the Phase 1 deep-RAG & Vision pilot zone, not the entire product.

Node.js 20+, Express 5, Drizzle/PostgreSQL, Zod, Groq text/vision, Gemini speech and a Gemini Live WebSocket relay. Port 4000. Provider credentials stay on the server; the browser receives a one-use Live session token.

Implemented routes: health; landmark list/detail; guide ask; analytics summary; `POST /api/trips/compose`, `GET /api/trips/current`, `GET /api/access`; legacy `POST /api/trips/generate`; `POST /api/audio/speech`; `POST /api/roadmap/generate`. The national frontend calls real Groq composition: validated day/place selection, explicit exclusions, summary and server-calculated USD cents. Manual and Live `manage_trip` requests share one private workspace/revision. New composition fails honestly when AI is unavailable; only the legacy `/generate` route keeps its labelled local fallback. `LANDMARK_STORE=json` enables real AI with file-based dossiers before PostgreSQL setup; it does not save analytics. [Live setup](../../documentation/LIVE_API_SETUP.md). Historical accuracy is not guaranteed by RAG alone.

Map assistant routes: `GET /api/explore/places`, `POST /api/explore/identify` (Snap without microphone), `POST /api/explore/live/session`, WebSocket `/api/explore/live`. Voice, photos and optional GPS use national source records and a persistent public Wikipedia cache. Photo identity is evaluated separately from the selected map city. [Live configuration and backend handoff](../../documentation/LIVE_VOICE_ASSISTANT.md).

Authentication: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/session`, `POST /api/auth/logout`. Salted scrypt password hashes, server-side hashed session tokens, seven-day HttpOnly/SameSite cookies, JSON/origin checks and attempt/concurrency limits. Default private file: `apps/api/data/auth/accounts.json`, ignored by Git; `AUTH_STORE_FILE` overrides it. This is a single-process demo store with atomic writes, not a multi-instance database. Use persistent storage, exact `CORS_ORIGIN`, production Secure cookies over HTTPS and same-origin Next proxy. Email verification, password recovery and production DB/cloud sync remain pending. Server trial permits one created plan, 180 cumulative Live seconds and three distinct photos before registration for an exhausted feature. Existing-plan revisions and reading are available to the guest; registered users continue free until sales. Photo hashes deduplicate repeated questions. `apps/api/data/auth/access.json` (or `ACCESS_STORE_FILE`) stores trial/workspace entries for 30 days; registration/login adopts a guest trip if the account has no workspace. [Trial and planning](../../documentation/TRIAL_AND_PLANNING.md). [Implementation and auth handoff](../../documentation/STITCH_IMPLEMENTATION.md).

Not implemented: production DB trip storage/history/sync, legacy `/api/landmarks/nearby`, guide feedback, landmark visit, analytics export, contribution moderation and payments. [API contract](../../documentation/API_CONTRACT.md) separates proposals from runtime. [AI handoff](../../documentation/AI_BACKEND_HANDOFF.md) covers model checks, quota handling, environment and the staged JSON import. No DB migration is included.

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

Next implementation tasks: [Backend tasks](../../documentation/BACKEND_TASKS.md). The frontend adapter is implemented; PostgreSQL-backed auth/trial/workspace persistence, a shared guide deadline and the public HTTPS staging address remain.
