# `@smartguide/dashboard` — B2B Museum Experience Intelligence Paneli

**Port:** `5173`  
**Stek:** React 19, Vite 6, TypeScript, Tailwind CSS v4, Recharts 3, `qrcode`

## Asosiy Modullar (5 Soniyalik Real-Time Polling)
- **KPI & Revenue Share:** Total Tourists, Roadmaps Generated, Total AI Interactions, Top Landmark, Estimated Revenue Share (`$4/sayyoh`, 30% muzey ulushi, `$0.04` real Gemini API xarajati → ~96% marja).
- **Signal vs. Noise Content Matrix:** Sayyohlarni eng ko'p hayratga solgan **TOP Signal** faktlar vs. e'tibor berilmayotgan **Low-Signal Noise** ma'lumotlar (avtomatik filtrlangan).
- **Tourist Impressions & Curiosity Gaps:** Sayyohlar hissiyoti (Awe / Fascinated / Curious / Bored) + muzey arxivida yetishmayotgan savollar ro'yxati.
- **B2B Revenue Simulator:** Muzey direktori uchun kunlik sayyohlar soni bo'yicha oylik/yillik daromad kalkulyatori.
- **QR Code Plaque Generator & CSV Export:** 5 ta obida + kirish eshigi uchun chop etiladigan A4/A5 QR plakatlar (`PNG`, `Print All`) va UTF-8 CSV hisobot.

## Buyruqlar
```bash
npm run dev:dashboard
npm run typecheck --workspace=@smartguide/dashboard
npm run build --workspace=@smartguide/dashboard
```

Batafsil TZ: [TZ_FRONTEND.md](../../documentation/TZ_FRONTEND.md) · [BUSINESS_MODEL.md](../../documentation/BUSINESS_MODEL.md)
