# SmartGuide — Oʻzbekiston boʻylab oʻz maromingizda

SmartGuide mustaqil sayohatchiga shaharlar, kunlar, umumiy byudjet va qiziqishlar asosida kunlik safar rejasini tuzishga yordam beradi. Rejada vaqt, ovqatlanish, transport, kirish, yashash va zaxira xarajatlari bor. Interaktiv xaritada mahalliy joylar, manbali hikoyalar va shaxsiy topilmalar uchun qoralama mavjud.

**Butun Oʻzbekiston — mahsulot geografiyasi. Xiva — birinchi AI-pilot.** Milliy frontend planner hali lokal ishlaydi; yangi Groq server planner 16 shahar tanlovi va toʻrtta shahardagi 15 joy katalogidan foydalanadi. Dossier/foto piloti besh Xiva obidasi bilan cheklangan. Jonli narxlar, moderatsiya, avtomatik GPS va toʻlovlar hali integratsiya talab qiladi. Gemini audio — javobni ixtiyoriy tinglash.

## Hujjatlar

| Hujjat | Mazmun |
| --- | --- |
| [Frontend product](documentation/FRONTEND_PRODUCT.md) | Joriy ekranlar, imkoniyatlar, cheklovlar va egalik |
| [Business model](documentation/BUSINESS_MODEL.md) | User/customer/payer, monetizatsiya gipotezalari, validatsiya |
| [Smeta](documentation/SMETA_BUDGET.md) | Tariflar, farazlar va qayta hisoblangan cash ssenariylar |
| [Architecture](documentation/ARCHITECTURE.md) | Ishlayotgan qatlamlar va keyingi integratsiya |
| [API contract](documentation/API_CONTRACT.md) | Runtime endpointlar va hali taklif holatidagi kengaytmalar |
| [AI backend handoff](documentation/AI_BACKEND_HANDOFF.md) | Groq / Gemini, quota fallback, yangi trip/audio API va JSON import |
| [Backend tasks](documentation/BACKEND_TASKS.md) | Keyingi ishlar: P0/P1, masʼullar, DB/HTTPS/frontend integratsiya va demo qabul mezonlari |
| [Roadmap](documentation/ROADMAP.md) | Frontend va boshqa jamoa ishlarining alohida navbati |
| [Git / deploy](documentation/GIT_WORKFLOW_AND_DEPLOY.md) | Jamoa egaligi va deploy yoʻriqnomasi |

## Lokal ishga tushirish

Node.js 20+ va npm. Rejalashtirish/xarita uchun backend shart emas:

```bash
npm install --no-audit --no-fund
npm run dev:tourist
```

Tourist: `http://localhost:3000`; Khiva pilot: `/khiva`; AI sahifa: `/l/kalta-minor`. Xarita tile lari uchun internet kerak. Tariflar — taxminiy smeta, bron emas.

Backend/analitika uchun PostgreSQL va `.env.example` asosidagi konfiguratsiya:

```bash
cp .env.example .env
# DATABASE_URL, GROQ_API_KEYS va GEMINI_API_KEY ni serverda kiriting; bazani yarating
npm run db:push
npm run db:seed
npm run dev
```

API: `http://localhost:4000/api/health`. Dashboard: `http://localhost:5173`. Seed maʼlumotlari ishlab turgan mijozlardan yigʻilgan validatsiya emas. Baza migratsiyasi va deploy backend masʼuliyatida.

```bash
npm run typecheck
npm run build
npx tsx --tsconfig apps/tourist/tests/tsconfig.json --test apps/tourist/tests/*.test.ts apps/dashboard/tests/*.test.ts
```

## Workspace

- [Tourist](apps/tourist/README.md): Next.js / React, 6 tildagi UI.
- [Dashboard](apps/dashboard/README.md): Vite / React, pilot analitikasi va iqtisodiyot ssenariysi.
- [API](apps/api/README.md): Express / PostgreSQL / Groq / Gemini, milliy trip va Xiva pilot runtime.
- [Shared](packages/shared/README.md): amaldagi umumiy tiplarga yagona manba.

Frontend branchi: `feat/uzbekistan-solo-travel`. Keyingi AI-backend topshirigʻi: `feat/ai-provider-routing`; milliy server planner va Gemini TTS tayyor, frontend milliy sahifasi hozircha lokal hisoblaydi. DB migratsiyasi yoki production deploy bajarilmagan.
