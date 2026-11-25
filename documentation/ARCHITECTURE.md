# SmartGuide — Tizim Arxitekturasi va Texnik Dizayn

Ushbu hujjat texnik mentorlar (Behruz Saidjonov, Aziza Turaeva), hakamlar hay'ati va yangi qo'shilayotgan dasturchilar uchun **SmartGuide** tizimining to'liq arxitekturasini tushuntiradi.

---

## 1. Umumiy Tizim Arxitekturasi

```mermaid
flowchart LR
    subgraph Tourist["Sayyoh Telefoni (Ilova yuklamasdan)"]
        QR["QR-kod (Kassa / Obida)"] --> PWA["Tourist PWA\nNext.js 15 · :3000"]
    end

    subgraph Museum["Muzey Ma'muriyati (B2B)"]
        ADMIN["Executive Dashboard\nReact 19 + Vite · :5173"]
    end

    subgraph Backend["SmartGuide Core API (Node.js + Express 5 · :4000)"]
        ROUTES["REST API + Zod Validation"]
        CACHE["Smart Response & Audio Cache\n(Tezkor savollar <100ms)"]
        RAG["Verified Local RAG Engine\n(ai.service.ts)"]
        ANALYTICS["B2B Analytics & Revenue Engine"]
    end

    subgraph Data["Ma'lumotlar va AI"]
        PG[("PostgreSQL\nlandmarks · interactions · qr_scans")]
        GEMINI_V["Gemini 3.5 Flash-Lite\n(Fallback: Gemini 4 Hydrogen)\nMultimodal Vision + Grounded RAG"]
        GEMINI_TTS["Gemini 3.8 Flash-Lite TTS\n(WAV Audio · 6 til)"]
    end

    PWA -->|"GET /api/landmarks/:slug\nPOST /api/guide/ask"| ROUTES
    ADMIN -->|"Poll 5s: GET /api/analytics/summary\nGET /api/analytics/export"| ROUTES
    ROUTES --> CACHE
    CACHE -->|"Cache Miss"| RAG
    RAG -->|"1. Tasdiqlangan dossier"| PG
    RAG -->|"2. Vision + Grounded Text"| GEMINI_V
    RAG -->|"3. Audio WAV"| GEMINI_TTS
    ROUTES -->|"Har doim yoziladi"| ANALYTICS
    ANALYTICS --> PG
```

---

## 2. "Snap & Ask" + Zero-Hallucination RAG Ishlash Ketma-Ketligi

```mermaid
sequenceDiagram
    actor T as Sayyoh (Smartfon)
    participant PWA as apps/tourist (Next.js)
    participant API as apps/api (Express)
    participant DB as PostgreSQL
    participant AI as Gemini 3.5 Flash-Lite
    participant TTS as Gemini 3.8 Flash-Lite TTS
    participant DASH as apps/dashboard (B2B)

    T->>PWA: QR skanerlaydi (/l/kalta-minor) + Rasm oladi yoki savol beradi
    PWA->>PWA: Rasmni 1024px JPEG (~120KB) ga siqadi
    PWA->>API: POST /api/guide/ask { landmarkSlug, question, language, sessionId, imageBase64? }
    opt Agar imageBase64 mavjud bo'lsa
        API->>DB: 5 ta obidaning visualCues katalogini oladi
        API->>AI: Vision: Qaysi Ichan-Qal'a obidasi?
        AI-->>API: "kalta-minor"
    end
    API->>DB: Faqat "kalta-minor" ning tasdiqlangan muzey pasportini oladi
    API->>AI: Strict system_instruction (ONLY VERIFIED DOSSIER) + savol/rasm
    AI-->>API: Aniq, 0% gallyutsinatsiya javob (tanlangan tilda)
    API->>TTS: Toza nutq matni + speech_metadata.style
    TTS-->>API: Base64 audio/wav (24kHz PCM WAV)
    API->>DB: INSERT INTO interactions (landmark_id, language, question, session_id, has_image)
    API-->>PWA: { answer, audioBase64, archiveCode, identifiedByVision }
    PWA-->>T: Matn ko'rsatiladi + Ovozli gid ijro etiladi
    loop Har 5 soniyada
        DASH->>API: GET /api/analytics/summary
        API->>DB: Real-time SQL agregatsiya
        API-->>DASH: Yangi sayyoh, grafiklar, 30% muzey ulushi, LIVE NEW savol!
    end
```

---

## 3. Ma'lumotlar Bazasi Sxemasi (PostgreSQL + Drizzle ORM)

```mermaid
erDiagram
    landmarks ||--o{ interactions : "has many"
    landmarks {
        serial id PK
        text slug UK "kalta-minor, juma-mosque, ..."
        text name
        jsonb localized_names "en, uz, ru, ja, ko, es"
        text era
        text built_year
        text architect
        text location_in_site
        text verified_by
        text archive_code "IQ-KH-001 .. IQ-KH-005"
        jsonb historical_facts
        jsonb architectural_details
        jsonb local_legends
        jsonb visual_cues
        jsonb suggested_questions
        timestamptz created_at
        timestamptz updated_at
    }

    interactions {
        serial id PK
        integer landmark_id FK
        text landmark_slug
        text language "en, uz, ru, ja, ko, es"
        text question
        text answer_preview
        boolean has_image
        boolean identified_by_vision
        text session_id "Anonymous browser UUID"
        text source_mode "gemini-rag | verified-rag-fallback"
        integer response_time_ms
        timestamptz created_at
    }
```

**Indekslar (Tezkor B2B agregatsiya uchun):**
- `idx_interactions_landmark_id`
- `idx_interactions_language`
- `idx_interactions_session_id`
- `idx_interactions_created_at`

---

## 4. Nima Uchun "Structured Verified Dossier Injection" (Chunking o'rniga)?

Oddiy RAG tizimlari hujjatlarni 500 tokenlik bo'laklarga (chunks) bo'lib, vektor qidiruvda ko'pincha muhim sanalar yoki afsona kontekstini yo'qotib qo'yadi.  
Ichan-Qal'a kabi tarixiy obidalarda esa:
1. Sayyoh **QR-kod** yoki **Snap & Ask Vision** orqali aynan qaysi obida oldida turgani 100% ma'lum bo'ladi.
2. Bitta obidaning to'liq tasdiqlangan muzey pasporti atigi **~800–1,200 token** — bu `gemini-3.5-flash-lite` (1M token kontekst) ga to'liq, hech bir detalni yo'qotmasdan sig'adi!
3. Natija: **0% kontekst uzilishi, 0% gallyutsinatsiya**, minimal infratuzilma (qo'shimcha Vector DB kerak emas — faqat PostgreSQL!).

---

## 5. Unit-Ekonomika va Barqarorlik (B2B2C Modeli)

| Ko'rsatkich | Qiymat | Izoh |
| :--- | :--- | :--- |
| Chipta ustamasi (sayyoh to'lovi) | **$4.00 / sayyoh** | Jonli giddan ($40–$60) 10 baravar arzon |
| Muzey ulushi (B2B Revenue Share) | **$1.20 (30%)** | Muzey uchun $0 kapital xarajat + bepul analitika paneli |
| SmartGuide ulushi | **$2.80 (70%)** | Server va AI xarajatlarini qoplaydi |
| O'rtacha Gemini API xarajati | **~$0.15 / sayyoh** | `gemini-3.5-flash-lite` + `gemini-3.8-flash-lite-tts` + tezkor savollar keshi |
| Yalpi marja (Gross Margin) | **~95%+** | Sog'lom SaaS/B2B2C unit-ekonomika (`LTV >= 3 x CAC`) |

### Graceful Degradation (Ishonchlilik Qatlamlari)
1. **Model fallback:** `gemini-3.5-flash-lite` xato bersa → avtomatik `gemini-4-hydrogen`.
2. **Offline/Quota fallback:** Gemini API umuman javob bermasa → PostgreSQL'dagi tasdiqlangan arxivdan deterministik matn qaytadi (`sourceMode: "verified-rag-fallback"`).
3. **TTS fallback:** Gemini TTS javob bermasa → Frontend `AudioGuidePlayer` avtomatik qurilmaning o'z `speechSynthesis` ovoziga o'tadi.
4. **Rasm fallback:** Obida fotosi yuklanmasa → `LandmarkArt` maxsus vektor SVG illyustratsiyani ko'rsatadi.
