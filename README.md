# SmartGuide — Oʻzbekiston boʻylab oʻz maromingizda

SmartGuide mustaqil sayohatchiga shaharlar, kunlar, umumiy byudjet va qiziqishlar asosida kunlik safar rejasini tuzishga yordam beradi. Rejada vaqt, ovqatlanish, transport, kirish, yashash va zaxira xarajatlari bor. Interaktiv xaritada mahalliy joylar, manbali hikoyalar va shaxsiy topilmalar uchun qoralama mavjud.

**Butun Oʻzbekiston — mahsulot geografiyasi.** Milliy frontend Groq server planneriga ulangan: 16 shahar tanlovi va toʻrtta shahardagi 15 planner joyi. Xaritada **Gemini Live ovozli popup** bor: suhbat, foto va ixtiyoriy GPS, Groq orqali manbali maʼlumot hamda yetishmagan joylarni Wikipediaʼdan keshga olish. Alohida besh Xiva obidasi dossier piloti saqlangan. Xarita katalogi hali butun mamlakatdagi barcha obyektlarni qamramaydi; jonli narxlar, moderatsiya va toʻlovlar tayyor emas. [API konfiguratsiyasi](documentation/LIVE_API_SETUP.md), [Live yordamchi va backend topshirish](documentation/LIVE_VOICE_ASSISTANT.md).

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
| [Live API setup](documentation/LIVE_API_SETUP.md) | Frontend → Groq/Gemini, lokal ishga tushirish va real HTTP tekshiruv |
| [Live voice assistant](documentation/LIVE_VOICE_ASSISTANT.md) | Xarita popup, Gemini Live, foto/GPS, WebSocket va manbali kesh |
| [Roadmap](documentation/ROADMAP.md) | Frontend va boshqa jamoa ishlarining alohida navbati |
| [Git / deploy](documentation/GIT_WORKFLOW_AND_DEPLOY.md) | Jamoa egaligi va deploy yoʻriqnomasi |

## Lokal ishga tushirish

Node.js 20+ va npm. Yangi reja/AI uchun API kerak; saqlangan reja va statik xarita API siz ham ochiladi. Avval [live API setup](documentation/LIVE_API_SETUP.md) bo‘yicha server va URLlarni sozlang:

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

Frontend, AI va live API ulanishi `main`da. Milliy UI va Xiva walk haqiqiy API ni chaqiradi. PostgreSQL migratsiyasi yoki production HTTPS deploy bajarilmagan.
