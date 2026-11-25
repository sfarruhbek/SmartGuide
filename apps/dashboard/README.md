# `@smartguide/dashboard` — B2B Muzey Analitika Paneli

**Port:** `5173`  
**Stek:** React 19, Vite 6, TypeScript, Tailwind CSS v4, Recharts 3, `qrcode`

## Asosiy Modullar

- **`src/App.tsx`:** Har **5 soniyada** `GET /api/analytics/summary` dan jonli ma'lumot oladi va yangi kelgan savollarni `"LIVE NEW"` belgisi bilan ajratib ko'rsatadi.
- **`src/components/KpiCards.tsx`:** Total Tourists, Total AI Interactions, Top Landmark, Estimated Revenue Share (`$4/sayyoh`, 30% muzey ulushi, ~96% yalpi marja).
- **`src/components/AnalyticsCharts.tsx`:**
  - Visits by Landmark (`BarChart` — jami savollar + foto skanlar)
  - Tourists by Language (`PieChart` — til/davlat kesimi)
  - Hourly Activity (`AreaChart` — 24 soatlik dinamika)
- **`src/components/LiveQuestionsFeed.tsx`:** PostgreSQL'dan real-vaqtda kelayotgan savollar oqimi.
- **`src/components/QrCodeGenerator.tsx`:** Kirish eshigi va barcha 5 ta obida uchun chop etishga tayyor QR-kod plakatlari (jonli URL almashtirish, `PNG` yuklab olish, `Print All`).

## Muhit O'zgaruvchilari (`.env`)

```env
VITE_API_URL=http://localhost:4000
VITE_TOURIST_APP_URL=http://localhost:3000
```

## Buyruqlar

```bash
# Root papkadan:
npm run dev:dashboard
npm run typecheck --workspace=@smartguide/dashboard
npm run build --workspace=@smartguide/dashboard
```

TZ va vazifalar ro'yxati: [../../documentation/TZ_FRONTEND.md](../../documentation/TZ_FRONTEND.md)
