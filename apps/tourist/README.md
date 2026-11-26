# `@smartguide/tourist` — Emotsional Roadmap + Jonli AI-Gid PWA

**Port:** `3000`  
**Stek:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons

## 2 Bosqichli Sayyoh Tajribasi (Loginsiz · Har Obidada QR Kerak Emas!)
1. **`/` — GPS Yaqin Obyekt + Shaxsiy Emotsional Roadmap Builder:**
   - Kirishdagi reklama QR/kiosk orqali ilova ochiladi (`/?ref=west-gate-kiosk`).
   - Brauzer **GPS geolokatsiyasi** sayyohning joylashuviga qarab eng yaqin obyektni avtomatik taklif qiladi (xakaton zali ichida ko'rsatish uchun *Demo GPS Simulator* mavjud).
   - 10 soniyada Til (`EN, UZ, RU, JA, KO, ES`) + Vaqt (`1h / 2h / 4h`) + Qiziqish/Vibe tanlanib, har bir obidaning **emotsional foydasi**, **piyoda masofasi** va **TOP Signal fakti** bilan Roadmap chiziladi.
2. **`/l/[slug]` — Obida Oldida Jonli AI Suhbat + Micro-Feedback:**
   - Roadmap progressi va keyingi bekat tavsiyasi.
   - **Snap & Ask** kamera/rasm tanish + ovozli diktovka + matn + **Gemini 3.8 TTS** audio pleyer.
   - Har bir javob ostida **1-tap Micro-Feedback** (`🔥 Juda qiziq`, `🤯 Hayratlanarli`, `😐 Kerak emas`) — keyingi sayyohlar marshrutini aqllilashtiruvchi real signal!

## Buyruqlar
```bash
npm run dev:tourist
npm run typecheck --workspace=@smartguide/tourist
npm run build --workspace=@smartguide/tourist
```

Batafsil TZ: [TZ_FRONTEND.md](../../documentation/TZ_FRONTEND.md)
