# SmartGuide — Shaxsiylashtirilgan Emotsional Roadmap + Jonli AI-Gid + Sayyohlar Qiziqishi Intellekti

> **Tourism Hackathon 2026 (25–27 noyabr, CAEx Toshkent) · 3-trek: Kichik turbiznes va infratuzilmani raqamlashtirish**  
> **Yakuniy mahsulot konsepsiyasi:** Sayyoh ilovaga kirishi bilan unga **qaysi obidalarga nega borishi va qanday hissiyot/foyda olishi** bo'yicha shaxsiy **Roadmap** chiziladi → obida oldida **jonli ovozli/foto AI suhbat** quradi → har bir suhbatdan **qaysi obida va qaysi ma'lumot sayyohlarga haqiqatan qiziq ("Signal") va qaysilari ahamiyatsiz ("Noise")** ekani avtomatik yig'ilib, ham keyingi sayyohlarning Roadmap'ini mukammallashtiradi, ham muzeylarga **B2B Experience Intelligence** beradi!

---

## Hujjatlar Markazi (Boshlashdan Oldin O'qing!)

| Hujjat | Kimga mo'ljallangan | Mazmuni |
| :--- | :--- | :--- |
| [documentation/BUSINESS_MODEL.md](documentation/BUSINESS_MODEL.md) | **Speaker, Mentorlar, Hakamlar** | ProSkill 7-band biznes model, Data Flywheel Moat, TAM/SAM/SOM, LTV/CAC (`18×`), GTM |
| [documentation/SMETA_BUDGET.md](documentation/SMETA_BUDGET.md) | **Speaker, Investor, Hakamlar** | 2026 real narxlar asosida moliyaviy smeta (Gemini API `$0.036/sayyoh`, AWS EC2, `.uz`, QR stendlar, 3 oy & 12 oy P&L) |
| [documentation/ARCHITECTURE.md](documentation/ARCHITECTURE.md) | **Butun jamoa & Texnik Mentorlar** | 3 bosqichli Data Flywheel arxitekturasi, Mermaid diagrammalar, PostgreSQL ERD, Signal/Noise formulasi |
| [documentation/ROADMAP.md](documentation/ROADMAP.md) | **Butun jamoa** | 2-kun (26-noyabr) va Demo Day (27-noyabr) aniq soatbay rejasi, Code Freeze (19:00), 3 daqiqalik pitch ssenariysi |
| [documentation/API_CONTRACT.md](documentation/API_CONTRACT.md) | **Butun jamoa** | `POST /api/roadmap/generate`, `POST /api/guide/ask`, `POST /api/guide/feedback`, `GET /api/analytics/summary` JSON kontraktlari |
| [documentation/TZ_FRONTEND.md](documentation/TZ_FRONTEND.md) | **Frontend Developer (1 kishi)** | Emotsional Roadmap UI + Obida Jonli Suhbat + Micro-Feedback + B2B Signal/Noise Dashboard TZ (`FE-01`..`FE-15`) |
| [documentation/TZ_BACKEND.md](documentation/TZ_BACKEND.md) | **Backend Developer (1 kishi)** | Roadmap & Signal DB sxemasi, Signal/Noise agregatsiya, kesh, CSV eksport, AWS Ubuntu Deploy TZ (`BE-01`..`BE-12`) |
| [documentation/TZ_AI_RAG.md](documentation/TZ_AI_RAG.md) | **AI & RAG Data Engineer (1 kishi)** | Emotsional Roadmap Prompting, Interest/Sentiment/Signal Extractor, 5 obida RAG, Vision, TTS, `eval-rag.ts` TZ (`AI-01`..`AI-10`) |
| [documentation/GIT_WORKFLOW_AND_DEPLOY.md](documentation/GIT_WORKFLOW_AND_DEPLOY.md) | **Butun jamoa** | Konfliktsiz parallel Git branch qoidalari va AWS Ubuntu (PostgreSQL + Node 22 + PM2 + Nginx/HTTPS) deploy |

### Workspace README fayllari
- [packages/shared/README.md](packages/shared/README.md) — Umumiy TypeScript kontraktlari (`@smartguide/shared`)
- [apps/api/README.md](apps/api/README.md) — Backend API + PostgreSQL + Gemini Roadmap/RAG/Vision/TTS servisi
- [apps/tourist/README.md](apps/tourist/README.md) — Sayyohlar uchun Emotsional Roadmap + Live AI Guide PWA
- [apps/dashboard/README.md](apps/dashboard/README.md) — Muzey ma'muriyati uchun B2B Experience Intelligence + QR Generator

---

## Boshqa AI'lardan (ChatGPT, Google Maps) Asosiy Farqimiz

1. **Kirishdayoq "Nega borish kerak?" degan Emotsional Roadmap:** Quruq joylar ro'yxati emas — har bir obida sizga **qanday hissiyot, estetik zavq yoki hikoya berishi** aniq ko'rsatilgan shaxsiy yo'nalish.
2. **Real Suhbatlardan O'rganuvchi "Signal vs. Noise" Bazasi:** Sayyohlar obida oldida jonli suhbat qurganda, tizim qaysi faktlar hayrat uyg'otganini (`Signal`) va qaysilari qiziq emasligini (`Noise`) ajratib oladi. Keyingi sayyoh uzun, zerikarli matn emas — **aynan eng kuchli, sinalgan ma'lumot va eng ideal marshrutni** oladi!
3. **100% Muzey Tasdiqlagan Mahalliy RAG (0% Gallyutsinatsiya):** Xivaning Ichan-Qal'a 5 ta asosiy obidasi (`kalta-minor`, `juma-mosque`, `tosh-hovli`, `kunya-ark`, `pahlavon-mahmud`) bo'yicha rasmiy tarixiy pasportlar + 6 tilda jonli **Gemini 3.8 Flash-Lite TTS** ovoz.

---

## Arxitektura va Parallel Ishlash Xaritasi (Docker'siz)

```text
SmartGuide/
├── packages/
│   └── shared/                 # 🔒 Umumiy API tiplari (o'zgartirish faqat kelishib qilinadi)
├── apps/
│   ├── api/                    # Backend + AI/RAG + Interest Flywheel (Port 4000)
│   │   ├── data/               # 🧠 AI/RAG Dev zonasi: ichan-qala-landmarks.json
│   │   └── src/
│   │       ├── services/ai.service.ts  # 🧠 AI/RAG Dev zonasi: Roadmap, RAG, Vision, TTS, Signal Extractor
│   │       ├── db/             # ⚙️ Backend Dev zonasi: Drizzle sxema & seed
│   │       ├── routes/         # ⚙️ Backend Dev zonasi: REST endpointlar
│   │       └── services/       # ⚙️ Backend Dev zonasi: landmark, roadmap, analytics, cache servislari
│   ├── tourist/                # 🎨 Frontend Dev zonasi: Next.js 15 PWA (Port 3000)
│   └── dashboard/              # 🎨 Frontend Dev zonasi: React 19 + Vite B2B Panel (Port 5173)
└── documentation/              # Biznes Model, Smeta, Arxitektura, Roadmap, API Contract, 3 ta TZ
```

---

## 5 Daqiqada Lokal Ishga Tushirish

### Talablar
- **Node.js >= 20** va **npm**
- Lokal **PostgreSQL** servisi (5432-portda ishlab turgan)
- Google AI Studio **Gemini API Key**

### Buyruqlar
```bash
# 1. Reponi yuklash va paketlarni o'rnatish
git clone https://github.com/sfarruhbek/SmartGuide.git
cd SmartGuide
npm install --no-audit --no-fund

# 2. PostgreSQL bazasini yaratish (bir marta)
psql -U postgres -c "CREATE DATABASE smartguide;"

# 3. .env sozlash (DATABASE_URL + GEMINI_API_KEY kiriting)
cp .env.example .env

# 4. Jadvallar va Seed (5 ta Ichan-Qal'a obidasi + dastlabki analitika)
npm run db:push
npm run db:seed

# 5. Barcha 3 servisni parallel ishga tushirish
npm run dev
```

- **Backend API:** `http://localhost:4000/api/health`
- **Tourist PWA:** `http://localhost:3000` (QR sahifa: `http://localhost:3000/l/kalta-minor`)
- **B2B Museum Dashboard:** `http://localhost:5173`

Har bir push/PR oldidan majburiy tekshiruv:
```bash
npm run typecheck && npm run build
```
