# SmartGuide — 48 Soatlik Xakaton Yo'l Xaritasi (Roadmap)

**Tadbir:** Tourism Hackathon 2026 (25–27 noyabr 2026, CAEx Toshkent)  
**Tanlangan trek:** 3-trek — *Kichik turbiznes va infratuzilmani raqamlashtirish* ("Turistik obyektlarning raqamli infratuzilmasi")  
**MVP Obyekti:** Xiva — **Ichan-Qal'a** majmuasidagi 5 ta asosiy obida (`kalta-minor`, `juma-mosque`, `tosh-hovli`, `kunya-ark`, `pahlavon-mahmud`).

---

## Jamoa Rollari va Mas'uliyat Taqsimoti

| Rol | Mas'uliyat doirasi | Asosiy TZ fayli |
| :--- | :--- | :--- |
| **1. Frontend Developer** | `apps/tourist` (Sayyoh PWA) + `apps/dashboard` (Muzey B2B Dashboard + QR Generator) | [TZ_FRONTEND.md](TZ_FRONTEND.md) |
| **2. Backend Developer** | `apps/api` (Express API, PostgreSQL/Drizzle, Analitika, Kesh/Rate-limit, AWS Ubuntu Deploy) | [TZ_BACKEND.md](TZ_BACKEND.md) |
| **3. AI & RAG Data Engineer** | `apps/api/data/ichan-qala-landmarks.json`, `apps/api/src/services/ai.service.ts` (RAG, Vision, TTS, Eval) | [TZ_AI_RAG.md](TZ_AI_RAG.md) |
| **4. Team Lead / Speaker** | Validatsiya (10+ sayyoh/gid/muzey suhbati), unit-ekonomika, 18:00 & Final Pitch, integratsiya nazorati | Ushbu hujjat + `start conversation with gemni.pdf` |

---

## Bosqichma-Bosqich Reja (0-bosqichdan Demo Day gacha)

### 0-BOSQICH: Skelet va Monorepo (BAJARILDI ✅)
- [x] Yagona monorepo (`packages/shared`, `apps/api`, `apps/tourist`, `apps/dashboard`) yaratildi.
- [x] PostgreSQL + Drizzle ORM sxemasi (`landmarks`, `interactions`) va idempotent seed tayyor.
- [x] 5 ta Ichan-Qal'a obidasi uchun dastlabki RAG JSON bazasi va 6 tilli tezkor savollar yozildi.
- [x] Rasmiy `@google/genai` SDK (`gemini-3.5-flash-lite` + `gemini-4-hydrogen` fallback + `gemini-3.8-flash-lite-tts`) ulandi.
- [x] Tourist PWA (`/`, `/l/[slug]`), Audio Player, Snap & Ask, B2B Dashboard (5s live polling + Recharts + QR Generator) bazaviy ishlaydigan holatda.
- [x] Barcha 4 workspace `npm run typecheck` va `npm run build` dan 0 xato bilan o'tdi.

---

### 1-BOSQICH: 1-kun (25-noyabr, 14:00 – 18:00) — Jonli Integratsiya va 18:00 Check-in

**Maqsad:** Soat 18:00 dagi oraliq tekshiruvgacha hamma lokalda ishga tushirib, kamida **Kalta Minor** bo'yicha to'liq zanjirni (QR → Savol/Rasm → Gemini RAG + Ovoz → B2B Dashboard'da jonli yangilanish) real API kalit bilan sinab ko'rish.

| Vaqt | Kim | Aniq vazifa |
| :--- | :--- | :--- |
| **14:00 – 14:30** | **Hamma** | Reponi `git clone` qilish, `.env` ga `DATABASE_URL` + `GEMINI_API_KEY` kiritish, `npm run db:push && npm run db:seed && npm run dev` ni muvaffaqiyatli yurgizish. O'z branchini ochish (`feat/frontend`, `feat/backend`, `feat/ai-rag`). |
| **14:30 – 16:00** | **AI/RAG Dev + Backend Dev** | **Texnik mentorlik** (Behruz Saidjonov / Aziza Turaeva): RAG prompt arxitekturasi, gallyutsinatsiyaga qarshi himoya va 1 sayyohga API xarajatini `$0.15` atrofida ushlash bo'yicha maslahat olish. |
| **14:30 – 16:00** | **Speaker** | **Biznes mentorlik** (Sadokat Kazieva / Foziljon Saydaliev / Lola Sayfi): B2B2C 70/30 modelni tekshirtirish va kamida 5–10 ta sayyoh/gid bilan real validatsiya intervyusi o'tkazish. |
| **16:00 – 17:30** | **Frontend Dev** | Tourist PWA ni real smartfon ekranida tekshirish (kamera yuklash, audio pleyer iOS/Android'da o'ynashi, 6 til UI). Dashboard'da 5s polling va QR generatorni sinash. |
| **16:00 – 17:30** | **AI/RAG Dev** | Kalta Minor + qolgan 4 ta obida bo'yicha real foto bilan **Snap & Ask** va 6 tilda (`UZ, RU, EN, JA, KO, ES`) **Gemini TTS** ovoz sifatini test qilish. |
| **16:00 – 17:30** | **Backend Dev** | `POST /api/guide/ask` javob vaqtini o'lchash, TTS/RAG xatolarini loglash, QR scan eventlarini to'g'ri yozish va barcha endpointlarni `curl` bilan verifikatsiya qilish. |
| **17:30 – 18:00** | **Hamma** | `main` branchga birinchi barqaror merge + 18:00 Check-in uchun 2 daqiqalik jonli demo tayyorlash. |

**1-bosqich yakuniy mezoni (Definition of Done):**
- Kalta Minor sahifasida yapon yoki ingliz tilida savol berilganda Gemini ovozli javob beradi va 5 soniya ichida Dashboard'da yangi yozuv `"LIVE NEW"` bilan chiqadi.

---

### 2-BOSQICH: 1-kun kechqurun va 2-kun ertalab (25-noyabr 19:00 – 26-noyabr 13:00) — To'liq MVP va "Wow-Effekt"

**Maqsad:** Barcha 5 ta obidani muzey darajasidagi chuqur RAG kontent bilan boyitish, keshlash orqali tezlikni oshirish va UI/UX ni sahna darajasiga olib chiqish.

- **AI & RAG Engineer:**
  - 5 ta obidaning har biri uchun kamida 8–10 ta noyob tarixiy fakt (Vikipediyada kam uchraydigan aniq o'lchamlar, me'morlar, koshin texnologiyasi, epigrafika yozuvlari, mahalliy keksa gidlar afsonalari) bilan `ichan-qala-landmarks.json` ni boyitish.
  - "Gallyutsinatsiya testi" (Anti-Hallucination Benchmark): 15 ta chalg'ituvchi savol (masalan, *"Kalta Minorni Amir Temur qurganmi?"*, *"Tosh-Hovlida necha qavatli lift bor?"*) bilan AI 0% yolg'on ma'lumot berishini isbotlash.
  - Real Xiva suratlari (har bir obidadan 2–3 xil rakurs) bilan Vision tanish aniqligini ≥95% ga chiqarish.
- **Backend Developer:**
  - **Response + TTS Caching** (tezkor savollar uchun in-memory/Postgres kesh) — bir xil tezkor savol qayta so'ralganda API xarajatini 0 ga, javob vaqtini `<150ms` ga tushirish!
  - `POST /api/landmarks/:slug/scan` (ixtiyoriy QR ochilish hodisasini qayd etish) va `GET /api/analytics/export` (CSV hisobot — muzey direktori uchun B2B wow-detal).
  - Rate limiting, payload validatsiyasi, aniq error kodlari va healthcheck monitoring.
- **Frontend Developer:**
  - **Tourist PWA (`apps/tourist`):**
    - Silliq mobil animatsiyalar, tezkor savollar karuseli, kamera suratini oldindan ko'rish, iOS Safari'da audio autoplay/tap UX ni mukammallashtirish.
    - Obidalar o'rtasida tezkor o'tish va "Verified Museum Fact" / "Archive ID" ishonch elementlarini ko'zga tashlanadigan qilish.
  - **B2B Dashboard (`apps/dashboard`):**
    - Projektor ekranida uzoqdan aniq ko'rinadigan kontrast, jonli yangi savol kelganda vizual bildirishnoma (toast/flash), B2B daromad kalkulyatori (muzey direktori kunlik sayyohlar sonini slayderda surib oylik daromadini hisoblay olishi!).
    - Chop etishga tayyor chiroyli A5/A6 **QR Plakat** dizayni.

---

### 3-BOSQICH: 2-kun tushdan keyin (26-noyabr 13:00 – 19:00) — AWS Ubuntu Deploy va Sayqallash

- **13:00 – 15:00:** Barcha 3 ta branch (`feat/frontend`, `feat/backend`, `feat/ai-rag`) asosiy branchga birlashtiriladi, to'liq end-to-end integratsiya testi o'tkaziladi.
- **15:00 – 17:30:** **Backend Developer** loyihani AWS Ubuntu serverga (Native PostgreSQL + Node 22 + PM2 + Nginx/HTTPS) deploy qiladi ([GIT_WORKFLOW_AND_DEPLOY.md](GIT_WORKFLOW_AND_DEPLOY.md)).
- **17:30 – 18:45:** **Butun jamoa** real telefonlarda (iOS + Android, mobil internetda!) AWS domen/IP ga ulangan QR-kodlarni skanerlab sinovdan o'tkazadi:
  - Kamera orqali rasm olish (HTTPS talab qilinishi mumkin — shuning uchun Nginx + Let's Encrypt HTTPS ulash juda muhim!).
  - Ovozli javob (UZ, EN, JA, KO, RU, ES) telefon karnayidan tiniq eshitilishi.
  - Dashboard 5 soniyada yangilanishi.
- **19:00 — QAT'IY CODE FREEZE!** Yangi funksiya qo'shish to'xtatiladi. Faqat kritik xatolar (bugfix) tuzatiladi.

---

### 4-BOSQICH: Tayyorgarlik va Demo Day (26-noyabr 19:00 – 27-noyabr 12:00)

- **26-noyabr 19:30 – 21:00:**
  - **Zaxira demo video (60 soniya):** Internet uzilib qolishi ehtimoli uchun telefon ekrani + Dashboard yonma-yon ishlayotgan 1 daqiqalik tiniq video yozib qo'yish.
  - **QR Plakatlarni chop etish:** Dashboard'dagi `QR Code Generator` tabidan Kalta Minor va asosiy kirish QR kodlarini qog'ozga chiqarib hakamlar stoliga tayyorlash + taqdimot slaydiga katta QR kod qo'yish.
  - **Repetitsiya:** Spiker bilan taymer qo'yib (qat'iy **3 daqiqa pitch + 2 daqiqa Q&A**) kamida 5 marta mashq qilish.
- **27-noyabr 10:00 – 12:00 (Final Pitch — "G'olibona fokus"):**
  1. 1-daqiqada texnik so'z emas, **muammo va real validatsiya raqamlari**dan boshlash.
  2. Slaydda katta QR-kodni ko'rsatish: hakamlar o'z telefonida skanerlab **Kalta Minor** haqida ingliz/yapon tilida savol beradi.
  3. Shu zahoti katta ekrandagi **B2B Muzey Dashboard**da yangi sayyoh, savol va daromad real vaqtda oshganini ko'rsatish!
  4. Savol-javobda texnik hakamlarga mahalliy RAG arxitekturasi, 0% gallyutsinatsiya testi va `$0.15` API xarajatini ko'rsatish.
