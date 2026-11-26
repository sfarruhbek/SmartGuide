# SmartGuide — Oʻzbekiston boʻylab toʻliq shahar Roadmap'i va AI-Gid

> **Muhim aniqlik (Mahsulot ko'lami):** SmartGuide **faqat Ichan-Qal'a (Xiva) ilovasi EMAS!**
> - **Asosiy mahsulot:** Sayyoh tashrif buyuradigan **istalgan shahar(lar)** (Oʻzbekiston boʻylab 16 ta shahar + erkin shahar kiritish: Toshkent, Samarqand, Buxoro, Xiva, Nukus, Termiz, Shahrisabz, Qoʻqon va boshqalar) boʻylab aylanish uchun **toʻliq kunlik sayohat Roadmap'ini** chizib beruvchi mustaqil sayohat va AI-gid PWA platformasi.
> - **Toʻliq Roadmap ichida nima bor:** har bir kun uchun vaqt jadvali, obidalar va mahalliy kashfiyotlar ketma-ketligi, ovqatlanish, mahalliy/shaharlararo transport, kirish chiptalari, yashash va 10% zaxira byudjet (USD) hisob-kitobi, interaktiv OpenStreetMap xarita, manbali hikoyalar hamda shaxsiy topilmalar qoralamasi.
> - **Ichan-Qal'a (Xiva) nima?** U mahsulot chegarasi emas, balki **1-bosqich chuqurlashtirilgan AI-pilot hududi** (5 ta muzey-arxiv dossierli obida, Snap & Ask rasm tanish, `/khiva` qisqa piyoda yurish rejimi va B2B muzey analitikasi piloti).

**Texnik holat:** Milliy frontend (`/`) Groq server planneriga (`POST /api/trips/generate`) ulangan: 16 ta shahar tanlovi + erkin shahar kiritish, 4 ta asosiy shaharda 15 ta katalog joyi (qolgan shaharlarda ochiq erkin tadqiqot bloklari). Chuqur dossier va foto-tanish piloti hozircha Xivadagi 5 obidada, ovozli gid (TTS) esa Gemini 3.8 orqali ishlaydi. PWA (`manifest.webmanifest`, `sw.js`, PNG iconlar) oʻrnatishga tayyor. Jonli chipta narxlari, foydalanuvchi topilmalarini moderatsiya qilish, fon GPS avto-taklifi va toʻlovlar keyingi bosqich integratsiyasida. [Ishlaydigan API konfiguratsiyasi va tekshiruv](documentation/LIVE_API_SETUP.md).

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
