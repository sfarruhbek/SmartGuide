# Parallel Git Ishlash Qoidalari va AWS Ubuntu Deploy Yo'riqnomasi

Ushbu hujjat Frontend, Backend va AI/RAG egaligini hamda deploy yoʻriqnomasini belgilaydi. Merge conflictsiz ishlash kafolatlanmaydi. Buyruqlar yoʻriqnoma, deploy bajarilgani dalili emas.

Live API ulanishi foydalanuvchining aniq topshirigʻi bilan toʻgʻridan-toʻgʻri `main`ga beriladi. Keyingi backend ishini `origin/main` dan boshlang; eski feature branch nusxasi joriy frontend integratsiyasini oʻz ichiga olmaydi. [LIVE_API_SETUP.md](LIVE_API_SETUP.md).

> 26-noyabr yangilanishi: milliy frontend `feat/uzbekistan-solo-travel` branchida; foydalanuvchining keyingi AI-backend topshirigʻi `feat/ai-provider-routing` branchida. Ikkinchisi backend va shared guide sourceMode tipini kengaytiradi. Boshqa odamlarning branchlari yoki production deploy oʻzgartirilmaydi. [AI backend handoff](AI_BACKEND_HANDOFF.md), [API_CONTRACT.md](API_CONTRACT.md), [FRONTEND_PRODUCT.md](FRONTEND_PRODUCT.md).

---

## 1. Fayl Egaligi Matritsasi (Konfliktsiz Parallel Ishlash)

Har bir dasturchi **faqat o'z zonasidagi** fayllarni tahrirlaydi:

| Papka / Fayl | Egasi | Qoida |
| :--- | :--- | :--- |
| `apps/tourist/**` | **Frontend Dev** | To'liq erkin |
| `apps/dashboard/**` | **Frontend Dev** | To'liq erkin |
| `apps/api/data/ichan-qala-landmarks.json` | **AI / RAG Dev** | To'liq erkin (JSON sxemasini buzmasdan) |
| `apps/api/src/services/ai.service.ts` | **AI / RAG Dev** | To'liq erkin (eksport qilingan funksiya signaturasini saqlagan holda) |
| `apps/api/src/db/**` | **Backend Dev** | To'liq erkin (`seed.ts` va `schema.ts`) |
| `apps/api/src/routes/**`, `src/services/analytics.service.ts`, `src/services/landmark.service.ts`, `src/app.ts` | **Backend Dev** | To'liq erkin |
| `packages/shared/src/index.ts` | **LOCKED (Umumiy)** | Faqat Telegram/og'zaki kelishuvdan keyin o'zgartiriladi! |
| Root `package.json`, `package-lock.json` | **Team Lead / Kelishuv** | Yangi kutubxona qo'shishda jamoadagilarga xabar bering |

---

## 2. Git Branch Strategiyasi

Asosiy ishchi branch (`main` yoki hozirgi repo branchi `Freelance`) doim **ishlaydigan (`npm run build` o'tadigan)** holatda saqlanadi.

### Birinchi marta ish boshlash
```bash
git clone <REPO_URL> SmartGuide
cd SmartGuide
npm install --no-audit --no-fund

# O'z yo'nalishingizga mos branch yarating:
git checkout -b feat/frontend    # Frontend Dev uchun
# yoki
git checkout -b feat/backend     # Backend Dev uchun
# yoki
git checkout -b feat/ai-rag      # AI & RAG Dev uchun
```

### Kunlik ish ritmi (har 2–3 soatda kichik, toza merge!)
```bash
# 1. O'zgarishlarni tekshiring (MAJBURIY!)
npm run typecheck
npm run build

# 2. Commit qiling
git add .
git commit -m "feat(tourist): improve Snap & Ask camera preview and audio playback"

# 3. Asosiy branchdagi yangilanishlarni oling
git fetch origin
git rebase origin/main   # (yoki jamoa ishlatayotgan asosiy branch nomi)

# 4. Push qiling va PR oching
git push -u origin feat/frontend
```

### Commit nomlash standarti
- `feat(tourist): ...` — Tourist PWA yangi funksiyasi
- `feat(dashboard): ...` — B2B Dashboard yangi funksiyasi
- `feat(api): ...` — Backend endpoint / DB / kesh
- `feat(rag): ...` — RAG JSON ma'lumotlari, Vision yoki TTS yaxshilash
- `fix(...): ...` — Xatoni tuzatish
- `docs: ...` — Hujjatlar

---

## 3. AWS Ubuntu Serverga Deploy (Docker'siz — Native PostgreSQL + Node 22 + PM2)

AWS EC2 Ubuntu (22.04 / 24.04 LTS) serverda minimal RAM bilan eng barqaror deploy usuli:

### 1-qadam: Serverni tayyorlash
```bash
sudo apt-get update && sudo apt-get install -y curl git postgresql postgresql-contrib nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2 serve
```

### 2-qadam: PostgreSQL foydalanuvchi va baza yaratish
```bash
sudo -u postgres psql -c "CREATE USER smartguide WITH PASSWORD 'KUCHLI_PAROL_YOZING';"
sudo -u postgres psql -c "CREATE DATABASE smartguide OWNER smartguide;"
```

### 3-qadam: Reponi yuklash va `.env` sozlash
```bash
git clone <REPO_URL> /var/www/SmartGuide
cd /var/www/SmartGuide
cp .env.example .env
nano .env
```

`.env` faylida quyidagilarni serveringiz IP/domeniga moslab to'ldiring:
```env
NODE_ENV=production
API_PORT=4000

GROQ_API_KEYS=replace_with_server_key
GROQ_MODELS=openai/gpt-oss-120b,openai/gpt-oss-20b,qwen/qwen3.8-27b
GROQ_VISION_MODEL=qwen/qwen3.8-27b
GEMINI_API_KEY=replace_with_server_key
GEMINI_TTS_MODEL=gemini-3.8-flash-lite-tts
GEMINI_TTS_FALLBACK_MODELS=gemini-3.8-flash-tts,gemini-3.1-flash-tts-preview,gemini-2.5-flash-preview-tts
GEMINI_TTS_VOICE=Sulafat

DATABASE_URL=postgresql://smartguide:KUCHLI_PAROL_YOZING@localhost:5432/smartguide
CORS_ORIGIN=*

TICKET_PRICE_USD=4
MUSEUM_REVENUE_SHARE_PERCENT=30
ESTIMATED_API_COST_PER_TOURIST_USD=0.15

# Domen (HTTPS) yoki AWS Public IP:
NEXT_PUBLIC_API_URL=http://<AWS_IP>:4000
VITE_API_URL=http://<AWS_IP>:4000
VITE_TOURIST_APP_URL=http://<AWS_IP>:3000
```

### 4-qadam: O'rnatish, Build va Seed
```bash
npm install --no-audit --no-fund
npm run build
npm run db:push
npm run db:seed
```

### 5-qadam: PM2 orqali 3 ta servisni doimiy ishga tushirish
```bash
pm2 start apps/api/dist/index.js --name smartguide-api
pm2 start "npm run start --workspace=@smartguide/tourist" --name smartguide-tourist
pm2 start "npx serve -s apps/dashboard/dist -l 5173" --name smartguide-dashboard
pm2 save
pm2 startup
```

Loglarni tekshirish:
```bash
pm2 status
pm2 logs smartguide-api --lines 50
curl http://localhost:4000/api/health
```

### 6-qadam: AWS Security Group & HTTPS (Mobil kamera/mikrofon uchun muhim!)
1. **AWS Security Group Inbound Rules:** TCP `22`, `80`, `443`, `3000`, `4000`, `5173` portlarni oching.
2. **Tavsiya (HTTPS):** iOS Safari va Android Chrome brauzerlarida ovozli diktovka (`SpeechRecognition`) va to'g'ridan-to'g'ri kamera ishlashi uchun HTTPS zarur. Agar domeningiz bo'lsa, Nginx reverse proxy + Certbot (`sudo apt install certbot python3-certbot-nginx`) ulang:
   - `https://app.smartguide.uz` → `localhost:3000` (Tourist PWA — butun O'zbekiston Roadmap + AI-Gid)
   - `https://admin.smartguide.uz` → `localhost:5173` (B2B Dashboard)
   - `https://api.smartguide.uz` → `localhost:4000` (API)
   *(HTTPS ulangach `.env` dagi `NEXT_PUBLIC_API_URL`, `VITE_API_URL`, `VITE_TOURIST_APP_URL` ni yangilab `npm run build` va `pm2 restart all` qiling!)*

### Yangi kodni serverda yangilash (30 soniyada)
```bash
cd /var/www/SmartGuide
git pull origin main
npm install --no-audit --no-fund
npm run build
npm run db:seed
pm2 restart all
```
