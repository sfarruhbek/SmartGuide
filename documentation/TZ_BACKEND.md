# TZ #2 — Backend Developer (To'liq Texnik Topshiriq)

> **Loyiha:** SmartGuide — Ichan-Qal'a (Xiva) Raqamli AI-Gid Infratuzilmasi  
> **Rol:** Backend & DevOps Developer (1 kishi)  
> **Git Branch:** `feat/backend`  
> **Mas'uliyat zonasi:** `apps/api/src/db/**`, `apps/api/src/routes/**`, `apps/api/src/middleware/**`, `apps/api/src/config/**`, `apps/api/src/services/landmark.service.ts`, `apps/api/src/services/analytics.service.ts`, `apps/api/src/app.ts`, `apps/api/src/index.ts` va AWS Ubuntu server deploy  
> **Tegilmaydigan zonalar:** `apps/tourist/**`, `apps/dashboard/**`, `apps/api/data/ichan-qala-landmarks.json`, `apps/api/src/services/ai.service.ts` (AI/RAG Dev bilan kelishilgan funksiya interfeysi orqali ulanadi)

---

## 1. Strategik Maqsad

Sizning mas'uliyatingiz — tizimning **barqarorligi, tezligi, ma'lumotlar aniqligi, API xarajatini tejash (keshlash) va AWS Ubuntu production deployi**:
1. **0% Downtime Demo Day'da:** Sahnada 10–20 nafar hakam bir vaqtning o'zida QR-kodni skanerlab savol berganda, server ham, PostgreSQL ham sekinlashmasdan va qulamasdan javob qaytarishi kerak.
2. **Real-Time B2B Analitika:** Har bir QR skan, matnli savol va Snap & Ask foto so'rovi PostgreSQL'ga aniq yozilib, 5 soniyalik polling so'rovlariga `<50ms` da agregatsiya qaytarishi kerak.
3. **Unit-Ekonomika Himoyasi (Response + TTS Cache):** Eng ko'p so'raladigan tezkor savollar keshlanishi orqali 1 sayyohga API xarajatini `$0.15` dan ham pastda ushlash va javob tezligini `<150ms` ga tushirish!

---

## 2. Mavjud Fayllar va PostgreSQL Sxemasi (Hozir Tayyor Baza)

| Fayl | Vazifasi (hozirgi holati) |
| :--- | :--- |
| `src/config/env.ts` | Zod bilan tekshirilgan muhit o'zgaruvchilari (`GEMINI_*`, `DATABASE_URL`, `TICKET_PRICE_USD`, `MUSEUM_REVENUE_SHARE_PERCENT`) |
| `src/db/schema.ts` | Drizzle ORM PostgreSQL jadvallari: `landmarks` (5 ta obida JSONB + metadata) va `interactions` (indekslangan sayyoh interaksiyalari) |
| `src/db/index.ts` | `pg.Pool` (`max: 15`), `drizzle(pool, { schema })`, `ensureSchemaExists()`, `checkDatabaseHealth()` |
| `src/db/seed.ts` & `seed-data.ts` | Idempotent seed: `ichan-qala-landmarks.json` ni upsert qiladi va `interactions` bo'sh bo'lsa 46 ta realistik boshlang'ich yozuv qo'shadi |
| `src/services/landmark.service.ts` | `listLandmarkSummaries()`, `listLandmarkDetails()`, `getLandmarkBySlug()` (DB bo'sh bo'lsa JSON fallback bilan) |
| `src/services/analytics.service.ts` | `logTouristInteraction()` va `getAnalyticsSummary()` (SQL agregatsiyalar: KPI, landmarklar, tillar, 24h soatlik dinamika, 70/30 daromad, oxirgi 15 savol) |
| `src/routes/landmarks.routes.ts` | `GET /api/landmarks`, `GET /api/landmarks/:slug` |
| `src/routes/guide.routes.ts` | `POST /api/guide/ask` (Zod validatsiya + Vision/RAG/TTS + PostgreSQL loglash) |
| `src/routes/analytics.routes.ts` | `GET /api/analytics/summary` |
| `src/app.ts` & `src/index.ts` | Express 5, `helmet`, `cors`, `15mb` JSON limit, `GET /api/health`, `AUTO_SEED=true`, graceful shutdown (`SIGINT`/`SIGTERM`) |

---

## 3. Batafsil Vazifalar Ro'yxati (Task-by-Task Spetsifikatsiya)

### 1-BOSQICH (25-noyabr, 14:00 – 18:00) — P0 Blocker Vazifalar (Check-in gacha)

#### `BE-01` — Lokal PostgreSQL Sozlash va Barcha Endpointlarni Verifikatsiya Qilish `[P0]`
- **Bajariladigan ishlar:**
  1. Lokal PostgreSQL'da `smartguide` bazasini yaratish (`CREATE DATABASE smartguide;`).
  2. `.env` ga `DATABASE_URL` va real `GEMINI_API_KEY` kiritish.
  3. `npm run db:push && npm run db:seed && npm run dev:api` ni ishga tushirish.
  4. [API_CONTRACT.md](API_CONTRACT.md) dagi barcha 5 ta `curl` so'rovini tekshirib, `200 OK` va to'g'ri JSON strukturasini tasdiqlash.
- **Qabul mezoni:** `GET /api/health` → `database: "connected"`, `aiConfigured: true`; `POST /api/guide/ask` PostgreSQL `interactions` jadvaliga yangi qator qo'shadi va `GET /api/analytics/summary` da `totalInteractions` +1 oshadi.

#### `BE-02` — Strukturalashgan Request Logging Middleware `[P0]`
- **Fayl:** yangi `apps/api/src/middleware/request-logger.ts`, `apps/api/src/app.ts`
- **Aniq talablar:**
  - Har bir HTTP so'rov tugaganda bitta toza qatorda log chiqarish:
    `[HTTP] POST /api/guide/ask -> 200 (1420ms) | lang=ja slug=kalta-minor img=false`
  - `GET /api/analytics/summary` har 5 soniyada kelgani uchun logni ifloslantirmaslik maqsadida uni faqat `NODE_ENV=development` yoki xato (`>=400`) holatida logga chiqarish.
- **Qabul mezoni:** Debug qilish va mentorlarga real javob vaqtini (`ms`) ko'rsatish oson bo'ladi.

#### `BE-03` — QR Skan Hodisasini Qayd Etish Endpointi (`POST /api/landmarks/:slug/scan`) `[P0]`
- **Fayl:** `apps/api/src/db/schema.ts`, `src/db/index.ts`, `src/routes/landmarks.routes.ts`, `src/services/analytics.service.ts`
- **Nima uchun kerak:** Sayyoh QR-kodni skanerlab sahifani ochganida, savol bermasdan oldin ham muzey panelida "QR skanerlandi" statistikasi tushishi kerak!
- **Aniq spetsifikatsiya:**
  - Request: `POST /api/landmarks/:slug/scan` body: `{ sessionId: string, language: SupportedLanguage }`
  - `qr_scans` jadvalini qo'shish (`id`, `landmarkId`, `landmarkSlug`, `language`, `sessionId`, `createdAt`) — `ensureSchemaExists()` ga ham qo'shishni unutmang!
  - Response: `201 Created` `{ ok: true, scanId: number }`
  - `getAnalyticsSummary()` da `totalTourists` hisoblanayotganda ham `interactions.session_id`, ham `qr_scans.session_id` union'idan unique sayyohlar sanalsin (yoki `totalQrScans` qo'shimcha metrika sifatida hisoblansin).
- **Qabul mezoni:** Frontend sahifa ochilishi bilan chaqirganda DB'ga dublikatsiz yoziladi, mavjud `AnalyticsSummary` kontraktini buzmaydi.

---

### 2-BOSQICH (25-noyabr 19:00 – 26-noyabr 13:00) — P1 Keshlash, B2B Eksport va Himoya

#### `BE-04` — Smart Response + Audio Cache (`cache.service.ts`) `[P1 · ENG MUHIM OPTIMIZATSIYA]`
- **Fayl:** yangi `apps/api/src/services/cache.service.ts`, `apps/api/src/routes/guide.routes.ts`
- **Biznes va texnik sabab:**
  - Tezkor savollar (masalan *"Why is Kalta Minor unfinished?"* yoki *"Tell me a local legend"*) barcha sayyohlarning ~60–70% so'rovini tashkil qiladi.
  - Agar har bir sayyohda qayta Gemini Text + Gemini TTS chaqirilsa, 2–3 soniya vaqt va API puli ketadi. Kesh orqali bir xil savolga **<100ms** da va **$0** xarajat bilan javob + WAV audio qaytaramiz!
- **Aniq arxitektura:**
  1. **Kesh kaliti:** Faqat `hasImage === false` bo'lgan so'rovlar uchun:
     ```ts
     const cacheKey = `${landmark.slug}:${language}:${normalizeQuestion(question)}:${includeAudio ? 'audio' : 'text'}`;
     ```
     (`normalizeQuestion`: `.trim().toLowerCase().replace(/[?!.,'’"]/g, '').replace(/\s+/g, ' ')`)
  2. **Saqlash:** In-memory `Map` (LRU max 150 ta yozuv, TTL `12 soat` — 150 ta WAV audio ~15–25MB RAM oladi, AWS server uchun juda yengil!) YOKI PostgreSQL `response_cache` jadvali.
  3. **MUHIM:** Keshdan javob topilsa ham **`logTouristInteraction(...)` ALBATTA chaqirilishi shart**, shunda B2B Dashboard'dagi real-time statistika va jonli savollar oqimi 100% aniq ishlashda davom etadi!
  4. **Kesh tozalash:** AI/RAG Dev `ichan-qala-landmarks.json` ni yangilab serverni restart qilganda in-memory kesh avtomatik tozalanadi (agar DB kesh ishlatsangiz, `db:seed` da `TRUNCATE response_cache` qiling).
- **Qabul mezoni:** Bir xil tezkor savol 2-marta berilganda javob vaqti `>1500ms` dan `<100ms` ga tushadi, WAV audio to'liq qaytadi va Dashboard'ga yangi yozuv tushadi.

#### `BE-05` — B2B CSV Analitika Eksporti (`GET /api/analytics/export`) `[P1]`
- **Fayl:** `apps/api/src/routes/analytics.routes.ts`, `apps/api/src/services/analytics.service.ts`
- **Aniq talablar:**
  - `GET /api/analytics/export` barcha `interactions` ni `landmarks.name` bilan JOIN qilib RFC-4180 standartidagi toza CSV (UTF-8 BOM `\uFEFF` bilan — Excel'da o'zbek/rus/yapon/koreys harflari buzilmasdan ochilishi uchun!) qaytaradi.
  - Ustunlar: `ID,Timestamp_UTC,Landmark_Slug,Landmark_Name,Language,Session_ID,Snap_And_Ask,Source_Mode,Response_Time_Ms,Question`
  - Headerlar:
    - `Content-Type: text/csv; charset=utf-8`
    - `Content-Disposition: attachment; filename="smartguide-ichan-qala-analytics.csv"`
- **Qabul mezoni:** Brauzerda havolani ochganda Excel'da to'g'ri ochiladigan `.csv` fayl yuklab olinadi.

#### `BE-06` — Rate Limiting va Payload Himoyasi `[P1]`
- **Fayl:** yangi `apps/api/src/middleware/rate-limiter.ts`, `apps/api/src/routes/guide.routes.ts`
- **Aniq talablar:**
  - `POST /api/guide/ask` uchun yengil in-memory sliding-window rate limiter: bitta IP/session uchun 1 daqiqada maksimum `25` ta so'rov (Demo Day'da bitta Wi-Fi NAT ortidan 15 ta hakam birga kirishi mumkinligini hisobga olib, kalit sifatida **IP emas, `req.body.sessionId` + IP kombinatsiyasi** yoki kengroq `60 req/min per IP` qo'ying!).
  - Limitdan oshganda `429 Too Many Requests` + `{ error: "Too many guide requests. Please wait a few seconds.", retryAfterSec: 10 }`.
  - Base64 rasm o'lchamini tekshirish: dekodlangan hajm `6MB` dan oshsa `413 Payload Too Large` qaytarish.
- **Qabul mezoni:** Oddiy 15 ta hakam parallel foydalanganda hech kim bloklanmaydi; cheksiz sikl/spam esa API kvotani yeb qo'ymaydi.

#### `BE-07` — Demo Day Oldidan Bazani Tozalab Qayta Seed Qilish Skripti (`db:reset`) `[P1]`
- **Fayl:** `apps/api/src/db/reset.ts`, `apps/api/package.json`, root `package.json`
- **Nima uchun kerak:** 48 soatlik test davomida bazaga *"asdf", "test 123"* kabi sinov savollari yig'ilib qoladi. Demo Day'dan 30 daqiqa oldin `npm run db:reset` buyrug'i bilan bazani bir soniyada toza, chiroyli boshlang'ich holatga qaytarish kerak!
- **Aniq talablar:**
  - `TRUNCATE TABLE interactions RESTART IDENTITY CASCADE;` (va `qr_scans` bo'lsa uni ham) → keyin `seedDatabase()` chaqiradi.
  - Yakunida nechta landmark va nechta toza boshlang'ich analitika yozuvi yaratilganini konsolga chiqaradi.

#### `BE-08` — Analytics SQL Unumdorligi va Vaqt Zonasi (Toshkent UTC+5) `[P1]`
- **Fayl:** `apps/api/src/services/analytics.service.ts`
- **Aniq talablar:**
  - `hourlyActivity` SQL so'rovida `AT TIME ZONE 'Asia/Tashkent'` dan foydalanish (hozir `'UTC'` turibdi — Toshkentda 11:00 da Demo Day paytida grafikda `06:00` emas, real **`11:00`** ko'rinishi juda muhim!).
  - `GET /api/analytics/summary` javob vaqti `<50ms` bo'lishini tekshirish.
  - Barcha raqamli maydonlar (`totalTourists`, `visits`, `revenue.*`) `NaN` yoki `null` qaytarmasligini (bo'sh jadvalda ham `0` qaytishini) tekshirish.

---

### 3-BOSQICH (26-noyabr 13:00 – 19:00 CODE FREEZE) — P2 AWS Ubuntu Production Deploy

#### `BE-09` — AWS Ubuntu Serverga Native Deploy (PostgreSQL + Node 22 + PM2) `[P0 · DEPLOY]`
- [GIT_WORKFLOW_AND_DEPLOY.md](GIT_WORKFLOW_AND_DEPLOY.md) dagi barcha qadamlarni bajarish:
  1. PostgreSQL servisi + `smartguide` foydalanuvchisi va bazasi.
  2. `.env` faylini production qiymatlari bilan to'ldirish (`NODE_ENV=production`, `CORS_ORIGIN=*` yoki aniq domenlar, real `GEMINI_API_KEY`).
  3. `npm install --no-audit --no-fund && npm run build && npm run db:push && npm run db:seed`.
  4. PM2 orqali 3 ta servisni ishga tushirish (`smartguide-api`, `smartguide-tourist`, `smartguide-dashboard`), `pm2 save` va `pm2 startup`.

#### `BE-10` — Nginx Reverse Proxy + HTTPS (Certbot) `[P1 · MOBIL KAMERA/MIKROFON UCHUN]`
- **Nima uchun juda muhim:** Mobil brauzerlarda (ayniqsa iOS Safari) mikrofon (`SpeechRecognition`) va PWA xususiyatlari faqat **HTTPS** da to'liq ishlaydi.
- Agar domen/subdomen mavjud bo'lsa Nginx + Certbot HTTPS ulash; agar faqat IP bo'lsa `nip.io` (masalan `smartguide.<AWS_IP>.nip.io`) orqali bepul Let's Encrypt HTTPS sertifikat olish mumkin!

#### `BE-11` — Yuklama va Parallel Barqarorlik Testi (Load Test) `[P2]`
- 10 ta parallel `POST /api/guide/ask` + 5 ta parallel `GET /api/analytics/summary` so'rovini bir vaqtda yuborib tekshirish:
  - 0 ta `500` xato
  - PostgreSQL pool to'lib qolmaydi
  - PM2 xotira sarfi barqaror (`pm2 monit`)

---

## 4. AI/RAG Dev Bilan O'zaro Shartnoma (Interface Contract)

`apps/api/src/routes/guide.routes.ts` faqat `apps/api/src/services/ai.service.ts` dan quyidagi 3 ta funksiyani chaqiradi:
```ts
identifyLandmarkFromImage(imageBase64, imageMimeType, allLandmarks, fallbackSlug)
  => Promise<{ slug: string; identifiedByVision: boolean }>

generateVerifiedGuideAnswer({ landmark, question, language, imageBase64, imageMimeType })
  => Promise<{ answer: string; modelUsed: string; sourceMode: 'gemini-rag' | 'verified-rag-fallback' }>

synthesizeGuideAudio(text, language)
  => Promise<{ audioBase64: string; audioMimeType: string } | null>
```
Bu signaturalarni kelishuvsiz o'zgartirmang — aks holda merge vaqtida kompilyatsiya xatosi chiqadi.

---

## 5. QA Test Senariylari (Merge va Deploy Oldidan Majburiy Checklist)

| # | Test Senariysi | Kutilayotgan Natija |
| :--- | :--- | :--- |
| 1 | `GET /api/health` | `200 OK`, `database: "connected"`, `aiConfigured: true` |
| 2 | `GET /api/landmarks` | `200 OK`, `count: 5`, barcha 5 slug to'liq |
| 3 | `GET /api/landmarks/invalid-slug` | `404 Not Found`, tushunarli JSON `error` |
| 4 | `POST /api/guide/ask` bo'sh `question` va `imageBase64` siz | `400 Bad Request`, Zod validatsiya tafsilotlari |
| 5 | `POST /api/guide/ask` bir xil tezkor savolni 2 marta ketma-ket yuborish | 1-so'rov Gemini'dan (~1.5–3s), 2-so'rov keshdan (`<100ms`), ikkalasi ham PostgreSQL `interactions` ga yoziladi |
| 6 | `GET /api/analytics/summary` | `<50ms`, soatlar Toshkent vaqtida (`Asia/Tashkent`), `revenue.museumShareUsd` = 30% |
| 7 | `GET /api/analytics/export` | `200 OK`, `.csv` fayl, UTF-8 harflar (O'zbek/Rus/Yapon) Excel'da buzilmaydi |
| 8 | `npm run db:reset` | Test chiqindilari tozalanadi, 5 ta obida + toza boshlang'ich analitika qaytadi |
| 9 | `GEMINI_API_KEY` ni noto'g'ri qiymatga almashtirib so'rov yuborish | Server qulamaydi (`500` bermaydi), `sourceMode: "verified-rag-fallback"` bilan tasdiqlangan matn qaytaradi |
