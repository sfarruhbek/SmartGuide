# SmartGuide — API Kontrakt Spetsifikatsiyasi (Yakuniy Konsepsiya)

Ushbu hujjat **Frontend (`apps/tourist`, `apps/dashboard`)**, **Backend (`apps/api`)** va **AI/RAG (`apps/api/src/services/ai.service.ts`)** o'rtasidagi qat'iy JSON shartnomasidir.

**Yagona manba:** [packages/shared/src/index.ts](../packages/shared/src/index.ts)  
> ⚠️ **Qoida:** Yangi maydon qo'shish (backward-compatible) erkin, lekin mavjud maydon nomlarini o'zgartirish faqat 3 dasturchi kelishuvi bilan qilinadi.

---

## Umumiy Parametrlar

- **Local Base URL:** `http://localhost:4000`
- **Content-Type:** `application/json`
- **Tillar (`SupportedLanguage`):** `"en" | "uz" | "ru" | "ja" | "ko" | "es"`
- **Qiziqish yo'nalishlari (`TravelVibe`):** `"legends" | "architecture" | "photography" | "royalty" | "spiritual"`
- **5 ta Ichan-Qal'a obida slug'lari:** `kalta-minor`, `juma-mosque`, `tosh-hovli`, `kunya-ark`, `pahlavon-mahmud`

---

## 1. Health Check — `GET /api/health`

```json
{
  "status": "ok",
  "service": "smartguide-api",
  "database": "connected",
  "aiConfigured": true,
  "models": {
    "ragVision": "gemini-3.5-flash-lite",
    "fallback": "gemini-4-hydrogen",
    "tts": "gemini-3.8-flash-lite-tts"
  },
  "timestamp": "2026-11-26T06:30:00.000Z"
}
```

---

## 2. Shaxsiy Emotsional Roadmap Yaratish — `POST /api/roadmap/generate` *(1-QADAM — GPS + EMOTSIONAL ROADMAP)*

Sayyoh kirishdagi reklama QR/kiosk orqali ilovani ochishi bilan uning **GPS joylashuvi (`lat/lng`)**, vaqti va qiziqishlariga hamda real sayyohlar qiziqishi (`landmark_topic_signals`) bazasiga tayangan holda **eng yaqin obyektlardan boshlab Emotsional Roadmap** chizib beradi. *(Har bir obidada QR-kod bo'lishi shart emas!)*

### Request Body (`GenerateRoadmapRequest`)
```json
{
  "sessionId": "visitor-8a71b2c3d4e5",
  "language": "en",
  "durationMinutes": 120,
  "vibes": ["legends", "photography"],
  "lat": 41.3781,
  "lng": 60.3580,
  "refSource": "west-gate-kiosk"
}
```
- `durationMinutes`: `60` (2–3 obida), `120` (4 obida), `240` (barcha 5 obida).
- `vibes`: `TravelVibe[]` (1 dan 3 tagacha).
- `lat`, `lng` *(ixtiyoriy)*: sayyohning joriy GPS koordinatalari (berilsa, masofa `distanceMeters` va eng yaqin boshlash nuqtasi hisoblanadi; berilmasa Ota-Darvoza kirish darvozasidan boshlanadi).
- `refSource` *(ixtiyoriy)*: sayyoh qaysi reklama QR-kodi yoki kioskdan kirgani (`west-gate-kiosk`, `hotel-orient`, `khiva-station`, `direct`) — B2B marketing attribution uchun!

### Response `200 OK` (`GenerateRoadmapResponse`)
```json
{
  "roadmapId": 14,
  "sessionId": "visitor-8a71b2c3d4e5",
  "language": "en",
  "headline": "Your 2-Hour Khiva Legends & Golden Photo Journey",
  "totalMinutes": 110,
  "dataDrivenNote": "Ranked from 84+ real Ichan-Qala tourist conversations — zero boring encyclopedia fluff.",
  "stops": [
    {
      "order": 1,
      "slug": "kalta-minor",
      "name": "Kalta Minor Minaret",
      "latitude": 41.37828,
      "longitude": 60.35833,
      "distanceMeters": 34,
      "walkingMinutesFromPrev": 1,
      "estimatedMinutes": 20,
      "whyVisit": "Start with instant awe: Khiva's glowing turquoise unfinished giant right beside you.",
      "emotionalPayoff": "Wonder & iconic Silk Road photography",
      "topSignalHighlight": "92% of visitors loved the secret legend of the architect escaping on wings & why the tower halted at 29m.",
      "noiseFilteredNote": "Skipping dry 19th-century tax chronicles — focused on the drama and blue glaze secret.",
      "interestScore": 94
    },
    {
      "order": 2,
      "slug": "juma-mosque",
      "name": "Juma Mosque",
      "latitude": 41.37826,
      "longitude": 60.35969,
      "distanceMeters": 148,
      "walkingMinutesFromPrev": 2,
      "estimatedMinutes": 25,
      "whyVisit": "Step out of the desert sun into a 1,000-year-old forest of 213 carved wooden pillars cooled naturally by skylights.",
      "emotionalPayoff": "Serenity, cool atmosphere & magical light-shaft photos",
      "topSignalHighlight": "87% of visitors asked how the 10th-century elm columns survived and how natural ventilation drops heat by 10°C.",
      "noiseFilteredNote": "Focused on the oldest 10th-century Kufic column and acoustic secret.",
      "interestScore": 89
    }
  ],
  "createdAt": "2026-11-26T06:31:00.000Z"
}
```

---

## 3. Obidalar Ro'yxati, GPS Yaqinlik va Tafsilot — `GET /api/landmarks`, `GET /api/landmarks/nearby`, `GET /api/landmarks/:slug`

- `GET /api/landmarks` → barcha 5 ta obida ro'yxati (`slug`, `localizedNames`, `latitude`, `longitude`, `triggerRadiusMeters`, `era`, `builtYear`, `emotionalPromise`, `estimatedVisitMinutes`, `vibeTags`, `topSignalScore`, `suggestedQuestions`).
- `GET /api/landmarks/nearby?lat=41.3782&lng=60.3584` → Haversine masofa bo'yicha eng yaqin obyektlarni tartiblab qaytaradi:
  ```json
  {
    "inSiteRange": true,
    "nearest": {
      "slug": "kalta-minor",
      "name": "Kalta Minor Minaret",
      "distanceMeters": 11,
      "isWithinTriggerRadius": true
    },
    "landmarks": [{ "slug": "kalta-minor", "distanceMeters": 11 }, "..."]
  }
  ```
- `GET /api/landmarks/:slug` → bitta obidaning to'liq tasdiqlangan muzey pasporti (`historicalFacts`, `architecturalDetails`, `localLegends`, `visualCues`, `topSignals`, `archiveCode`).
- `POST /api/landmarks/:slug/visit` → `{ sessionId, language, source: "gps_nearby" | "roadmap" | "promo_qr" | "snap_photo", refSource? }` → `201 Created { ok: true, visitId }` (obida ochilishi va reklama kanali attribution hodisasi).

---

## 4. Obida Oldida Jonli AI Suhbat + Signal Ajratish — `POST /api/guide/ask` *(2-QADAM)*

Sayyoh obida oldida matn, ovoz yoki **Snap & Ask** rasm yuborganda:
1. Agar rasm bo'lsa → Gemini Vision qaysi obida ekanini taniydi.
2. Obidaning tasdiqlangan pasporti + **eng yuqori Signal faktlari** asosida javob beradi (keraksiz shovqinni filtrlash!).
3. Fonda/strukturaviy tarzda **sayyohning qiziqqan mavzusi (`detectedTopic`), kategoriyasi (`signalCategory`), taassuroti (`sentiment`) va qiziqish ballini (`interestScore`)** ajratib PostgreSQL `interactions` + `landmark_topic_signals` jadvallariga yozadi!
4. `gemini-3.8-flash-lite-tts` orqali WAV ovoz qaytaradi.

### Request Body (`GuideAskRequest`)
```json
{
  "landmarkSlug": "kalta-minor",
  "question": "Why is Kalta Minor unfinished?",
  "language": "en",
  "sessionId": "visitor-8a71b2c3d4e5",
  "roadmapId": 14,
  "imageBase64": "(ixtiyoriy — base64 JPEG/PNG/WebP)",
  "imageMimeType": "image/jpeg",
  "includeAudio": true
}
```

### Response `200 OK` (`GuideAskResponse`)
```json
{
  "interactionId": 52,
  "landmarkSlug": "kalta-minor",
  "landmarkName": "Kalta Minor Minaret",
  "language": "en",
  "answer": "Muhammad Amin Khan began Kalta Minor in 1851 dreaming of an 80-meter tower...",
  "audioBase64": "UklGRiQAAABXQVZFZm10IBAAAA...",
  "audioMimeType": "audio/wav",
  "identifiedByVision": false,
  "verifiedBy": "Ichan-Qala State Historical & Architectural Museum-Reserve Archive",
  "archiveCode": "IQ-KH-001",
  "modelUsed": "gemini-3.5-flash-lite",
  "sourceMode": "gemini-rag",
  "responseTimeMs": 1290,
  "insight": {
    "detectedTopicKey": "kalta-minor-unfinished-1855",
    "detectedTopicLabel": "Why Kalta Minor stopped at 29 meters",
    "signalCategory": "history",
    "sentiment": "curious",
    "interestScore": 5
  },
  "nextStopSuggestion": {
    "slug": "juma-mosque",
    "name": "Juma Mosque",
    "teaser": "Next on your journey: step into a naturally cooled forest of 213 ancient wooden columns (3 min walk)."
  }
}
```

---

## 5. Sayyoh Taassuroti (Micro-Feedback) — `POST /api/guide/feedback` *(3-QADAM — SIGNAL VS NOISE)*

Sayyoh AI javobidan so'ng 1 ta tugmani bosadi (`🔥 Qiziqarli` / `🤯 Hayratlanarli` / `😐 Ahamiyatsiz`) — bu darhol `landmark_topic_signals.signal_score` ni yangilaydi!

### Request Body
```json
{
  "interactionId": 52,
  "rating": "fascinating"
}
```
- `rating`: `"fascinating" | "surprising" | "not_relevant"`

### Response `200 OK`
```json
{
  "ok": true,
  "interactionId": 52,
  "topicKey": "kalta-minor-unfinished-1855",
  "updatedSignalScore": 96
}
```

---

## 6. B2B Experience Intelligence & Analitika — `GET /api/analytics/summary` & `GET /api/analytics/export`

B2B Dashboard har **5 soniyada** `GET /api/analytics/summary` ga so'rov yuboradi. Mavjud KPI va grafiklardan tashqari endi **Data Flywheel Intellekti** maydonlarini ham qaytaradi:

### Response `200 OK` (`AnalyticsSummary` — kengaytirilgan)
```json
{
  "siteName": "Ichan-Qala State Museum-Reserve · Khiva",
  "totalTourists": 34,
  "totalInteractions": 62,
  "totalRoadmapsGenerated": 28,
  "totalPhotoScans": 19,
  "avgQuestionsPerTourist": 1.82,
  "topLandmark": {
    "slug": "kalta-minor",
    "name": "Kalta Minor Minaret",
    "visits": 19,
    "sharePercent": 30.65
  },
  "revenue": {
    "blendedPassPriceUsd": 7.0,
    "cityPassPriceUsd": 4.99,
    "silkRoadPassPriceUsd": 12.99,
    "grossRevenueUsd": 238.0,
    "estimatedApiCostPerTouristUsd": 0.07,
    "totalEstimatedApiCostUsd": 2.38,
    "grossMarginPercent": 91.0
  },
  "visitsByLandmark": [
    {
      "slug": "kalta-minor",
      "name": "Kalta Minor Minaret",
      "visits": 19,
      "uniqueTourists": 15,
      "photoScans": 8,
      "avgInterestScore": 4.8,
      "sharePercent": 30.65
    }
  ],
  "touristsByLanguage": [
    {
      "code": "ja",
      "language": "Japanese",
      "countryLabel": "Japan",
      "tourists": 8,
      "interactions": 15,
      "sharePercent": 23.5
    }
  ],
  "signalVsNoise": {
    "topHighSignalTopics": [
      {
        "landmarkSlug": "kalta-minor",
        "landmarkName": "Kalta Minor Minaret",
        "topicKey": "kalta-minor-architect-legend",
        "topicLabel": "Legend of the Architect's Escape on Wings",
        "category": "legend",
        "askCount": 14,
        "positiveReactions": 11,
        "negativeReactions": 0,
        "signalScore": 95
      }
    ],
    "lowInterestNoiseTopics": [
      {
        "landmarkSlug": "tosh-hovli",
        "landmarkName": "Tosh-Hovli Palace",
        "topicKey": "tosh-hovli-administrative-tax-records",
        "topicLabel": "19th-Century Palace Budget & Tax Ledgers",
        "category": "history",
        "askCount": 1,
        "positiveReactions": 0,
        "negativeReactions": 4,
        "signalScore": 22
      }
    ]
  },
  "sentimentBreakdown": [
    { "sentiment": "awe", "count": 24, "sharePercent": 38.7 },
    { "sentiment": "fascinated", "count": 21, "sharePercent": 33.9 },
    { "sentiment": "curious", "count": 13, "sharePercent": 21.0 },
    { "sentiment": "neutral", "count": 3, "sharePercent": 4.8 },
    { "sentiment": "bored", "count": 1, "sharePercent": 1.6 }
  ],
  "curiosityGaps": [
    {
      "landmarkSlug": "juma-mosque",
      "landmarkName": "Juma Mosque",
      "question": "Can visitors climb the Juma Mosque minaret today?",
      "language": "en",
      "createdAt": "2026-11-26T05:40:00.000Z"
    }
  ],
  "hourlyActivity": [{ "hour": "11:00", "interactions": 7, "tourists": 5 }],
  "recentQuestions": ["..."],
  "updatedAt": "2026-11-26T06:35:00.000Z"
}
```

### CSV Eksport — `GET /api/analytics/export`
- `Content-Type: text/csv; charset=utf-8` (UTF-8 BOM bilan)
- Sayyoh savollari, aniqlangan mavzu (`detected_topic`), hissiyot (`sentiment`), qiziqish balli (`interest_score`) va foydalanuvchi bahosini Excel'ga yuklab beradi.

---

## Tezkor `curl` Test Buyruqlari

```bash
# 1. Emotsional Roadmap yaratish
curl -X POST http://localhost:4000/api/roadmap/generate \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"judge-01","language":"en","durationMinutes":120,"vibes":["legends","photography"]}'

# 2. Jonli savol berish + Interest/Sentiment ajratish
curl -X POST http://localhost:4000/api/guide/ask \
  -H "Content-Type: application/json" \
  -d '{"landmarkSlug":"kalta-minor","question":"Tell me the local legend about the architect","language":"en","sessionId":"judge-01","includeAudio":false}'

# 3. Micro-feedback yuborish (Signal score oshishi!)
curl -X POST http://localhost:4000/api/guide/feedback \
  -H "Content-Type: application/json" \
  -d '{"interactionId":1,"rating":"fascinating"}'

# 4. B2B Experience Intelligence & Signal vs Noise xulosasi
curl http://localhost:4000/api/analytics/summary
```
