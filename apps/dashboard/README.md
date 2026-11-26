# `@smartguide/dashboard` — pilot analytics and planning tools

React 19, Vite 6, TypeScript, Tailwind 4, Recharts, qrcode. Default port 5173.

- Existing analytics summary polled every five seconds, preserving the last successful data during reconnect.
- Optional Signal/Noise, sentiment, curiosity gaps and roadmap counts display only if API supplies them. Empty states otherwise; no invented interest scores or visitor reactions.
- Revenue calculator is an **assumption model**, not live payments: museum 30%, payment fee 2%, AI $0.04/base or $0.15/stress per session, server $43/month. Default 3,000 monthly paid sessions at $4 give $7,997 contribution before salaries, content, marketing, taxes, refunds and affiliates.
- Promo QR entry links (`?ref=entrance`, hotel, station) and optional per-landmark Khiva pilot links. Generating a ref URL does not implement backend attribution or require a sign on every monument.
- UTF-8 BOM CSV export; frontend fallback if export API is missing. Charts, QR and calculator use lazy chunks.
- CSV user text is protected against spreadsheet formula execution, including the server export response. Analytics/export requests have a 12-second timeout so a stalled request does not keep the panel busy indefinitely.

The museum share is revenue before its own costs. Actual paid users, sales and nationwide travel budgets are not inferred from guide questions. Backend summary values may be seeded/demo data; identify them during demos.

```bash
npm run dev:dashboard
npm run typecheck --workspace=@smartguide/dashboard
npm run build --workspace=@smartguide/dashboard
```

[API status](../../documentation/API_CONTRACT.md) · [business](../../documentation/BUSINESS_MODEL.md) · [budget assumptions](../../documentation/SMETA_BUDGET.md)
