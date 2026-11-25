# SmartGuide — Ichan-Qala (Khiva) AI Tour Guide Infrastructure

> **Tourism Hackathon 2026 (25–27 noyabr, CAEx Toshkent) · 3-trek: Kichik turbiznes va infratuzilmani raqamlashtirish**  
> Tarixiy obyektlar va muzeylar uchun tayyor **B2B2C raqamli AI-gid infratuzilmasi**: ilova yuklamasdan QR-kod orqali ochiladigan 6 tilli ovozli AI-gid + **0% gallyutsinatsiyali** tasdiqlangan mahalliy RAG baza + **Snap & Ask** rasm tanish + real-vaqtdagi **B2B Muzey Analitika Paneli**.

---

## Jamoa uchun Tezkor Navigatsiya (Boshlashdan oldin o'qing!)

Har bir jamoa a'zosi o'zining TZ (Texnik Topshiriq) hujjatini ochib, parallel ravishda ishni boshlashi mumkin:

| Hujjat | Kimga mo'ljallangan | Mazmuni |
| :--- | :--- | :--- |
| [documentation/ROADMAP.md](documentation/ROADMAP.md) | **Butun jamoa** | 48 soatlik aniq bosqichlar, Check-in (18:00), Code Freeze (19:00), Demo Day rejasi |
| [documentation/ARCHITECTURE.md](documentation/ARCHITECTURE.md) | **Butun jamoa & Mentorlar** | Tizim arxitekturasi, Mermaid diagrammalar, DB ERD, zero-hallucination RAG va unit-ekonomika |
| [documentation/TZ_FRONTEND.md](documentation/TZ_FRONTEND.md) | **Frontend Developer (1 kishi)** | `apps/tourist` (Next.js PWA) + `apps/dashboard` (React/Vite B2B) to'liq TZ (`FE-01`..`FE-14`) |
| [documentation/TZ_BACKEND.md](documentation/TZ_BACKEND.md) | **Backend Developer (1 kishi)** | `apps/api` (Express + Drizzle + PostgreSQL), kesh, CSV eksport, AWS deploy to'liq TZ (`BE-01`..`BE-11`) |
| [documentation/TZ_AI_RAG.md](documentation/TZ_AI_RAG.md) | **AI & RAG Data Engineer (1 kishi)** | 5 obida muzey RAG bazasi, Vision, TTS, 0% gallyutsinatsiya benchmark to'liq TZ (`AI-01`..`AI-08`) |
| [documentation/API_CONTRACT.md](documentation/API_CONTRACT.md) | **Butun jamoa** | Frontend ↔ Backend ↔ AI o'rtasidagi qat'iy JSON kontrakt va `curl` testlari |
| [documentation/GIT_WORKFLOW_AND_DEPLOY.md](documentation/GIT_WORKFLOW_AND_DEPLOY.md) | **Butun jamoa** | Parallel Git branch strategiyasi, fayl egaligi chegaralari va AWS Ubuntu deploy |

### Workspace README fayllari
- [packages/shared/README.md](packages/shared/README.md) — Umumiy TypeScript kontraktlari (`@smartguide/shared`)
- [apps/api/README.md](apps/api/README.md) — Backend API + PostgreSQL + Gemini RAG/TTS servisi
- [apps/tourist/README.md](apps/tourist/README.md) — Sayyohlar uchun Mobile-First Next.js PWA
- [apps/dashboard/README.md](apps/dashboard/README.md) — Muzey ma'muriyati uchun B2B Analitika + QR Generator

---

## Arxitektura va Parallel Ishlash Xaritasi

```text
SmartGuide/
├── packages/
│   └── shared/                 # 🔒 Umumiy API tiplari (o'zgartirish faqat kelishib qilinadi)
├── apps/
│   ├── api/                    # Backend + AI/RAG servisi (Port 4000)
│   │   ├── data/               # 🧠 AI/RAG Dev zonasi: ichan-qala-landmarks.json
│   │   └── src/
│   │       ├── services/ai.service.ts  # 🧠 AI/RAG Dev zonasi: Gemini Vision + RAG + TTS
│   │       ├── db/             # ⚙️ Backend Dev zonasi: Drizzle sxema & seed
│   │       ├── routes/         # ⚙️ Backend Dev zonasi: REST endpointlar
│   │       └── services/       # ⚙️ Backend Dev zonasi: landmark & analytics servislari
│   ├── tourist/                # 🎨 Frontend Dev zonasi: Next.js PWA (Port 3000)
│   └── dashboard/              # 🎨 Frontend Dev zonasi: React + Vite B2B (Port 5173)
└── documentation/              # Barcha TZ, Roadmap, API Contract va xakaton hujjatlari
```

### Texnologik Stek (Docker'siz — Yengil va Tez)

| Qism | Texnologiyalar | Port |
| :--- | :--- | :--- |
| **Backend + AI** | Node.js 20+, Express 5, TypeScript, Drizzle ORM, PostgreSQL, `@google/genai` | `4000` |
| **AI Modellar** | RAG + Vision: `gemini-3.5-flash-lite` (fallback: `gemini-4-hydrogen`) · TTS: `gemini-3.8-flash-lite-tts` | — |
| **Tourist PWA** | Next.js 15 (App Router), React 19, Tailwind CSS v4, Lucide Icons | `3000` |
| **B2B Dashboard** | React 19, Vite 6, Tailwind CSS v4, Recharts 3, `qrcode` | `5173` |

---

## 5 Daqiqada Lokal Ishga Tushirish (Har bir dasturchi uchun)

### Talablar
1. **Node.js >= 20** (`node -v`) va **npm** (`npm -v`)
2. Lokal **PostgreSQL** servisi (5432-portda ishlab turgan)
3. Google AI Studio'dan olingan **Gemini API Key**: https://aistudio.google.com/apikey

### 1-qadam: Reponi yuklab olish va paketlarni o'rnatish
```bash
git clone <REPO_URL> SmartGuide
cd SmartGuide
npm install --no-audit --no-fund
```

### 2-qadam: PostgreSQL bazasini yaratish (bir marta)
```bash
# macOS / Linux:
psql -U postgres -c "CREATE DATABASE smartguide;"

# Windows (PowerShell):
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE smartguide;"
```

### 3-qadam: `.env` faylini sozlash
```bash
cp .env.example .env
```
`.env` faylini ochib, kamida quyidagi 2 ta qiymatni kiriting:
```env
GEMINI_API_KEY=AIza...sizning_kalitingiz
DATABASE_URL=postgresql://postgres:SIZNING_PG_PAROLINGIZ@localhost:5432/smartguide
```
> **Eslatma:** Agar `GEMINI_API_KEY` hali kiritilmagan bo'lsa ham, API ishdan chiqmaydi — avtomatik ravishda mahalliy tasdiqlangan arxiv fallback rejimida javob qaytaradi. Haqiqiy Gemini Vision + TTS uchun kalitni kiriting.

### 4-qadam: DB jadvallarini yaratish va Seed qilish
```bash
npm run db:push
npm run db:seed
```
`db:seed` idempotent (qayta ishlatsangiz dublikat yaratmaydi): 5 ta Ichan-Qal'a obidasini va B2B dashboard darhol to'la ko'rinishi uchun realistik boshlang'ich analitika ma'lumotlarini PostgreSQL'ga yozadi.

### 5-qadam: Loyihani ishga tushirish
```bash
# Barcha 3 ta appni bitta terminalda parallel ishga tushirish:
npm run dev
```
Yoki faqat o'zingiz ishlayotgan qismni alohida terminalda ishga tushiring:
- `npm run dev:api` → Backend API (`http://localhost:4000/api/health`)
- `npm run dev:tourist` → Tourist PWA (`http://localhost:3000`, QR manzil: `http://localhost:3000/l/kalta-minor`)
- `npm run dev:dashboard` → B2B Museum Dashboard (`http://localhost:5173`)

### Tekshirish buyruqlari (har bir PR/push dan oldin majburiy!)
```bash
npm run typecheck
npm run build
```

---

## Biznes Model (Pitch va Dashboard uchun asosiy raqamlar)
- **Tarif:** Chipta narxiga `+$4` (sayyoh ilova yuklamasdan QR-kod orqali foydalanadi).
- **Daromad taqsimoti (B2B2C):** `70%` SmartGuide / `30%` Muzey yoki tarixiy kompleksga.
- **API xarajati (Cost-to-Serve):** 1 sayyoh uchun o'rtacha `~$0.15` (yalpi marja **~96%**).
- **Asosiy ustunlik (Moat):** Global AI modellardagi tarixiy xatolarni (gallyutsinatsiyani) nolga tushiruvchi muzey tasdiqlagan mahalliy RAG bazasi + kassa/obida QR tarqatish kanali.
