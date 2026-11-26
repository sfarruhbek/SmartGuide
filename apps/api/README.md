# `@smartguide/api` — Backend, AI/RAG & Tourist Interest Flywheel

**Port:** `4000`  
**Stek:** Node.js 20+, Express 5, TypeScript, Drizzle ORM, PostgreSQL, Zod, `@google/genai`

## Asosiy Vazifasi (3 Bosqichli Data Flywheel)
1. **GPS Yaqin Obyekt & Emotsional Roadmap Engine (`GET /api/landmarks/nearby`, `POST /api/roadmap/generate`):** Sayyohning GPS joylashuvi (`lat/lng`) va real sayyohlar qiziqishi (`landmark_topic_signals`) asosida har obidada fizik QR-kodsiz eng yaqin obyektni va Emotsional Roadmap'ni taklif qiladi.
2. **Live Verified RAG + Vision + TTS (`POST /api/guide/ask`):** `gemini-3.5-flash-lite` (fallback: `gemini-4-hydrogen`) + `gemini-3.8-flash-lite-tts` orqali 0% gallyutsinatsiyali jonli suhbat va WAV audio beradi, shu bilan birga mavzu (`detectedTopic`), hissiyot (`sentiment`) va `curiosityGap` ni ajratib PostgreSQL'ga yozadi.
3. **Signal vs. Noise Intellekt & B2B Analitika (`POST /api/guide/feedback`, `GET /api/analytics/summary`, `GET /api/analytics/export`):** Qaysi ma'lumot sayyohlarga qiziq (`Signal`) va qaysilari ahamiyatsiz (`Noise`) ekanini real vaqtda hisoblab, ham Roadmap'ga, ham B2B Dashboard'ga uzatadi.

## Buyruqlar
```bash
npm run db:push      # PostgreSQL sxemasini yangilash
npm run db:seed      # 5 ta obida + Signal/Noise boshlang'ich bazasini seed qilish
npm run dev:api      # Watch rejimida ishga tushirish (http://localhost:4000)
npm run typecheck --workspace=@smartguide/api
npm run build --workspace=@smartguide/api
```

Batafsil TZ'lar: [TZ_BACKEND.md](../../documentation/TZ_BACKEND.md) · [TZ_AI_RAG.md](../../documentation/TZ_AI_RAG.md) · [API_CONTRACT.md](../../documentation/API_CONTRACT.md)
