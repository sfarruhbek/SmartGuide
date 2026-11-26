# SmartGuide — Moliyaviy Smeta va Haqiqiy Xarajatlar Modeli (2026 Real Narxlar)

> **Hisob-kitob sanasi:** 2026-yil noyabr  
> **Valyuta kursi bazasi:** `1 USD ≈ 12,500 UZS` (O'zbekiston MB joriy bozor o'rtachasi)  
> **Tamoyil:** Barcha narxlar taxmin emas — 2026-yilgi rasmiy provayder tariflari (Google Gemini API, AWS EC2/EBS, UZINFOCOM `cctld.uz`, Click/Payme Business va Toshkent reklama-poligrafiya bozor narxlari) asosida hisoblangan.

---

## 1. Rasmiy Manbalardan Olingan Real Tariflar Bazasi (2026)

| Xarajat elementi | Rasmiy tarif (2026) | Manba / Provayder |
| :--- | :--- | :--- |
| **`gemini-3.5-flash-lite` (Input — text/image)** | **`$0.30` / 1 mln token** (Free Tier ham bor) | Google AI Studio (`ai.google.dev/gemini-api/docs/pricing`) |
| **`gemini-3.5-flash-lite` (Output — text)** | **`$2.50` / 1 mln token** | Google AI Studio (`ai.google.dev`) |
| **`gemini-4-hydrogen` (Fallback Input / Output)** | **`$1.50` / `$7.50`** per 1M token (Cache read: `$0.075/1M`) | Google AI Studio (`ai.google.dev`) |
| **`gemini-3.8-flash-lite-tts` (Text Input)** | **`$0.50` / 1M token** (2026-yil oxirigacha; 2027-yildan `$1.00/1M`) | Google AI Studio (`ai.google.dev`) |
| **`gemini-3.8-flash-lite-tts` (Audio Output)** | **`$6.00` / 1M token** (`25 token = 1 soniya` → **1 daqiqa audio = `$0.009`**) | Google AI Studio (`ai.google.dev`) |
| **AWS EC2 Ubuntu `t3.small` (2 vCPU, 2 GiB RAM)** | **`$15.18 – $15.77 / oy`** (730 soat On-Demand, `us-east-1`) | Amazon Web Services EC2 Pricing |
| **AWS EC2 Ubuntu `t3.medium` (2 vCPU, 4 GiB RAM)** | **`$30.37 / oy`** (730 soat On-Demand, `us-east-1`) | Amazon Web Services EC2 Pricing |
| **AWS EBS `gp3` SSD xotira** | **`$0.08 / GB-oy`** (`30 GB = $2.40/oy`, `50 GB = $4.00/oy`) | Amazon Web Services EBS Pricing |
| **AWS Public IPv4 manzil** | **`$3.65 / oy`** (`$0.005/soat`) | Amazon Web Services VPC Pricing |
| **`.uz` domen (`smartguide.uz`)** | **`33,000 – 35,000 UZS / yil`** (`~$2.80 / yil`) | UZINFOCOM (`cctld.uz` / akkreditatsiyalangan registratorlar) |
| **HTTPS SSL Sertifikat (Let's Encrypt)** | **`$0 / yil`** (Certbot + Nginx avtomatik yangilanish) | Let's Encrypt |
| **Click / Payme internet-ekvayring komissiyasi** | **`1.5% – 2.0%`** har bir onlayn to'lovdan | Click Business / Payme Business |
| **Akril UV-bosma QR stol stendi (100×150 mm, 3 mm)** | **`45,000 – 80,000 UZS / dona`** (`~$3.60 – $6.40`) | Toshkent reklama ishlab chiqarish bozori |
| **Ko'cha sharoitiga chidamli kompozit/alyuminiy QR lavha (A4/A5)** | **`150,000 – 250,000 UZS / dona`** (`~$12.00 – $20.00`) | Toshkent/Xiva tashqi reklama bozori |

---

## 2. Bitta Sayyohga AI Xarajati (Exact Cost-to-Serve Kalkulyatsiyasi)

Faraz qilaylik, 1 nafar sayyoh Ichan-Qal'a bo'ylab to'liq sayohat qiladi:
- **1 ta** Emotsional Shaxsiy Roadmap generatsiyasi (`gemini-3.5-flash-lite`)
- **6 ta** Obida oldida jonli savol-javob (`gemini-3.5-flash-lite`)
- **2 ta** Snap & Ask kamera rasmini tanish (`gemini-3.5-flash-lite` multimodal Vision)
- **6 ta** Signal/Noise va Taassurot (Interest & Sentiment) ajratish tahlili
- **6 ta** Ovozli javob (`gemini-3.8-flash-lite-tts`, har biri o'rtacha **25 soniya** = jami **150 soniya / 2.5 daqiqa audio**)

| Bosqich | Model | Token hajmi | 0% Kesh (Maksimal) | 50% Kesh bilan (Real) |
| :--- | :--- | :--- | :---: | :---: |
| 1. Emotsional Roadmap tuzish | `gemini-3.5-flash-lite` | 2,200 in / 600 out | `$0.00216` | `$0.00216` |
| 2. 6 ta Jonli RAG savol-javob | `gemini-3.5-flash-lite` | 6 × (1,800 in / 250 out) | `$0.00699` | `$0.00350` |
| 3. 2 ta Snap & Ask foto tanish | `gemini-3.5-flash-lite` | 2 × (1,400 in / 50 out) | `$0.00109` | `$0.00109` |
| 4. 6 ta Interest/Signal ajratish | `gemini-3.5-flash-lite` | 6 × (500 in / 120 out) | `$0.00270` | `$0.00270` |
| 5. 6 ta TTS Audio (150 sek = 3,750 audio token) | `gemini-3.8-flash-lite-tts` | 1,200 text in / 3,750 audio out | `$0.02310` | `$0.01155` |
| **JAMI AI API XARAJATI / SAYYOH** | — | — | **`$0.0360` (~450 so'm)** | **`$0.0210` (~263 so'm)** |

> **Xavfsizlik zaxirasi (Stress-buffer):** Agar sayyoh 2 baravar ko'proq (12 ta savol) bersa, 2027-yil TTS narxi oshsa va 10% so'rov `gemini-4-hydrogen` fallback'ga o'tsa ham, 1 sayyohning maksimal AI xarajati **`$0.09 – $0.12`** dan oshmaydi! Biznes-modelda ehtiyot chorasi sifatida **`$0.15 / sayyoh`** deb olingan.

---

## 3. Bosqichma-Bosqich Loyiha Smetasi (3 Ta Davr)

### SMETA A: 0-Bosqich — Xakaton va MVP Ishga Tushirish (Hozirgi 1 oy)

| # | Xarajat moddasi | Miqdor | Birlik narxi | Jami (USD) | Jami (UZS) |
| :---: | :--- | :---: | :---: | :---: | :---: |
| 1 | AWS EC2 Ubuntu `t3.small` + 30GB EBS `gp3` + Public IPv4 | 1 oy | `$21.50` | `$21.50` | `268,750` |
| 2 | `.uz` domen (`smartguide.uz`, 1 yil) | 1 yil | `$2.80` | `$2.80` | `35,000` |
| 3 | HTTPS SSL (Let's Encrypt) + PostgreSQL + PM2 | — | `$0.00` | `$0.00` | `0` |
| 4 | Gemini API test va Demo Day zaxirasi (~500 test sessiya) | 500 sessiya | `$0.036` | `$18.00` | `225,000` |
| 5 | Demo Day uchun A5 laminatsiyalangan QR kartalar (6 dona) | 6 dona | `$1.50` | `$9.00` | `112,500` |
| | **JAMI 0-BOSQICH (MVP LAUNCH)** | | | **`$51.30`** | **`641,250 so'm`** |

---

### SMETA B: 1-Bosqich — Xiva Ichan-Qal'a 3 Oylik Real Pilot (5 → 15 Obida)

*Maqsad: Ichan-Qal'a ma'muriyati bilan rasmiy pilot o'tkazish, 15 ta asosiy obidaga ob-havoga chidamli QR-lavhalar o'rnatish, 3 oyda 3 000 ta pullik sayyohga xizmat ko'rsatish va Tourist Interest bazasini shakllantirish.*

#### 1. Bir martalik kapital xarajatlar (CAPEX — 1-oy)
| # | Xarajat moddasi | Miqdor | Birlik narxi | Jami (USD) | Jami (UZS) |
| :---: | :--- | :---: | :---: | :---: | :---: |
| 1 | Ko'cha sharoitiga chidamli alyuminiy/kompozit QR lavhalar (15 ta obida) | 15 dona | `$16.00` | `$240.00` | `3,000,000` |
| 2 | Kassa va mehmonxonalar uchun akril UV-bosma QR stol stendlari | 20 dona | `$5.00` | `$100.00` | `1,250,000` |
| 3 | Xiva tarixchilari / muzey ilmiy xodimlari bilan 15 ta obida RAG pasportini tasdiqlatish (gonorar) | 15 obida | `$25.00` | `$375.00` | `4,687,500` |
| 4 | Xivaga pilot o'rnatish va shartnoma safari (2 kishi, poyezd + 2 kun mehmonxona) | 1 safar | `$260.00` | `$260.00` | `3,250,000` |
| 5 | Click / Payme merchant ulash va yuridik (YaTT/MChJ) ro'yxatdan o'tish xarajatlari | 1 paket | `$120.00` | `$120.00` | `1,500,000` |
| | **Jami CAPEX (Bir martalik)** | | | **`$1,095.00`** | **`13,687,500 so'm`** |

#### 2. 3 Oylik Operatsion Xarajatlar (OPEX — 3 oy uchun)
| # | Xarajat moddasi | Oylik | 3 Oy Jami (USD) | 3 Oy Jami (UZS) |
| :---: | :--- | :---: | :---: | :---: |
| 1 | AWS EC2 `t3.medium` (4GB RAM) + 50GB EBS + IPv4 + Snapshot backup | `$43.00` | `$129.00` | `1,612,500` |
| 2 | Gemini API xarajati (3,000 sayyoh × `$0.04` zaxirali tarif) | `$40.00` | `$120.00` | `1,500,000` |
| 3 | Click/Payme ekvayring (2% × `$12,000` tushum) | `$80.00` | `$240.00` | `3,000,000` |
| 4 | Kassa xodimlari motivatsiyasi & promo flayerlar (Xiva vokzali/xostellar) | `$100.00` | `$300.00` | `3,750,000` |
| 5 | Monitoring, backup va kutilmagan xarajatlar zaxirasi (10%) | `$60.00` | `$180.00` | `2,250,000` |
| | **Jami OPEX (3 oy — founder jamoa ulushda ishlaydi)** | **`$323.00`** | **`$969.00`** | **`12,112,500 so'm`** |

#### 3. 3 Oylik Pilot Natijasi va Qoplash Nuqtasi (Break-Even)
- **Pilot Umumiy Byudjeti (CAPEX + 3 oy OPEX):** **`$2,064`** (`25.8 mln so'm`)
- **Pilot Daromadi (3,000 sayyoh × `$4`):** `$12,000` Gross
  - Muzey ulushi (30%): **`$3,600`** *(Muzey $0 tikib $3,600 sof foyda + Data Panel oladi!)*
  - SmartGuide ulushi (70%): **`$8,400`**
- **SmartGuide Sof Foydasi (3 oy yakuni):** `$8,400 - $2,064` = **`+$6,336`** (**ROI: 307%!**)
- **Qoplash nuqtasi (Break-Even):** Bor-yo'g'i **`770 ta` pullik sayyoh** (Xiva mavsumida **~20–25 kun** ichida barcha pilot xarajatlari to'liq qoplanadi!).

---

### SMETA C: 2-Bosqich — 12 Oylik O'zbekiston Bo'ylab Kengayish (10 ta Kompleks: Xiva, Samarqand, Buxoro, Toshkent)

*Maqsad: 10 ta yirik tarixiy kompleks/muzey (~100 ta obida), yiliga 50,000 pullik sayyoh + 10 ta B2B SaaS shartnoma.*

| Kategoriya | Tarkibi | Yillik Xarajat (USD) | Izoh |
| :--- | :--- | :---: | :--- |
| **1. Infratuzilma & AI** | AWS EC2 (`t3.large` + Managed PostgreSQL RDS `db.t4g.small` + S3/CloudFront ~`$145/oy`) + Gemini API (50K sayyoh × `$0.04` = `$2,000`) + domenlar | **`$3,740`** | Yuqori yuklama (Multi-AZ backup) |
| **2. Fizik QR Infratuzilma** | 100 ta obida uchun metall QR lavhalar (`$1,600`) + 100 ta akril kassa/mehmonxona stendlari (`$500`) | **`$2,100`** | 10 ta kompleksni to'liq qamrash |
| **3. Kontent & Mahalliy RAG** | 100 ta obida uchun tarixchilar/muzey ekspertlari tekshiruvi (`$30 × 100`) | **`$3,000`** | 0% gallyutsinatsiya kafolati |
| **4. Jamoa (Core Team, 12 oy)** | 1 Backend/DevOps + 1 Frontend + 1 AI/RAG + 1 B2B Sales/Ops (O'zbekiston startap bosqichi o'rtacha oylik `$800–$1,200` / kishi) | **`$48,000`** | To'liq shtatga o'tish (tushumdan qoplanadi) |
| **5. Sotuv, Safarlar & Ekvayring** | Click/Payme 2% (`$4,000`) + hududiy safarlar/TITF ko'rgazma (`$3,500`) + buxgalteriya/yuridik (`$2,400`) | **`$9,900`** | B2B sotuv va soliq hisobi |
| **6. Zaxira fondi (10%)** | Kutilmagan texnik/operatsion xarajatlar | **`$6,674`** | Xavfsizlik yostiqchasi |
| **JAMI 12 OYLIK SMETA** | | **`$73,414`** | |

#### 12 Oylik Moliyaviy Prognoz (P&L Xulosa)
| Ko'rsatkich | Konservativ (30K sayyoh) | Bazaviy Maqsad (50K sayyoh) | Optimistik (85K sayyoh) |
| :--- | :---: | :---: | :---: |
| Umumiy Chipta Tushumi (`$4/sayyoh`) | `$120,000` | `$200,000` | `$340,000` |
| Muzeylarga To'lanadigan Ulush (30%) | `$36,000` | `$60,000` | `$102,000` |
| SmartGuide Chipta Ulushi (70%) | `$84,000` | `$140,000` | `$238,000` |
| B2B Experience Intelligence SaaS (`10 × $150/oy`) | `$12,000` | `$18,000` | `$30,000` |
| **SmartGuide Jami Sof Tushumi** | **`$96,000`** | **`$158,000`** | **`$268,000`** |
| Jami Yillik Xarajatlar (Smeta C) | `$69,000` | `$73,414` | `$81,500` |
| **Yillik Operatsion Foyda (EBITDA)** | **`+$27,000`** | **`+$84,586`** | **`+$186,500`** |

---

## 4. Xakaton Mukofoti (`50 000 000 so'm ≈ $4,000`) Taqsimot Rejasi

Agar **Tourism Hackathon 2026** 3-trekda 1-o'rin (`50 mln so'm ≈ $4,000`) olinsa, mablag' 100% maqsadli ravishda **Ichan-Qal'a Pilotini** ishga tushirishga sarflanadi:
- **`$1,095` (27%)** — Ichan-Qal'a 15 ta obidasi uchun QR lavhalar, kassa stendlari, tarixchilar ekspertizasi va Xiva safari (Smeta B CAPEX).
- **`$969` (24%)** — 3 oylik AWS server, Gemini API kvotasi, kassa promo va monitoring (Smeta B OPEX).
- **`$1,200` (30%)** — Samarqand (Registon) va Toshkent (Temuriylar muzeyi) 2-pilot obyektlarini tayyorlash.
- **`$736` (19%)** — Yuridik rasmiylashtirish, soliq/ekvayring va zaxira fondi.
