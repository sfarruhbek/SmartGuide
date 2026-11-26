# SmartGuide — API kontrakti va bajarilish holati

26-noyabr 2026. **Amaldagi shared tiplari:** [packages/shared/src/index.ts](../packages/shared/src/index.ts). Quyidagi statuslar repodagi Express route lar bilan solishtirilgan. Dizayn taklifi route yoki DB migratsiyasi tayyorligini bildirmaydi.

> **Mahsulot va pilot chegarasi:** SmartGuide'ning **asosiy mahsulot API'si** — butun Oʻzbekiston (16+ shahar va erkin shaharlar) boʻylab toʻliq kunlik sayohat Roadmap'i va byudjet smetasini chizuvchi **`POST /api/trips/compose`** endpointidir; eski `/api/trips/generate` compatibility uchun saqlangan. Quyidagi 5 ta Xiva (Ichan-Qal'a) slug'i (`kalta-minor`, `juma-mosque`, `tosh-hovli`, `kunya-ark`, `pahlavon-mahmud`), `/api/guide/ask` va `/api/roadmap/generate` esa faqat **1-bosqich chuqurlashtirilgan RAG/Vision pilot hududi**ga tegishli boʻlib, butun mahsulot geografiyasini cheklamaydi.

Base URL `http://localhost:4000`, JSON. Til: `en | uz | ru | ja | ko | es`. Pilot slug: `kalta-minor | juma-mosque | tosh-hovli | kunya-ark | pahlavon-mahmud`. Milliy frontend katalog ID lari shu enumni almashtirmaydi.

## 1. Amaldagi runtime

| Method / path | Response yoki vazifa |
| --- | --- |
| GET `/api/health` | status, database, aiConfigured, models, timestamp; DB uzilsa 503 |
| GET `/api/landmarks` | `{ site, count, landmarks: LandmarkSummary[] }` |
| GET `/api/landmarks/:slug` | `{ landmark: LandmarkDetail }`; topilmasa 404 |
| POST `/api/guide/ask` | `GuideAskResponse` |
| POST `/api/trips/compose` | Qoʻlda/Live shaxsiy trip; Groq kunlik tanlov, exclusions, summary, server smeta, revision |
| GET `/api/trips/current` | Joriy private `{workspace,revision,access}` |
| GET `/api/access` | `{registered,remaining,limits}` — server trial qoldigʻi |
| POST `/api/trips/generate` | Legacy trip v2; Groq ranking + server smeta, belgilangan local-fallback |
| POST `/api/audio/speech` | Gemini TTS → base64 WAV yoki 503 |
| POST `/api/roadmap/generate` | Xiva qisqa yurishi, Groq; persistence yoʻq, roadmapId null |
| GET `/api/explore/places` | `cityId` yoki `lat/lng` bo‘yicha `{places,areas}` |
| POST `/api/explore/identify` | Snap JPEG → Groq photo recognition va manbali javob; mikrofon talab qilinmaydi |
| POST `/api/explore/live/session` | Map/GPS konteksti → bir martalik 60 soniyalik token |
| WS `/api/explore/live` | Gemini Live audio/foto, manbalar va yaqin joylar |
| POST `/api/auth/register` | `{login,password,name}` → 201 `{user}` va HttpOnly sessiya cookie |
| POST `/api/auth/login` | `{login,password}` → 200 `{user}` va yangi sessiya cookie |
| GET `/api/auth/session` | `{user}` yoki `{user:null}` |
| POST `/api/auth/logout` | JSON `{}` → `{user:null}`, cookie/sessiya bekor qilinadi |
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

## 3. Oldingi milliy trip endpointi — compatibility

`POST /api/trips/generate` quyidagi legacy payloadni qabul qiladi. Yangi asosiy UI `/compose` ishlatadi; quyidagi fallback tavsifi faqat eski endpointga tegishli. [Joriy ishga tushirish va tekshiruv](LIVE_API_SETUP.md), [AI backend handoff](AI_BACKEND_HANDOFF.md).

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

Backend/AI egasi bilan keyin kelishiladi: katalog va manba versiyasi, sana/availability, tekshirilgan narx range, transfer jadvali, production DB trip saqlash/history/sync, moderation/consent, nationwide recognition confidence, payment va attribution.

## 4. Joriy qoʻlda/ovozli rejalashtirish va trial

### POST `/api/trips/compose`

```json
{
  "preferences": {"cities":["bukhara"],"days":2,"budget":100,"interests":["local"],"accommodation":true,"customCity":""},
  "language": "ru",
  "instruction": "Убери это место и добавь местную кухню",
  "action": "revise",
  "excludePlaceId": "fayzabad"
}
```

`preferences` — oldingi `TripInput` cheklovlari; `language` 6 til; `instruction` max 1000, default empty; `action:create|revise`, default create; optional `excludePlaceId` max 120. Qayta yozishda server joriy workspaceʼni va avvalgi exclusionsʼni oladi. Boʻsh instruction bilan qoʻlda yuborilgan preferences oʻzgarmasligi tekshiriladi. Ovozdagi `manage_trip` ham shu kompozitsiya xizmatini chaqiradi.

Response: `{trip,source:"groq",modelUsed,fallbackReason:null,excludedIds,revision,costBasis:"planning-allowances"}`. Trip v2ʼga `places` (haqiqatan tanlangan katalog/source records) va lokalizatsiyalangan `summary` qoʻshilgan. Model har kun uchun 0–2 tekshirilgan ID tanlaydi; transfer kunlari joysiz. Excluded/unknown/duplicate ID va notoʻgʻri city/day rad etiladi. Pul/vaqt server hisobida; `estimatedAdmission:true` narx tekshirilmaganini bildiradi, `admission:0` bepul kirish degani emas. `storyLanguage:"en"` inglizcha source excerptʼni belgilaydi. Frontend bu metadata va AI tartibini saqlaydi.

400 notoʻgʻri input; 402 `REGISTRATION_REQUIRED` yangi plan limiti tugaganda; 409 revision parallel oʻzgarganda; 429 technical limiter; 503 AI/storage mavjud emas. Xato yangi tayyor lokal tur sifatida yashirilmaydi, muvaffaqiyatsiz create urinish rezervi qaytariladi. Oʻzining bor planini oʻzgartirish yana bitta creation sarflamaydi.

### GET `/api/trips/current` va GET `/api/access`

`/current` → `{workspace:null|{trip,source,modelUsed,fallbackReason,excludedIds},revision,access}`. `/access` → `{registered,remaining,limits}`. Mehmon uchun `limits:{plans:1,photos:3,voiceSeconds:180}` va 0 dan limitgacha `remaining`; hisob bilan `remaining:null`. Hammasi no-store va same-origin cookie bilan. Joriy private workspace va trial server JSON faylda, mahalliy Trip v2 nusxasi brauzerda.

Limiti tugagan imkoniyatgina registratsiya soʻraydi: yangi create, yangi distinct foto yoki jami 180 sekunddan keyin Live. Qolgan imkoniyatlar va saqlangan plan oʻqilishi ochiq. Live reconnect vaqtni tiklamaydi; foto follow-up encoded image xeshi bilan dedup qilinadi. Aʼzo foydalanuvchi savdo ishga tushguncha bepul davom etadi; provider/IP/concurrency limitlari qoladi. [Toʻliq trial va saqlash chegaralari](TRIAL_AND_PLANNING.md).

## 5. Snap va auth — amaldagi endpointlar

### POST `/api/explore/identify`

```json
{
  "cityId": "bukhara",
  "language": "ru",
  "question": "Расскажи об этом месте",
  "imageBase64": "<JPEG base64>",
  "imageMimeType": "image/jpeg",
  "locationSource": "map"
}
```

`cityId` — katalogdagi 16 shahardan biri. JPEG base64 max 300000 belgi, savol max 500; begona maydonlar rad etiladi. GPS bo‘lsa `locationSource:gps` va `{location:{lat,lng,accuracy?}}` kerak. Response: `{answer,language,modelUsed,photoModelUsed,source:"groq",locationSource,nearby,focusPlace,sources,photo,webRecordsAdded}`. `photo.status` — `possible-match | unknown`; `placeId` null bo‘lishi mumkin. Noaniq foto tasdiqlangan obida sifatida chiqarilmaydi. 400 input, 402 `REGISTRATION_REQUIRED` trial tugaganda, 429/503 technical limit/provider; `Cache-Control:no-store`. Bir encoded foto haqida qayta savol SHA-256 orqali taniladi va yangi foto sifatida hisoblanmaydi. Foto xaritadagi shahar bilan majburan bog‘lanmaydi. [Haqiqiy regression natijasi](SNAP_API_CHECK_2026-11-26.json).

### `/api/auth/*`

Login 3–80 ASCII harf/raqam va `_.@+-`; bo‘shliqlar chetdan olinadi, registrdan qatʼi nazar. Name 1–80, password 8–128. Email login sifatida qabul qilinadi, ammo email verification/recovery yo‘q. Ochiq `user`: `{id,login,name,createdAt}`. Parol/hash/session token response yoki localStoragega qaytmaydi.

Sessiya `smartguide_session` HttpOnly, SameSite=Lax, Path=/api, 7 kun; productionda Secure. Login eski cookie sessiyasini almashtiradi; logout uni serverdan o‘chiradi. JSON POST va ruxsat etilgan Origin talab qilinadi. 400 input, 401 noto‘g‘ri login/parol, 409 band login, 403 Origin, 415 JSON, 429 limit, 503 storage. Barcha javoblar no-store. Login/register: 20 urinish/10 minut/IP, process bo‘yicha ikki parallel urinish.

Turist brauzeri same-origin Next proxy ishlatadi. Alohida cross-origin cookie auth sozlanmagan. Hozirgi private JSON-store scrypt parol xeshlari va SHA-256 session token xeshlarini saqlaydi, bir API process uchun; PostgreSQL auth migratsiyasi bajarilmagan. `AUTH_STORE_FILE` persistent yo‘lni sozlaydi. Registratsiya tugagan trial imkoniyatini davom ettirishga ruxsat beradi va mehmon workspaceʼini hisobda hali reja boʻlmasa koʻchiradi. Registratsiya toʻlov yoki production cloud sync degani emas. [Backend topshirish](STITCH_IMPLEMENTATION.md).

## 6. Tekshiruv chegarasi

Typecheck/build endpoint tayyorligi yoki tarixiy aniqlik testi emas. Mock bilan UI tekshiruvi real Gemini, PostgreSQL, toʻlov yoki RAG eval o‘rnini bosmaydi. Kengaytmalarni ulashda muvaffaqiyat/xato/malformed/timeout va privacy holatlari haqiqiy backend bilan tekshiriladi.
