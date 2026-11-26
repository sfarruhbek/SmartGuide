# SmartGuide — Moliyaviy Smeta va Haqiqiy Xarajatlar Modeli (2026 Real Narxlar)

> **Mahsulot ko'lami:** SmartGuide — **O'zbekistonning istalgan shahri (16+ shahar) bo'ylab to'liq kunlik sayohat Roadmap'i + AI-Gid** platformasi (faqat Ichan-Qal'a emas!). Quyidagi **Smeta B** — 1-bosqich chuqurlashtirilgan maydon piloti (Xiva), **Smeta C** esa barcha asosiy shaharlar (Toshkent, Samarqand, Buxoro, Xiva va b.) bo'ylab 12 oylik kengayish smetasi.  
> **Hisob-kitob sanasi:** 2026-yil noyabr · **Valyuta kursi bazasi:** `1 USD ≈ 12,500 UZS`  
> **Biznes-model bazasi:** Oylik obunasiz **Bir Martalik Trip Pass** (`$4.99` 48s **istalgan 1 shahar** City Pass · `$12.99` 10-kun **butun O'zbekiston** Silk Road Pass · Blended ARPU `$7.00`) + Mahalliy SME 10% komissiya + Kirish/vokzal/mehmonxonalarda **reklama QR/Kiosk**.  
> **AI Stack eslatmasi:** Joriy jonli runtime matn/planner/foto uchun **Groq** (`openai/gpt-oss-120b`, `qwen/qwen3.8-27b`), ovoz uchun **Gemini 3.8 TTS** ishlatadi. Quyidagi jadvalda konservativ zaxira (yuqori chegara) sifatida rasmiy 2026 Gemini tariflari olingan — Groq bilan haqiqiy matn xarajati bundan ham pastroq bo'ladi.

---

## 1. Rasmiy Manbalardan Olingan Real Tariflar Bazasi (2026)

| Xarajat elementi | Rasmiy tarif (2026) | Manba / Provayder |
| :--- | :--- | :--- |
| **`gemini-3.5-flash-lite` (Input — text/image)** | **`$0.30` / 1 mln token** (Free Tier mavjud) | Google AI Studio (`ai.google.dev/gemini-api/docs/pricing`) |
| **`gemini-3.5-flash-lite` (Output — text)** | **`$2.50` / 1 mln token** | Google AI Studio (`ai.google.dev`) |
| **`gemini-4-hydrogen` (Fallback Input / Output)** | **`$1.50` / `$7.50`** per 1M token (Cache read: `$0.075/1M`) | Google AI Studio (`ai.google.dev`) |
| **`gemini-3.8-flash-lite-tts` (Text Input)** | **`$0.50` / 1M token** (2026-yil oxirigacha; 2027-yildan `$1.00/1M`) | Google AI Studio (`ai.google.dev`) |
| **`gemini-3.8-flash-lite-tts` (Audio Output)** | **`$6.00` / 1M token** (`25 token = 1 soniya` → **1 daqiqa audio = `$0.009`**) | Google AI Studio (`ai.google.dev`) |
| **AWS EC2 Ubuntu `t3.small` (2 vCPU, 2 GiB RAM)** | **`$15.18 – $15.77 / oy`** (730 soat On-Demand, `us-east-1`) | Amazon Web Services EC2 Pricing |
| **AWS EC2 Ubuntu `t3.medium` (2 vCPU, 4 GiB RAM)** | **`$30.37 / oy`** (730 soat On-Demand, `us-east-1`) | Amazon Web Services EC2 Pricing |
| **AWS EBS `gp3` SSD xotira** | **`$0.08 / GB-oy`** (`30 GB = $2.40/oy`, `50 GB = $4.00/oy`) | Amazon Web Services EBS Pricing |
| **AWS Public IPv4 manzil** | **`$3.65 / oy`** (`$0.005/soat`) | Amazon Web Services VPC Pricing |
| **`.uz` domen (`smartguide.uz`)** | **`33,000 – 35,000 UZS / yil`** (`~$2.80 / yil`) | UZINFOCOM (`cctld.uz`) |
| **HTTPS SSL Sertifikat (Let's Encrypt)** | **`$0 / yil`** (Certbot + Nginx) | Let's Encrypt |
| **Click / Payme / Visa onlayn ekvayring** | **`1.5% – 2.0%`** (mahalliy) · **`~2.9% – 3.5%`** (xalqaro Visa/MC) | Click Business / Payme / Stripe-Octobank |
| **Akril UV-bosma reklama QR stol stendi (100×150 mm)** | **`45,000 – 80,000 UZS / dona`** (`~$3.60 – $6.40`) | Toshkent reklama ishlab chiqarish bozori |
| **Roll-Up reklama banneri (85×200 cm, alyuminiy + bosma)** | **`250,000 – 450,000 UZS / dona`** (`~$20 – $36`; premium `~$45`) | Toshkent reklama-poligrafiya bozori |
| **Interaktiv pol reklama info-kioski (32"–43" sensor ekran)** | **`$800 – $1,800 / dona`** (O'zbekiston bozori) | Toshkent info-kiosk yetkazib beruvchilari (`utouch.uz`, `barakatexnika.uz`) |

---

## 2. Bitta Sayyohga Haqiqiy AI API Xarajati (Exact Cost-to-Serve)

**City Pass (`$4.99`, 48 soat — istalgan 1 shahar: Xiva, Samarqand, Buxoro yoki Toshkent)** bo'yicha o'rtacha 1 sayyoh sessiyasi:
- **1 ta** Shahar bo'ylab to'liq kunlik Roadmap (`Groq LLM` / konservativ tarif bazasida `gemini-3.5-flash-lite`)
- **6 ta** Jonli RAG savol-javob + Interest/Sentiment Extraction (`Groq LLM` / konservativ bazada `gemini-3.5-flash-lite`)
- **2 ta** Snap & Ask foto tanish (`Groq Vision` / konservativ bazada `gemini-3.5-flash-lite`)
- **6 ta** Ovozli javob (`gemini-3.8-flash-lite-tts`, har biri ~25 soniya = **150 soniya / 2.5 daqiqa WAV audio**)

| Bosqich | Model | Token hajmi | 0% Kesh (Maksimal) | 50% Kesh bilan (Real) |
| :--- | :--- | :--- | :---: | :---: |
| 1. Emotsional Roadmap tuzish | `gemini-3.5-flash-lite` | 2,200 in / 600 out | `$0.00216` | `$0.00216` |
| 2. 6 ta Jonli RAG savol + Signal tahlil | `gemini-3.5-flash-lite` | 6 × (1,900 in / 320 out) | `$0.00822` | `$0.00411` |
| 3. 2 ta Snap & Ask foto tanish | `gemini-3.5-flash-lite` | 2 × (1,400 in / 50 out) | `$0.00109` | `$0.00109` |
| 4. 6 ta TTS Audio (150 sek = 3,750 audio token) | `gemini-3.8-flash-lite-tts` | 1,200 text in / 3,750 audio out | `$0.02310` | `$0.01155` |
| **JAMI AI XARAJATI (48s City Pass)** | — | — | **`$0.0346` (~430 so'm)** | **`$0.0189` (~236 so'm)** |
| **JAMI AI XARAJATI (10-kun Silk Road Pass, 3 shahar)** | — | — | **`~$0.105` (~1,310 so'm)** | **`~$0.058` (~725 so'm)** |

> **Blended AI xarajati:** 65% City Pass + 35% Silk Road Pass → o'rtacha **`$0.07 / pullik sayyoh`** (hatto bepul freemium foydalanuvchilarning 2 ta bepul savoli `$0.008` ni qo'shganda ham jami AI xarajat `$0.10` dan oshmaydi!).

---

## 3. Bosqichma-Bosqich Loyiha Smetasi (3 Ta Davr)

### SMETA A: 0-Bosqich — Xakaton va MVP Ishga Tushirish (1-oy)

| # | Xarajat moddasi | Miqdor | Birlik narxi | Jami (USD) | Jami (UZS) |
| :---: | :--- | :---: | :---: | :---: | :---: |
| 1 | AWS EC2 Ubuntu `t3.small` + 30GB EBS `gp3` + Public IPv4 | 1 oy | `$21.50` | `$21.50` | `268,750` |
| 2 | `.uz` domen (`smartguide.uz`, 1 yil) | 1 yil | `$2.80` | `$2.80` | `35,000` |
| 3 | HTTPS SSL (Let's Encrypt) + PostgreSQL + PM2 | — | `$0.00` | `$0.00` | `0` |
| 4 | Gemini API test va Demo Day zaxirasi (~500 sessiya) | 500 sessiya | `$0.035` | `$17.50` | `218,750` |
| 5 | Demo Day uchun stol reklama QR-stendi (2 dona) | 2 dona | `$5.00` | `$10.00` | `125,000` |
| | **JAMI 0-BOSQICH (MVP LAUNCH)** | | | **`$51.80`** | **`647,500 so'm`** |

---

### SMETA B: 1-Bosqich — Xiva Ichan-Qal'a 3 Oylik Real Pilot (GPS 15 Obida + Kirish Reklama Nuqtalari)

*Maqsad: Har bir obida devoriga QR qo'ymasdan (ichkarida GPS avtomatik ishlaydi!), chipta kassasi yonida, vokzalda va 20 ta mehmonxonada reklama stendlari orqali 3 oyda 2 000 ta pullik Trip Pass sotish (blended `$6.50`: Xiva City Pass `$4.99` + Silk Road Pass `$12.99`) va 10 ta mahalliy restoran/hunarmandni ulash.*

#### 1. Bir martalik kapital xarajatlar (CAPEX — 1-oy)
| # | Xarajat moddasi | Miqdor | Birlik narxi | Jami (USD) | Jami (UZS) |
| :---: | :--- | :---: | :---: | :---: | :---: |
| 1 | Chipta kassasi, Ota-Darvoza va Xiva vokzali uchun Roll-Up reklama bannerlari (85×200 cm) | 4 dona | `$35.00` | `$140.00` | `1,750,000` |
| 2 | Hamkor mehmonxonalar, kafe va kassa stollari uchun akril UV-bosma reklama QR stendlari | 25 dona | `$5.00` | `$125.00` | `1,562,500` |
| 3 | Xiva tarixchilari bilan 15 ta obida RAG pasporti + aniq GPS nuqtalarini tasdiqlatish | 15 obida | `$25.00` | `$375.00` | `4,687,500` |
| 4 | Xivaga pilot o'rnatish va mehmonxona/hunarmand shartnomalari safari (2 kishi, 2 kun) | 1 safar | `$260.00` | `$260.00` | `3,250,000` |
| 5 | Visa/Click/Payme to'lov integratsiyasi va yuridik (YaTT/MChJ) rasmiylashtirish | 1 paket | `$120.00` | `$120.00` | `1,500,000` |
| | **Jami CAPEX (Bir martalik — obida lavhalarisiz yengil start!)** | | | **`$1,020.00`** | **`12,750,000 so'm`** |

#### 2. 3 Oylik Operatsion Xarajatlar (OPEX — 3 oy uchun)
| # | Xarajat moddasi | Oylik | 3 Oy Jami (USD) | 3 Oy Jami (UZS) |
| :---: | :--- | :---: | :---: | :---: |
| 1 | AWS EC2 `t3.medium` (4GB RAM) + 50GB EBS + IPv4 + Backup | `$43.00` | `$129.00` | `1,612,500` |
| 2 | Gemini API xarajati (2,000 pullik + 6,000 bepul freemium sinov = `$190`) | `$63.33` | `$190.00` | `2,375,000` |
| 3 | Onlayn ekvayring (3% × `$13,000` Trip Pass sotuv) | `$130.00` | `$390.00` | `4,875,000` |
| 4 | Mehmonxona/hamkor affiliate ulushi (40% sotuvdan 15% komissiya) | `$260.00` | `$780.00` | `9,750,000` |
| 5 | Google Maps / Travel SEO & promo flayerlar + zaxira (10%) | `$120.00` | `$360.00` | `4,500,000` |
| | **Jami OPEX (3 oy — founder jamoa ulushda ishlaydi)** | **`$616.33`** | **`$1,849.00`** | **`23,112,500 so'm`** |

#### 3. 3 Oylik Pilot Natijasi va Qoplash Nuqtasi (Break-Even)
- **Pilot Umumiy Byudjeti (CAPEX + 3 oy OPEX):** **`$2,869`** (`35.86 mln so'm`)
- **Pilot Daromadi (3 oy):**
  - 2,000 ta pullik Trip Pass × `$6.50` blended = **`$13,000`**
  - Mahalliy restoran/hunarmand 10% affiliate komissiyasi = **`$1,400`**
  - **Jami Pilot Tushumi:** **`$14,400`**
- **SmartGuide Sof Foydasi (3 oy yakuni):** `$14,400 - $2,869` = **`+$11,531`** (**ROI: 402%!**)
- **Qoplash nuqtasi (Break-Even):** Bor-yo'g'i **`195 ta` pullik Trip Pass** (CAPEX'ni qoplash uchun ~15 kun, butun 3 oylik xarajat uchun ~490 sayyoh!).

---

### SMETA C: 2-Bosqich — 12 Oylik O'zbekiston Kengayishi (Xiva, Samarqand, Buxoro, Toshkent)

*Maqsad: 4 ta asosiy turistik shahar (~100 ta GPS obida), 25,000 pullik Trip Pass (`$7.00` blended), 50 ta mehmonxona/restoran hamkori va 3 ta flagman reklama info-kioski.*

| Kategoriya | Tarkibi | Yillik Xarajat (USD) | Izoh |
| :--- | :--- | :---: | :--- |
| **1. Infratuzilma & AI** | AWS EC2 `t3.large` + Managed PostgreSQL RDS + S3/CloudFront (`$145/oy = $1,740`) + Gemini API (25K pullik + 75K freemium = `$2,400`) + domenlar | **`$4,200`** | Yuqori yuklama va 99.9% uptime |
| **2. Reklama Info-Kiosklar & Promo Stendlar** | 3 ta flagman 32" reklama info-kioski (Ichan-Qal'a kirish, Registon kirish, Urganch/Samarqand vokzali: `3 × $1,200 = $3,600`) + 20 ta Roll-Up (`$700`) + 150 ta mehmonxona akril QR stendi (`$750`) | **`$5,050`** | Faqat reklama/tanitish — obida devorlariga QR yo'q! |
| **3. Kontent & GPS Xaritalash** | 100 ta obida RAG pasporti + tarixchilar ekspertizasi (`$30 × 100`) | **`$3,000`** | 0% gallyutsinatsiya kafolati |
| **4. Jamoa (Core Team, 12 oy)** | 1 Backend/DevOps + 1 Frontend + 1 AI/RAG + 1 Partner Sales/Ops (4 kishi × `$1,000/oy`) | **`$48,000`** | To'liq shtatga o'tish |
| **5. Ekvayring, Affiliate & Marketing** | To'lov komissiyasi 3% (`$5,250`) + Mehmonxona QR 15% affiliate (`$10,500`) + Travel SEO/TITF ko'rgazma (`$6,000`) + yuridik/buxgalteriya (`$2,400`) | **`$24,150`** | Faqat natijaga bog'liq o'zgaruvchan sotuv xarajati |
| **6. Zaxira fondi (10%)** | Kutilmagan xarajatlar | **`$8,440`** | Xavfsizlik zaxirasi |
| **JAMI 12 OYLIK SMETA** | | **`$92,840`** | |

#### 12 Oylik Moliyaviy Prognoz (P&L Xulosa)
| Ko'rsatkich | Konservativ (15K sayyoh) | Bazaviy Maqsad (25K sayyoh) | Optimistik (45K sayyoh) |
| :--- | :---: | :---: | :---: |
| Direct B2C Trip Passes (`$7.00` blended) | `$105,000` | `$175,000` | `$315,000` |
| Mahalliy SME Referral Komissiyasi (`10%`) | `$15,000` | `$25,000` | `$45,000` |
| B2B Bulk Pass & Loyihaviy Data Insights | `$12,000` | `$20,000` | `$35,000` |
| **Jami Yillik Tushum** | **`$132,000`** | **`$220,000`** | **`$395,000`** |
| Jami Yillik Xarajatlar (Smeta C) | `$84,000` | `$92,840` | `$112,000` |
| **Yillik Operatsion Foyda (EBITDA)** | **`+$48,000`** | **`+$127,160`** | **`+$283,000`** |

---

## 4. Xakaton Mukofoti (`50 000 000 so'm ≈ $4,000`) Taqsimot Rejasi

1-o'rin (`50 mln so'm ≈ $4,000`) mablag'i to'g'ridan-to'g'ri **Xiva Pilotini** va **1-Flagman Info-Kioskni** ishga tushirishga yo'naltiriladi:
- **`$1,200` (30%)** — 1 ta 32" interaktiv reklama info-kioski (Ichan-Qal'a Ota-Darvoza chipta kassasi yoniga o'rnatish).
- **`$1,020` (25.5%)** — 4 ta Roll-Up banner, 25 ta mehmonxona akril QR stendi, 15 obida RAG/GPS ekspertizasi va Xiva safari (Smeta B CAPEX).
- **`$1,080` (27%)** — 6 oylik AWS server, Gemini API byudjeti va to'lov integratsiyasi.
- **`$700` (17.5%)** — Samarqand va Buxoro RAG bazasini tayyorlash va zaxira fondi.
