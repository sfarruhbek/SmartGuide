# SmartGuide — Tizim Arxitekturasi va Data Flywheel Dizayni

Ushbu hujjat **SmartGuide** ning yakuniy mahsulot arxitekturasini — **Emotsional Shaxsiy Roadmap → Jonli Obida Suhbatlari → Sayyoh Qiziqishi va Signal/Noise Intellekti (Self-Learning Flywheel)** tizimini texnik jihatdan to'liq tushuntiradi.

---

## 1. Yopiq Zanjirli Data Flywheel Arxitekturasi (Boshqa AI'lardan Asosiy Farqimiz)

```mermaid
flowchart TB
    subgraph S1["1-QADAM: Kirishda Shaxsiy Emotsional Roadmap"]
        PREF["Sayyoh profili:\nTil · Vaqt (1h/2h/4h) · Qiziqish (Afsona/Me'morchilik/Foto/Tarix)"]
        RM_GEN["POST /api/roadmap/generate\nSignal-Weighted Roadmap Engine"]
        RM_UI["Emotsional Roadmap:\nQayerga? Nega? Qanday hissiyot/foyda oladi?\n(Real sayyohlar reytingi bilan!)"]
        PREF --> RM_GEN --> RM_UI
    end

    subgraph S2["2-QADAM: Obida Oldida Jonli AI Suhbat"]
        VISIT["Obidaga yetib kelish\n(Roadmap tap · QR-kod · Snap & Ask foto)"]
        ASK["POST /api/guide/ask\nVerified Local RAG + Gemini Vision + Gemini 3.8 TTS"]
        FEEDBACK["Sayyoh munosabati\n(Suhbat matni + Micro-reaksiya: 🔥/🤯/😐)"]
        RM_UI --> VISIT --> ASK --> FEEDBACK
    end

    subgraph S3["3-QADAM: Tourist Interest & Signal/Noise Flywheel (MOAT)"]
        EXTRACT["Interest & Impression Extractor\n(Mavzu · Hissiyot/Sentiment · Signal vs Noise · Curiosity Gap)"]
        PG[("PostgreSQL Intelligence DB\nlandmarks · roadmaps · interactions · landmark_topic_signals")]
        B2B["B2B Experience Intelligence Dashboard\nSignal vs Noise Heatmap · Sentiment · Revenue Share · QR Generator"]
        FEEDBACK --> EXTRACT --> PG
        PG -->|"Real-time 5s Poll"| B2B
    end

    PG ==>|"Yopiq tsikl: Eng qiziq obidalar va Signal faktlar\nkeyingi sayyohlar Roadmap & hikoyalarini yaxshilaydi!"| RM_GEN
    PG ==>|"Signal-first Storytelling:\nKeraksiz shovqinni (Noise) olib tashlaydi"| ASK
```

---

## 2. To'liq So'rovlar Ketma-Ketligi (Sequence Diagram)

```mermaid
sequenceDiagram
    actor T as Sayyoh (Smartfon)
    participant PWA as apps/tourist (Next.js)
    participant API as apps/api (Express)
    participant DB as PostgreSQL
    participant AI as Gemini 3.5 Flash-Lite
    participant TTS as Gemini 3.8 Flash-Lite TTS
    participant DASH as apps/dashboard (B2B)

    Note over T,DB: 1-BOSQICH: Emotsional va Foyda Asosidagi Shaxsiy Roadmap
    T->>PWA: Ilovaga kiradi, til + vaqt + qiziqish (vibe) tanlaydi
    PWA->>API: POST /api/roadmap/generate { language, durationMinutes, interests, sessionId }
    API->>DB: 5 ta obida + real landmark_topic_signals (eng yuqori Signal reytinglari) ni o'qiydi
    API->>AI: Signal reytinglariga tayangan holda tartiblangan Emotsional Roadmap tuzadi
    AI-->>API: Har bir stop uchun: nega borish, qanday hissiyot/foyda, top signal fakt
    API->>DB: roadmaps jadvaliga yozadi
    API-->>PWA: Shaxsiy Roadmap kartalari

    Note over T,DB: 2-BOSQICH: Obida Oldida Jonli Suhbat + Signal/Noise Yig'ish
    T->>PWA: Obidaga boradi (/l/kalta-minor), savol beradi yoki rasmga oladi
    PWA->>API: POST /api/guide/ask { landmarkSlug, question, language, sessionId, imageBase64? }
    API->>DB: Tasdiqlangan muzey pasporti + top Signal faktlarni oladi
    API->>AI: Strict RAG + Signal-first javob + Interest/Sentiment JSON tahlili
    AI-->>API: { answer, detectedTopic, signalCategory, sentiment, interestScore, curiosityGap? }
    API->>TTS: Toza matn → WAV audio (24kHz)
    TTS-->>API: Base64 audio/wav
    API->>DB: interactions + landmark_topic_signals (signal_score++, sentiment) yangilanadi
    API-->>PWA: { answer, audioBase64, detectedTopic, nextStopSuggestion }

    Note over T,DASH: 3-BOSQICH: B2B Real-Time Experience Intelligence
    loop Har 5 soniyada
        DASH->>API: GET /api/analytics/summary
        API->>DB: Obidalar qiziqishi, Signal vs Noise jadvali, Sentiment, Curiosity Gaps, Daromad
        API-->>DASH: Jonli yangilangan B2B panel
    end
```

---

## 3. Ma'lumotlar Bazasi Sxemasi (PostgreSQL + Drizzle ORM)

```mermaid
erDiagram
    landmarks ||--o{ interactions : "has many"
    landmarks ||--o{ landmark_topic_signals : "tracks signal vs noise"
    roadmaps ||--o{ interactions : "optional journey link"

    landmarks {
        serial id PK
        text slug UK "kalta-minor, juma-mosque, ..."
        text name
        jsonb localized_names
        text era
        text built_year
        text architect
        text location_in_site
        text archive_code "IQ-KH-001..005"
        integer estimated_visit_minutes "15..35 min"
        jsonb emotional_promise "6 tilda: nima his qiladi/foyda oladi"
        jsonb vibe_tags "legends, architecture, photography, royalty, spiritual"
        jsonb historical_facts "tagged facts: id, text, category"
        jsonb architectural_details
        jsonb local_legends
        jsonb visual_cues
        jsonb suggested_questions
    }

    roadmaps {
        serial id PK
        text session_id
        text language
        integer duration_minutes "60 | 120 | 240"
        jsonb selected_vibes
        jsonb stops_json "ordered stops + why + emotion + topSignal"
        timestamptz created_at
    }

    interactions {
        serial id PK
        integer landmark_id FK
        text landmark_slug
        text language
        text question
        text answer_preview
        boolean has_image
        boolean identified_by_vision
        text session_id
        text detected_topic "e.g. architect-escape-legend"
        text signal_category "legend | architecture | history | photo_spot | practical"
        text sentiment "awe | fascinated | curious | neutral | bored"
        integer interest_score "1..5"
        text user_feedback "fascinating | surprising | not_relevant | null"
        text curiosity_gap "unanswered question if outside archive"
        text source_mode
        integer response_time_ms
        timestamptz created_at
    }

    landmark_topic_signals {
        serial id PK
        integer landmark_id FK
        text landmark_slug
        text topic_key "e.g. unfinished-1855-battle"
        text topic_label "Why Kalta Minor stopped at 29m"
        text category "legend | architecture | history | photo_spot"
        integer ask_count "necha marta so'ralgan"
        integer positive_reactions "🔥/🤯 soni"
        integer negative_reactions "😐/keraksiz soni"
        real signal_score "0..100: Signal vs Noise indeksi"
        timestamptz updated_at
    }
```

---

## 4. "Signal vs. Noise" Ajratish Mexanizmi Qanday Ishlaydi?

Oddiy AI har bir obida uchun 20 ta faktning hammasini bir xil vaznda saqlaydi. SmartGuide'da esa har bir fakt/mavzu o'z **Signal Score (`0–100`)** indeksiga ega:

$$\text{Signal Score} = \text{clamp}\left(50 + 6 \cdot \ln(1 + \text{ask\_count}) + 12 \cdot \text{positive\_reactions} - 18 \cdot \text{negative\_reactions} + 8 \cdot \text{avg\_awe\_bonus},\; 0,\; 100\right)$$

- **`Signal Score >= 75` (High Signal / "Oltin fakt"):**
  - Yangi sayyohning **Emotsional Roadmap** kartasida *"Sayyohlarni eng ko'p hayratlantirgan nuqta"* sifatida chiqadi.
  - Jonli suhbatda AI birinchi navbatda shu mavzularni jonli, qisqa hikoya qilib beradi.
- **`Signal Score < 35` (Low Signal / "Noise — Ahamiyatsiz"):**
  - AI buni o'zidan-o'zi cho'zib gapirib sayyohni zeriktirmaydi (faqat sayyoh aniq so'rasa javob beradi).
  - B2B Dashboard'da muzey ma'muriyatiga *"Sayyohlar e'tibor bermayotgan ma'lumotlar"* bo'limida ko'rsatiladi!

---

## 5. Barqarorlik va Graceful Degradation (4 Qatlamli Himoya)

1. **Model Fallback:** `gemini-3.5-flash-lite` xato bersa → avtomatik `gemini-4-hydrogen`.
2. **Offline/Archive Fallback:** API kalit ishlamasa ham, Roadmap va RAG javoblari PostgreSQL'dagi tasdiqlangan `landmarks` + `landmark_topic_signals` dan deterministik tarzda qaytadi (`500` xato chiqmaydi!).
3. **TTS Fallback:** Gemini 3.8 TTS kechiksa yoki xato bersa → Frontend `AudioGuidePlayer` brauzerning `speechSynthesis` ovoziga o'tadi.
4. **Smart Cache:** Bir xil tezkor savollar keshdan `<100ms` va `$0` API xarajatida qaytadi, lekin har bir savol baribir `interactions` va `landmark_topic_signals` ni yangilaydi!
