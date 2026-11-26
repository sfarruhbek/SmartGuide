# SmartGuide — API kontrakti va bajarilish holati

26-noyabr 2026. **Amaldagi shared tiplari:** [packages/shared/src/index.ts](../packages/shared/src/index.ts). Quyidagi statuslar repodagi Express route lar bilan solishtirilgan. Dizayn taklifi route yoki DB migratsiyasi tayyorligini bildirmaydi.

Base URL `http://localhost:4000`, JSON. Til: `en | uz | ru | ja | ko | es`. Pilot slug: `kalta-minor | juma-mosque | tosh-hovli | kunya-ark | pahlavon-mahmud`. Milliy frontend katalog ID lari shu enumni almashtirmaydi.

## 1. Amaldagi runtime

| Method / path | Response yoki vazifa |
| --- | --- |
| GET `/api/health` | status, database, aiConfigured, models, timestamp; DB uzilsa 503 |
| GET `/api/landmarks` | `{ site, count, landmarks: LandmarkSummary[] }` |
| GET `/api/landmarks/:slug` | `{ landmark: LandmarkDetail }`; topilmasa 404 |
| POST `/api/guide/ask` | `GuideAskResponse` |
| POST `/api/trips/generate` | Milliy trip v2; Groq ranking + server smeta, local-fallback |
| POST `/api/audio/speech` | Gemini TTS → base64 WAV yoki 503 |
| POST `/api/roadmap/generate` | Xiva qisqa yurishi, Groq; persistence yoʻq, roadmapId null |
| GET `/api/explore/places` | `cityId` yoki `lat/lng` bo‘yicha `{places,areas}` |
| POST `/api/explore/live/session` | Map/GPS konteksti → bir martalik 60 soniyalik token |
| WS `/api/explore/live` | Gemini Live audio/foto, manbalar va yaqin joylar |
| GET `/api/analytics/summary` | `AnalyticsSummary` |

`GET /api/landmarks/nearby` hozir dinamik `/:slug` route bilan toʻqnashib 404 bo‘lishi mumkin; nearby sifatida tayyor emas. Health javobi real toʻlov yoki kontent tasdigʻi emas.

### Guide ask — amaldagi payload

```json
{
  "landmarkSlug": "kalta-minor",
  "question": "Why is it unfinished?",
  "language": "en",
  "sessionId": "visitor-example",
  "includeAudio": true
}
```

Ixtiyoriy `imageBase64`, `imageMimeType`. Kamida savol yoki foto kerak. Savol max 500 belgi; base64 max 12M belgi. Foto boʻlmasa slug kerak. Ushbu legacy oqimda brauzer mikrofon diktovkasini matnga aylantiradi. Xaritadagi yangi popup esa alohida [Live WebSocket protokoli](LIVE_VOICE_ASSISTANT.md) orqali audio va foto yuboradi.

Response maydonlari: `interactionId`, `landmarkSlug`, `landmarkName`, `language`, `answer`, optional `audioBase64`/`audioMimeType`, `identifiedByVision`, `verifiedBy`, `archiveCode`, `modelUsed`, `sourceMode`, `responseTimeMs`. `sourceMode`: `groq-rag | verified-rag-fallback`; oldingi `gemini-rag` shared tipida compatibility uchun qolgan. Ushbu legacy endpointda Gemini TTS uchun, Groq matn va foto uchun. Tanilmagan foto va tanlangan slug boʻlmasa 422. `identifiedByVision: false` boʻlsa surat muvaffaqiyatli tanildi deb koʻrsatmaslik kerak. `verifiedBy` stringi mustaqil tarixiy audit dalili emas.

Hozir backend `roadmapId`, `insight`, `nextStopSuggestion`ni shared response sifatida kafolatlamaydi. Frontend ularni faqat optional kengaytma sifatida tushunadi.

### Analytics — amaldagi maydonlar

`siteName`, `totalTourists`, `totalInteractions`, `totalPhotoScans`, `avgQuestionsPerTourist`, `topLandmark`, `revenue`, `visitsByLandmark`, `touristsByLanguage`, `hourlyActivity`, `recentQuestions`, `updatedAt`.

Mavjud `revenue` metrikalari taxminiy foydalanishdan hisoblanadi: payment-ledger yoki haqiqiy sotuv emas. `countryLabel` til metadatasi, millat dalili emas. `grossMarginPercent`ning eski API formulasi toʻliq moliyaviy model sifatida ishlatilmaydi; dashboardning alohida kalkulyatori [smeta](SMETA_BUDGET.md) dagi 30% / 2% / AI / server formulasini ishlatadi.

## 2. Xiva qisqa yurishi va keyingi kengaytmalar

Roadmap route va frontend adapteri ulangan. Feedback/nearby/visit/export hali taklif; umumiy shared roadmap tipi yoʻq.

### POST `/api/roadmap/generate`

Request:

```json
{
  "sessionId": "visitor-example",
  "language": "en",
  "durationMinutes": 120,
  "vibes": ["legends", "photography"]
}
```

Duration: 60 / 120 / 240; vibes 1–3: legends / architecture / photography / royalty / spiritual. Response: `roadmapId:null`, `sessionId`, `language`, `headline`, `totalMinutes`, `stops`, `createdAt`, `source:groq`, `modelUsed`. Mos ravishda 2/3/5 ta katalog stopi, daqiqalar yigʻindisi tanlangan vaqtga teng. AI ishlamasa 503; frontend curated fallbackni ochiq belgilaydi. Route saqlangan DB roadmap yaratmaydi va haqiqiy piyoda routing emas.

Stop: `order`, `slug`, `name`, `estimatedMinutes`, `whyVisit`, `emotionalPayoff`; optional `topSignalHighlight`, `noiseFilteredNote`, `interestScore`. Foiz yoki namunalar soni haqiqiy agregatsiya boʻlmasa qaytarilmasin. Frontend malformed/unavailable javobni lokal curated marshrut bilan almashtirib, manbasini belgilaydi. Bu milliy ko‘p kunlik trip endpointi emas.

Oldingi taklifdagi `lat`, `lng`, `refSource`, stop masofasi/trigger fields — kelajak dizayni; joriy UI/API integratsiya ularni ishlatmaydi.

### POST `/api/guide/feedback`

Request `{ interactionId, rating }`, rating `fascinating | surprising | not_relevant`. Frontend success uchun `{ ok: true }` kutadi. Hozir endpoint yoʻq: UI mavjud emasligini yoki vaqtinchalik xatoni ko‘rsatadi. Saqlangan reaksiya yoki signal yangilandi deb aytmaydi.

Audit yangilanishi: 404/405/501 boʻlsa frontend feedback vaqtincha mavjud emasligini koʻrsatadi va shu javob uchun tugmalarni oʻchiradi. Boshqa vaqtinchalik xatolarda retry qoladi. Guide POST timeout 45 soniya; navigatsiya yoki til almashganda soʻrov bekor qilinadi.

### Qolgan pilot takliflari

- GET `/api/landmarks/nearby?lat&lng`: opt-in joylashuv. Radius/precision/no-permission fallback kelishiladi.
- POST `/api/landmarks/:slug/visit`: sessionId/language/source/refSource. Hozir legacy frontend `/scan`ga best-effort urinish ham qiladi; bu ham backend route emas va zarur oqimni bloklamaydi.
- GET `/api/analytics/export`: CSV. Hozir dashboard joriy summary asosida BOM-li CSV fallback yaratadi.
- Analytics optional fields: `totalRoadmapsGenerated`, `avgInterestScore`, `signalVsNoise`, `sentimentBreakdown`, `curiosityGaps`. UI ularni yo‘q bo‘lsa ixtiro qilmaydi. Aniq shape: [dashboard experience types](../apps/dashboard/src/lib/experience.ts).
- Guide optional `insight` va `nextStopSuggestion`: [tourist experience types](../apps/tourist/src/lib/experience.ts). Bular shared ABI deb tasdiqlanmagan.

## 3. Milliy safar — frontend va server ulangan

`POST /api/trips/generate` quyidagi payloadni qabul qiladi. Milliy frontend uni chaqiradi, response/mablagʻ/joylarni validatsiya qiladi va olingan tartibni saqlaydi. [Joriy ishga tushirish va tekshiruv](LIVE_API_SETUP.md), [AI backend handoff](AI_BACKEND_HANDOFF.md).

```json
{
  "cities": ["bukhara", "samarkand"],
  "days": 4,
  "budget": 160,
  "interests": ["local", "history"],
  "accommodation": true,
  "customCity": ""
}
```

Budget USD, bir kishi, mamlakatga kelish yoʻlisiz. Kunlar 1–14; shaharlar tartibi va har shaharga kamida bir kun. Interests: history / local / food / nature / sacred. Legacy TravelVibe bilan teng emas. Resultda kunlar va slotlar, subtotal, 10% reserve, total va shortfall mavjud. Input budget USD dollar; Trip v2 currency USD, slot/total/reserve/shortfall va place admission integer USD centlarda. Bu joriy quote emas. Trip uchun global backend ID yoki fake session success yoʻq.

`Discovery`: nom, shahar, lat/lng, hikoya, source, fact/legend/personal turi va sana. Hozir faqat shaxsiy localStorage. Public moderation statusi yoki nashr API si yoʻq.

Server response: `{trip, source: "groq" | "local-fallback", modelUsed, fallbackReason, costBasis: "planning-allowances", amounts, warnings}`. Groq faqat katalog ID larini tartiblaydi; pul/vaqt serverda hisoblanadi. Model/quota xatosida lokal reja HTTP 200 bilan va aniq source bilan qaytadi; notoʻgʻri input 400. Route IP/concurrency limiti 429/503 qaytarishi mumkin.

Frontend `Trip.generation` ichida source/modelUsed/fallbackReason ni saqlaydi. HTTP xatosi lokal AI natija sifatida yashirilmaydi. `LANDMARK_STORE=json` holatida guide haqiqiy AI bilan ishlaydi, `interactionId:0`; analytics 503 `ANALYTICS_UNAVAILABLE`, health 200 va `analyticsAvailable:false`, `database:not-used`. PostgreSQL rejimida eski DB talablari saqlanadi.

`POST /api/audio/speech` input `{text, language}`, text 1–1400 belgi. Response `{audioBase64, audioMimeType: "audio/wav", modelUsed, provider: "gemini"}`; input xatosi 400, ovoz vaqtincha yoʻq boʻlsa 503 `{error, code:"AUDIO_UNAVAILABLE", text}`. Mikrofon STT yoki Live audio chat bu route vazifasi emas.

Backend/AI egasi bilan keyin kelishiladi: katalog va manba versiyasi, sana/availability, tekshirilgan narx range, transfer jadvali, trip saqlash, moderation/consent, nationwide recognition confidence, payment va attribution.

## 4. Tekshiruv chegarasi

Typecheck/build endpoint tayyorligi yoki tarixiy aniqlik testi emas. Mock bilan UI tekshiruvi real Gemini, PostgreSQL, toʻlov yoki RAG eval o‘rnini bosmaydi. Kengaytmalarni ulashda muvaffaqiyat/xato/malformed/timeout va privacy holatlari haqiqiy backend bilan tekshiriladi.
