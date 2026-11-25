# `@smartguide/tourist` — Sayyohlar uchun Mobile-First PWA

**Port:** `3000`  
**Stek:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons

## Sahifalar va Asosiy Komponentlar

- **`/` ([src/app/page.tsx](src/app/page.tsx)):**
  - 5 ta Ichan-Qal'a obidasi tezkor kartalari (`TouristHomeClient.tsx`)
  - 6 tilli almashtirgich: `EN, UZ, RU, JA, KO, ES` (`LanguageSwitcher.tsx`)
  - "Snap & Identify Any Monument" kamera/rasm orqali obidani aniqlash
- **`/l/[slug]` ([src/app/l/[slug]/page.tsx](src/app/l/%5Bslug%5D/page.tsx)):**
  - QR-kod orqali to'g'ridan-to'g'ri ochiladigan loginsiz obida sahifasi (`LandmarkGuideClient.tsx`)
  - Dark/Gold Silk Road dizayni + oflayn ishlaydigan maxsus SVG me'moriy bannerlar (`LandmarkArt.tsx`)
  - **Snap & Ask** kamera/foto yuklash (klient tomonda 1024px JPEG ga siqish — `src/lib/image-utils.ts`)
  - Ovozli savol (Web Speech API) + matn kiritish + 6 tilda tezkor savol chiplari
  - `AudioGuidePlayer.tsx` — Gemini 3.8 TTS WAV pleyeri (kalit bo'lmasa brauzer `speechSynthesis` fallback)
  - Tasdiqlangan muzey pasporti (Tarix / Me'morchilik / Afsonalar)

## Muhit O'zgaruvchilari (`.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Buyruqlar

```bash
# Root papkadan:
npm run dev:tourist
npm run typecheck --workspace=@smartguide/tourist
npm run build --workspace=@smartguide/tourist
```

TZ va vazifalar ro'yxati: [../../documentation/TZ_FRONTEND.md](../../documentation/TZ_FRONTEND.md)
