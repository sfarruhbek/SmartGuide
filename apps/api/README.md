# `@smartguide/api` — current Khiva pilot runtime

Node.js 20+, Express 5, Drizzle/PostgreSQL, Zod, Google GenAI. Port 4000.

Implemented routes in this checkout: health; landmark list/detail; guide ask; analytics summary. Guide ask uses the five-landmark Khiva dataset, configured RAG/Vision/TTS and interaction logging. AI/DB availability and fallback mode must be checked in the running environment; historical accuracy is not guaranteed by RAG alone.

Not implemented as routes here: national trip generation/storage, nearby GPS, roadmap generation, guide feedback, landmark visit, analytics export, contribution moderation and payments. Earlier design documents described these as final behaviour; [API_CONTRACT.md](../../documentation/API_CONTRACT.md) now distinguishes proposals from runtime. This frontend branch does not change backend implementation or DB migrations.

```bash
npm run db:push
npm run db:seed
npm run dev:api
npm run typecheck --workspace=@smartguide/api
npm run build --workspace=@smartguide/api
```

Database changes belong to the backend owner. Seed data is not evidence of real visitor research or transactions. [Architecture](../../documentation/ARCHITECTURE.md)
