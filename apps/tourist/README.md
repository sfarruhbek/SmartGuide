# `@smartguide/tourist` — Uzbekistan Full-City Travel Roadmap & AI Guide PWA

> **Scope:** SmartGuide is **not** an Ichan-Qala-only app. The main experience (`/`) draws a **complete day-by-day city/multi-city exploration roadmap** (schedule, places, interactive map, USD budget breakdown) for whichever city or cities in Uzbekistan the traveler visits (16 cities + custom city). Khiva (`/khiva`, `/l/[slug]`) is the Phase 1 deep museum-archive & photo-recognition pilot.

Next.js 15, React 19, TypeScript, Tailwind 4. Default port 3000.

- `/`: plan / itinerary / map. Six-language UI, days and USD budget. The form posts to the real API; Groq ranks places and the server calculates estimates. Loading/error states, labelled server fallback and exact saved itinerary restoration are implemented.
- Interactive OSM map: 15 places in four cities, source notes, filters and private discovery drafts. Planner supports 16 named cities plus free text; missing catalog data becomes explicit free time.
- Map voice popup: Gemini Live audio through our WebSocket API, interruption, mute, photos, optional GPS, nearby sourced pins and a collapsible latest transcript. No text-chat interface. The extended map catalog has 28 places and 16 city contexts, with public-source lookup/cache for missing coverage. [Protocol, setup and real checks](../../documentation/LIVE_VOICE_ASSISTANT.md).
- `/khiva`: retained short-walk pilot (1/2/4 hours, five landmarks).
- `/l/[slug]`: Groq text/photo guide and Gemini speech through our API. `/khiva` calls the real roadmap route. Feedback remains unimplemented, with explicit unavailable UI.
- Mobile navigation uses three equal buttons with short labels and reserved safe-area spacing. Day selection uses a select and previous/next buttons on phones, wrapping buttons on wider screens.
- View, city, collection, selected catalog place and day are restored from URL parameters; Back/Forward switches views. Trip export downloads all days, costs and sources as UTF-8 text.
- Budget breakdown separates food, transport, admission, accommodation and reserve. API calls time out; interrupted guide requests are cancelled; errors and unknown places have recovery screens.

Trip and discovery drafts stay in localStorage. Installable PWA support (`manifest.webmanifest`, `sw.js`, PNG 192/512 and Apple Touch icons) uses network-first navigation and asset caching, bypassing `/api/*`. No login, cloud sync, public contribution publishing, payment, booking, live fares or bulk offline map tile download is implemented. GPS in the voice popup is opt-in; public map tiles and Live conversations need internet.

UI languages: EN/UZ/RU/ES/JA/KO. New place stories: EN/RU/UZ; English fallback is labelled. Estimates are authored planning allowances, not verified current tariffs.

```bash
npm run dev:tourist
npm run typecheck --workspace=@smartguide/tourist
npm run build --workspace=@smartguide/tourist
npx tsx --tsconfig apps/tourist/tests/tsconfig.json --test apps/tourist/tests/*.test.ts apps/dashboard/tests/*.test.ts
```

See [product/status](../../documentation/FRONTEND_PRODUCT.md), [API](../../documentation/API_CONTRACT.md), [architecture](../../documentation/ARCHITECTURE.md).

[Live API setup and real checks](../../documentation/LIVE_API_SETUP.md). Local fonts and their OFL licenses are in `src/app/fonts`; build no longer fetches Google Fonts.

Full audit, remaining product gaps and hackathon readiness: [26 November audit](../../documentation/FRONTEND_AUDIT_2026-11-26.md). HTTPS deployments using the default local API configuration need a same-origin `/api` reverse proxy, or an explicit HTTPS API URL. Physical mobile-keyboard/safe-area testing remains a device check.

Photo licenses: [`public/cities/credits.json`](public/cities/credits.json), `/credits.html`. Khiva photos predate this national edition; their provenance must be checked before public redistribution. No new rights claim is made for them in this change.
