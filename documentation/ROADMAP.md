# SmartGuide — keyingi ishlar va demo chegarasi

26-noyabr 2026. Mahsulot egasi aniqlashtirgan geografiya: butun Oʻzbekiston. Xiva — dastlabki AI/hamkor piloti. Eski soatbay reja bajarilgan ish dalili emas; quyidagi navbat uning oʻrnini bosadi.

## Masʼuliyat

| Kim | Vazifa |
| --- | --- |
| Frontend | `apps/tourist`, `apps/dashboard`: kunlik safar, smeta, xarita, shaxsiy topilma, API UI, responsive/a11y |
| Backend | Milliy trip/katalog/contribution API, saqlash, GPS, payment, feedback, auth/moderation va deploy |
| AI/RAG | Mahalliy manba huquqlari, fact/rivoyat ajratish, nationwide foto, tarjimalar, eval va sarf telemetry |
| PM/Speaker | Hamkorlik, narxlash, real intervyular, byudjet takliflari, metrikalar va pitch dalillari |

Frontend ish branchi `feat/uzbekistan-solo-travel`. Shared tiplardagi oʻzgarishlar jamoa bilan kelishiladi. Boshqa odamlarning branchlariga force-push qilinmaydi; hujjatlar shu branchdagi diff sifatida beriladi.

## Frontend topshirigʻi

- [x] Milliy onboarding: shaharlar tartibi, 1–14 kun, byudjet, qiziqishlar, yashash.
- [x] Lokal kunlik reja, xarajat yigʻindisi, zaxira va kamomad.
- [x] Interactive OSM xarita, mahalliy joylar filteri, manbali kartalar.
- [x] Shaxsiy tekshirilmagan joy qoralamasi va localStorage.
- [x] Xiva pilotini alohida saqlash; foto imkoniyatining geografik chegarasini yozish.
- [x] B2B kalkulyatorda 30% muzey, 2% payment, AI va serverni ayirish.
- [x] Promo entry QR va optional pilot linklarini ajratish.
- [ ] Haqiqiy backend bilan milliy safar, moderation va nationwide vision integratsiyasi.

Texnik tekshiruv natijalari commit/PR bilan beriladi. Checkbox foydalanuvchi tadqiqoti yoki production deploy isboti emas.

## Keyingi integratsiya navbati

1. City/place/source modeli va tarjimalarni kelishish. Barcha shaharlarda haqiqiy joylar borligini katalog bilan isbotlash; UI tanlovi bilan adashtirmaslik.
2. Sana, ochilish vaqti, transport jadvali va narx diapazonlarini ulash. Uzoq transferlar va paketli chiptalarni hisoblash; milliy tripni serverga saqlash.
3. Public contribution: moderatsiya, dalil/manba, muallif huquqi, tekshiruv statusi, spam himoyasi. Hozirgi lokal draft bu ishni bajarmaydi.
4. Nationwide recognition: ishonch darajasi, aniqlanmagan javob, manbalar va history/legend ajratish. «0% hallucination» vaʼdasi oʻrniga real eval hisobot.
5. Opt-in GPS va promo attribution; mamlakat bo‘ylab geo tavsiya frontendning hozirgi tayyor funksiyasi emas.
6. Feedback API va B2B agregat ko‘rsatkichlarni haqiqiy namunadan ulash. Seed/demo qiymatlarini yashirmaslik.
7. Ixtiyoriy $4 pilot paketi va hamkor payout shartnomasi; real payment/refund oqimi. Bepul sinov va pullik sotuv maqsadini ajratish.

## Demo ssenariysi — 3 daqiqa

- 0:00–0:30: mustaqil sayohatchining kun va byudjet rejalash muammosi; faqat o‘tkazilgan tadqiqot bo‘lsa uning raqamlari.
- 0:30–1:20: 4 kun, shahar va byudjet → kunlar, xarajatlar, qoldiq/kamomad. Narxlar smeta ekanini ko‘rsatish.
- 1:20–2:00: xaritada mahalliy joy, manba, rivoyat chegarasi va shaxsiy topilma. Umumiy eʼlon hali yo‘qligini yashirmaslik.
- 2:00–2:30: ulangan Xiva AI-piloti. Real AI/DB yo‘q bo‘lsa fallback/demo deb aytish; tekshirilmagan feedback saqlandi deb ko‘rsatmaslik.
- 2:30–3:00: B2B panel va $4 / 70:30 monetizatsiya farazi. Uch oylik $1,964 cash ssenariysi, 599 sotuv break-even — shartli hisob, natija emas.

Tariflar va to‘liq formulalar [SMETA_BUDGET.md](SMETA_BUDGET.md) da. «20 kunda kafolatlangan qoplanish», «96% sof foyda», intervyu placeholderlari yoki tayyor boʻlmagan GPSni jonli imkoniyat deb pitch qilmaslik kerak.
