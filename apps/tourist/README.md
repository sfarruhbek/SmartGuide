# `@smartguide/tourist` — Uzbekistan solo travel

Next.js 15, React 19, TypeScript, Tailwind 4. Default port 3000.

- `/`: plan / itinerary / map. Six-language UI, days and USD budget, ordered destinations, local estimates, contingency and shortfall. Deterministic frontend planner; no AI-generation claim.
- Interactive OSM map: 15 places in four cities, source notes, filters and private discovery drafts. Planner supports 16 named cities plus free text; missing catalog data becomes explicit free time.
- `/khiva`: retained short-walk pilot (1/2/4 hours, five landmarks).
- `/l/[slug]`: existing Khiva API guide with optional audio, text/photo/speech, transcript and feedback UI. Current backend does not implement feedback or roadmap routes; errors/fallbacks are visible.

Trip and discovery drafts stay in localStorage. No login, cloud sync, public contribution publishing, payment, booking, live fares, GPS auto-suggestion or offline tile download is implemented. Public map tiles need internet. The installed manifest is not an offline service-worker implementation.

UI languages: EN/UZ/RU/ES/JA/KO. New place stories: EN/RU/UZ; English fallback is labelled. Estimates are authored planning allowances, not verified current tariffs.

```bash
npm run dev:tourist
npm run typecheck --workspace=@smartguide/tourist
npm run build --workspace=@smartguide/tourist
```

See [product/status](../../documentation/FRONTEND_PRODUCT.md), [API](../../documentation/API_CONTRACT.md), [architecture](../../documentation/ARCHITECTURE.md).

Photo licenses: [`public/cities/credits.json`](public/cities/credits.json), `/credits.html`. Khiva photos predate this national edition; their provenance must be checked before public redistribution. No new rights claim is made for them in this change.
