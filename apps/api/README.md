# `@smartguide/api` — Backend & AI/RAG Servisi

**Port:** `4000`  
**Stek:** Node.js 20+, Express 5, TypeScript, Drizzle ORM, PostgreSQL, Zod, `@google/genai`

## Papka Strukturasi

```text
apps/api/
├── data/
│   └── ichan-qala-landmarks.json    # 🧠 AI/RAG: 5 ta Ichan-Qal'a obidasi tasdiqlangan bazasi
├── drizzle.config.ts                # Drizzle Kit konfiguratsiyasi
└── src/
    ├── config/env.ts                # Zod bilan tekshirilgan .env sozlamalari
    ├── db/
    │   ├── schema.ts                # PostgreSQL jadvallari: landmarks, interactions
    │   ├── index.ts                 # pg.Pool + Drizzle + ensureSchemaExists()
    │   ├── seed-data.ts             # Dashboard uchun dastlabki realistik analitika
    │   └── seed.ts                  # Idempotent seed skripti
    ├── services/
    │   ├── ai.service.ts            # 🧠 AI/RAG: Gemini 3.5/4 Vision + RAG + Gemini 3.8 TTS
    │   ├── landmark.service.ts      # Obidalarni DB'dan o'qish (+ JSON fallback)
    │   └── analytics.service.ts     # B2B SQL agregatsiyalar va revenue hisob-kitobi
    ├── routes/
    │   ├── landmarks.routes.ts      # GET /api/landmarks, GET /api/landmarks/:slug
    │   ├── guide.routes.ts          # POST /api/guide/ask
    │   └── analytics.routes.ts      # GET /api/analytics/summary
    ├── middleware/error-handler.ts
    ├── app.ts
    └── index.ts
```

## Buyruqlar

```bash
# Root papkadan:
npm run db:push      # PostgreSQL jadvallarini yaratish/yangilash
npm run db:seed      # 5 ta obida + boshlang'ich analitikani yuklash (idempotent)
npm run dev:api      # Watch rejimida ishga tushirish (http://localhost:4000)
npm run db:studio    # Drizzle Studio (DB GUI)

# Tekshirish va Build:
npm run typecheck --workspace=@smartguide/api
npm run build --workspace=@smartguide/api
```

Batafsil API spetsifikatsiyasi: [../../documentation/API_CONTRACT.md](../../documentation/API_CONTRACT.md)
