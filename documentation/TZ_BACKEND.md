# TZ #2 — Backend Developer (Yakuniy Konsepsiya: Roadmap Engine, Signal/Noise DB & AWS Deploy)

> **Loyiha:** SmartGuide — Emotsional Roadmap + Jonli AI-Gid + Sayyohlar Qiziqishi Intellekti  
> **Rol:** Backend & DevOps Developer (1 kishi)  
> **Git Branch:** `feat/backend`  
> **Mas'uliyat zonasi:** `apps/api/src/db/**`, `apps/api/src/routes/**`, `apps/api/src/middleware/**`, `apps/api/src/config/**`, `apps/api/src/services/landmark.service.ts`, `apps/api/src/services/roadmap.service.ts` *(yangi)*, `apps/api/src/services/analytics.service.ts`, `apps/api/src/services/cache.service.ts` *(yangi)*, `apps/api/src/app.ts`, `apps/api/src/index.ts`, AWS Ubuntu deploy  
> **Tegilmaydigan zonalar:** `apps/tourist/**`, `apps/dashboard/**`, `apps/api/data/ichan-qala-landmarks.json`, `apps/api/src/services/ai.service.ts`

---

## 1. Strategik Maqsad

Sizning mas'uliyatingiz — SmartGuide'ning **Data Flywheel (O'z-o'zidan aqllilashish) mexanizmini PostgreSQL'da real vaqtda yurgizish**:
1. Har bir sayyohga real PostgreSQL `landmark_topic_signals` reytinglariga tayangan **Shaxsiy Emotsional Roadmap** (`POST /api/roadmap/generate`) taqdim etish.
2. Obida oldidagi har bir jonli suhbat (`POST /api/guide/ask`) va micro-reaksiyadan (`POST /api/guide/feedback`) **Signal Score (`0–100`)** ni real vaqtda yangilab borish — shunda keyingi sayyohning Roadmap'i va hikoyasi avtomatik yaxshilanadi!
3. Muzey B2B paneliga `<50ms` tezlikda **Signal vs. Noise**, **Sentiment**, **Curiosity Gaps**, **CSV Eksport** va **70/30 daromad** hisobotini berish.
4. Tezkor savollarni keshlash (`<100ms`, `$0` API xarajat) va **AWS Ubuntu** serverga Docker'siz, uzluksiz (`PM2 + Nginx/HTTPS`) deploy qilish.

---

## 2. Mavjud Baza va Yangi Qo'shiladigan Jadval/Servislar

- **Hozir tayyor:** `landmarks`, `interactions` jadvallari (`src/db/schema.ts`), `seed.ts`, `GET /api/health`, `GET /api/landmarks`, `GET /api/landmarks/:slug`, `POST /api/guide/ask`, `GET /api/analytics/summary`.
- **Yangi qo'shiladi (Yakuniy Konsepsiya):**
  1. `roadmaps` jadvali (sayyohlarga tuzilgan Emotsional Roadmap'larni saqlash)
  2. `landmark_topic_signals` jadvali (har bir obidaning har bir fakti/mavzusi bo'yicha `ask_count`, `positive_reactions`, `negative_reactions`, `signal_score`)
  3. `qr_scans` jadvali (QR skan / obida ochish hodisalari)
  4. `interactions` jadvaliga insight ustunlari (`detected_topic_key`, `detected_topic_label`, `signal_category`, `sentiment`, `interest_score`, `user_feedback`, `curiosity_gap`, `roadmap_id`)

---

## 3. Batafsil Vazifalar Ro'yxati (`BE-01` .. `BE-12`)

### P0 — Birinchi Navbatda (26-noyabr, 11:50 – 14:30 · Data Flywheel Yadro API'lari)

#### `BE-01` — PostgreSQL Sxemasini Kengaytirish (`schema.ts` + `index.ts`) `[P0]`
- **Fayl:** `apps/api/src/db/schema.ts`, `apps/api/src/db/index.ts`, `packages/shared/src/index.ts` *(jamoa bilan kelishib)*
- **Aniq ustunlar:**
  - `landmarks` ga qo'shilsin: `estimatedVisitMinutes` (`integer`, default `20`), `emotionalPromise` (`jsonb` — 6 til), `vibeTags` (`jsonb` — `string[]`), `taggedTopics` (`jsonb` — `{ topicKey, topicLabel, category, baselineScore }[]`).
  - `roadmaps` yangi jadvali: `id`, `sessionId`, `language`, `durationMinutes`, `selectedVibes` (`jsonb`), `stopsJson` (`jsonb`), `createdAt`.
  - `landmark_topic_signals` yangi jadvali: `id`, `landmarkId` (FK), `landmarkSlug`, `topicKey` (unique with `landmarkId`), `topicLabel`, `category`, `askCount`, `positiveReactions`, `negativeReactions`, `signalScore` (`real`, default `50`), `updatedAt`.
  - `interactions` ga qo'shilsin: `roadmapId` (nullable FK), `detectedTopicKey`, `detectedTopicLabel`, `signalCategory`, `sentiment` (`awe | fascinated | curious | neutral | bored`), `interestScore` (`integer`, 1..5), `userFeedback` (`fascinating | surprising | not_relevant | null`), `curiosityGap` (`text`, nullable).
  - `ensureSchemaExists()` da `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` va `CREATE TABLE IF NOT EXISTS` yozilsin (mavjud lokal DB buzilmasdan avtomatik yangilanishi uchun!).

#### `BE-02` — Boshlang'ich Seed'ni "Signal vs. Noise" Ma'lumotlari Bilan Boyitish `[P0]`
- **Fayl:** `apps/api/src/db/seed.ts`, `apps/api/src/db/seed-data.ts`
- **Aniq talablar:**
  - `seed.ts` 5 ta obidani upsert qilish bilan birga har bir obidaning `taggedTopics` laridan `landmark_topic_signals` jadvalini to'ldirsin (realistik `askCount`, `positiveReactions`, `negativeReactions`, `signalScore` bilan — masalan Kalta Minor me'mor afsonasi `95/100` High Signal, Tosh-Hovli quruq soliq yozuvlari `22/100` Low Signal Noise, shunda Dashboard darhol boy va tushunarli ko'rinadi!).
  - `seed-data.ts` dagi 46+ interaksiyaga `detectedTopicKey`, `sentiment` (`awe`, `fascinated`, `curious`, ...), `interestScore` va 3–4 ta realistik `curiosityGap` (masalan *"Can visitors climb Juma Mosque minaret?"*) qo'shilsin.

#### `BE-03` — `POST /api/roadmap/generate` Endpointi (Signal-Weighted Roadmap) `[P0 · YANGI ASOSIY OQIM]`
- **Fayl:** yangi `apps/api/src/routes/roadmap.routes.ts`, `apps/api/src/services/roadmap.service.ts`, `apps/api/src/app.ts`
- **Ishlash tartibi:**
  1. Zod validatsiya: `{ sessionId, language, durationMinutes: 60 | 120 | 240, vibes: TravelVibe[] }`.
  2. PostgreSQL'dan barcha 5 ta obida + har bir obidaning **TOP-3 eng yuqori `signal_score` li mavzulari** va **eng past Noise mavzusi** olinadi.
  3. `durationMinutes` ga qarab obidalar soni belgilanadi (`60m → 2–3 obida`, `120m → 4 obida`, `240m → barcha 5 obida`), `vibes` mosligi + real `signal_score` bo'yicha tartiblanadi.
  4. AI/RAG Dev yozgan `generateEmotionalRoadmap(...)` funksiyasi chaqirilib, har bir bekat uchun tanlangan tilda `whyVisit`, `emotionalPayoff`, `topSignalHighlight`, `noiseFilteredNote` olinadi (API xato bersa deterministik fallback!).
  5. Natija `roadmaps` jadvaliga saqlanib, `GenerateRoadmapResponse` qaytariladi.

#### `BE-04` — `POST /api/guide/ask` ni Interest/Sentiment Extractor & Signal Update Bilan Bog'lash `[P0]`
- **Fayl:** `apps/api/src/routes/guide.routes.ts`, `apps/api/src/services/analytics.service.ts`
- **Aniq talablar:**
  - `POST /api/guide/ask` javob olayotganda `landmark` ning TOP-3 Signal mavzulari va LOW Noise mavzularini AI funksiyasiga uzatsin (AI keraksiz shovqinni filtrlab, eng qiziq faktlarni birinchi aytsin!).
  - AI qaytargan `insight` (`detectedTopicKey`, `detectedTopicLabel`, `signalCategory`, `sentiment`, `interestScore`, `curiosityGap`) `interactions` jadvaliga yozilsin.
  - Shu zahoti `landmark_topic_signals` jadvalida o'sha `(landmarkId, detectedTopicKey)` uchun `ask_count = ask_count + 1` qilinib, `signal_score` qayta hisoblansin (upsert)!
  - Agar `roadmapId` yuborilgan bo'lsa, `roadmaps` jadvalidan keyingi bekat olinib `nextStopSuggestion` qaytarilsin.

#### `BE-05` — `POST /api/guide/feedback` (Micro-Impression & Signal Score Real-Time Yangilash) `[P0]`
- **Fayl:** `apps/api/src/routes/guide.routes.ts`, `apps/api/src/services/analytics.service.ts`
- **Aniq talablar:**
  - Request: `{ interactionId: number, rating: 'fascinating' | 'surprising' | 'not_relevant' }`
  - `interactions.user_feedback` yangilanadi.
  - Bog'liq `landmark_topic_signals` qatorida:
    - `fascinating` / `surprising` → `positive_reactions + 1` (Signal Score oshadi!)
    - `not_relevant` → `negative_reactions + 1` (Signal Score pasayib Noise tomon tushadi!)
  - Formula (`ARCHITECTURE.md` dagi):
    `signalScore = clamp(50 + 6 * ln(1 + askCount) + 12 * positiveReactions - 18 * negativeReactions, 0, 100)`
  - Response: `{ ok: true, interactionId, topicKey, updatedSignalScore }`.

---

### P1 — B2B Experience Intelligence, Kesh va Xavfsizlik (26-noyabr, 14:30 – 16:30)

#### `BE-06` — `GET /api/analytics/summary` ni Signal vs. Noise, Sentiment va Curiosity Gaps Bilan Boyitish `[P1]`
- **Fayl:** `apps/api/src/services/analytics.service.ts`
- **Aniq qo'shimchalar:**
  - `totalRoadmapsGenerated` (`SELECT count(*) FROM roadmaps`)
  - `visitsByLandmark` har bir obida uchun `avgInterestScore` (`ROUND(AVG(interest_score)::numeric, 1)`)
  - `signalVsNoise`:
    - `topHighSignalTopics`: `ORDER BY signal_score DESC, ask_count DESC LIMIT 6`
    - `lowInterestNoiseTopics`: `ORDER BY signal_score ASC, negative_reactions DESC LIMIT 5`
  - `sentimentBreakdown`: `GROUP BY sentiment` (`awe`, `fascinated`, `curious`, `neutral`, `bored`)
  - `curiosityGaps`: `WHERE curiosity_gap IS NOT NULL ORDER BY created_at DESC LIMIT 8`
  - `hourlyActivity`: **`AT TIME ZONE 'Asia/Tashkent'`** (UTC emas, haqiqiy Toshkent soati!).
  - `revenue.estimatedApiCostPerTouristUsd`: real 2026 smeta asosida `0.04` (`.env` orqali sozlanadi).

#### `BE-07` — Smart Response + Audio Cache (`cache.service.ts`) `[P1]`
- **Fayl:** yangi `apps/api/src/services/cache.service.ts`, `src/routes/guide.routes.ts`
- `hasImage === false` so'rovlar uchun `${slug}:${lang}:${normalizedQuestion}:${includeAudio}` kaliti bo'yicha LRU kesh (max 150 yozuv, TTL 12h).
- **Qat'iy qoida:** Kesh hit bo'lganda Gemini'ga so'rov ketmaydi (`<100ms`, `$0`), **lekin `interactions` va `landmark_topic_signals.ask_count` HAR DOIM yangilanadi!**

#### `BE-08` — `POST /api/landmarks/:slug/scan` + `GET /api/analytics/export` (UTF-8 CSV) `[P1]`
- `POST /api/landmarks/:slug/scan`: QR / Roadmap tashrifini `qr_scans` ga yozadi.
- `GET /api/analytics/export`: UTF-8 BOM (`\uFEFF`) bilan Excel'da buzilmaydigan to'liq CSV (savol, obida, til, aniqlangan mavzu, sentiment, qiziqish balli, foydalanuvchi bahosi).

#### `BE-09` — Rate Limiter, HTTP Logger & `npm run db:reset` `[P1]`
- NAT-xavfsiz rate limiter (`sessionId` bo'yicha `25 req/min`, IP bo'yicha `90 req/min` — Demo Day zalidagi 15 hakam bitta Wi-Fi'da bloklanmasligi uchun!).
- `apps/api/src/db/reset.ts` → `npm run db:reset` (Demo Day'dan 30 daqiqa oldin test chiqindilarini tozalab, chiroyli seed holatiga qaytarish).

---

### P2 — AWS Ubuntu Deploy va Yuklama Testi (26-noyabr, 16:30 – 19:00 CODE FREEZE)

#### `BE-10` — AWS Ubuntu Native Deploy (`PostgreSQL + Node 22 + PM2`) `[P0 · DEPLOY]`
- [GIT_WORKFLOW_AND_DEPLOY.md](GIT_WORKFLOW_AND_DEPLOY.md) bo'yicha 3 ta servisni PM2 bilan ishga tushirish (`smartguide-api`, `smartguide-tourist`, `smartguide-dashboard`).

#### `BE-11` — Nginx + Certbot HTTPS `[P1]`
- Mobil telefonlarda kamera/ovozli diktovka uzluksiz ishlashi uchun HTTPS ulash (`domain` yoki `nip.io`).

#### `BE-12` — 15 Ta Parallel So'rov Yuklama Testi `[P2]`
- 10 ta parallel `POST /api/guide/ask` + 5 ta `POST /api/roadmap/generate` yuborib 0 ta `500` xato va `<50ms` analytics javobini tasdiqlash.

---

## 4. QA Test Senariylari

| # | Test | Kutilayotgan Natija |
| :--- | :--- | :--- |
| 1 | `POST /api/roadmap/generate` (`120m`, `["legends","photography"]`) | `200 OK`, 4 ta tartiblangan obida, `whyVisit`, `emotionalPayoff`, `topSignalHighlight` to'liq, `roadmaps` jadvaliga yozilgan |
| 2 | `POST /api/guide/ask` (Kalta Minor afsonasi) | `200 OK`, `insight` qaytadi, `interactions` +1, `landmark_topic_signals.ask_count` +1 |
| 3 | `POST /api/guide/feedback` (`rating: "fascinating"`) | `200 OK`, `updatedSignalScore` oshadi; `"not_relevant"` yuborilsa `signalScore` kamayadi |
| 4 | `GET /api/analytics/summary` | `signalVsNoise.topHighSignalTopics`, `lowInterestNoiseTopics`, `sentimentBreakdown`, `curiosityGaps` va `Asia/Tashkent` soatlari to'g'ri |
| 5 | `GET /api/analytics/export` | UTF-8 BOM CSV yuklanadi, o'zbek/yapon/rus harflari Excel'da to'g'ri ko'rinadi |
| 6 | `npm run db:reset` | Test qoldiqlari tozalanadi, 5 obida + Signal/Noise seed tiklanadi |
