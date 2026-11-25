# TZ #1 — Frontend Developer (To'liq Texnik Topshiriq)

> **Loyiha:** SmartGuide — Ichan-Qal'a (Xiva) Raqamli AI-Gid Infratuzilmasi  
> **Rol:** Frontend Developer (1 kishi)  
> **Git Branch:** `feat/frontend`  
> **Mas'uliyat zonasi:** `apps/tourist/**` (Next.js 15 PWA · Port `3000`) va `apps/dashboard/**` (React 19 + Vite B2B Panel · Port `5173`)  
> **Tegilmaydigan zonalar:** `apps/api/**` (Backend va AI/RAG zonasi), `packages/shared/**` (faqat kelishuvdan keyin o'zgartiriladi)

---

## 1. Strategik Maqsad va Hakamlar Ko'zi Bilan Baholash

Hakamlar hay'ati va Turizm qo'mitasi vakillari loyihamizning texnik qismini bevosita **siz yaratgan 2 ta interfeys** orqali baholaydi:

1. **Sayyoh tajribasi (`apps/tourist` — B2C tomoni):**
   - Sayyoh Xivada rouming internetda yuribdi — u **100 MB mobil ilova yuklab o'tirmaydi** va **login/parol kiritmaydi**.
   - QR-kodni skanerlashi bilan **<2 soniyada** zamonaviy Dark/Gold Ipak Yo'li estetikasida ochiladi, 1 bosishda tilini tanlaydi (`EN, UZ, RU, JA, KO, ES`), rasmga oladi (**Snap & Ask**) yoki tezkor savolni bosadi va **darhol quloqchin/karnaydan ovozli gidni tinglaydi**.
2. **Muzey direktori tajribasi (`apps/dashboard` — B2B pul keltiruvchi tomoni):**
   - ProSkill biznes-ramkasiga ko'ra, asosiy qaror qiluvchi hamkor (B2B) — muzey va tarixiy kompleks ma'muriyati.
   - Sahnadagi Demo Day "g'olibona fokus": hakam telefonida QR skanerlab **Kalta Minor** haqida savol beradi → **5 soniya ichida** katta ekrandagi Dashboard'da yangi sayyoh, jonli savol, til ulushi va muzeyning 30% daromad ulushi jonli ravishda oshib ko'rinadi!

---

## 2. Mavjud Fayllar Xaritasi (Hozir Tayyor Bo'lgan Baza)

Noldan loyiha qurish shart emas — quyidagi barcha fayllar allaqachon ishlaydigan, `typecheck` va `build` dan o'tgan holatda tayyor:

### A. `apps/tourist` (Next.js 15 App Router + Tailwind CSS v4)
| Fayl | Vazifasi (hozirgi holati) |
| :--- | :--- |
| `src/app/layout.tsx` & `globals.css` | PWA metadata, `manifest.webmanifest`, Dark Obsidian + Gold/Turquoise Ipak Yo'li fon va audio animatsiyalar |
| `src/app/page.tsx` & `src/components/TouristHomeClient.tsx` | Asosiy kirish sahifasi (`/`): 6 til almashtirgich, 5 ta obida kartasi, umumiy "Snap & Identify Any Monument" kamera oqimi |
| `src/app/l/[slug]/page.tsx` & `src/components/LandmarkGuideClient.tsx` | QR-kod manzil sahifasi (`/l/kalta-minor` va b.): hero banner, tasdiqlangan muzey pasporti (History/Architecture/Legends), tezkor savollar, chat tarixi, pastki Snap & Ask + Voice + Text paneli |
| `src/app/l/[slug]/not-found.tsx` | Noto'g'ri QR slug uchun chiroyli 404 sahifasi |
| `src/components/LanguageSwitcher.tsx` | `EN, UZ, RU, JA, KO, ES` bayroqli til almashtirgich |
| `src/components/LandmarkArt.tsx` | 5 ta obida uchun oflayn ishlaydigan maxsus vektor SVG illyustratsiyalar |
| `src/components/AudioGuidePlayer.tsx` | Base64 WAV pleyer (Play/Pause, ekvalayzer animatsiya, vaqt slayderi, Replay) + brauzer `speechSynthesis` zaxirasi |
| `src/lib/api.ts` | Backend REST klienti (`fetchLandmarks`, `fetchLandmarkBySlug`, `askGuide`) |
| `src/lib/i18n.ts` | 6 tildagi to'liq UI lug'ati (`TOURIST_UI`) |
| `src/lib/session.ts` | `localStorage` orqali loginsiz `sessionId` va tanlangan tilni saqlash |
| `src/lib/image-utils.ts` | Kamera rasmini klient tomonda `1024px` JPEG (`~100KB`) ga siqish |

### B. `apps/dashboard` (React 19 + Vite 6 + Tailwind CSS v4 + Recharts 3)
| Fayl | Vazifasi (hozirgi holati) |
| :--- | :--- |
| `src/App.tsx` | Asosiy executive panel, 2 ta tab (`Live Analytics` / `QR Code Generator`), har **5 soniyada** polling, `"LIVE NEW"` highlight |
| `src/components/KpiCards.tsx` | 4 ta KPI karta (Total Tourists, Total AI Interactions, Top Landmark, Est. Revenue Share) |
| `src/components/AnalyticsCharts.tsx` | Recharts: `BarChart` (obidalar), `PieChart` (tillar/davlatlar), `AreaChart` (24 soatlik dinamika) |
| `src/components/LiveQuestionsFeed.tsx` | PostgreSQL'dan kelayotgan oxirgi 15 ta savol oqimi |
| `src/components/QrCodeGenerator.tsx` | 5 ta obida + kirish eshigi uchun QR generatsiya, PNG yuklab olish, URL nusxalash, `Print All` |
| `src/lib/api.ts` | `fetchAnalyticsSummary`, `fetchLandmarksList` |

---

## 3. Batafsil Vazifalar Ro'yxati (Task-by-Task Spetsifikatsiya)

### 1-BOSQICH (25-noyabr, 14:00 – 18:00) — P0 Blocker Vazifalar (Check-in gacha)

#### `FE-01` — Lokal Ishga Tushirish va End-to-End Integratsiya Tekshiruvi `[P0]`
- **Maqsad:** `apps/tourist` (`:3000`) va `apps/dashboard` (`:5173`) ni real ishlayotgan `apps/api` (`:4000`) bilan to'liq sinovdan o'tkazish.
- **Bajariladigan ishlar:**
  1. `.env` faylida `NEXT_PUBLIC_API_URL`, `VITE_API_URL`, `VITE_TOURIST_APP_URL` to'g'ri ekanini tekshirish.
  2. Lokal Wi-Fi orqali o'z smartfoningizdan (`http://<KOMPYUTER_LAN_IP>:3000/l/kalta-minor`) sahifani ochib ko'rish.
  3. 6 ta tilning har birida (`en`, `uz`, `ru`, `ja`, `ko`, `es`) savol berib, javob, audio va Dashboard'dagi 5 soniyalik yangilanishni tekshirish.
- **Qabul mezoni:** Telefon ekranida dizayn buzilmaydi, gorizontal scroll chiqmaydi, savol 5 soniya ichida Dashboard'da aks etadi.

#### `FE-02` — Mobil Audio UX va iOS Safari / Android Chrome Mosligi `[P0]`
- **Fayl:** `apps/tourist/src/components/AudioGuidePlayer.tsx`, `LandmarkGuideClient.tsx`
- **Muammo:** iOS Safari va ko'plab Android brauzerlar foydalanuvchi bevosita audio tugmasini bosmasdan `audio.play()` qilishni (autoplay) bloklaydi; bundan tashqari, chatda 2-javob kelganda 1-javobning audiosi to'xtamasdan ustma-ust o'ynab qolishi mumkin.
- **Aniq talablar:**
  1. **Single Active Audio Manager:** Yangi audio ijro etilganda oldingi ijro etilayotgan `<audio>` yoki `speechSynthesis` avtomatik `pause()` / `cancel()` qilinsin (global event `smartguide:audio-play` yoki ref callback orqali).
  2. **Autoplay bloklanganda aniq vizual holat:** Agar `el.play()` promise reject bo'lsa, Play tugmasi atrofida mayin oltin rangli pulsatsiya (`ring-2 ring-amber-400/60 animate-pulse`) ko'rinsin va foydalanuvchiga "Tinglash uchun bosing" ishorasi berilsin.
  3. **Tezlik tanlash (`1.0x` / `1.25x`):** Audio pleyerga ixcham playback rate tugmasi qo'shilsin (`el.playbackRate`).
- **Qabul mezoni:** Bir vaqtda hech qachon ikkita ovoz ustma-ust chiqmaydi; iOS Safari va Chrome'da 1 tap bilan tiniq o'ynaydi.

#### `FE-03` — Snap & Ask Kamera Oqimi va Tarmoq Xatolarini Himoyalash `[P0]`
- **Fayl:** `apps/tourist/src/components/LandmarkGuideClient.tsx`, `TouristHomeClient.tsx`, `src/lib/image-utils.ts`
- **Aniq talablar:**
  1. **Ikki xil rasm tanlash qulayligi:** Mobil qurilmalarda foydalanuvchi kamera orqali yangi rasm olishi YOKI galereyadan tayyor rasm yuklashi (Demo Day'da zaldagi hakam galereyadagi Kalta Minor rasmini yuklab tekshirishi mumkin!) oson bo'lsin — `capture="environment"` ba'zi Android telefonlarda galereyani yashirib qo'yadi! Shuning uchun:
     - Asosiy tugma: `<input type="file" accept="image/*" />` (iOS va Android'da avtomatik *"Kamera / Foto galereya"* menyusini ochadi — eng ishonchli UX!).
  2. **Yuklash holati (Progress Feedback):** Rasm siqilayotganda va Vision API kutayotganda foydalanuvchiga yuklangan rasmning kichik prevyusi ustida "Obida aniqlanmoqda..." skaner chizig'i / spinner ko'rinsin.
  3. **Retry (Qayta urinish) tugmasi:** Agar internet vaqtincha uzilib xato chiqsa, oxirgi yuborilgan savol/rasm yo'qolib ketmasin — xato kartasida **"Qayta urinish"** tugmasi tursin.
  4. **Klaviatura va scroll UX:** Savol yuborilganda mobil klaviatura avtomatik yopilsin (`inputRef.current?.blur()`), chat avtomatik oxirgi javobga silliq scroll qilsin.
- **Qabul mezoni:** Ham kamera, ham galereyadan rasm yuklash ishlaydi; 10MB lik iPhone rasmi <200KB ga siqilib xatosiz yuboriladi.

#### `FE-04` — QR Skan Hodisasini Qayd Etish (Backend `BE-03` bilan integratsiya) `[P0]`
- **Fayl:** `apps/tourist/src/lib/api.ts`, `apps/tourist/src/components/LandmarkGuideClient.tsx`
- **Aniq talablar:**
  - Backend Dev `POST /api/landmarks/:slug/scan` endpointini qo'shgach, foydalanuvchi `/l/[slug]` sahifasini ochganida bir marta (`useEffect`, `sessionStorage` bilan dublikatni oldini olgan holda) `trackLandmarkScan({ slug, sessionId, language })` chaqirilsin.
  - Agar endpoint hali tayyor bo'lmasa yoki xato bersa, foydalanuvchiga hech qanday xato ko'rsatilmasin (silent fail).

---

### 2-BOSQICH (25-noyabr 19:00 – 26-noyabr 13:00) — P1 To'liq MVP va "Wow-Effekt"

#### `FE-05` — Tourist PWA: Obidalararo Tez O'tish Paneli (Monument Switcher) `[P1]`
- **Fayl:** `apps/tourist/src/components/LandmarkGuideClient.tsx` (yoki yangi `MonumentQuickNav.tsx`)
- **Aniq talablar:**
  - `/l/[slug]` sahifasida yuqori sarlavha ostida gorizontal scroll qilinadigan 5 ta obida chiplari (masalan: `1. Kalta Minor` · `2. Juma Mosque` · `3. Tosh-Hovli` · `4. Kunya-Ark` · `5. Pahlavon Mahmud`).
  - Joriy obida oltin (`amber-400`) ramkada ajralib tursin; boshqasini bosganda tanlangan til (`?lang=...`) saqlangan holda darhol o'sha obidaga o'tsin.
- **Nima uchun kerak:** Demo paytida QR kodni qayta skanerlamasdan ham hakamlarga barcha 5 ta obidani 5 soniyada ko'rsatib chiqish oson bo'ladi.

#### `FE-06` — Tourist PWA: Haqiqiy Xiva Suratlari + Oflayn SVG Fallback `[P1]`
- **Fayl:** `apps/tourist/public/landmarks/` + `apps/tourist/src/components/LandmarkArt.tsx`
- **Aniq talablar:**
  - 5 ta obida uchun yengil, siqilgan (`.webp` yoki `.jpg`, har biri `<120KB`) sifatli Xiva rasmlarini `public/landmarks/{slug}.webp` ga joylashtiring.
  - `LandmarkArt` komponenti rasm mavjud bo'lsa uni chiroyli dark gradient overlay bilan ko'rsatsin; rasm yuklanmasa (`onError`) darhol mavjud vektor SVG illyustratsiyaga o'tsin (shunda hech qachon singan rasm ikonasi chiqmaydi!).

#### `FE-07` — Tourist PWA: "Verified Museum Trust" Metama'lumotlari `[P1]`
- **Fayl:** `apps/tourist/src/components/LandmarkGuideClient.tsx`
- **Aniq talablar:**
  - Har bir AI javob kartasining pastki qatorida (kichik, nafis shriftda):
    - Arxiv kodi (`IQ-KH-001`) va yashil "Verified Museum Archive" belgisi
    - Javob manbasi / tezligi (masalan: `Gemini RAG · 1.2s` yoki `Instant Cache · 0.1s`)
    - Nusxalash (Copy) tugmasi
  - **Suhbatni tozalash** (Reset chat) ixcham tugmasi, agar foydalanuvchi yangi savoldan boshlamoqchi bo'lsa.

#### `FE-08` — Tourist PWA: "Audio-Only / Tour Mode" Kirish Tugmasi `[P1]`
- **Fayl:** `apps/tourist/src/components/LandmarkGuideClient.tsx`
- **Aniq talablar:**
  - Obida hero kartasi ichida bitta yorqin oltin tugma: **"▶ 30 soniyalik Kirish Ekskursiyasini Tinglash"** (6 tilda tarjima qilingan!).
  - Bosilganda avtomatik ravishda ushbu obidaning qisqa tanishtiruv savolini yuboradi va darhol ovozli gidni boshlab beradi — foydalanuvchi hech narsa yozmasdan ham darhol audio-gid eshita oladi!

#### `FE-09` — B2B Dashboard: Real-Time "Live Arrival" Toast & Sound/Pulse Banner `[P1]`
- **Fayl:** `apps/dashboard/src/App.tsx`, yangi `apps/dashboard/src/components/LiveArrivalBanner.tsx`
- **Aniq talablar:**
  - Har 5 soniyalik polling paytida yangi `interaction.id` aniqlanganda, ekranning yuqori o'ng burchagida (yoki header ostida) 7 soniya davomida aniq, chiroyli oltin/yashil banner chiqsin:
    - *"Yangi sayyoh faolligi · 🇯🇵 JA · Kalta Minor Minaret"*
    - *"«なぜカルタ・ミノルは未完成のままなのですか？»"*
  - Demo Day'da zalning oxiridagi hakam ham darhol ko'ra oladigan katta, tiniq shriftda bo'lsin.

#### `FE-10` — B2B Dashboard: Muzey Daromad Kalkulyatori (B2B Revenue Simulator) `[P1]`
- **Fayl:** yangi `apps/dashboard/src/components/RevenueSimulator.tsx`, `apps/dashboard/src/App.tsx`
- **Nima uchun muhim:** ProSkill biznes-modeli va hakamlar oldida B2B qiymatni (LTV va daromad) jonli isbotlash uchun eng kuchli vizual vosita!
- **Aniq talablar:**
  - Dashboard'da alohida blok (yoki 3-tab `"Revenue Calculator"`):
    - **Slayder 1:** Kunlik mustaqil sayyohlar soni (`50` dan `2 000` gacha, default: `400` — Xiva mavsumi o'rtachasi).
    - **Slayder 2:** QR AI-gid qo'shimcha chipta narxi (`$3`, `$4`, `$5`, default: `$4`).
    - **Slayder 3:** Konversiya foizi (`10%` – `60%`, default: `25%`).
  - **Real vaqtda hisoblanadigan natijalar:**
    - Oylik va Yillik umumiy tushum (`Gross Revenue`)
    - **Muzeyning sof daromadi (`30% ulush`, nol investitsiya bilan!)** — alohida yashil/oltin kartada!
    - SmartGuide daromadi (`70%`)
    - Oylik Gemini API xarajati (`$0.15 / sayyoh`) va **Yalpi Marja (`~96%`)**.

#### `FE-11` — B2B Dashboard: CSV Hisobot Yuklab Olish va Filtrlar `[P1]`
- **Fayl:** `apps/dashboard/src/components/LiveQuestionsFeed.tsx`, `apps/dashboard/src/App.tsx`
- **Aniq talablar:**
  - `LiveQuestionsFeed` yuqorisida tezkor filtrlar: **Obida bo'yicha** (`All` / 5 ta obida) va **Til bo'yicha** (`All` / 6 til) hamda **"Faqat Snap & Ask"** checkbox.
  - Header'da **"Export CSV"** tugmasi: Backend'ning `GET /api/analytics/export` endpointini ochadi (yoki zaxira sifatida joriy `summary.recentQuestions` dan klient tomonda CSV fayl generatsiya qilib yuklab beradi).

#### `FE-12` — B2B Dashboard: Chop Etishga Tayyor Muzey QR Plakat Dizayni `[P1]`
- **Fayl:** `apps/dashboard/src/components/QrCodeGenerator.tsx`, `apps/dashboard/src/index.css`
- **Aniq talablar:**
  - Har bir QR plakatda quyidagilar aniq ko'rinsin:
    - Yuqorida: **SmartGuide · Ichan-Qala Official AI Guide** + `UNESCO Heritage` nishoni
    - O'rtada: Yuqori aniqlikdagi (360×360px, Error Correction `H`) QR-kod
    - Pastda: Obida nomi (EN + UZ), `"Point Camera · Instant Audio Guide · No App Download"`, 6 til bayroqlari
  - `@media print` da 1 ta A4 varaqqa chiroyli 2 ta yoki 4 ta plakat kesilmasdan sig'sin (Demo Day stoliga qo'yish uchun).
  - **Tezkor Preset tugmalari:** URL input ostida `Localhost (:3000)` va `Current Host` (avtomatik `window.location.hostname:3000`) tezkor tugmalari bo'lsin.

---

### 3-BOSQICH (26-noyabr 13:00 – 19:00 CODE FREEZE) — P2 Sayqallash va Sahnaga Tayyorgarlik

#### `FE-13` — Responsive & Projektor Auditi `[P2]`
- Quyidagi ekran o'lchamlarida vizual tekshiruv:
  - `375×667` (iPhone SE) va `390×844` (iPhone 14/15) — Tourist PWA
  - `1280×720` (ko'pchilik xakaton projektorlari!) va `1920×1080` — B2B Dashboard
- Projektor ekranida qorong'i fon matnlari yetarlicha kontrastli ekanini (`slate-300` dan xira bo'lmagan) tekshiring.

#### `FE-14` — Yakuniy Build & Zero-Warning Tekshiruvi `[P2]`
- `npm run typecheck` va `npm run build` barcha workspace'larda 0 xato bilan o'tishi shart.
- Brauzer Console'da hech qanday React warning/error qolmasligi shart.

---

## 4. Edge-Case va Xatolarni Qayta Ishlash Matritsasi

| Holat / Muammo | Kutilayotgan Frontend Xulqi |
| :--- | :--- |
| API server vaqtincha o'chgan (`503` / network error) | Tourist PWA'da qizil chiroyli xato xabari + "Retry" tugmasi; Dashboard'da oxirgi muvaffaqiyatli ma'lumot ekranda qoladi + yuqorida kichik "Reconnecting..." belgisi chiqadi |
| Foydalanuvchi 12MB lik telefon rasmini yuklaydi | `compressImageToBase64` uni `<=1024px` JPEG (~120KB) ga siqadi, serverga yengil ketadi |
| `audioBase64` bo'sh kelsa (masalan TTS fallback) | `AudioGuidePlayer` buzilmaydi — avtomatik brauzer `speechSynthesis` tugmasini ko'rsatadi |
| Sayyoh Kalta Minor sahifasida turib Juma masjidi rasmini yuklasa | AI javobida `"Identified by Snap & Ask Vision"` badge + `"Open full guide for Juma Mosque →"` 1-tap o'tish tugmasi chiqadi |
| Brauzer `SpeechRecognition` ni qo'llamasa (masalan Firefox/iOS WebView) | Mikrofon bosilganda qotib qolmaydi, muloyim xabar ko'rsatib matn maydoniga fokus beradi |
| Noto'g'ri URL (`/l/non-existent`) | Custom Silk Road 404 sahifasi va `/` ga qaytish tugmasi |

---

## 5. QA Test Senariylari (Merge Oldidan Majburiy Checklist)

| # | Test Senariysi | Kutilayotgan Natija |
| :--- | :--- | :--- |
| 1 | `/` sahifasini ochib tilni `JA` (Yapon) ga almashtiring | Barcha tugmalar, 5 ta obida nomi va tavsifi yaponchaga o'tadi; sahifani refresh qilsa `JA` saqlanib qoladi |
| 2 | `/l/kalta-minor` ga kirib `"Why is Kalta Minor unfinished?"` chipini bosing | 1–3 soniyada tasdiqlangan javob + `IQ-KH-001` badge + o'ynaydigan WAV audio pleyer chiqadi |
| 3 | Juma masjidi rasmini `/l/kalta-minor` da **Snap & Ask** orqali yuklang | Vision `juma-mosque` ni taniydi, Juma masjidi haqida javob beradi va Juma sahifasiga o'tish tugmasini chiqaradi |
| 4 | Bir vaqtda `apps/dashboard` ni yon oynada ochiq tuting va PWA'da savol yuboring | Maksimum 5 soniyada Dashboard'da Total Interactions +1, Live Feed'da `"LIVE NEW"` qatori va toast chiqadi |
| 5 | Dashboard'da `QR Code Generator` → Base URL o'zgartirish → `PNG` yuklash → `Print All` | Barcha 6 ta QR yangi URL bilan qayta chiziladi, PNG skanerlanadi, print preview toza chiqadi |
| 6 | Revenue Simulator slayderlarini surib ko'ring | Oylik/yillik muzey 30% ulushi va ~96% marja xatosiz yangilanadi |
