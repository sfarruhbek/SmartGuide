# SmartGuide — moliyaviy smeta va ssenariylar

> Hisob sanasi: 26-noyabr 2026. USD. UZS ko‘rinishi uchun **1 USD = 12,500 UZS** — faqat rejalashtirish kursi, joriy MB kursi deb tasdiqlanmagan.
> Tarif ≠ haqiqiy sarf. API hajmi, cache hit, konversiya, shartnoma va yetkazib beruvchi narxlari pilotda tekshiriladi. Sayyohning safar byudjeti ushbu platforma xarajatlaridan alohida.

## 1. Tarif manbalari va taxminlar

Google rasmiy [pricing sahifasi](https://ai.google.dev/gemini-api/docs/pricing) 26-noyabr 2026 tekshirildi. Standard, per 1M token:

| Model | Input | Output | Eslatma |
| --- | ---: | ---: | --- |
| gemini-3.5-flash-lite | $0.30 | $2.50 | Output thinking tokenlarni ham qamraydi |
| gemini-4-hydrogen | $1.50 | $7.50 | Cache input $0.075 |
| gemini-3.8-flash-lite-tts | $0.50 | $6 audio | 2026-12-31 gacha; 2027-01-01 dan $1 / $12 |

TTS 25 audio token/soniya: 60 soniya output $0.009, matn input qoʻshimcha. 2027 yilda **audio output ham ikki baravar** oshadi, faqat input emas. Tariflar trafik, vositalar va rejimga bogʻliq; bu jadval qoʻshimcha search/maps grounding, tokenlashning real hajmi va qayta urinishlarni hisoblamaydi.

| Boshqa xarajat | Reja bazasi | Tasdiqlash holati |
| --- | ---: | --- |
| Kichik server + disk + IPv4 | $21.50/oy | Yetkazib beruvchi konfiguratsiyasi bo‘yicha quote kerak |
| Pilot server + disk + backup | $43/oy | AWS mintaqa/konfiguratsiya bilan tekshiriladi |
| IPv4 | $0.005/soat = $3.65/730 soat | [AWS VPC](https://aws.amazon.com/vpc/pricing/) |
| EBS / EC2 | Pilot konfiguratsiyasiga kiritilgan | [EC2](https://aws.amazon.com/ec2/pricing/on-demand/), [EBS](https://aws.amazon.com/ebs/pricing/); trafik, soliqlar va backup qoʻshimcha boʻlishi mumkin |
| Domen | $2.80/yil | Registratordan amaldagi quote kerak |
| Ekvayring | Gross tushumning 2% | Merchant shartnomasi kerak; Click/Payme/Visa bir xil tarif deb olinmaydi |
| Akril QR stendi / Roll-Up | $5 / $35 | Bozor smetasi, yozma taklif olinmagan |
| Kiosk | $1,200 | Keyingi bosqich xarid farazi |

QR/kiosk — promo kirish kanali. Har obidaga lavha va kiosk xaridi hozirgi frontendning sharti emas. TLS sertifikat bepul boʻlishi mumkin; server va xizmat ko‘rsatish nol xarajat emas.

## 2. Bitta AI sessiya: hisoblanadigan yuklama

Bu bir Xiva pilot sessiyasi uchun faraz; 4 kunlik, ko‘p shaharli safarning haqiqiy o‘rtacha sarfi emas.

| Amal | Token/yuklama | Cache yoʻq | 50% toʻliq javob/audio cache ssenariysi |
| --- | --- | ---: | ---: |
| 1 roadmap | 2,200 in / 600 out | $0.002160 | $0.002160 |
| 6 RAG savol | Har biri 1,800 in / 250 out | $0.006990 | $0.003495 |
| 2 foto | Har biri 1,400 in / 50 out | $0.001090 | $0.001090 |
| 6 signal tahlili | Har biri 500 in / 120 out | $0.002700 | $0.002700 |
| 6 audio, jami 150 soniya | 1,200 text in / 3,750 audio out | $0.023100 | $0.011550 |
| **Jami** | | **$0.036040** | **$0.020995** |

Cache ustuni provider prompt cache tarifi emas: RAG/TTS soʻrovlarining yarmiga qayta API chaqiruvsiz tayyor javob qaytarish farazi. Hit rate hali oʻlchanmagan. Shaxsiy javob va audio har doim qayta ishlatilmaydi.

**Operatsion reja $0.04/pullik sessiya**, stress parametri $0.15. Hech biri maksimal limit kafolati emas. Backend kvota, retry va fallback chegaralarini o‘rnatishi kerak. 2027 TTS, ko‘p kunlik foydalanish, ko‘proq savol va grounding xarajatni oshiradi. Milliy safar iqtisodiyoti alohida telemetriya bilan o‘lchanadi.

## 3. Smeta A — MVP uchun bir oylik pul xarajati

| Modda | Formula | USD |
| --- | --- | ---: |
| Server | 1 × $21.50 | 21.50 |
| Domen | 1 yil | 2.80 |
| API test | 500 × $0.03604 | 18.02 |
| Demo promo kartalar | 6 × $1.50 | 9.00 |
| **Jami** | | **51.32** |

UZS: 641,500. Founder mehnati, internet va qurilmalar bu cash smetaga kiritilmagan; ular iqtisodiy jihatdan bepul emas.

## 4. Smeta B — Xiva, uch oylik pullik pilot ssenariysi

Maqsad: 15 ta kontent joyini tekshirish, 3,000 pullik sessiya. Hozirgi AI katalogi 5 obida; 15 ta — kelajak maqsadi. GPS avtomatik tavsiya va payment integratsiyasi tayyor deb olinmaydi. Bepul validatsiya davri bu sotuvlar ichida emas.

### Bir martalik xarajat (CAPEX / ishga tushirish)

| Modda | Formula | USD |
| --- | --- | ---: |
| Roll-Up | 4 × $35 | 140 |
| Promo QR stendi | 20 × $5 | 100 |
| Lokal ekspert + kontent/GPS tekshiruvi | 15 × $25 | 375 |
| Safar | 1 | 260 |
| Merchant/yuridik boshlangʻich ishlar | 1 paket | 120 |
| **Jami** | | **995** |

### Uch oylik OPEX

| Modda | Formula | USD |
| --- | --- | ---: |
| Server | 3 × $43 | 129 |
| AI | 3,000 × $0.04 | 120 |
| Ekvayring | 2% × $12,000 | 240 |
| Promo va operatsiya | 3 × $100 | 300 |
| Yaxlitlangan zaxira | $60 × 3 | 180 |
| **Jami** | | **969** |

Cash byudjet: **$1,964 = 24,550,000 UZS**. Unda muzey ulushi alohida tushumdan ushlab qolinadi: gross $12,000 − muzey $3,600 − cash byudjet $1,964 = **$6,436 rejalashtirilgan qoldiq**, ish haqi, soliqlar, refund va affiliate dan oldin. Buni sof foyda deb atamaymiz. Zaxiraning sarflanmagan qismi real xarajat bo‘lmaydi.

**Break-even:** doimiy xarajat = $995 + $129 + $300 + $180 = $1,604. Har sotuv hissasi = $4 × (1 − 30% − 2%) − $0.04 = $2.68. **ceil(1,604 / 2.68) = 599 sessiya**. Ekvayring va AI ni yana umumiy smetadan ayrish ikki marta hisoblash boʻladi. Kunlar soni sotuv tezligisiz aniqlanmaydi.

Stress AI $0.15 boʻlsa: cash byudjet $2,294; qoldiq $6,106; break-even ceil(1,604 / 2.57) = **625**. Agar sotuvlarning hammasiga 10% affiliate qoʻshilsa, bazaviy hissa $2.28, break-even **704**; shartnoma yoʻqligi sabab asosiy byudjetga kiritilmagan.

Bepul sessiya: tushum $0, muzey ulushi $0; AI va infratuzilma xarajati bor. Uni pullik prognoz bilan aralashtirmaslik kerak.

## 5. Smeta C — 12 oy / 10 hamkor ssenariysi

| Kategoriya | Tarkib | USD |
| --- | --- | ---: |
| Infra va AI | Infra/domen uchun $145 × 12 + 50K × $0.04 | 3,740 |
| Promo/kiosk | 2 × $1,200 + 20 × $35 + 100 × $5 | 3,600 |
| Kontent | 100 joy × $30 | 3,000 |
| Jamoa | 4 kishi × $1,000 × 12 | 48,000 |
| Sotuv/huquqiy/ekvayring | $3,500 + $2,400 + 2% × $200K | 9,900 |
| Zaxira | Yuqoridagi $68,240 ning 10% | 6,824 |
| **Jami** | | **75,064** |

Infra $145 — reja envelope; Multi-AZ RDS yoki toʻliq managed stack shu summaga sigʻadi degan quote yoʻq. Jamoa qatori ish beruvchi soliqlarini batafsil hisoblamaydi. Alohida quote va mehnat xarajatlari tekshiriladi.

Ssenariylarda 10 Starter hamkor butun 12 oy faol: **10 × $149 × 12 = $17,880**. Bosqichma-bosqich ulansa kamayadi. Doimiy envelope $69,064; oʻzgaruvchan AI + fee har sotuvga $0.12; zaxira ssenariylar orasida oʻzgartirilmagan.

| Koʻrsatkich | 30K sessiya | 50K sessiya | 85K sessiya |
| --- | ---: | ---: | ---: |
| Chipta gross | 120,000 | 200,000 | 340,000 |
| Muzey 30% | 36,000 | 60,000 | 102,000 |
| Platforma ulushi | 84,000 | 140,000 | 238,000 |
| SaaS | 17,880 | 17,880 | 17,880 |
| Jami platforma tushumi, xarajatlardan oldin | 101,880 | 157,880 | 255,880 |
| Cash smeta: 69,064 + N × 0.12 | 72,664 | 75,064 | 79,264 |
| **Rejalashtirilgan cash qoldiq** | **29,216** | **82,816** | **176,616** |

Bu EBITDA emas: cash xarajatlar ichida kiosk va boshlangʻich kontent bor. Soliq, amortizatsiya, payment refund, affiliate, bepul foydalanuvchilar va koʻp kunlik foydalanish keyingi moliyaviy modelda alohida hisoblanadi. SaaS dan ekvayring kerak bo‘lsa qo‘shimcha.

## 6. $4,000 grant ssenariysi

Mukofot olingani tasdiqlanmagan. Agar shu summa ajratilsa:

- $995 — pilotni ishga tushirish.
- $969 — uch oylik pilot OPEX.
- $1,200 — keyingi kontent/pilot tayyorlash, kiosk xaridi avtomatik emas.
- $836 — qoʻshimcha kutilmagan xarajatlar va keyingi bosqich; merchant/yuridik $120 yuqorida hisoblangan, takror yozilmaydi.

Jami $4,000. Grant daromad modelining ishlash isboti emas.
