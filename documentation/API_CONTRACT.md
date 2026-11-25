# SmartGuide — API Kontrakt Spetsifikatsiyasi

Ushbu hujjat **Frontend (`apps/tourist`, `apps/dashboard`)**, **Backend (`apps/api`)** va **AI/RAG (`apps/api/src/services/ai.service.ts`)** o'rtasidagi qat'iy JSON shartnomasidir.

**Yagona manba (Single Source of Truth):** [packages/shared/src/index.ts](../packages/shared/src/index.ts)  
> ⚠️ **Muhim qoida:** Mavjud maydon nomlarini buzuvchi (breaking) o'zgarish qilishdan oldin barcha 3 dasturchi kelishib oladi va birinchi navbatda `packages/shared/src/index.ts` yangilanadi.

---

## Umumiy Ma'lumotlar

- **Local Base URL:** `http://localhost:4000`
- **Content-Type:** `application/json`
- **Qo'llab-quvvatlanadigan tillar (`SupportedLanguage`):** `"en" | "uz" | "ru" | "ja" | "ko" | "es"`
- **5 ta tasdiqlangan obida slug'lari:**
  1. `kalta-minor`
  2. `juma-mosque`
  3. `tosh-hovli`
  4. `kunya-ark`
  5. `pahlavon-mahmud`

---

## 1. Health Check — `GET /api/health`

Server, PostgreSQL va Gemini API konfiguratsiyasi holatini tekshiradi.

### Response `200 OK` (yoki DB ulanmagan bo'lsa `503`)
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
  "timestamp": "2026-11-25T09:15:00.000Z"
}
```

---

## 2. Barcha Obidalar Ro'yxati — `GET /api/landmarks`

Tourist PWA asosiy sahifasi (`/`) va Dashboard QR Code Generator uchun barcha 5 ta obidani qaytaradi.

### Response `200 OK`
```json
{
  "site": "Ichan-Qala, Khiva",
  "count": 5,
  "landmarks": [
    {
      "id": 1,
      "slug": "kalta-minor",
      "name": "Kalta Minor Minaret",
      "localizedNames": {
        "en": "Kalta Minor Minaret",
        "uz": "Kalta Minor minorasi",
        "ru": "Минарет Кальта-Минор",
        "ja": "カルタ・ミノル・ミナレット",
        "ko": "칼타 미노르 미나레트",
        "es": "Minarete Kalta Minor"
      },
      "era": "Khiva Khanate · Qungrat Dynasty",
      "builtYear": "1851–1855",
      "architect": "Usto Qalandar Khivaki (ceramic glazing by Master Abdulla Jin)",
      "locationInSite": "West Square, immediately inside Ata-Darvoza (West Gate)...",
      "shortDescription": "Khiva's iconic turquoise-tiled unfinished minaret...",
      "localizedShortDescriptions": { "en": "...", "uz": "...", "ru": "...", "ja": "...", "ko": "...", "es": "..." },
      "accentColor": "#14B8A6",
      "suggestedQuestions": {
        "en": ["Why is Kalta Minor unfinished?", "..."],
        "uz": ["Kalta Minor nega oxirigacha qurilmagan?", "..."],
        "ru": ["..."],
        "ja": ["..."],
        "ko": ["..."],
        "es": ["..."]
      }
    }
  ]
}
```

---

## 3. Bitta Obida Tafsiloti — `GET /api/landmarks/:slug`

QR-kod orqali `/l/[slug]` ochilganda obidaning to'liq muzey pasportini qaytaradi.

### Response `200 OK`
```json
{
  "landmark": {
    "id": 1,
    "slug": "kalta-minor",
    "name": "Kalta Minor Minaret",
    "localizedNames": { "...": "..." },
    "era": "Khiva Khanate · Qungrat Dynasty",
    "builtYear": "1851–1855",
    "architect": "Usto Qalandar Khivaki...",
    "locationInSite": "West Square...",
    "shortDescription": "...",
    "localizedShortDescriptions": { "...": "..." },
    "accentColor": "#14B8A6",
    "suggestedQuestions": { "...": [] },
    "historicalFacts": ["..."],
    "architecturalDetails": ["..."],
    "localLegends": ["..."],
    "visualCues": ["..."],
    "verifiedBy": "Ichan-Qala State Historical & Architectural Museum-Reserve Archive",
    "archiveCode": "IQ-KH-001"
  }
}
```

### Error `404 Not Found`
```json
{
  "error": "Landmark \"unknown-slug\" was not found in the verified Ichan-Qala archive."
}
```

---

## 4. AI-Gidga Savol Berish / Snap & Ask — `POST /api/guide/ask`

Sayyohning matnli savoli yoki kameradan yuklangan rasmi asosida tasdiqlangan RAG javob + Gemini TTS WAV audio qaytaradi va interaksiyani PostgreSQL'ga yozadi.

### Request Body (`GuideAskRequest`)
```json
{
  "landmarkSlug": "kalta-minor",
  "question": "Why is Kalta Minor unfinished?",
  "language": "en",
  "sessionId": "visitor-8a71b2c3d4e5",
  "imageBase64": "(ixtiyoriy — base64 JPEG/PNG/WebP string, data: prefix bilan yoki prefixsiz)",
  "imageMimeType": "image/jpeg",
  "includeAudio": true
}
```

**Validatsiya qoidalari (Zod):**
- `question` yoki `imageBase64` dan kamida bittasi bo'lishi **shart**.
- Agar `imageBase64` berilmagan bo'lsa, `landmarkSlug` **majburiy**.
- Agar `imageBase64` berilgan bo'lsa, `landmarkSlug` ixtiyoriy — Vision modeli 5 ta obidadan qaysi biri ekanini o'zi aniqlaydi!
- Maksimal JSON tana hajmi: `15mb` (Frontend rasmni 1024px JPEG ~100KB ga siqib yuboradi).

### Response `200 OK` (`GuideAskResponse`)
```json
{
  "interactionId": 49,
  "landmarkSlug": "kalta-minor",
  "landmarkName": "Kalta Minor Minaret",
  "language": "en",
  "answer": "Construction of Kalta Minor began in 1851 under Muhammad Amin Khan...",
  "audioBase64": "UklGRiQAAABXQVZFZm10IBAAAA...",
  "audioMimeType": "audio/wav",
  "identifiedByVision": false,
  "verifiedBy": "Ichan-Qala State Historical & Architectural Museum-Reserve Archive",
  "archiveCode": "IQ-KH-001",
  "modelUsed": "gemini-3.5-flash-lite",
  "sourceMode": "gemini-rag",
  "responseTimeMs": 1480
}
```

> **Audio eslatma:** `audioBase64` bo'lmasligi ham mumkin (masalan `includeAudio: false` bo'lsa, yoki `GEMINI_API_KEY` kiritilmagan bo'lsa, yoki TTS vaqtincha javob bermasa). Frontend bunday holatda avtomatik brauzer `speechSynthesis` tugmasiga o'tadi.

---

## 5. B2B Real-Time Analitika — `GET /api/analytics/summary`

B2B Museum Dashboard har 5 soniyada so'rov yuboradigan asosiy metrikalar endpointi.

### Response `200 OK` (`AnalyticsSummary`)
```json
{
  "siteName": "Ichan-Qala State Museum-Reserve · Khiva",
  "totalTourists": 26,
  "totalInteractions": 46,
  "totalPhotoScans": 16,
  "avgQuestionsPerTourist": 1.77,
  "topLandmark": {
    "slug": "kalta-minor",
    "name": "Kalta Minor Minaret",
    "visits": 15,
    "sharePercent": 32.61
  },
  "revenue": {
    "pricePerTouristUsd": 4,
    "grossRevenueUsd": 104,
    "museumSharePercent": 30,
    "museumShareUsd": 31.2,
    "smartGuideSharePercent": 70,
    "smartGuideShareUsd": 72.8,
    "estimatedApiCostPerTouristUsd": 0.15,
    "totalEstimatedApiCostUsd": 3.9,
    "grossMarginPercent": 96.25
  },
  "visitsByLandmark": [
    {
      "slug": "kalta-minor",
      "name": "Kalta Minor Minaret",
      "visits": 15,
      "uniqueTourists": 13,
      "photoScans": 7,
      "sharePercent": 32.61
    }
  ],
  "touristsByLanguage": [
    {
      "code": "en",
      "language": "English",
      "countryLabel": "International / UK & US",
      "tourists": 7,
      "interactions": 12,
      "sharePercent": 26.92
    }
  ],
  "hourlyActivity": [
    { "hour": "09:00", "interactions": 5, "tourists": 4 }
  ],
  "recentQuestions": [
    {
      "id": 49,
      "landmarkSlug": "kalta-minor",
      "landmarkName": "Kalta Minor Minaret",
      "language": "ja",
      "question": "なぜカルタ・ミノルは未完成のままなのですか？",
      "answerPreview": "1851年にムハンマド・アミン・ハンが...",
      "hasImage": true,
      "sessionId": "sess-jp-01",
      "createdAt": "2026-11-25T09:14:22.000Z"
    }
  ],
  "updatedAt": "2026-11-25T09:15:00.000Z"
}
```

---

## Tezkor `curl` Test Buyruqlari

```bash
# 1. Health check
curl http://localhost:4000/api/health

# 2. 5 ta obidani olish
curl http://localhost:4000/api/landmarks

# 3. Kalta Minor tafsiloti
curl http://localhost:4000/api/landmarks/kalta-minor

# 4. AI-gidga savol yuborish (audio bilan)
curl -X POST http://localhost:4000/api/guide/ask \
  -H "Content-Type: application/json" \
  -d '{
    "landmarkSlug": "kalta-minor",
    "question": "Why is Kalta Minor unfinished?",
    "language": "en",
    "sessionId": "test-judge-01",
    "includeAudio": false
  }'

# 5. B2B Analitika xulosasi
curl http://localhost:4000/api/analytics/summary
```
