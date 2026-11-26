# SmartGuide — Shaxsiylashtirilgan Emotsional Roadmap + Jonli AI-Gid + Sayyohlar Qiziqishi Intellekti

> **Tourism Hackathon 2026 (25–27 noyabr, CAEx Toshkent) · 3-trek: Kichik turbiznes va infratuzilmani raqamlashtirish**  
> **Yakuniy mahsulot konsepsiyasi:** Kirish darvozasi, vokzal, mehmonxona yoki info-kioskdagi **reklama QR-kodi** orqali sayyoh ilovani 1 soniyada ochadi (har bir obidaga alohida QR yopishtirish shart emas!). Ilovaga kirishi bilan uning **GPS joylashuvi va qiziqishiga** qarab **Emotsional Roadmap** chiziladi → yurish davomida **GPS geolokatsiya** eng yaqin obyektni avtomatik taklif qiladi → obida oldida **jonli ovozli/foto AI suhbat** quradi → har bir suhbatdan **Signal vs. Noise** bazasi yig'ilib, keyingi sayyohlar marshrutini mukammallashtiradi va muzeylarga **B2B Experience Intelligence** beradi!

---

## Hujjatlar Markazi (Boshlashdan Oldin O'qing!)

| Hujjat | Kimga mo'ljallangan | Mazmuni |
| :--- | :--- | :--- |
| [documentation/BUSINESS_MODEL.md](documentation/BUSINESS_MODEL.md) | **Speaker, Mentorlar, Hakamlar** | ProSkill 7-band biznes model, Data Flywheel Moat, TAM/SAM/SOM, LTV/CAC (`18×`), GTM |
| [documentation/SMETA_BUDGET.md](documentation/SMETA_BUDGET.md) | **Speaker, Investor, Hakamlar** | 2026 real narxlar asosida moliyaviy smeta (Gemini API `$0.036/sayyoh`, AWS EC2, `.uz`, QR stendlar, 3 oy & 12 oy P&L) |
| [documentation/ARCHITECTURE.md](documentation/ARCHITECTURE.md) | **Butun jamoa & Texnik Mentorlar** | 3 bosqichli Data Flywheel arxitekturasi, Mermaid diagrammalar, PostgreSQL ERD, Signal/Noise formulasi |
| [documentation/ROADMAP.md](documentation/ROADMAP.md) | **Butun jamoa** | 2-kun (26-noyabr) va Demo Day (27-noyabr) aniq soatbay rejasi, Code Freeze (19:00), 3 daqiqalik pitch ssenariysi |
| [documentation/API_CONTRACT.md](documentation/API_CONTRACT.md) | **Butun jamoa** | `POST /api/roadmap/generate`, `POST /api/guide/ask`, `POST /api/guide/feedback`, `GET /api/analytics/summary` JSON kontraktlari |
| [documentation/GIT_WORKFLOW_AND_DEPLOY.md](documentation/GIT_WORKFLOW_AND_DEPLOY.md) | **Butun jamoa** | Konfliktsiz parallel Git branch qoidalari va AWS Ubuntu (PostgreSQL + Node 22 + PM2 + Nginx/HTTPS) deploy |

### Workspace README fayllari
- [packages/shared/README.md](packages/shared/README.md) — Umumiy TypeScript kontraktlari (`@smartguide/shared`)
- [apps/api/README.md](apps/api/README.md) — Backend API + PostgreSQL + Gemini Roadmap/RAG/Vision/TTS servisi
- [apps/tourist/README.md](apps/tourist/README.md) — Sayyohlar uchun Emotsional Roadmap + Live AI Guide PWA
- [apps/dashboard/README.md](apps/dashboard/README.md) — Muzey ma'muriyati uchun B2B Experience Intelligence + QR Generator

---

## Boshqa AI'lardan (ChatGPT, Google Maps) Asosiy Farqimiz

1. **Kirishdayoq "Nega borish kerak?" degan Emotsional Roadmap + GPS Yaqin Obyekt Taklifi:** Har bir tarixiy devorga QR yopishtirmaymiz (UNESCO obidalariga zarar yetmaydi, 10× tez kengayadi!). QR-kod va kiosklar faqat kirish nuqtalarida dasturni tanitish/reklama uchun turadi; ichkarida esa sayyohning **GPS joylashuvi (`lat/lng`)** va marshrutiga qarab eng yaqin obyekt ilovaning o'zida avtomatik taklif qilinadi.
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
└── documentation/              # Biznes Model, Smeta, Arxitektura, Roadmap, API Contract, Deploy
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
