# `@smartguide/dashboard` — B2B Museum Experience Intelligence Paneli

**Port:** `5173`  
**Stek:** React 19, Vite 6, TypeScript, Tailwind CSS v4, Recharts 3, `qrcode`

## Asosiy Modullar (5 Soniyalik Real-Time Polling)
- **KPI & Revenue Share:** Total Tourists, Roadmaps Generated, Total AI Interactions, Top Landmark, Estimated Revenue Share (`$4/sayyoh`, 30% muzey ulushi, `$0.04` real Gemini API xarajati → ~96% marja).
- **Signal vs. Noise Content Matrix:** Sayyohlarni eng ko'p hayratga solgan **TOP Signal** faktlar vs. e'tibor berilmayotgan **Low-Signal Noise** ma'lumotlar (avtomatik filtrlangan).
- **Tourist Impressions & Curiosity Gaps:** Sayyohlar hissiyoti (Awe / Fascinated / Curious / Bored) + muzey arxivida yetishmayotgan savollar ro'yxati.
- **B2B Revenue Simulator:** Muzey direktori uchun kunlik sayyohlar soni bo'yicha oylik/yillik daromad kalkulyatori.
- **Marketing & Partner Promo QR Generator & CSV Export:** Kirish darvozasi, kassa, vokzal, info-kiosk va hamkor mehmonxonalar uchun kuzatiladigan (`?ref=...`) reklama QR-stendlari (`PNG`, `Print All`) va UTF-8 CSV hisobot. *(Eslatma: QR-kod faqat ilovani tanitish/kirish uchun; obidalar ichkarida GPS orqali taklif qilinadi.)*

## Buyruqlar
```bash
npm run dev:dashboard
npm run typecheck --workspace=@smartguide/dashboard
npm run build --workspace=@smartguide/dashboard
```

Batafsil spetsifikatsiya: [API_CONTRACT.md](../../documentation/API_CONTRACT.md) · [BUSINESS_MODEL.md](../../documentation/BUSINESS_MODEL.md)
