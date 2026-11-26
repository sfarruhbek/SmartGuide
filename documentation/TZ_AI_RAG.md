# TZ #3 — AI & RAG Data Engineer (Yakuniy Konsepsiya: Emotsional Roadmap, Signal/Noise Extractor, Verified RAG & TTS)

> **Loyiha:** SmartGuide — Emotsional Roadmap + Jonli AI-Gid + Sayyohlar Qiziqishi Intellekti  
> **Rol:** AI & RAG Data Engineer (1 kishi)  
> **Git Branch:** `feat/ai-rag`  
> **Mas'uliyat zonasi:**
> - `apps/api/data/ichan-qala-landmarks.json` (Emotsional profillar + Teglangan muzey RAG bazasi)
> - `apps/api/src/services/ai.service.ts` (Roadmap Generator + Signal-First RAG + Interest/Sentiment Extractor + Vision + Gemini 3.8 TTS)
> - `apps/api/scripts/eval-rag.ts` (Anti-Hallucination & Cost Benchmark skripti)  
> **Tegilmaydigan zonalar:** `apps/tourist/**`, `apps/dashboard/**`, `apps/api/src/routes/**`, `apps/api/src/db/**`

---

## 1. Strategik Maqsad — Boshqa Barcha AI'lardan Tubdan Farqimizni Texnik Ta'minlash

Sizning ishingiz 3 ta kuchli AI modulini bitta yopiq **Self-Learning Flywheel** ga birlashtiradi:
1. **Emotsional & Foyda Asosidagi Roadmap Generator:** Sayyohga *"1-obida: Kalta Minor (1851)"* deb quruq ro'yxat emas, balki *"Nega borish kerak, qanday hissiyot/zavq olasiz va avvalgi sayyohlarning 92% ni aynan qaysi fakt hayratga solgan"* degan jonli marshrut tuzish.
2. **Adaptive Zero-Fluff RAG (Signal-First, 0% Hallucination):** Muzey tasdiqlagan bazadan **eng yuqori `signalScore` li qiziq faktlarni birinchi o'ringa qo'yish**, zerikarli (`Noise`) ma'lumotlarni ortiqcha cho'zmasdan filtrlash va 0% yolg'on fakt aytish!
3. **Structured Conversation Insight & Impression Extractor:** Sayyohning har bir jonli savoli va ohangidan:
   - Qaysi aniq mavzuga (`detectedTopicKey`) qiziqdi?
   - Hissiyoti / taassuroti (`awe | fascinated | curious | neutral | bored`) qanday?
   - Qiziqish kuchi (`1..5`) nechchi?
   - Agar sayyoh arxivda yo'q narsani so'ragan bo'lsa, uni **`curiosityGap`** sifatida muzey kuratoriga yetkazish!

---

## 2. Rasmiy Gemini API Qoidalari (`@google/genai` ^3.6.1)

- Faqat **`client.interactions.create(...)`** (Interactions API) dan foydalaning.
- **Modellar (2026 rasmiy arzon kombinatsiya — 1 sayyoh = `$0.036`!):**
  - Asosiy Multimodal RAG + Vision + Roadmap + Extractor: **`gemini-3.5-flash-lite`** (`$0.30/1M` in · `$2.50/1M` out)
  - Fallback model: **`gemini-4-hydrogen`** (`$1.50/1M` in · `$7.50/1M` out)
  - Ovozli gid (6 til): **`gemini-3.8-flash-lite-tts`** (`$0.50/1M` text in · `$6.00/1M` audio out, `25 token/sek`)
- **Qat'iy taqiq:** `gemini-2.5-*`, `gemini-2.0-*`, `gemini-1.5-*` va `temperature`/`top_p`/`top_k` parametrlarini ishlatmang!

---

## 3. Batafsil Vazifalar Ro'yxati (`AI-01` .. `AI-10`)

### P0 — Birinchi Navbatda (26-noyabr, 11:50 – 14:30 · Data Schema & Core AI Engine)

#### `AI-01` — `ichan-qala-landmarks.json` ni Emotsional Profillar va Teglangan Mavzular (`taggedTopics`) Bilan Boyitish `[P0 · ENG MUHIM]`
- **Fayl:** `apps/api/data/ichan-qala-landmarks.json`
- Har bir obida (`kalta-minor`, `juma-mosque`, `tosh-hovli`, `kunya-ark`, `pahlavon-mahmud`) uchun quyidagi yangi maydonlarni qo'shing:
  - **Haqiqiy Xiva GPS koordinatalari (`latitude`, `longitude`, `triggerRadiusMeters`):** (Har bir obidada QR-kod bo'lmagani uchun ilova joylashuvdan kelib chiqib aynan shu koordinatalar orqali obyektni taklif qiladi!):
    - `kalta-minor`: `latitude: 41.37828`, `longitude: 60.35833`, `triggerRadiusMeters: 45`
    - `kunya-ark`: `latitude: 41.37922`, `longitude: 60.35789`, `triggerRadiusMeters: 55`
    - `juma-mosque`: `latitude: 41.37826`, `longitude: 60.35969`, `triggerRadiusMeters: 45`
    - `pahlavon-mahmud`: `latitude: 41.37717`, `longitude: 60.35947`, `triggerRadiusMeters: 50`
    - `tosh-hovli`: `latitude: 41.37864`, `longitude: 60.36233`, `triggerRadiusMeters: 55`
  - `estimatedVisitMinutes`: `20` (Kalta Minor), `25` (Juma Mosque), `35` (Tosh-Hovli), `30` (Kunya-Ark), `25` (Pahlavon Mahmud).
  - `vibeTags`: `["legends", "photography", "architecture", "royalty", "spiritual"]` dan mos 2–3 tasi.
  - `emotionalPromise` (**6 tilda:** `en, uz, ru, ja, ko, es`): Sayyoh aynan shu joydan qanday hissiyot/maza/foyda olishi!
    - *Kalta Minor:* *"Osmonda to'xtab qolgan buyuk orzuning hayrati + Ipak Yo'lidagi eng yorqin firuza foto lahzasi"*
    - *Juma masjidi:* *"Jazirama cho'ldan 1000 yillik 213 ta yog'och ustunlar o'rmoniga kirgandagi salqin xotirjamlik va yorug'lik sehri"*
    - *Tosh-Hovli:* *"Xiva xonlarining 163 xonali sirli saroy hayoti, majolika jozibasi va hovli ichidagi o'tov siri"*
    - *Ko'hna Ark:* *"Oq-Shayx-Bobo tepaligidan butun Ichan-Qal'aning oltin quyosh botishini 360° tomosha qilish zavqi"*
    - *Pahlavon Mahmud:* *"Yengilmas shoir-kurashchi afsonasidan ma'naviy ilhom va Xivaning eng ulug'vor firuza gumbazi ostidagi sokinlik"*
  - `taggedTopics` (har bir obida uchun **5–6 ta aniq `topicKey`**, jumladan 4 ta kuchli High-Signal mavzu + 1–2 ta quruq/texnik Low-Signal mavzu — Signal vs. Noise tizimi aniq ishlashi uchun!):
    - Misol (`kalta-minor`):
      - `kalta-minor-unfinished-1855` (*Why it stopped at 29m*, `history`, baseline `92`)
      - `kalta-minor-architect-legend` (*Legend of the Architect's Escape*, `legend`, baseline `95`)
      - `kalta-minor-turquoise-glaze` (*Abdulla Jin's Unfading Blue Glaze*, `architecture`, baseline `86`)
      - `kalta-minor-deep-foundation` (*15m Seismic Reed Foundation*, `architecture`, baseline `78`)
      - `kalta-minor-agahi-calligraphy` (*Poet Agahi's Persian Inscriptions*, `history`, baseline `74`)
      - `kalta-minor-1996-restoration-budget` (*1996 Administrative Restoration Ledger*, `history`, baseline `28` — Noise misoli!)
- Har bir obidada kamida **8 ta tarixiy fakt**, **6 ta me'morchilik detali**, **3 ta mahalliy afsona** va **6 tilda 4 tadan tezkor savol** bo'lsin.

#### `AI-02` — `generateEmotionalRoadmap(...)` Funksiyasini Yozish (`ai.service.ts`) `[P0]`
- **Signatura (Backend Dev `BE-03` bilan kelishilgan):**
  ```ts
  export async function generateEmotionalRoadmap(params: {
    landmarks: LandmarkWithSignals[];
    language: SupportedLanguage;
    durationMinutes: number;
    vibes: TravelVibe[];
  }): Promise<{
    headline: string;
    stops: RoadmapStop[];
  }>
  ```
- **Prompt qoidalari:**
  - `system_instruction` ichida faqat sayyohning `vibes` va `durationMinutes` iga mos kelgan obidalarni va ularning PostgreSQL'dan kelgan **TOP Signal mavzularini** (`signalScore >= 70`) bering.
  - AI qat'iy JSON formatda (yoki toza parse qilinadigan JSON) qaytarsin: har bir stop uchun `whyVisit` (jonli, hissiyotli 1–2 gap), `emotionalPayoff` (4–7 so'z), `topSignalHighlight` (real sayyohlar reytingiga tayangan eng qiziq nuqta) va `noiseFilteredNote` (qanday quruq ma'lumotdan qutqarganimiz!).
  - **Fallback:** Agar Gemini javob bermasa yoki JSON buzilsa, har bir obidaning `emotionalPromise[language]` + eng yuqori `signalScore` mavzusidan darhol deterministik Roadmap qaytarsin (hech qachon 500 bermasin!).

#### `AI-03` — Single-Call Grounded RAG + Interest/Sentiment/Signal Extractor (`ai.service.ts`) `[P0 · COST-SAVER]`
- **Nima uchun bitta chaqiruvda (yoki structured JSON'da) qilish ideal?**
  - Bir so'rovda ham javobni, ham sayyoh qiziqishi tahlilini (`detectedTopicKey`, `signalCategory`, `sentiment`, `interestScore`, `curiosityGap`) olish **2 baravar tezroq** va **API xarajatini 2 baravar tejaydi**!
- **Aniq ishlash tartibi (`generateVerifiedGuideAnswer`):**
  1. `system_instruction` ga 3 ta qat'iy blok kiritiladi:
     - **A) Verified Museum Dossier** (faqat shu manbadan javob berish — 0% gallyutsinatsiya!).
     - **B) Live Signal vs. Noise Priority List** (PostgreSQL'dan kelgan TOP Signal mavzularni birinchi urg'ulash; Low-Signal Noise mavzularni foydalanuvchi aniq so'ramasa gapirmaslik!).
     - **C) Strict JSON Output Schema:**
       ```json
       {
         "answer": "3–5 ta jonli, ovozli o'qishga qulay, markdownsiz jumla (tanlangan tilda)",
         "detectedTopicKey": "obidaning taggedTopics ro'yxatidagi eng yaqin topicKey",
         "detectedTopicLabel": "mavzuning qisqa tushunarli nomi (inglizcha — B2B dashboard uchun)",
         "signalCategory": "legend | architecture | history | photo_spot | practical",
         "sentiment": "awe | fascinated | curious | neutral | bored",
         "interestScore": 5,
         "curiosityGap": null
       }
       ```
       *(Agar sayyoh arxivda yo'q savol bersa, `answer` da muloyimlik bilan arxivda yo'qligini aytadi va `curiosityGap` ga o'sha savolni yozadi!)*
  2. JSON parsingda xavfsiz fallback: agar model oddiy matn qaytarsa, matn `answer` sifatida saqlanadi va `detectedTopicKey` kalit so'zlar orqali deterministik topiladi.

---

### P1 — Sifat, Vision Aniqligi, TTS va Benchmark (26-noyabr, 14:30 – 17:00)

#### `AI-04` — Real `GEMINI_API_KEY` Bilan 6 Tilda TTS & Talaffuz Sozlash `[P1]`
- Barcha 6 tilda (`en, uz, ru, ja, ko, es`) `gemini-3.8-flash-lite-tts` ovozini eshitib tekshirish.
- Xorazm tarixiy nomlari (`Ichan-Qal'a`, `Kalta Minor`, `Olloqulixon`, `Pahlavon Mahmud`, `Usto Qalandar`) talaffuzi ravon va `speech_metadata.style` qisqa (`"warm, engaging cultural storyteller"`) bo'lishini tasdiqlash.
- Javob uzunligi **15–30 soniya** audio (≈ 60–90 so'z) atrofida bo'lishi — sayyoh tinglab zerikmaydi va TTS xarajati atigi `$0.004/javob` bo'ladi!

#### `AI-05` — Snap & Ask Vision Farqlash Aniqligi (≥95%) `[P1]`
- 10 ta real Xiva surati (har obidadan 2 ta rakurs) + 2 ta obida bo'lmagan rasm (stakan/stol → `"unknown"`) bilan `identifyLandmarkFromImage` ni tekshirish.
- Ayniqsa **Tosh-Hovli ichki ko'k majolikasi** vs **Ko'hna Ark Yozgi masjidi** va **Kalta Minor** vs **Juma minorasi** farqlanishini `visualCues` da aniq ajratib yozish.

#### `AI-06` — Anti-Hallucination & Signal Extraction Benchmark (`apps/api/scripts/eval-rag.ts`) `[P1 · PITCH DALILI]`
- Kamida **18 ta avtomatik test case**:
  - **10 ta Factual Accuracy testi** (5 obida × 2 aniq fakt, 6 tilda)
  - **5 ta Anti-Hallucination tuzoq testi** (*"Kalta Minorni Amir Temur qurganmi?"*, *"Juma masjidida nechta lift bor?"* → 0% to'qima + `curiosityGap` to'g'ri to'lishi!)
  - **3 ta Emotsional Roadmap testi** (`60m legends`, `120m photography`, `240m full` → to'g'ri obidalar soni va `whyVisit` / `emotionalPayoff` sifati).
- Terminalda toza xulosa jadvali chiqarsin (Speaker slaydiga qo'yish uchun):
  `Factual Accuracy: 10/10 · Hallucination Rate: 0% · Avg RAG+Extract Latency: X ms · Real API Cost/Session: $0.036`

---

### P2 — Demo Day "Oltin Ssenariy" Sinovi (26-noyabr, 17:00 – 19:00 CODE FREEZE)

#### `AI-07` — Demo Day 5 Ta Oltin Savol va 2 Ta Oltin Roadmap Tekshiruvi `[P2]`
- Sahnada ko'rsatiladigan aniq ssenariyni (`Legends + Photo` Roadmap → Kalta Minor EN/JA savol → Pahlavon Mahmud UZ afsona → Juma Mosque KO ustunlar) 3 marta sinab, javob, ovoz va Signal Extraction 100% mukammalligini tasdiqlang.

---

## 4. Qabul Mezonlari (Acceptance Criteria)

1. `ichan-qala-landmarks.json` barcha 5 obida uchun `emotionalPromise` (6 til), `vibeTags`, `estimatedVisitMinutes` va `taggedTopics` (High Signal + Low Noise) bilan boyitilgan va `npm run db:seed` 0 xato bilan o'tadi.
2. `generateEmotionalRoadmap` quruq ro'yxat emas — aniq hissiyot, foyda va real sayyoh Signal'iga asoslangan marshrut qaytaradi.
3. `generateVerifiedGuideAnswer` bitta so'rovda ham 0% gallyutsinatsiyali javob, ham to'g'ri `insight` (`detectedTopicKey`, `sentiment`, `interestScore`, `curiosityGap`) qaytaradi.
4. `eval-rag.ts` benchmark'ida **Hallucination Rate = 0%**, Vision aniqligi **≥90%**, 6 tilda Gemini 3.8 TTS ravon ishlaydi.
5. `npm run typecheck --workspace=@smartguide/api` 0 xato bilan o'tadi.
