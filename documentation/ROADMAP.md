# SmartGuide — Yakuniy 24 Soatlik Harakat Rejasi (2-kun va Demo Day)

**Tadbir:** Tourism Hackathon 2026 (25–27 noyabr 2026, CAEx Toshkent)  
**Yakuniy qaror (Pivot):** **Emotsional & Foyda Asosidagi Shaxsiy Roadmap → Obida Oldida Jonli AI Suhbat → Sayyoh Qiziqishi va Signal/Noise Intellekti (Self-Learning Flywheel)**  
**Joriy nuqta:** **26-noyabr (2-kun)** — **19:00 CODE FREEZE** gacha qolgan vaqtni 100% samarali taqsimlash!

---

## Jamoa Rollari va Parallel Mas'uliyat

| Rol | Git Branch | Asosiy Fokus | Asosiy Hujjatlar |
| :--- | :--- | :--- | :--- |
| **1. Frontend Dev** | `feat/frontend` | 1) GPS Yaqin Obyekt + Emotsional Roadmap (`/`) · 2) Obida jonli suhbat + Micro-Feedback (`/l/[slug]`) · 3) B2B Signal/Noise & Sentiment Dashboard + Promo QR (`apps/dashboard`) | [API_CONTRACT.md](API_CONTRACT.md) · [ARCHITECTURE.md](ARCHITECTURE.md) |
| **2. Backend Dev** | `feat/backend` | `roadmaps` + `landmark_topic_signals` + `landmark_visits` DB sxemasi, `GET /api/landmarks/nearby`, `POST /api/roadmap/generate`, `POST /api/guide/feedback`, Cache, CSV, AWS Deploy | [API_CONTRACT.md](API_CONTRACT.md) · [GIT_WORKFLOW_AND_DEPLOY.md](GIT_WORKFLOW_AND_DEPLOY.md) |
| **3. AI & RAG Dev** | `feat/ai-rag` | 5 ta obidaning GPS + Emotional Payoff + Tagged Facts RAG bazasi, Roadmap Generator prompt, Signal/Noise + Sentiment Extractor, Vision + Gemini 3.8 TTS, `eval-rag.ts` | [ARCHITECTURE.md](ARCHITECTURE.md) · [SMETA_BUDGET.md](SMETA_BUDGET.md) |
| **4. Speaker & PM** | — | Validatsiya faktlarini rasmiylashtirish, [BUSINESS_MODEL.md](BUSINESS_MODEL.md) + [SMETA_BUDGET.md](SMETA_BUDGET.md) asosida slaydlar, biznes mentorlik, 3 daqiqalik pitch repetitsiyasi | [BUSINESS_MODEL.md](BUSINESS_MODEL.md) · [SMETA_BUDGET.md](SMETA_BUDGET.md) |

---

## Soatbay "Jangovar Reja" (26-noyabr 11:30 → 27-noyabr 12:30)

### 1-BLOK: 26-noyabr, 11:30 – 13:30 — Yakuniy Kontrakt va Yadro (Core Flywheel)

- **11:30 – 11:50 (Hamma — 20 daqiqa Sync):**
  - `packages/shared/src/index.ts` ni yangi kontraktga (`GenerateRoadmapRequest/Response`, `GuideFeedbackRequest`, `SignalTopicMetric`, `SentimentMetric`, `CuriosityGapItem`) moslab yangilash va asosiy branchga qo'shish.
  - Har bir dasturchi `git pull` qilib, o'z branchida parallel boshlaydi.
- **11:50 – 13:30 (Parallel kodlash):**
  - **AI/RAG Dev:** `ichan-qala-landmarks.json` ga har bir obida uchun `emotionalPromise` (6 til), `vibeTags`, `estimatedVisitMinutes` va teglangan faktlarni (`taggedTopics`) qo'shish; `ai.service.ts` da `generateEmotionalRoadmap(...)` va `extractConversationInsight(...)` funksiyalarini yozish.
  - **Backend Dev:** `schema.ts` ga `roadmaps`, `landmark_topic_signals` va `interactions` insight ustunlarini qo'shish; `seed-data.ts` ni boyitish (Signal vs Noise ma'lumotlari bilan!); `POST /api/roadmap/generate` va `POST /api/guide/feedback` endpointlarini ulash.
  - **Frontend Dev:** `/` sahifasini **Emotsional Roadmap Builder** ga aylantirish (Til + Vaqt + Vibe tanlash → tartiblangan marshrut kartalari: *"Nega borish kerak?"*, *"Qanday hissiyot/foyda olasiz?"*, *"Sayyohlarning 92% ni hayratlantirgan fakt"*).

---

### 2-BLOK: 26-noyabr, 13:30 – 16:30 — Jonli Flywheel Bog'lanishi va B2B Intelligence

- **13:30 – 15:00 (Mentorlik + Integratsiya):**
  - **Speaker** biznes/pitch mentorlariga [BUSINESS_MODEL.md](BUSINESS_MODEL.md) (Trip Pass `$4.99/$12.99`, `LTV/CAC = 4.66×`) va [SMETA_BUDGET.md](SMETA_BUDGET.md) (`$0.035/sayyoh` real Gemini narxi, `$2,869` 3 oylik pilot smetasi) ni ko'rsatib, slayd matnlarini tasdiqlatadi.
  - **Frontend Dev:**
    - `/l/[slug]` sahifasiga Roadmap navigatsiyasi (*"1/4-bekat · Keyingi: Juma masjidi"*) va har bir AI javobi ostiga **1-tap Micro-Feedback tugmalari** (`🔥 Qiziqarli` · `🤯 Hayratlanarli` · `😐 Kerak emas`) qo'shadi.
    - `apps/dashboard` ga **Signal vs. Noise Content Matrix** (eng ko'p hayratlantirgan faktlar vs. zerikarli/ahamiyatsiz faktlar!), **Sentiment Donut/Bar**, **Curiosity Gaps** va **Revenue Simulator** ni qo'shadi!
  - **Backend Dev:**
    - `GET /api/analytics/summary` ga real PostgreSQL'dan `signalVsNoise`, `sentimentBreakdown`, `curiosityGaps` va `Asia/Tashkent` soatlarini ulaydi.
    - Tezkor savollar uchun `cache.service.ts` + `GET /api/analytics/export` CSV + `npm run db:reset` skriptini tayyorlaydi.
  - **AI/RAG Dev:**
    - Real `GEMINI_API_KEY` bilan 6 tilda (ayniqsa `UZ`, `EN`, `JA`, `KO`) Roadmap + Jonli suhbat + Vision + Gemini 3.8 TTS ni sinab, `eval-rag.ts` (**0% gallyutsinatsiya hisoboti**) natijasini Speaker'ga beradi!
- **15:30 – 16:30 (To'liq Merge #1):** Barcha 3 branch asosiy branchga birlashtiriladi, to'liq sikl tekshiriladi:
  `Roadmap yaratish → Kalta Minor'da savol + 🔥 bosish → Dashboard'da Signal Score + Live Feed jonli oshishi → Keyingi Roadmap'da shu Signal ko'tarilishi!`

---

### 3-BLOK: 26-noyabr, 16:30 – 19:00 — AWS Ubuntu Deploy va CODE FREEZE

- **16:30 – 18:00:** **Backend Dev** loyihani AWS Ubuntu serverga deploy qiladi (Native PostgreSQL + Node 22 + PM2 + Nginx/HTTPS — [GIT_WORKFLOW_AND_DEPLOY.md](GIT_WORKFLOW_AND_DEPLOY.md)).
- **18:00 – 18:50:** **Butun jamoa** real telefonlarda (iOS + Android, 4G mobil internetda!) AWS serverdagi QR kodlarni skanerlab barcha 3 bosqichni tekshiradi:
  1. Emotsional Roadmap 3 soniyada chiziladimi?
  2. Obidaga o'tganda Snap & Ask + Ovozli javob tiniq eshitiladimi?
  3. `🔥` bosilganda va savol berilganda B2B Dashboard 5 soniyada yangilanadimi?
- **19:00 — QAT'IY CODE FREEZE!** Yangi funksiya qo'shish mutlaqo to'xtatiladi. Faqat kritik bugfix!

---

### 4-BLOK: 26-noyabr 19:30 – 21:00 — Zaxira Video, QR Plakat va Repetitsiya

- **19:30 – 20:00:** `npm run db:reset` bilan bazani tozalab, **60 soniyalik zaxira demo video** yozib olish (telefon ekrani + B2B Dashboard yonma-yon — zalda Wi-Fi uzilsa darhol qo'yiladi!).
- **20:00 – 20:15:** Dashboard → `Marketing Promo QR Generator` tabidan AWS manzilga ulangan **bitta asosiy reklama QR-kodini** (`/?ref=demo-stage`) slaydga va hakamlar stoli uchun qog'ozga chiqarish (eslatma: QR-kod faqat ilovani ochish/reklama uchun, ichkarida obyektlar GPS joylashuv + Roadmap orqali taklif qilinadi!).
- **20:15 – 21:00:** Taymer bilan **3 daqiqalik pitch** ni kamida 5 marta mashq qilish!

---

## Demo Day (27-noyabr, 10:00 – 12:00) — 3 Daqiqalik G'olibona Pitch Ssenariysi

| Sekund | Bo'lim | Nima aytiladi / ko'rsatiladi (ProSkill qoidasi bo'yicha!) |
| :---: | :--- | :--- |
| **0:00 – 0:30** | **1. Muammo & Real Dalil** | "2026-yilda O'zbekistonga 12 million sayyoh kelmoqda, *National Geographic* Xivani yil yo'nalishi deb tan oldi. Lekin mustaqil sayyoh Ichan-Qal'aga kirganda qayerga nega borishini bilmaydi, jonli gid `$35–$60`, ChatGPT esa uzun va xato ma'lumot beradi. Muzeylar esa sayyohlar aslida nimaga qiziqishini umuman bilmaydi. Biz suhbatlashgan [X] ta sayyohdan [Y] tasi buni tasdiqladi." |
| **0:30 – 1:05** | **2. Yechim & Asosiy Farq (Moat)** | "**SmartGuide** — har bir qadimiy devorga QR yopishtirmaydigan aqlli turistik infratuzilma. Kirish darvozasi yoki mehmonxonadagi reklama QR/kioski orqali ilova 1 soniyada ochiladi: 1) Sayyohning **GPS joylashuvi va qiziqishiga** qarab **Emotsional Roadmap** chizadi. 2) Yurish paytida **GPS** eng yaqin obyektni o'zi taklif qiladi va 6 tilda jonli ovozli suhbat quradi. 3) Har bir suhbatdan **qaysi fakt hayrat uyg'otganini (Signal)** va **qaysilari zerikarli ekanini (Noise)** o'rganib, keyingi sayyohlarga yanada ideal Roadmap, muzeylarga esa real intellekt beradi!" |
| **1:05 – 2:00** | **3. JONLI DEMO ("G'olibona fokus")** | Slaydda bitta katta reklama QR kod! Hakamlar yoki Spiker telefonda ilovani ochadi → 1) `Legends + Photo` tanlab bepul **Emotsional Roadmap** oladi va **GPS joylashuv** darhol eng yaqin **Kalta Minor** ni taklif qiladi → 2) Yapon/ingliz tilida savol beradi + ovoz eshitiladi + `🔥` bosadi → 3) Shu zahoti ekrandagi **Experience Intelligence Dashboard**da yangi sayyoh, **Signal Score oshishi** va Trip Pass daromad prognozi jonli ko'rinadi! |
| **2:00 – 2:35** | **4. Biznes Model & Real Smeta** | "Sayyoh O'zbekistonda 1 oy qolmaydi — shuning uchun oylik obuna emas, **bir martalik Safar Pass'i**: `$4.99` (48 soat Xiva) yoki `$12.99` (10 kun butun O'zbekiston — jonli giddan 5–10× arzon!). Sayyoh ilovani istalgan joydan ochadi; kassa va vokzaldagi info-kiosk/QR esa reklama kanali! Muzeylarga analitika BEPUL — evaziga reklama joyi va tasdiqlangan arxiv. Real 2026 Gemini xarajati atigi **`$0.035`** (91% marja, **`LTV/CAC = 4.66×`**), 3 oylik Xiva piloti `$2,869` va 195 sayyohda qoplanadi!" |
| **2:35 – 3:00** | **5. GTM & Yakun** | "1-qadam: Ichan-Qal'a kirish info-kioski + 20 ta Xiva mehmonxonasi va hunarmandlari (10–15% affiliate) → Samarqand/Buxoro/Toshkent (GPS bilan 1 haftada kengayadi, 1-yil maqsad: 25K sayyoh, `$220K` tushum). SmartGuide — har bir sayyoh suhbatini O'zbekiston turizmining eng kuchli intellekt bazasiga aylantiradi!" |
