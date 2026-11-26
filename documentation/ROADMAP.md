# SmartGuide — Mahsulot Rejasi, Xakaton Sprinti va Demo Day Pitch Ssenariysi

> **Mahsulot ko'lami (Muhim):** SmartGuide **faqat Ichan-Qal'a ilovasi EMAS!**
> - **Asosiy mahsulot (`/`):** Sayyoh tashrif buyuradigan **istalgan shahar(lar)** (O'zbekiston bo'ylab **16 ta shahar + erkin shahar kiritish**: Toshkent, Samarqand, Buxoro, Xiva, Shahrisabz, Nukus, Termiz, Qo'qon va b.) uchun kunlar (1–14), USD byudjet va qiziqishlar asosida **butun shahar bo'ylab aylanishning to'liq kunlik Roadmap'ini + byudjet smetasini + interaktiv OpenStreetMap xaritasini** tuzib beradi (`POST /api/trips/generate` — Groq LLM + server byudjet kalkulyatori).
> - **1-bosqich chuqurlashtirilgan AI-Gid piloti (`/khiva`, `/l/[slug]`):** Xiva (**Ichan-Qal'a**) — 5 ta muzey-arxiv dossierli obida, Snap & Ask rasm tanish (Groq Vision), 6 tilda jonli ovozli hikoya (Gemini 3.8 TTS) va B2B analitika sinov hududi.
> - **Joriy runtime holati:** Milliy Roadmap (`/`), Xiva qisqa yurishi (`/khiva`), AI-gid (`/l/[slug]`), Gemini TTS audio, PostgreSQL va PWA o'rnatish (`sw.js`, `manifest.webmanifest`) lokal jonli muhitda ishlayapti. Qolgan ishlar: [BACKEND_TASKS.md](BACKEND_TASKS.md), [LIVE_API_SETUP.md](LIVE_API_SETUP.md).

> Live yangilanishi: xaritada Gemini Live ovoz/foto popup, opt-in GPS va Groq manbali kontekst + Wikipedia kesh bor. [Live kontrakt va tekshiruv](LIVE_VOICE_ASSISTANT.md). Joriy 4001 API ishga tushirilishi `LANDMARK_STORE=json`: bu jarayonda DB-analitika saqlanmaydi. PostgreSQL bilan tekshiruv alohida; Live sessiyalari hozir DBga yozilmaydi. Trip Pass biznes-modeli va smeta saqlangan; Live sarfini alohida o‘lchash kerak.

**Tadbir:** Tourism Hackathon 2026 (25–27 noyabr 2026, CAEx Toshkent) · **3-trek:** *Kichik turbiznes va infratuzilmani raqamlashtirish*
**Asosiy Qiymat Zanjiri:** **Tashrif Buyuriladigan Shahar(lar) Bo'ylab To'liq Kunlik Roadmap & Byudjet → Interaktiv Xarita va Obidalar Oldida Jonli AI-Gid (6+ til, ovoz, foto) → Sayyoh Qiziqishi va Signal/Noise Intellekti (Data Flywheel)**

---

## Jamoa Rollari va Parallel Mas'uliyat

| Rol | Git Branch | Asosiy Fokus | Asosiy Hujjatlar |
| :--- | :--- | :--- | :--- |
| **1. Frontend Dev** | `feat/frontend` | 1) **Butun O'zbekiston (16+ shahar) To'liq Sayohat Roadmap + Byudjet + OSM Xarita** (`/`) · 2) Xiva qisqa yurishi (`/khiva`) va Obida jonli AI-gid + Ovoz + Snap & Ask (`/l/[slug]`) · 3) PWA (`sw.js`, `manifest.webmanifest`) · 4) B2B Analitika Dashboard + Promo QR (`apps/dashboard`) | [FRONTEND_PRODUCT.md](FRONTEND_PRODUCT.md) · [API_CONTRACT.md](API_CONTRACT.md) |
| **2. Backend Dev** | `feat/backend` | PostgreSQL (`landmarks`, `interactions`, keyinchalik `trips`/`feedback`), `POST /api/trips/generate`, `POST /api/guide/ask`, `POST /api/audio/speech`, `POST /api/roadmap/generate`, `GET /api/analytics/summary`, HTTPS Deploy | [API_CONTRACT.md](API_CONTRACT.md) · [BACKEND_TASKS.md](BACKEND_TASKS.md) · [GIT_WORKFLOW_AND_DEPLOY.md](GIT_WORKFLOW_AND_DEPLOY.md) |
| **3. AI & RAG Dev** | `feat/ai-rag` | Milliy shahar/joylar katalogini boyitish (Samarqand, Buxoro, Toshkent, Xiva → 16 shahar), Groq multi-key/model routing (planner/guide/vision), Gemini 3.8 TTS ovoz failover, 5 ta Xiva pilot obidasi RAG bazasi va `ai:check` / `ai:smoke` | [AI_BACKEND_HANDOFF.md](AI_BACKEND_HANDOFF.md) · [ARCHITECTURE.md](ARCHITECTURE.md) |
| **4. Speaker & PM** | — | Foydalanuvchi testlari va validatsiya natijalari, [BUSINESS_MODEL.md](BUSINESS_MODEL.md) + [SMETA_BUDGET.md](SMETA_BUDGET.md) asosida slaydlar, biznes mentorlik, 3 daqiqalik pitch repetitsiyasi | [BUSINESS_MODEL.md](BUSINESS_MODEL.md) · [SMETA_BUDGET.md](SMETA_BUDGET.md) |

---

## Yakuniy Bosqichlar (26-noyabr → Demo Day, 27-noyabr)

### 1. Tayyor va Jonli Tekshirilgan Yadro ✅
- **Milliy Shahar Roadmap Planner (`/` → `POST /api/trips/generate`):** 16 ta O'zbekiston shahri + erkin shahar, 1–14 kun, USD byudjet, 5 qiziqish toifasi, Groq AI tartiblash + serverning aniq kunbay smetasi (ovqatlanish, transport, kirish, yashash, 10% zaxira, kamomad ogohlantirishi) + TXT eksport.
- **Interaktiv Xarita va Kashfiyotlar:** OpenStreetMap xarita, 4 ta asosiy shaharda 15 ta manbali joy (mashhur obidalar vs. noodatiy tarixiy hikoyalar), shaxsiy topilma qoralamalari.
- **Chuqurlashtirilgan AI-Gid Piloti (`/khiva` va `/l/[slug]`):** Xiva Ichan-Qal'a 5 obidasi bo'yicha Groq RAG savol-javob (6 til), Groq Vision (`qwen/qwen3.8-27b`) Snap & Ask foto tanish, Gemini 3.8 TTS WAV audio (avtomatik zaxira model failover bilan).
- **PostgreSQL + B2B Dashboard (`apps/dashboard`):** Jonli PostgreSQL bazasidan 5 soniyalik polling analitika, CSV eksport, promo QR generator va daromad simulyatori.
- **Installable PWA:** `manifest.webmanifest`, `sw.js`, PNG iconlar (192/512/Apple Touch) bilan mobil telefonga to'g'ridan-to'g'ri o'rnatiladi.

### 2. Demo Day Oldi Yakuniy Tekshiruvlar (26-noyabr kechqurun → 27-noyabr)
- **Public HTTPS Deploy:** AWS Ubuntu (yoki toza HTTPS tunnel) orqali barcha 3 servisni mobil 4G internetda sinab ko'rish (mixed content va tunnel interstitial sahifasisiz!).
- **Zaxira Demo Video (60 soniya):** 1) `/` da **Samarqand + Buxoro (yoki Xiva + Buxoro)** bo'yicha 4 kunlik to'liq shahar Roadmap + byudjet + xarita → 2) Xiva pilot obidasida jonli AI savol + ovoz + foto → 3) B2B Dashboard'da jonli yangilanish.
- **Reklama QR-stend:** Slayd va hakamlar stoli uchun bitta asosiy PWA kirish QR-kodi (`/`).
- **Pitch Repetitsiyasi:** Taymer bilan 3 daqiqalik pitch'ni kamida 5 marta mashq qilish.

---

## Demo Day (27-noyabr, 10:00 – 12:00) — 3 Daqiqalik G'olibona Pitch Ssenariysi

| Sekund | Bo'lim | Nima aytiladi / ko'rsatiladi (ProSkill qoidasi bo'yicha!) |
| :---: | :--- | :--- |
| **0:00 – 0:30** | **1. Muammo & Real Dalil** | "2026-yilda O'zbekistonga 12 million sayyoh kelmoqda. Mustaqil sayyoh Toshkent, Samarqand, Buxoro yoki Xivaga 3–10 kunga kelganida **o'z byudjeti va vaqtiga mos butun shahar bo'ylab to'liq aylanish Roadmap'ini** tuza olmaydi: jonli gid `$35–$60/kun` yoki kamyob tillarda topilmaydi, ChatGPT esa real byudjet/xaritasiz uzun va ko'pincha xato ma'lumot beradi. Mahalliy biznes va muzeylar esa sayyohlar aslida qaysi joylar va hikoyalarga qiziqayotganini bilmaydi." |
| **0:30 – 1:05** | **2. Yechim & Asosiy Farq (Moat)** | "**SmartGuide** — O'zbekistonning **istalgan shahri bo'ylab to'liq sayohat Roadmap'ini** chizuvchi va obidalar yonida **6+ tilda jonli ovozli AI-gid** bo'lib yuruvchi PWA platforma! 1) Sayyoh boradigan **shahar(lar)ni, kunlar soni va USD byudjetini** kiritadi — tizim unga nonushtadan kechki sayrgacha, transport, chipta va 10% zaxira bilan **to'liq kunlik shahar Roadmap'i va interaktiv xarita** tuzib beradi. 2) Shahar ichida aylanayotganda manbali AI-gid va **Snap & Ask** orqali ovozli tushuntirish oladi (1-chuqur arxiv piloti — Xiva Ichan-Qal'a). 3) Har bir suhbatdan **Signal vs. Noise** intellekti yig'ilib, keyingi sayyohlarning Roadmap'ini yanada aniqroq qiladi!" |
| **1:05 – 2:00** | **3. JONLI DEMO ("G'olibona fokus")** | Slaydda bitta katta PWA QR kod! 1) Telefonda `/` ochiladi → **Samarqand + Buxoro (yoki Xiva)**, 4 kun, `$200` byudjet tanlanadi → **Groq AI + server kalkulyatori** 3 soniyada butun shahar bo'ylab to'liq kunlik Roadmap, USD smeta va OpenStreetMap xaritani chizib beradi! 2) Xiva chuqur pilotiga o'tiladi → **Kalta Minor**da yapon/ingliz/o'zbek tilida savol beriladi → manbali Groq javobi + tiniq **Gemini 3.8 TTS** ovozi eshitiladi! 3) Shu zahoti ekrandagi **B2B Dashboard**da yangi sayyoh va savol jonli ko'rinadi! |
| **2:00 – 2:35** | **4. Biznes Model & Real Smeta** | "Sayyoh O'zbekistonda 1 oy qolmaydi — shuning uchun oylik obuna emas, **bir martalik Safar Pass'i**: **`$4.99`** (48 soat — istalgan 1 shahar) yoki **`$12.99`** (10 kun — **butun O'zbekiston** safari, jonli giddan 5–10× arzon!). Aeroport, vokzal va kirishlardagi info-kiosk/QR — faqat reklama kanali. Muzeylarga analitika BEPUL — evaziga reklama joyi va tasdiqlangan arxiv. Real AI xarajati atigi **`$0.035–$0.07`** (91% marja, **`LTV/CAC = 4.66×`**), 3 oylik 1-shahar (Xiva) piloti `$2,869` va 195 sayyohda qoplanadi!" |
| **2:35 – 3:00** | **5. GTM & Yakun** | "1-bosqich: Xiva (Ichan-Qal'a) chuqur piloti + 20 ta mehmonxona va hunarmand hamkorligi (10–15% affiliate) → 3–4-oyda Samarqand, Buxoro va Toshkent chuqur RAG bazalari bilan **All-Uzbekistan Silk Road Pass (`$12.99`)** ga to'liq chiqish (1-yil maqsad: 25K sayyoh, `$220K` tushum). SmartGuide — O'zbekistonning har bir shahrini mustaqil sayyoh uchun jonli, tushunarli va byudjetga mos ochiq xaritaga aylantiradi!" |
