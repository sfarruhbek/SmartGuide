# SmartGuide — frontend mahsulot va integratsiya holati

Yangilangan: 26-noyabr 2026. Ish branchi: `feat/uzbekistan-solo-travel`.

## Mahsulot qarori

Asosiy foydalanuvchi — yolgʻiz/mustaqil sayohatchi. Geografiya — butun Oʻzbekiston, faqat Xiva emas. U mamlakatga kelish xarajatidan tashqari jami byudjetini, kunlarini, shaharlar tartibini va qiziqishlarini kiritadi. Natijada vaqt va xarajatlari yozilgan kunlik reja oladi. AI javobini audio shaklda tinglash ixtiyoriy; inson gid bilan birga yurish talab qilinmaydi.

## Shu branchdagi frontend

| Oqim | Amalga oshirilgan holat | Chegara |
| --- | --- | --- |
| `/` rejalashtirish | 16 shahar + boshqa shahar matni, 1–14 kun, UZS jami byudjet, 5 qiziqish, yashash toggle | Bir kishi uchun; boshlanish sanasi / jonli jadval / bron yoʻq |
| Kunlik reja | Nonushta, obidalar, ovqat, mahalliy transport, ixtiyoriy n−1 kecha, 10% zaxira, kamomad ko‘rsatish | Lokal deterministik planner; AI generatsiya deb ko‘rsatilmaydi |
| Koʻp shahar | Tanlash tartibi saqlanadi; yangi shaharga butun transfer kuni ajratiladi | Yoʻl narxi distance asosidagi allowance, transport qatnovi emas; uzoq yoʻl yana vaqt talab qilishi mumkin |
| Xarita | OpenStreetMap tile, pan/zoom, marker, klaviatura uchun tugmalar, shahar/mahalliy filter, matnli roʻyxat | Internet kerak; marshrut chizigʻi yoki navigatsiya hisoblanmaydi |
| Kontent | 13 joy / Buxoro, Samarqand, Toshkent, Xiva; 3 tilda hikoya + manba havolasi | Boshqa 3 til UI tayyor, hikoya tarjimasi bo‘lmasa English deb belgilanadi; boshqa shaharlarda katalog hali toʻldiriladi |
| Joy taklif qilish | Nom, shahar, koordinata, hikoya, manba, tarixiy daʼvo / rivoyat / kuzatuv; lokal saqlash va oʻchirish | Shaxsiy tekshirilmagan qoralama. Umumiy eʼlon yoki moderatorga joʻnatish yoʻq |
| Foto | Existing `/api/guide/ask` bilan Xiva pilotiga ulangan | Mamlakat boʻylab recognition yoʻq; aniqlanmagan natija tanilgan deb koʻrsatilmaydi |
| `/khiva` | Oldingi 1/2/4 soatlik 5 obida yurish builderi saqlangan | Bu milliy ko‘p kunlik safardan alohida legacy pilot |
| `/l/[slug]` | Matn/foto/speech input, audio, transkript, retry, progress va feedback UI | API/DB/model konfiguratsiyasiga bogʻliq. Feedback endpoint hozir backendda yoʻq |
| Dashboard | Existing analitika + optional insight, CSV fallback, promo QR, hisoblagich | Yangi signal maʼlumoti yo‘q bo‘lsa empty state; kalkulyator haqiqiy savdo emas |

16 shahar variantining mavjudligi 16 shaharda tekshirilgan kontent borligini bildirmaydi. Katalog tugaganda «erkin vaqt» aniq ko‘rsatiladi; soxta restoran/ziyoratgoh yoki uydirma mahalliy hikoya qoʻshilmaydi. Chipta qiymatlari qoʻlda berilgan smeta farazlari, amaldagi kassadan tekshirilgan narxlar emas. Bilet paketlari bir-birini qoplashi mumkin; foydalanuvchi tekshirishi kerak.

## Saqlash va tillar

`smartguide_trip_v1` — validatsiya qilingan inputdan qayta hisoblanadigan lokal reja. `smartguide_discoveries_v1` — 50 tagacha shaxsiy qoralama. Eski Xiva yurishi `smartguide_roadmap_v1` bilan alohida qoladi. LocalStorage ishlamasa UI saqlangan deb aytmaydi. Bulut sinxronizatsiya yo‘q.

UI: EN / RU / UZ / ES / JA / KO. URL `?lang=` va saqlangan til mavjud. Milliy katalog manbalari `apps/tourist/src/lib/places.ts` ichida. Foto litsenziyalari `/credits.html` va `public/cities/credits.json` da. Tile attribution © OpenStreetMap contributors; faqat joriy ko‘rinadigan tile lar olinadi, offline bulk download yo‘q.

## Frontend egaligi

Frontend dasturchi: `apps/tourist/**`, `apps/dashboard/**` va shu vazifa uchun hujjatlar. Backend runtime, DB sxemasi, shared kontraktlar, root dependency va lockfile bu branchda oʻzgartirilmagan. `packages/shared/README.md` dagi tavsif mavjud tiplarga moslangan, runtime emas.

Backend bilan kelishiladigan keyingi ishlar: milliy safar generation/storage, city/place katalogi, jonli tarif/jadval manbalari, source provenance, foydalanuvchi contribution moderation, nationwide vision, ixtiyoriy GPS, attribution va payment. Ular tayyor endpoint sifatida chaqirilmaydi. Eski pilot roadmap/feedback adapterlari HTTP xatoda halol fallback/retry ko‘rsatadi.

API holati: [API_CONTRACT.md](API_CONTRACT.md). Biznes farazlari: [BUSINESS_MODEL.md](BUSINESS_MODEL.md). Platforma xarajatlari: [SMETA_BUDGET.md](SMETA_BUDGET.md).

## Ushbu o‘zgarishning texnik tekshiruvi

26-noyabr 2026: monorepo `npm run typecheck` va `npm run build` muvaffaqiyatli o‘tdi. Node test runner bilan 6 test: planner uchun 112 kun/byudjet/yashash kombinatsiyasi, summa va vaqt ketma-ketligi, transfer/yashash, saqlangan input validatsiyasi, xarita proyeksiyasi va B2B iqtisodiyotining bazaviy/stress/nol sotuv holatlari.

Brauzerda 390×844 va 1280×800 ko‘rinishlari, kamomad, refreshdan keyingi trip tiklash, shaxsiy topilma yaratish/oʻchirish, OSM tile yuklanishi, 6 til UI, $7,997 kalkulyator natijasi va promo/pilot QR kartalari tekshirildi. Lokal 4000 API — QA mock; bu real PostgreSQL/Gemini, tarixiy audit, toʻlov yoki public moderation integratsiyasi sinovi emas.
