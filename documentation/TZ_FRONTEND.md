# TZ #1 — Frontend Developer (Yakuniy Konsepsiya: Emotsional Roadmap + Live Guide + B2B Intelligence)

> **Loyiha:** SmartGuide — Emotsional Roadmap + Jonli AI-Gid + Sayyohlar Qiziqishi Intellekti  
> **Rol:** Frontend Developer (1 kishi)  
> **Git Branch:** `feat/frontend`  
> **Mas'uliyat zonasi:** `apps/tourist/**` (Next.js 15 PWA · Port `3000`) va `apps/dashboard/**` (React 19 + Vite B2B Panel · Port `5173`)  
> **Tegilmaydigan zonalar:** `apps/api/**` (Backend & AI zonasi), `packages/shared/**` (faqat kelishuvdan keyin)

---

## 1. Yakuniy Konsepsiyada Frontendning 3 Ta Hal Qiluvchi Ekrani

Siz quradigan interfeys hakamlarga mahsulotimiz boshqa oddiy AI chat-botlardan nimasi bilan tubdan farq qilishini **30 soniyada ko'rsatib berishi** kerak:

1. **Ekran #1 — GPS Yaqin Obyekt Taklifi + Shaxsiy Emotsional Roadmap (`apps/tourist`, `/`):**
   - **Muhim konsepsiya:** Har bir obidaga alohida QR-kod yopishtirilmaydi! QR-kod va kiosklar faqat kirish darvozasi/mehmonxona/vokzalda reklama sifatida sayyohni `/` sahifasiga olib kiradi (`?ref=west-gate-kiosk`).
   - Ichkarida esa brauzer **GPS geolokatsiyasi (`navigator.geolocation`)** sayyohning joylashuvini aniqlab, **📍 "Siz hozir Kalta Minor yonidasiz (28m) — Jonli suhbatni boshlang!"** kartasini avtomatik chiqaradi (Toshkentdagi xakaton zali ichida sinash uchun esa *"Demo GPS Simulator"* tugmasi bo'ladi!).
   - Shu sahifada 10 soniyalik tanlov (Til + Vaqt `1h / 2h / 4h` + Qiziqish/Hissiyot) orqali **Shaxsiy Sayohat Roadmap'i** chizib beriladi: har bir bekatda **masofa (m / daqiqa)**, **Nega borish kerak?**, **Qanday hissiyot/maza/foyda olasiz?** va **Avvalgi sayyohlarning 90%+ ni hayratga solgan TOP Signal fakt** ko'rsatiladi!
2. **Ekran #2 — Obida Oldida Jonli Suhbat + Taassurot Yig'ish (`apps/tourist`, `/l/[slug]`):**
   - Sayyoh GPS yaqinlik kartasidan yoki Roadmap bekatidan obidaga kirganda, tepada uning marshrut progressi (*"1-bekat / 4 · Keyingi bekat: Juma masjidi · 140m"*) ko'rinadi.
   - AI javob bergach, javob ostida **1-tap Micro-Feedback tugmalari** (`🔥 Juda qiziq` · `🤯 Hayratlanarli` · `😐 Menga kerak emas`) chiqadi — foydalanuvchi bosishi bilan `POST /api/guide/feedback` ketadi va tizim o'rganadi!
3. **Ekran #3 — B2B Experience Intelligence Dashboard (`apps/dashboard`):**
   - **"Signal vs. Noise" (Kerakli vs Ahamiyatsiz ma'lumotlar)** jadvali, **Sayyohlar Taassuroti (Sentiment)** grafigi, **Javobsiz Qolgan Qiziqishlar (Curiosity Gaps)**, **Muzey Daromad Kalkulyatori** va **Reklama / Hamkor Promo QR Generator** (kiosk, kirish darvozasi, mehmonxona, vokzal uchun `?ref=` kuzatiladigan promo QR'lar)!

---

## 2. Mavjud Baza (Hozir Ishlab Turgan Fayllar)

- `apps/tourist`: `/`, `/l/[slug]`, `LanguageSwitcher.tsx`, `LandmarkArt.tsx`, `AudioGuidePlayer.tsx`, `src/lib/i18n.ts`, `src/lib/session.ts`, `src/lib/image-utils.ts`, `src/lib/api.ts`.
- `apps/dashboard`: `App.tsx` (5s live polling), `KpiCards.tsx`, `AnalyticsCharts.tsx`, `LiveQuestionsFeed.tsx`, `QrCodeGenerator.tsx`, `src/lib/api.ts`.

---

## 3. Batafsil Vazifalar Ro'yxati (`FE-01` .. `FE-15`)

### P0 — Birinchi Navbatda (26-noyabr, 11:50 – 14:30 · Asosiy Konsepsiya Oqimi)

#### `FE-01` — Tourist PWA (`/`): 10 Soniyalik Emotsional Roadmap Builder `[P0 · ENG MUHIM]`
- **Fayllar:** yangi `apps/tourist/src/components/RoadmapBuilder.tsx`, `TouristHomeClient.tsx`, `src/lib/api.ts`, `src/lib/i18n.ts`
- **Aniq UX oqimi:**
  1. **Yuqori qism:** 6 tilli almashtirgich (`EN, UZ, RU, JA, KO, ES`) + SmartGuide sarlavhasi.
  2. **Interaktiv Tanlov Kartasi (3 qadam bitta ekranda):**
     - **Qancha vaqtingiz bor?** 3 ta tugma: `⚡ 1 soat (Tezkor)` · `🧭 2 soat (Ideal)` · `👑 Yarim kun (To'liq 5 obida)`
     - **Sizga nima eng ko'p zavq beradi?** (Ko'p tanlov chiplari):
       - `✨ Afsonalar va Sirlar` (`legends`)
       - `📸 Foto va Estetika` (`photography`)
       - `🏛 Me'morchilik mo'jizalari` (`architecture`)
       - `👑 Xonlar va Saroy hayoti` (`royalty`)
       - `🕌 Ruhiy xotirjamlik` (`spiritual`)
     - **Asosiy oltin tugma:** `"🗺 Shaxsiy Roadmap'imni Chizish"` → `POST /api/roadmap/generate` chaqiriladi.
  3. **Natija — Vizual Sayohat Yo'l Xaritasi (Timeline UI):**
     - Chap tomonda raqamlangan oltin/firuza vertikal chiziq (`1 → 2 → 3 → 4`).
     - Har bir bekat kartasida 4 ta aniq ma'lumot:
       - **Obida nomi + Taxminiy vaqt (`20 daqiqa`) + Interest Score badge (`🔥 94% sayyohlar tavsiyasi`)**
       - **Nega borish kerak (`whyVisit`)** — qisqa, jonli 1–2 gap
       - **Qanday hissiyot/foyda olasiz (`emotionalPayoff`)** — firuza/oltin pill ko'rinishida
       - **Data-Driven Highlight (`topSignalHighlight`)** — *"Real sayyohlar suhbatidan: eng ko'p hayratlantirgan fakt..."*
       - **"Bu obidaga keldim · Jonli AI-Gidni ochish →"** tugmasi (`/l/[slug]?lang=...&roadmapId=...`).
  4. Yaratilgan Roadmap `localStorage` da saqlansin (sayyoh `/l/[slug]` dan orqaga qaytsa yoki sahifani yangilasa yo'qolib ketmasin; *"Marshrutni qayta tuzish"* tugmasi ham tursin).
  5. Pastki qismda baribir barcha 5 ta obidaning tezkor kartalari va **"Snap & Identify"** kamera tugmasi saqlanib qolsin.
- **Qabul mezoni:** Foydalanuvchi 2 klikda o'z tilida shaxsiy Emotsional Roadmap oladi va har bir bekatdan to'g'ridan-to'g'ri `/l/[slug]` ga o'ta oladi.

#### `FE-01B` — Tourist PWA (`/`): GPS Joylashuv Bo'yicha Eng Yaqin Obyekt Taklifi + Demo GPS Simulator `[P0 · ENG MUHIM]`
- **Fayllar:** yangi `apps/tourist/src/components/NearbyLandmarkBanner.tsx`, `apps/tourist/src/lib/geo.ts`, `TouristHomeClient.tsx`
- **Aniq UX qoidalari:**
  1. Sayyoh `/` ni ochganda `navigator.geolocation.getCurrentPosition(...)` (ixtiyoriy ruxsat bilan) orqali uning joriy `(lat, lng)` koordinatasi olinadi va `GET /api/landmarks/nearby?lat=...&lng=...` ga yuboriladi.
  2. Agar sayyoh Ichan-Qal'a hududida bo'lsa (`inSiteRange: true`), ekranning yuqorisida yorqin firuza/oltin **"📍 Sizning joylashuvingiz bo'yicha eng yaqin obyekt"** kartasi chiqadi: masalan, *"Kalta Minor minorasi · 28 metr narida (1 daqiqa piyoda) → Jonli AI-gid bilan suhbatni boshlash"*.
  3. **Xakaton Zali Uchun Demo GPS Simulator (JUDA MUHIM!):** Hakamlar CAEx Toshkentda o'tirgani uchun (Xivadan 750 km uzoqda!) `inSiteRange: false` bo'ladi. Shunday paytda chiroyli ixcham *"🧭 Demo rejim: Ichan-Qal'ada yurishni simulyatsiya qilish"* tugmasi chiqsin — bosilganda 5 ta Xiva GPS nuqtasidan birini (masalan, *Ota-Darvoza / Kalta Minor yonida* yoki *Juma masjidi yonida*) tanlab, haqiqiy GPS yaqinlik kartasi qanday avtomatik ishlashini sahnada jonli ko'rsatish mumkin bo'lsin!
  4. URL'dagi `?ref=west-gate-kiosk` (reklama QR/kiosk manbasi) `sessionStorage` da saqlanib, `POST /api/roadmap/generate` va `POST /api/landmarks/:slug/visit` ga yuborilsin.

#### `FE-02` — Tourist PWA (`/l/[slug]`): Roadmap Progressi va "Keyingi Bekat" Yo'naltirgichi `[P0]`
- **Fayl:** `apps/tourist/src/components/LandmarkGuideClient.tsx`
- **Aniq talablar:**
  - `localStorage` dan joriy Roadmap o'qilsin: agar bu obida sayyohning Roadmap'ida bo'lsa, yuqorida ixcham progress chizig'i ko'rinsin (`2 / 4-bekat · Sizning Roadmap'ingiz`).
  - Sayyoh kamida 1 ta savol bergach (yoki pastki panelda) **Keyingi bekat tavsiyasi** kartasi chiqsin (`response.nextStopSuggestion` yoki Roadmap'dagi keyingi stop): *"Keyingi manzil: Juma masjidi — 1000 yillik yog'och ustunlar salqinligini his qiling →"*.
  - Obida hero kartasida uning **Emotsional Va'dasi (`emotionalPayoff`)** va **"▶ 30 soniyalik Kirish Ekskursiyasini Tinglash"** 1-tap tugmasi tursin.

#### `FE-03` — Tourist PWA (`/l/[slug]`): 1-Tap Micro-Feedback (Signal vs. Noise Tugmalari) `[P0 · FLYWHEEL UCHUN SHART!]`
- **Fayl:** `apps/tourist/src/components/LandmarkGuideClient.tsx`, `src/lib/api.ts`
- **Aniq talablar:**
  - Har bir AI javobi kartasining pastida (audio pleyer ostida) 3 ta nafis ixcham tugma:
    - `🔥 Juda qiziq` (`fascinating`)
    - `🤯 Hayratlanarli` (`surprising`)
    - `😐 Menga kerak emas` (`not_relevant`)
  - Bosilganda `POST /api/guide/feedback` (`{ interactionId, rating }`) yuboriladi.
  - Tugma tanlangach, kichik tasdiq xabari chiqadi: *"Rahmat! Sizning taassurotingiz keyingi sayyohlar marshrutini yanada aqlliroq qiladi ✨"* (6 tilda tarjima qilingan!).
  - Har bir AI javobi ustida aniqlangan mavzu chipi (`insight.detectedTopicLabel` + kategoriya) ko'rinsin.

#### `FE-04` — Mobil Audio Single-Player & Snap & Ask Barqarorligi `[P0]`
- **Fayl:** `apps/tourist/src/components/AudioGuidePlayer.tsx`, `LandmarkGuideClient.tsx`
- **Aniq talablar:**
  1. **Single Active Audio:** Yangi audio boshlanganda oldingi o'ynayotgan `<audio>` yoki `speechSynthesis` avtomatik to'xtasin (`window.dispatchEvent(new CustomEvent('smartguide:stop-audio', { detail: playerId }))`).
  2. **Kamera + Galereya:** `<input type="file" accept="image/*" />` (`capture` atributini olib tashlash — Android va iOS'da ham kamera, ham galereya tanlash menyusi chiqishi uchun, Demo Day'da hakam tayyor rasm yuklab sinashi ham oson!).
  3. **Autoplay bloklanganda:** Play tugmasida mayin oltin pulsatsiya + `1.0x / 1.25x` tezlik tugmasi.
  4. **Retry tugmasi:** Tarmoq uzilsa savol yo'qolmasin, "Qayta urinish" tugmasi chiqsin.

---

### P1 — B2B Experience Intelligence Dashboard (26-noyabr, 14:30 – 17:00)

#### `FE-05` — Dashboard: "Signal vs. Noise" Kontent Matritsasi `[P1 · B2B ASOSIY WOW!]`
- **Fayl:** yangi `apps/dashboard/src/components/SignalNoisePanel.tsx`, `apps/dashboard/src/App.tsx`
- **Nima ko'rsatadi:** Hakamlar aynan shu blokni ko'rib *"Ha, bu ChatGPT emas — bu haqiqiy Tourist Intelligence!"* deyishi kerak:
  - **Chap ustun (🟢 TOP SIGNAL — Sayyohlarni eng ko'p hayratga solgan ma'lumotlar):**
    - `summary.signalVsNoise.topHighSignalTopics` dan Top 5 mavzu: Obida nomi, mavzu nomi, kategoriya (`Legend / Architecture`), `askCount`, `🔥` ijobiy reaksiyalar soni va **Signal Score progress bar (`95 / 100`)**.
    - Izoh: *"Avtomatik ravishda yangi sayyohlarning Roadmap va birinchi hikoyalariga qo'yiladi"*.
  - **O'ng ustun (🟠 LOW SIGNAL / NOISE — Sayyohlar e'tibor bermayotgan yoki ahamiyatsiz ma'lumotlar):**
    - `summary.signalVsNoise.lowInterestNoiseTopics` dan past balli mavzular (`22 / 100`), salbiy/skip belgisi bilan.
    - Izoh: *"Avtomatik filtrlanadi — sayyohlarni zeriktirmaslik uchun faqat so'ralganda ko'rsatiladi"*.

#### `FE-06` — Dashboard: Sayyohlar Taassuroti (Sentiment) & Javobsiz Qiziqishlar (Curiosity Gaps) `[P1]`
- **Fayl:** `apps/dashboard/src/components/AnalyticsCharts.tsx` (yoki yangi `ExperienceInsights.tsx`)
- **Aniq talablar:**
  1. **Tourist Impressions / Sentiment Chart:** `awe` (Hayrat), `fascinated` (Qiziqish), `curious` (Savolchan), `neutral`, `bored` ulushlarini ko'rsatuvchi toza gorizontal bar yoki Recharts grafigi.
  2. **Curiosity Gaps (Muzey kuratori uchun oltin ro'yxat):** Sayyohlar so'ragan, lekin hali rasmiy muzey arxivida yetarli javob bo'lmagan savollar ro'yxati (`summary.curiosityGaps`) — *"Muzey arxiviga qo'shish tavsiya etiladi"* belgisi bilan!

#### `FE-07` — Dashboard: Jonli Kelgan Savol & Reaksiya Uchun "Live Arrival Banner" `[P1]`
- **Fayl:** `apps/dashboard/src/App.tsx`
- Har 5 soniyalik polling'da yangi savol kelganda ekranning tepasida 7 soniya davomida katta, projektor ekranidan aniq o'qiladigan oltin bildirishnoma chiqsin:
  - *"🔔 JONLI SAYYOH · 🇯🇵 JA · Kalta Minor · Mavzu: Architect Legend · Taassurot: 🤯 Awe"*

#### `FE-08` — Dashboard: Muzey Daromad Kalkulyatori (B2B Revenue Simulator) `[P1]`
- **Fayl:** yangi `apps/dashboard/src/components/RevenueSimulator.tsx`
- Slayderlar: Kunlik sayyohlar (`50–2000`, default `400`), Narx (`$3–$5`, default `$4`), Konversiya (`10%–60%`, default `25%`).
- Real 2026 smeta formulasi bilan hisoblash:
  - **Muzey 30% sof ulushi** (oylik/yillik, `$0` investitsiya)
  - **SmartGuide 70% ulushi**
  - **Real Gemini API xarajati (`$0.04 / sayyoh`)** va **~96%+ yalpi marja**!

#### `FE-09` — Dashboard: KPI Yangilanishi, Filtrlar, CSV Eksport va Reklama Promo QR Generator `[P1]`
- `KpiCards.tsx` da qo'shimcha kichik ko'rsatkich: `Roadmaps Generated` soni va o'rtacha `Interest Score (4.7/5)`.
- `LiveQuestionsFeed.tsx` da har bir savol yonida `detectedTopic`, `sentiment` emojisi va `userFeedback` (`🔥/🤯/😐`) badge'i + Obida/Til filtri + **"Export CSV"** tugmasi (`GET /api/analytics/export`).
- **`QrCodeGenerator.tsx` ni "Marketing & Partner Promo QR Generator" ga aylantirish:**
  - Har bir obidaga emas, balki **reklama va kirish kanallari** uchun kuzatiladigan (`?ref=...`) QR-kodlar yaratilsin (hammasi asosiy `/` — Emotsional Roadmap + GPS sahifasiga olib kiradi!):
    1. `Ichan-Qala West Gate Info-Kiosk` → `${baseUrl}/?ref=west-gate-kiosk`
    2. `Ticket Office Acrylic Stand` → `${baseUrl}/?ref=ticket-desk`
    3. `Khiva Train Station Roll-Up` → `${baseUrl}/?ref=khiva-station`
    4. `Partner Boutique Hotels` → `${baseUrl}/?ref=partner-hotel`
    5. `Demo Day Pitch Slide (Judges)` → `${baseUrl}/?ref=demo-stage`
  - Foydalanuvchi o'zi yangi hamkor nomini (masalan `hotel-orient-star`) kiritib darhol maxsus promo QR yarata olsin, `PNG` yuklab olsin va `Print All` qila olsin!

---

### P2 — Sayqallash va Sahnaga Tayyorgarlik (26-noyabr, 17:00 – 19:00 CODE FREEZE)

#### `FE-10` — 6 Tilda To'liq i18n Audit (`src/lib/i18n.ts`) `[P2]`
- Barcha yangi Roadmap Builder, Micro-Feedback, Emotional Payoff va Next Stop matnlari `en, uz, ru, ja, ko, es` tillarida to'liq tarjima qilingan bo'lsin (birorta qolib ketgan inglizcha matn bo'lmasin!).

#### `FE-11` — Projektor (1280×720) va Smartfon (375×667) Auditi + Clean Build `[P2]`
- `npm run typecheck --workspace=@smartguide/tourist && npm run build --workspace=@smartguide/tourist`
- `npm run typecheck --workspace=@smartguide/dashboard && npm run build --workspace=@smartguide/dashboard`

---

## 4. QA Test Senariylari (Merge Oldidan Majburiy Checklist)

| # | Test | Kutilayotgan Natija |
| :--- | :--- | :--- |
| 1 | `/` da `2 soat` + `Legends` + `Photography` tanlab "Roadmap Chizish" ni bosing | 3–4 ta tartiblangan obida kartasi, har birida *Nega borish*, *Hissiyot/foyda* va *Top Signal fakt* chiqadi |
| 2 | 1-bekat (`Kalta Minor`) ni bosib `/l/kalta-minor` ga o'ting | Tepada Roadmap progressi (`1 / 4`), pastda `Keyingi bekat: Juma masjidi` ko'rinadi |
| 3 | Savol bering → WAV audio eshiting → `🔥 Juda qiziq` tugmasini bosing | Audio boshqa audiolar bilan ustma-ust chiqmaydi; `POST /api/guide/feedback` `200 OK` beradi va rahmat xabari chiqadi |
| 4 | Yon oynada `apps/dashboard` ni kuzating (5 soniya ichida) | `"Live Arrival"` banneri chiqadi, `Total Interactions` +1, `Signal vs. Noise` panelida o'sha mavzuning `Signal Score` i oshadi! |
| 5 | Dashboard'da `Export CSV` va `Revenue Simulator` ni sinang | UTF-8 CSV yuklanadi, slayderlar muzey 30% daromadini va `$0.04` API xarajatini aniq hisoblaydi |
