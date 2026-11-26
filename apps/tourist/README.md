# `@smartguide/tourist` — Uzbekistan Full-City Travel Roadmap & AI Guide PWA

> **Scope:** SmartGuide is **not** an Ichan-Qala-only app. The main experience (`/`) draws a **complete day-by-day city/multi-city exploration roadmap** (schedule, places, interactive map, USD budget breakdown) for whichever city or cities in Uzbekistan the traveler visits (16 cities + custom city). Khiva (`/khiva`, `/l/[slug]`) is the Phase 1 deep museum-archive & photo-recognition pilot.

Next.js 15, React 19, TypeScript, Tailwind 4. Default port 3000.

- `/`: Stitch mobile hub, `plan / auth / itinerary / map / snap / guide / pass`. Six-language UI, local fonts, limestone/cobalt/terracotta palette, 480 px maximum frame. [Implementation and handoff](../../documentation/STITCH_IMPLEMENTATION.md).
- Three-step introduction collects cities, days, interests and USD budget, or the tourist can tell Live their preferences. Confirmation calls real `POST /api/trips/compose` before registration. Groq chooses places by day; the server validates IDs and calculates estimates. Text instructions, per-stop removal and Live requests revise the same server workspace. The new compose flow returns an error when AI is unavailable, with no canned fallback. Saved trips require explicit continuation.
- Registration/login/profile/logout use our server's `/api/auth/*` through the same-origin Next proxy. HttpOnly cookie sessions survive reload; passwords are hashed on the server. Guest trial: one created plan, 180 cumulative Live seconds and three distinct photos; repeat questions about the same encoded photo are deduplicated server-side. Reading/revising the existing plan remains available. Registration is requested only for an exhausted feature, and adopts the guest workspace when the account has none. Members continue free until Pass sales. [Trial and planning](../../documentation/TRIAL_AND_PLANNING.md).
- Interactive OSM map: 15 authored planner places plus sourced server records, filters and private discovery drafts. Planner supports 16 named cities plus free text; missing catalog data becomes explicit free time.
- Snap & Ask uploads a compressed JPEG to `POST /api/explore/identify`, with follow-up questions and optional Gemini TTS. It works without starting the microphone. Unknown photos remain explicitly uncertain.
- Live guide screen and contextual popup: Gemini Live audio through our WebSocket API, interruption, mute, photos, optional GPS, nearby sourced pins and a latest transcript. The server tool `manage_trip` creates/revises the real trip through Groq; `tripUpdated` refreshes the UI. No text-chat interface. The extended map catalog has 28 places and 16 city contexts, with public-source lookup/cache for missing coverage. [Protocol, setup and real checks](../../documentation/LIVE_VOICE_ASSISTANT.md).
- `/khiva`: retained short-walk pilot (1/2/4 hours, five landmarks).
- `/l/[slug]`: Groq text/photo guide and Gemini speech through our API. `/khiva` calls the real roadmap route. Feedback remains unimplemented, with explicit unavailable UI.
- Mobile navigation: Roadmap / Map / raised Snap camera / AI guide / Pass. Introduction and auth hide the dock. GPS is available in the travel header, map and Live. Active voice can follow travel views as a popup; entering Snap/auth stops it. Popup and dock share safe-area clearance. Day selection uses a select and previous/next buttons.
- Tourist cards and Live have no external source action. Provenance stays in API/catalog records; licenses and required public-source attribution remain on `/credits.html` and the OSM map.
- Trip Pass displays the planned $4.99/$12.99 offers and explains that sales are not open. No fake purchase, activated entitlement or voucher success.
- View, city, collection, selected catalog place and day are restored from URL parameters; Back/Forward switches views. Trip export downloads all days, costs and sources as UTF-8 text.
- Budget breakdown separates food, transport, admission, accommodation and reserve. API calls time out; interrupted guide requests are cancelled; errors and unknown places have recovery screens.

The latest trip also has a private server workspace/revision returned by `GET /api/trips/current`; a local Trip v2 copy, preferences, discovery drafts and limited story reactions stay in localStorage. Trial/workspace storage is a single-process JSON demo store with 30-day entries, not a production archive. Passwords, session tokens, voice, photo and precise GPS are not stored there by these flows. Installable PWA support (`manifest.webmanifest`, `sw.js`, PNG 192/512 and Apple Touch icons) uses network-first navigation and asset caching, bypassing `/api/*`. Production DB/cloud sync/history, public contribution publishing, payment, booking, live fares and bulk offline map tile download remain pending. GPS is opt-in; public map tiles and Live conversations need internet.

UI languages: EN/UZ/RU/ES/JA/KO. New place stories: EN/RU/UZ; English fallback is labelled. Estimates are planning allowances, not verified current tariffs. Dynamic source places marked `estimatedAdmission` have no verified ticket price; zero allowance does not mean free entry.

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
