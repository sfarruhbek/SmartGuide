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

Ixtiyoriy `imageBase64`, `imageMimeType`. Kamida savol yoki foto kerak. Savol max 500 belgi; base64 max 12M belgi. Foto boʻlmasa slug kerak. Brauzer mikrofon diktovkasini matnga aylantiradi; streaming audio chat endpointi yoʻq.

Response maydonlari: `interactionId`, `landmarkSlug`, `landmarkName`, `language`, `answer`, optional `audioBase64`/`audioMimeType`, `identifiedByVision`, `verifiedBy`, `archiveCode`, `modelUsed`, `sourceMode`, `responseTimeMs`. `sourceMode`: `gemini-rag | verified-rag-fallback`. `identifiedByVision: false` boʻlsa surat muvaffaqiyatli tanildi deb koʻrsatmaslik kerak. `verifiedBy` stringi mustaqil tarixiy audit dalili emas.

Hozir backend `roadmapId`, `insight`, `nextStopSuggestion`ni shared response sifatida kafolatlamaydi. Frontend ularni faqat optional kengaytma sifatida tushunadi.

### Analytics — amaldagi maydonlar

`siteName`, `totalTourists`, `totalInteractions`, `totalPhotoScans`, `avgQuestionsPerTourist`, `topLandmark`, `revenue`, `visitsByLandmark`, `touristsByLanguage`, `hourlyActivity`, `recentQuestions`, `updatedAt`.

Mavjud `revenue` metrikalari taxminiy foydalanishdan hisoblanadi: payment-ledger yoki haqiqiy sotuv emas. `countryLabel` til metadatasi, millat dalili emas. `grossMarginPercent`ning eski API formulasi toʻliq moliyaviy model sifatida ishlatilmaydi; dashboardning alohida kalkulyatori [smeta](SMETA_BUDGET.md) dagi 30% / 2% / AI / server formulasini ishlatadi.

## 2. Legacy Xiva kengaytmalari — taklif, backendda ulanmagan

Frontend adapterlari mavjud. `packages/shared`ga hali kiritilmagan; mavjud nomlarni buzishdan oldin backend/AI egasi bilan kelishish kerak.

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

Duration: 60 / 120 / 240; vibes 1–3: legends / architecture / photography / royalty / spiritual. Frontend kutadigan response: `roadmapId`, `sessionId`, `language`, `headline`, `totalMinutes`, `stops`, `createdAt`, optional `dataDrivenNote`.

Stop: `order`, `slug`, `name`, `estimatedMinutes`, `whyVisit`, `emotionalPayoff`; optional `topSignalHighlight`, `noiseFilteredNote`, `interestScore`. Foiz yoki namunalar soni haqiqiy agregatsiya boʻlmasa qaytarilmasin. Frontend malformed/unavailable javobni lokal curated marshrut bilan almashtirib, manbasini belgilaydi. Bu milliy ko‘p kunlik trip endpointi emas.

Oldingi taklifdagi `lat`, `lng`, `refSource`, stop masofasi/trigger fields — kelajak dizayni; joriy UI/API integratsiya ularni ishlatmaydi.

### POST `/api/guide/feedback`

Request `{ interactionId, rating }`, rating `fascinating | surprising | not_relevant`. Frontend success uchun `{ ok: true }` kutadi. Hozir endpoint yoʻq: UI retry/xato ko‘rsatadi. Saqlangan reaksiya yoki signal yangilandi deb aytmaydi.

### Qolgan pilot takliflari

- GET `/api/landmarks/nearby?lat&lng`: opt-in joylashuv. Radius/precision/no-permission fallback kelishiladi.
- POST `/api/landmarks/:slug/visit`: sessionId/language/source/refSource. Hozir legacy frontend `/scan`ga best-effort urinish ham qiladi; bu ham backend route emas va zarur oqimni bloklamaydi.
- GET `/api/analytics/export`: CSV. Hozir dashboard joriy summary asosida BOM-li CSV fallback yaratadi.
- Analytics optional fields: `totalRoadmapsGenerated`, `avgInterestScore`, `signalVsNoise`, `sentimentBreakdown`, `curiosityGaps`. UI ularni yo‘q bo‘lsa ixtiro qilmaydi. Aniq shape: [dashboard experience types](../apps/dashboard/src/lib/experience.ts).
- Guide optional `insight` va `nextStopSuggestion`: [tourist experience types](../apps/tourist/src/lib/experience.ts). Bular shared ABI deb tasdiqlanmagan.

## 3. Milliy safar — frontend lokal modeli

Hozir yangi HTTP endpoint chaqirilmaydi. [journey.ts](../apps/tourist/src/lib/journey.ts) ichidagi `TripInput`, `Trip`, `TripDay`, `TripSlot` lokal model, kelishilgan server kontrakti emas.

```json
{
  "cities": ["bukhara", "samarkand"],
  "days": 4,
  "budget": 2000000,
  "interests": ["local", "history"],
  "accommodation": true,
  "customCity": ""
}
```

Budget UZS, bir kishi, mamlakatga kelish yoʻlisiz. Kunlar 1–14; shaharlar tartibi va har shaharga kamida bir kun. Interests: history / local / food / nature / sacred. Legacy TravelVibe bilan teng emas. Resultda kunlar va slotlar, subtotal, 10% reserve, total va shortfall mavjud. Barcha summalar whole UZS; joriy quote emas. Trip uchun global backend ID yoki fake session success yoʻq.

`Discovery`: nom, shahar, lat/lng, hikoya, source, fact/legend/personal turi va sana. Hozir faqat shaxsiy localStorage. Public moderation statusi yoki nashr API si yoʻq.

Backend/AI egasi bilan keyin kelishiladi: city/place ID va manba versiyasi, sana/availability, narx range va valyuta, transfer jadvali, trip saqlash, moderation/consent, nationwide recognition confidence, payment va attribution. Tasdiqlanmagan URLlarni tayyor API deb qoʻshmaslik kerak.

## 4. Tekshiruv chegarasi

Typecheck/build endpoint tayyorligi yoki tarixiy aniqlik testi emas. Mock bilan UI tekshiruvi real Gemini, PostgreSQL, toʻlov yoki RAG eval o‘rnini bosmaydi. Kengaytmalarni ulashda muvaffaqiyat/xato/malformed/timeout va privacy holatlari haqiqiy backend bilan tekshiriladi.
