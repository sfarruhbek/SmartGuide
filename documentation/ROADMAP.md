# SmartGuide — Yakuniy 24 Soatlik Harakat Rejasi (2-kun va Demo Day)

**Tadbir:** Tourism Hackathon 2026 (25–27 noyabr 2026, CAEx Toshkent)  
**Yakuniy qaror (Pivot):** **Emotsional & Foyda Asosidagi Shaxsiy Roadmap → Obida Oldida Jonli AI Suhbat → Sayyoh Qiziqishi va Signal/Noise Intellekti (Self-Learning Flywheel)**  
**Joriy nuqta:** **26-noyabr (2-kun)** — **19:00 CODE FREEZE** gacha qolgan vaqtni 100% samarali taqsimlash!

---

## Jamoa Rollari va Parallel Mas'uliyat

| Rol | Git Branch | Asosiy Fokus | TZ Hujjati |
| :--- | :--- | :--- | :--- |
| **1. Frontend Dev** | `feat/frontend` | 1) Emotsional Roadmap Builder (`/`) · 2) Obida jonli suhbat + Micro-Feedback (`/l/[slug]`) · 3) B2B Signal/Noise & Sentiment Dashboard + QR Generator (`apps/dashboard`) | [TZ_FRONTEND.md](TZ_FRONTEND.md) |
| **2. Backend Dev** | `feat/backend` | `roadmaps` + `landmark_topic_signals` DB sxemasi, `POST /api/roadmap/generate`, `POST /api/guide/feedback`, Signal/Noise SQL agregatsiyasi, Cache, CSV eksport, AWS Ubuntu Deploy | [TZ_BACKEND.md](TZ_BACKEND.md) |
| **3. AI & RAG Dev** | `feat/ai-rag` | 5 ta obidaning Emotional Payoff + Tagged Facts RAG bazasi, Roadmap Generator prompt, Signal/Noise + Sentiment Extractor, Vision + Gemini 3.8 TTS, `eval-rag.ts` benchmark | [TZ_AI_RAG.md](TZ_AI_RAG.md) |
| **4. Speaker & PM** | — | Validatsiya faktlarini rasmiylashtirish, [BUSINESS_MODEL.md](BUSINESS_MODEL.md) + [SMETA_BUDGET.md](SMETA_BUDGET.md) asosida slaydlar, biznes mentorlik (13:00–18:00), 3 daqiqalik pitch repetitsiyasi | [BUSINESS_MODEL.md](BUSINESS_MODEL.md) · [SMETA_BUDGET.md](SMETA_BUDGET.md) |

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
  - **Speaker** biznes/pitch mentorlariga [BUSINESS_MODEL.md](BUSINESS_MODEL.md) (`LTV/CAC = 18×`) va [SMETA_BUDGET.md](SMETA_BUDGET.md) (`$0.036/sayyoh` real Gemini narxi, `$2,064` pilot smetasi) ni ko'rsatib, slayd matnlarini tasdiqlatadi.
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
- **20:00 – 20:15:** Dashboard → `QR Code Generator` tabidan AWS manzilga ulangan **Ichan-Qal'a QR plakatini** chop etish va taqdimot slaydiga katta QR qo'yish.
- **20:15 – 21:00:** Taymer bilan **3 daqiqalik pitch** ni kamida 5 marta mashq qilish!

---

## Demo Day (27-noyabr, 10:00 – 12:00) — 3 Daqiqalik G'olibona Pitch Ssenariysi

| Sekund | Bo'lim | Nima aytiladi / ko'rsatiladi (ProSkill qoidasi bo'yicha!) |
| :---: | :--- | :--- |
| **0:00 – 0:30** | **1. Muammo & Real Dalil** | "2026-yilda O'zbekistonga 12 million sayyoh kelmoqda, *National Geographic* Xivani yil yo'nalishi deb tan oldi. Lekin mustaqil sayyoh Ichan-Qal'aga kirganda qayerga nega borishini bilmaydi, jonli gid `$35–$60`, ChatGPT esa uzun va xato ma'lumot beradi. Muzeylar esa sayyohlar aslida nimaga qiziqishini umuman bilmaydi. Biz suhbatlashgan [X] ta sayyohdan [Y] tasi buni tasdiqladi." |
| **0:30 – 1:05** | **2. Yechim & Asosiy Farq (Moat)** | "**SmartGuide** — shunchaki AI-chat emas. 1) Kirishdayoq sayyohga qaysi obidadan **qanday hissiyot va foyda olishini** ko'rsatuvchi **Emotsional Roadmap** chizadi. 2) Obida oldida muzey tasdiqlagan bazadan 6 tilda jonli ovozli suhbat quradi. 3) Eng muhimi — har bir suhbatdan **qaysi fakt sayyohlarni hayratga solganini (Signal)** va **qaysilari zerikarli ekanini (Noise)** o'rganib, keyingi sayyohlarga yanada ideal Roadmap, muzeylarga esa real intellekt beradi!" |
| **1:05 – 2:00** | **3. JONLI DEMO ("G'olibona fokus")** | Slaydda katta QR kod! Hakamlar yoki Spiker telefonda: 1) `Legends + Photo` tanlab **Emotsional Roadmap** oladi → 2) **Kalta Minor** ga o'tib yapon/ingliz tilida savol beradi + ovoz eshitiladi + `🔥` bosadi → 3) Shu zahoti ekrandagi **B2B Dashboard**da yangi sayyoh, **Signal Score oshishi** va 30% muzey daromadi jonli ko'rinadi! |
| **2:00 – 2:35** | **4. Biznes Model & Real Smeta** | "B2B2C: chiptaga `+$4` (70% SmartGuide / 30% Muzey — muzeyga `$0` xarajat!). Real 2026 Gemini tariflari bilan 1 sayyoh API xarajati atigi **`$0.04`** (96% marja, `LTV/CAC = 18×`). Ichan-Qal'a 3 oylik piloti jami **`$2,064`** turadi va 25 kunda o'zini qoplaydi!" |
| **2:35 – 3:00** | **5. GTM & Yakun** | "1-qadam: Ichan-Qal'a bepul piloti → Toshkent 4 ta yirik muzeyi → Samarqand/Buxoro (1-yil maqsad: 10 kompleks, `$158K` sof tushum). SmartGuide — har bir sayyoh suhbatini O'zbekiston turizmining eng kuchli ma'lumotlar bazasiga aylantiradi!" |
