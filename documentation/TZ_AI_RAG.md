# TZ #3 — AI & RAG Data Engineer (To'liq Texnik Topshiriq)

> **Loyiha:** SmartGuide — Ichan-Qal'a (Xiva) Raqamli AI-Gid Infratuzilmasi  
> **Rol:** AI & RAG Data Engineer (1 kishi)  
> **Git Branch:** `feat/ai-rag`  
> **Mas'uliyat zonasi:**
> - `apps/api/data/ichan-qala-landmarks.json` (Tasdiqlangan mahalliy muzey RAG ma'lumotlar bazasi)
> - `apps/api/src/services/ai.service.ts` (Gemini RAG Grounding, Snap & Ask Vision, Gemini 3.8 TTS)
> - `apps/api/scripts/eval-rag.ts` (Siz yaratadigan 0% gallyutsinatsiya va Vision aniqlik benchmark skripti)  
> **Tegilmaydigan zonalar:** `apps/tourist/**`, `apps/dashboard/**`, `apps/api/src/routes/**`, `apps/api/src/db/**`

---

## 1. Strategik Maqsad — Bizning Asosiy Raqobatbardosh Ustunligimiz ("Moat")

ProSkill metodologiyasi va hakamlar hay'ati oldidagi eng hal qiluvchi savol:
> **"ChatGPT va Gemini Live'da ham kamera bor-ku — sayyoh sizning tizimingizga nega pul to'lasin?"**

Sizning ishingiz ushbu savolga **texnik isbot va jonli dalil** bilan javob beradi:
1. **0% Gallyutsinatsiya (Verified Museum Archive):** Global AI modellari Xivaning kichikroq obidalari, me'morlari, koshin ustalari (Abdulla Jin, Usto Qalandar Xivakiy, Agahiy epigrafikasi) va mahalliy afsonalarida ko'pincha faktlarni to'qib chiqaradi (masalan, Kalta Minorni Amir Temur qurgan yoki Juma masjidida 100 ta ustun bor deb xato qiladi). Bizning tizim **faqat muzey tasdiqlagan mahalliy RAG pasportidan** javob beradi!
2. **Eksklyuziv Storytelling:** Oddiy Vikipediya emas — mahalliy keksa gidlar aytadigan hayajonli afsonalar, har bir naqsh/yozuv/ustunning aniq tarixiy siri.
3. **Aniq Snap & Ask Vision:** Xiva obidalari tashqaridan bir-biriga o'xshash ko'k-oq majolika va pishiq g'ishtdan qurilgan. Tosh-Hovli ichki hovlisini Ko'hna Ark Yozgi masjididan adashtirmasdan ajrata olish — sizning Vision prompt tuningiz natijasi!
4. **6 Tilda Tabiiy Ovozli Gid (`gemini-3.8-flash-lite-tts`):** Ingliz, O'zbek, Rus, Yapon, Koreys va Ispan tillarida 15–30 soniyalik jonli, quloqqa yoqimli audio ekskursiya.
5. **Minimal API Xarajati (`<= $0.15 / sayyoh`):** `gemini-3.5-flash-lite` + ixcham RAG kontekst injeksiyasi.

---

## 2. Hozir Tayyor Bo'lgan Baza va SDK Arxitekturasi

### A. Ishlatilayotgan Rasmiy Modellar (`.env` orqali boshqariladi)
- **SDK:** Rasmiy `@google/genai` (`^3.6.1`) — yangi **Interactions API (`client.interactions.create`)**!
  > ⚠️ Eski `generateContent` API va eskirgan `gemini-2.5-*` / `gemini-2.0-*` / `gemini-1.5-*` modellarni **MUTLAQO ISHLATMANG**.
  > ⚠️ Gemini 3.6+ va Gemini 4 modellarida `temperature`, `top_p`, `top_k` parametrlarini yubormang (API deprecation warning chiqaradi).
- **RAG + Vision asosiy model:** `gemini-3.5-flash-lite` (eng tez va arzon multimodal model).
- **Avtomatik Fallback model:** `gemini-4-hydrogen` (`GEMINI_FALLBACK_MODEL` — agar asosiy model xato bersa avtomatik o'tadi).
- **Text-to-Speech (TTS):** `gemini-3.8-flash-lite-tts` (`httpOptions: { apiVersion: 'v1beta' }`, unary so'rovda tayyor RIFF headerli `audio/wav` qaytaradi!).

### B. Mavjud `ai.service.ts` Funksiyalari (Signaturani O'zgartirmang!)
1. `identifyLandmarkFromImage(imageBase64, imageMimeType, allLandmarks, fallbackSlug)` — rasmni 5 ta obidaning `visualCues` katalogi bilan solishtirib aniq `slug` qaytaradi.
2. `generateVerifiedGuideAnswer({ landmark, question, language, imageBase64, imageMimeType })` — obidaning PostgreSQL'dagi tasdiqlangan pasportini `system_instruction` ga joylab, faqat shu manbadan javob generatsiya qiladi.
3. `synthesizeGuideAudio(text, language)` — markdown belgilarsiz toza nutq matnini `gemini-3.8-flash-lite-tts` orqali WAV `base64` ga aylantiradi.

---

## 3. Batafsil Vazifalar Ro'yxati (Task-by-Task Spetsifikatsiya)

### 1-BOSQICH (25-noyabr, 14:00 – 18:00) — P0 Real API Tekshiruvi va Mentorlik

#### `AI-01` — Real `GEMINI_API_KEY` bilan 3 ta Pipeline Sinovi `[P0]`
- **Bajariladigan ishlar:**
  1. `.env` ga haqiqiy `GEMINI_API_KEY` qo'yib, `npm run dev:api` ni ishga tushirish.
  2. Kalta Minor bo'yicha 6 ta tilning barchasida (`en, uz, ru, ja, ko, es`) savol yuborib:
     - Matn javobi haqiqatan 100% tanlangan tildami?
     - Javob uzunligi ovozli eshitishga qulaymi (3–5 jumla, ~15–30 soniya)?
     - Markdown belgilari (`**bold**`, `*`, `#`, `-`) chiqib qolmayaptimi?
  3. **Gemini 3.8 Flash-Lite TTS** ovozini barcha 6 tilda quloqchin/karnayda eshitib baholash — ayniqsa **O'zbekcha (`uz`)**, **Yaponcha (`ja`)** va **Koreyscha (`ko`)** talaffuzini tekshirish.
- **Qabul mezoni:** Barcha 6 tilda matn + WAV audio xatosiz va ravon chiqadi.

#### `AI-02` — O'zbek va Xorazm Tarixiy Ismlari Talaffuzini Optimallashtirish `[P0]`
- **Fayl:** `apps/api/src/services/ai.service.ts`
- **Muammo:** TTS modellari ba'zan `Ichan-Qal'a`, `Olloqulixon`, `Usto Qalandar Xivakiy`, `Pahlavon Mahmud`, `Muhammad Aminxon` kabi tarixiy nomlarni xorijiy tillarda g'alati urg'u bilan o'qishi yoki uzun jumlalarda nafas olmay tezlashib ketishi mumkin.
- **Aniq talablar:**
  1. `buildVerifiedRagSystemPrompt` ichida nutq ritmi bo'yicha aniq yo'riqnoma qo'shing: qisqa, tabiiy, jonli ekskursovod ohangidagi jumlalar; yillar va o'lchamlarni o'qishga qulay yozish.
  2. `synthesizeGuideAudio` ichida har bir til uchun eng yoqimli Gemini 3.8 prebuilt ovozini (`Sulafat` — Warm, `Sadaltager` — Knowledgeable, `Charon` — Informative, `Kore` — Firm, `Achird` — Friendly) sinab ko'rib, eng tabiiy eshitiladiganini `SUPPORTED_LANGUAGES` / `ai.service.ts` da belgilang.
  3. `speech_metadata.style` ni qisqa va barqaror ushlang (rasmiy Gemini 3.8 TTS qo'llanmasiga ko'ra uzun style bloki ovoz driftiga olib keladi — `"warm, engaging museum guide"` kabi 3–5 so'z ideal!).

#### `AI-03` — Texnik Mentorlik Sessiyasi (25-noyabr, 14:00 – 16:00) `[P0]`
- **Mentorlar:** Behruz Saidjonov (Senior AI Engineer, Exadel) va Aziza Turaeva (CTO, Clinora AI).
- **Muhokama qilinadigan 3 ta aniq savol:**
  1. 5 ta obida uchun "Structured Verified Dossier Injection" (zero-chunk-loss) vs vector DB — nima uchun kichik yopiq tarixiy majmuada to'liq tasdiqlangan pasportni injeksiya qilish chunking'dan ko'ra 0% gallyutsinatsiya berishini tasdiqlatish.
  2. Token va TTS xarajatini `$0.15 / sayyoh` dan tushirish strategiyasi (Backend Dev kesh + `gemini-3.5-flash-lite` + `gemini-3.8-flash-lite-tts`).
  3. Mentorlar bergan tavsiyalarni 2-bosqich vazifalariga kiritish.

---

### 2-BOSQICH (25-noyabr 19:00 – 26-noyabr 13:00) — P1 Chuqur Muzey RAG Bazasi va Benchmark

#### `AI-04` — 5 ta Ichan-Qal'a Obidasi RAG Bazasini Muzey Darajasiga Chiqarish `[P1 · ASOSIY KONTENT]`
- **Fayl:** `apps/api/data/ichan-qala-landmarks.json`
- **Qoida:** Oddiy Vikipediya emas — eksklyuziv, tekshirilgan tarixiy pasportlar, aniq raqamlar, epigrafika yozuvlari va mahalliy keksa gidlar afsonalari!
- Har bir obida uchun minimal sifat talabi:
  - `historicalFacts`: kamida **8–10 ta** aniq, sanalangan fakt
  - `architecturalDetails`: kamida **6–8 ta** aniq me'moriy, akustik, muhandislik va koshin tafsiloti
  - `localLegends`: kamida **3–4 ta** jonli, qiziqarli mahalliy hikoya (storytelling)
  - `visualCues`: kamida **6 ta** (ham tashqi fasad, ham ichki detal, ham qo'shni obidadan farqlovchi belgilar!)
  - `suggestedQuestions`: barcha **6 tilda (`en, uz, ru, ja, ko, es`)** kamida **4 tadan** eng qiziq savollar

**Har bir obida bo'yicha tekshirilishi shart bo'lgan eksklyuziv mavzular:**
1. **`kalta-minor` (Kalta Minor minorasi):**
   - 1851–1855, Muhammad Aminxon, Usto Qalandar Xivakiy, koshin ustasi Abdulla Jin.
   - Asos diametri `14.2m`, poydevor chuqurligi `~15m` (seysmik qamish va yog'och yostiq), rejalashtirilgan balandlik `70–80m`, amaldagi balandlik `29m`, devor qalinligi `3m+`.
   - 1855-yil Saraxs jangida xonning halok bo'lishi; 1996–1997-yillarda Xivaning 2500 yilligiga bag'ishlab Agahiy forscha g'azallari tushirilgan epigrafikaning tiklanishi.
   - Madrasa 2-qavatidan minoraga o'tgan yog'och ko'prik; Buxoroni ko'rish orzusi va me'morning qanot yasab qochgani afsonasi.
2. **`juma-mosque` (Juma masjidi):**
   - X asrda arab sayyohi Al-Muqaddasiy tilga olgan joy; 1788–1789-yillarda Avaz Inoq davrida Abdurahmon Mehtar mablag'iga qayta qurilgan.
   - `55m × 46m` gumbazsiz tekis tomli gipostil zal; **213 ta yog'och ustun** (X–XI asr kufiy yozuvli 4 ta noyob ustun, XII–XV asr 17 ta, qolgani XVIII–XIX asr; qorag'ay/gujum yog'ochi, sho'rdan himoyalovchi tosh poyustunlar).
   - 2 ta ochiq shift tuynugi (tabiiy konditsioner va yoritish effekti — yozda +45°C da ichkarida 10°C+ salqin), tabiiy akustika, `32.5m` minora, kirishdagi 1788-yilgi marmar vaqf lavhasi.
3. **`tosh-hovli` (Tosh-Hovli saroyi):**
   - 1830–1838, Olloqulixon, 1000+ usta, `163+` xona.
   - 3 ta hovli ketma-ketligi: **Haram** (1830–1832, 5 ta ayvon — 4 tasi rasmiy xotinlarga, 5-kattasi xonga), **Ishrat-Hovli** (1832–1834, mehmonlar va ziyofat), **Arz-Hovli** (1837–1838, sud va shikoyatlar — ikki xil eshik siri!).
   - Birinchi me'mor Usto Nurmuhammad Tojixonning "2 yilda bitmaydi" degani uchun qatl etilishi va Usto Qalandar Xivakiyning 8 yilda bitkazishi.
   - Hovli markazidagi doira g'isht sufalar (qishda ko'chmanchi Qo'ng'irot an'anasiga ko'ra o'tov tikish uchun!), qizil-oltin bo'yalgan yog'och shiftlar, Abdulla Jin majolikasi, qorong'i labirint yo'laklar.
4. **`kunya-ark` (Ko'hna Ark qal'asi):**
   - "Shahar ichidagi shahar" (~1.2 gektar); 1686–1688 Arangxon asos solgan, 1740 Nodirshoh bosqinida vayron bo'lgan, 1804–1806 Eltuzarxon va Olloqulixon tiklagan.
   - **Ko'rinishxona** (1816-yil Usto Muhammad yasagan kumush qoplamali taxt — asl nusxasi Moskvada, bu yerda aniq kopiya), **Yozgi masjid** (1838, Usto Ibodulla va Abdulla Jin ko'k koshinlari), **Zarbxona** (1919–1920-yillardagi mashhur **Xiva ipak pullari**!), **Zindon**, **O'q-dori ombori**, **Oq-Shayx-Bobo** kuzatuv minorasi (360° quyosh botish manzarasi va avliyo rivoyati).
5. **`pahlavon-mahmud` (Pahlavon Mahmud maqbarasi):**
   - 1247–1326, Piryor Valiy — po'stindo'z, yengilmas pahlavon, tasavvuf shoiri (*Kanz al-Haqoyiq* va ruboiylar), Xivaning ma'naviy homiysi.
   - 1326-yilgi asl qabr (o'z ustaxonasida), 1810–1835 Muhammad Rahimxon I va Olloqulixon davrida ulkan maqbara va xonlar sulolaviy xilxonasiga aylantirilishi (Abulg'ozixon, Anushaxon, Muhammad Rahimxon I, Olloqulixon, 1913-yil Isfandiyorxon qo'shimchalari).
   - Ichan-Qal'adagi **eng katta firuza gumbaz** (diametri `17.5m`, balandligi `25m`, zarhal qubba), 1810-yilgi fil suyagi qadalgan eshiklar, ichki majolikadagi ruboiylar, Hindistondagi kurash va "bitta sigir terisi" afsonasi, hovlidagi muqaddas quduq va kelin-kuyovlar ziyorati an'anasi.

> Har tahrirdan keyin `npm run db:seed` ni ishga tushirib JSON xatosiz ekanini va PostgreSQL yangilanganini tekshiring!

#### `AI-05` — Snap & Ask Vision Farqlash Aniqligini ≥95% ga Chiqarish `[P1]`
- **Fayl:** `apps/api/src/services/ai.service.ts` (`identifyLandmarkFromImage`) va `ichan-qala-landmarks.json` (`visualCues`)
- **Qiyin holatlar (Edge Cases):**
  - *Tosh-Hovli ichki hovlisi* vs *Ko'hna Ark Yozgi masjidi* — ikkalasida ham ko'k-oq majolika va yog'och ayvon bor! Vision promptiga aniq farqlovchi qoidalar bering (masalan: Tosh-Hovlida qizil-oltin naqshli shift va hovli markazida doira g'isht o'tov sufasi + ketma-ket bir nechta ayvonlar; Ko'hna Arkda katta loy-paxsali qal'a darvozasi, ikkita dumaloq burj yoki Oq-Shayx-Bobo tepaligi).
  - *Kalta Minor* vs *Juma masjidi minorasi* — Kalta Minor keng, to'liq ko'k-firuza koshinli, tepasi tekis kesilgan; Juma minorasi ingichka, oddiy pishiq g'ishtli.
  - *Obida bo'lmagan rasm (selfie, ovqat, kofe stakan, stol)* — Vision modeli albatta `"unknown"` qaytarishi va yolg'on obida topib yubormasligi kerak!
- **Sinov:** Har bir obidadan kamida 2 ta real rasm (jami 10 ta rasm) + 2 ta obida bo'lmagan rasm (jami 12 ta rasm) bilan aniqlikni test qiling.

#### `AI-06` — Anti-Hallucination & Latency Avtomatik Benchmark Skripti (`eval-rag.ts`) `[P1 · PITCH DALILI]`
- **Fayl:** yangi `apps/api/scripts/eval-rag.ts` (va `apps/api/package.json` da `"eval:rag": "tsx scripts/eval-rag.ts"`)
- **Nima uchun bu skript xakaton yutishda katta rol o'ynaydi:**
  - Hakamlarga "bizda gallyutsinatsiya 0%" deb quruq gapirish o'rniga, real terminal/jadval natijasini ko'rsatasiz!
- **Skript tarkibi (kamida 15–20 ta test case):**
  1. **10 ta Factual Accuracy testi** (5 ta obida × 2 tadan aniq raqam/ism savoli, har xil tillarda `en, uz, ru, ja, ko, es` — masalan, Kalta Minor `29` metr va `1855`, Juma masjidi `213` ustun, Tosh-Hovli `163` xona, Pahlavon Mahmud `1247–1326`).
  2. **5 ta Anti-Hallucination (Tuzoq) testi:**
     - *"Was Kalta Minor built by Amir Timur in 1405?"* → AI buni rad etishi va haqiqiy 1851 Muhammad Aminxon faktini aytishi shart!
     - *"How many modern glass elevators are inside Juma Mosque?"* → AI arxivda bunday narsa yo'qligini aniq aytishi shart!
     - *"What was the Wi-Fi password of Allakuli Khan in Tosh-Hovli?"* → AI to'qimasdan arxiv chegarasini tushuntirishi shart!
     - *"How much does a VIP helicopter tour from Kunya-Ark cost?"* → AI arxivda yo'q deb javob berishi shart!
     - *"Did Pahlavon Mahmud win an Olympic gold medal in Tokyo?"* → AI rad etishi va haqiqiy XIII–XIV asr faktini aytishi shart!
  3. **Chiqariladigan hisobot:**
     - `Factual Accuracy: X/10`
     - `Anti-Hallucination Score: Y/5 (Hallucination Rate: 0%)`
     - `Average RAG Latency (ms)` va `Average TTS Latency (ms)`
     - `Estimated Cost per 10-question Tourist Session (USD)`

---

### 3-BOSQICH (26-noyabr 13:00 – 19:00 CODE FREEZE) — P2 Sahnaga Sayqallash

#### `AI-07` — Demo Day "Oltin Savollar" Tekshiruvi `[P2]`
- Sahnada ko'rsatiladigan 5 ta asosiy savolni (EN, JA, KO, UZ, RU) jonli sinab, javob matni ham, ovozi ham 10/10 sifatda ekanini tasdiqlang:
  1. `kalta-minor` (`en`): *"Why is Kalta Minor unfinished?"*
  2. `kalta-minor` (`ja`): *"なぜカルタ・ミノルは未完成のままなのですか？"*
  3. `juma-mosque` (`ko`): *"주마 모스크에는 나무 기둥이 몇 개 있고 가장 오래된 것은 언제 것인가요?"*
  4. `pahlavon-mahmud` (`uz`): *"Pahlavon Mahmudning Hindistondagi kurash afsonasini aytib bering"*
  5. `tosh-hovli` (`ru`): *"Почему Аллакули-хан казнил первого архитектора дворца?"*

#### `AI-08` — Token va Cost-to-Serve Byudjeti Hisoboti `[P2]`
- 1 ta sayyohning o'rtacha sessiyasini (masalan, 6 ta savol + 2 ta Snap & Ask rasm + 6 ta qisqa TTS javob, 50% kesh hit bilan) hisoblab, haqiqiy `$ / sayyoh` xarajatini Speaker'ga taqdim etish (slayd va hakamlar Q&A uchun).

---

## 4. Qabul Mezonlari (Acceptance Criteria)

1. `ichan-qala-landmarks.json` barcha 5 ta obida uchun chuqur, tekshirilgan faktlar, me'morchilik va afsonalar bilan boyitilgan va `npm run db:seed` 0 xato bilan o'tadi.
2. `eval-rag.ts` benchmark skriptida **Anti-Hallucination = 100% (0% yolg'on fakt)** va **Factual Accuracy ≥ 95%**.
3. Real 10 ta Xiva suratida Vision `identifyLandmarkFromImage` **≥ 90%** to'g'ri obidani topadi, 2 ta begona suratda `"unknown"` qaytaradi.
4. Barcha 6 tilda (`en, uz, ru, ja, ko, es`) `gemini-3.8-flash-lite-tts` ravon, markdown belgilarsiz, 15–30 soniyalik WAV audio qaytaradi.
5. `ai.service.ts` eksport qilgan 3 ta funksiya signaturasi buzilmagan va `npm run typecheck --workspace=@smartguide/api` 0 xato bilan o'tadi.
