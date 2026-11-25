import type { SupportedLanguage } from '@smartguide/shared';

export interface TouristUiStrings {
  siteBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  verifiedTag: string;
  snapAnyButton: string;
  snapAnyHint: string;
  landmarksHeading: string;
  exploreGuide: string;
  backToAll: string;
  verifiedArchive: string;
  eraLabel: string;
  architectLabel: string;
  dossierToggleOpen: string;
  dossierToggleClose: string;
  factsTab: string;
  architectureTab: string;
  legendsTab: string;
  suggestedTitle: string;
  inputPlaceholder: string;
  snapButton: string;
  voiceListening: string;
  voiceButton: string;
  autoPlayAudio: string;
  audioPlay: string;
  audioPause: string;
  audioReplay: string;
  audioVoiceTag: string;
  audioBrowserFallback: string;
  thinkingMessage: string;
  visionDetectedBadge: string;
  switchDetectedLandmark: string;
  welcomePrefix: string;
  photoAttached: string;
  removePhoto: string;
  identifyingPhoto: string;
  errorPrefix: string;
}

export const TOURIST_UI: Record<SupportedLanguage, TouristUiStrings> = {
  en: {
    siteBadge: 'UNESCO World Heritage · Ichan-Qala, Khiva',
    heroTitle: 'Your Personal Verified AI Tour Guide',
    heroSubtitle:
      'Instant QR audio guide backed by official museum archives. Zero hallucinations, zero downloads — ask by voice, text, or camera.',
    verifiedTag: '100% Museum-Verified Archive',
    snapAnyButton: 'Snap & Identify Any Monument',
    snapAnyHint: 'Point your camera at any Khiva landmark for instant AI recognition',
    landmarksHeading: '5 Iconic Ichan-Qala Landmarks',
    exploreGuide: 'Open AI Guide',
    backToAll: 'All Landmarks',
    verifiedArchive: 'Verified Archive',
    eraLabel: 'Period',
    architectLabel: 'Master / Patron',
    dossierToggleOpen: 'View Verified Museum Dossier',
    dossierToggleClose: 'Hide Museum Dossier',
    factsTab: 'History',
    architectureTab: 'Architecture',
    legendsTab: 'Legends',
    suggestedTitle: 'Quick Questions',
    inputPlaceholder: 'Ask anything about this monument...',
    snapButton: 'Snap & Ask',
    voiceListening: 'Listening...',
    voiceButton: 'Voice',
    autoPlayAudio: 'Auto-play voice',
    audioPlay: 'Listen to Guide',
    audioPause: 'Pause Audio',
    audioReplay: 'Replay',
    audioVoiceTag: 'Gemini 3.8 AI Voice',
    audioBrowserFallback: 'Device Voice Readout',
    thinkingMessage: 'Consulting verified Khiva museum archive...',
    visionDetectedBadge: 'Identified by Snap & Ask Vision',
    switchDetectedLandmark: 'Open full guide for',
    welcomePrefix:
      'Welcome! I am your verified SmartGuide for this monument. Tap a quick question, take a photo, or ask me anything in your language.',
    photoAttached: 'Photo ready for Snap & Ask',
    removePhoto: 'Remove',
    identifyingPhoto: 'Recognizing monument from your photo...',
    errorPrefix: 'Connection issue:',
  },
  uz: {
    siteBadge: "UNESCO Butunjahon Merosi · Ichan-Qal'a, Xiva",
    heroTitle: 'Shaxsiy Tasdiqlangan AI-Gidingiz',
    heroSubtitle:
      "Rasmiy muzey arxiviga asoslangan tezkor QR ovozli gid. 0% xato, ilova yuklamasdan — ovoz, matn yoki kamera orqali savol bering.",
    verifiedTag: '100% Muzey Arxivi Tasdiqlagan',
    snapAnyButton: "Rasmga olib obidani aniqlash",
    snapAnyHint: "Xiva obidasiga kamerani qarating — AI darhol tanib hikoya qiladi",
    landmarksHeading: "Ichan-Qal'aning 5 ta mashhur obidasi",
    exploreGuide: 'AI-Gidni ochish',
    backToAll: 'Barcha obidalar',
    verifiedArchive: 'Tasdiqlangan Arxiv',
    eraLabel: 'Davr',
    architectLabel: "Me'mor / Homiy",
    dossierToggleOpen: "Tasdiqlangan tarixiy pasportni ko'rish",
    dossierToggleClose: 'Tarixiy pasportni yopish',
    factsTab: 'Tarix',
    architectureTab: "Me'morchilik",
    legendsTab: 'Afsonalar',
    suggestedTitle: 'Tezkor savollar',
    inputPlaceholder: "Ushbu obida haqida savolingizni yozing...",
    snapButton: 'Rasm + Savol',
    voiceListening: 'Tinglayapman...',
    voiceButton: 'Ovoz',
    autoPlayAudio: 'Avto-ovozli javob',
    audioPlay: 'Gidni tinglash',
    audioPause: "To'xtatish",
    audioReplay: 'Qayta tinglash',
    audioVoiceTag: 'Gemini 3.8 Ovozli Gid',
    audioBrowserFallback: 'Qurilma ovozida tinglash',
    thinkingMessage: "Xiva muzeyi tasdiqlangan bazasidan izlanmoqda...",
    visionDetectedBadge: 'Kamera orqali aniqlandi',
    switchDetectedLandmark: "To'liq sahifasiga o'tish:",
    welcomePrefix:
      "Xush kelibsiz! Men ushbu obida bo'yicha rasmiy tasdiqlangan SmartGuide AI-gidiman. Tezkor savolni bosing, rasmga oling yoki o'z savolingizni bering.",
    photoAttached: 'Rasm yuborishga tayyor',
    removePhoto: "O'chirish",
    identifyingPhoto: 'Rasmdagi obida aniqlanmoqda...',
    errorPrefix: 'Ulanish xatosi:',
  },
  ru: {
    siteBadge: 'Всемирное наследие ЮНЕСКО · Ичан-Кала, Хива',
    heroTitle: 'Ваш персональный AI-гид по Хиве',
    heroSubtitle:
      'Мгновенный QR аудиогид на основе проверенных музейных архивов. Без выдумок и скачивания приложений — спрашивайте голосом, текстом или камерой.',
    verifiedTag: '100% проверено музеем',
    snapAnyButton: 'Сфотографировать и узнать памятник',
    snapAnyHint: 'Наведите камеру на любой памятник Ичан-Калы для распознавания',
    landmarksHeading: '5 главных памятников Ичан-Калы',
    exploreGuide: 'Открыть AI-гид',
    backToAll: 'Все памятники',
    verifiedArchive: 'Проверенный архив',
    eraLabel: 'Эпоха',
    architectLabel: 'Зодчий / Заказчик',
    dossierToggleOpen: 'Открыть исторический паспорт',
    dossierToggleClose: 'Скрыть исторический паспорт',
    factsTab: 'История',
    architectureTab: 'Архитектура',
    legendsTab: 'Легенды',
    suggestedTitle: 'Популярные вопросы',
    inputPlaceholder: 'Задайте вопрос об этом памятнике...',
    snapButton: 'Фото + Вопрос',
    voiceListening: 'Слушаю...',
    voiceButton: 'Голос',
    autoPlayAudio: 'Автовоспроизведение',
    audioPlay: 'Слушать гида',
    audioPause: 'Пауза',
    audioReplay: 'Повторить',
    audioVoiceTag: 'Голос Gemini 3.8',
    audioBrowserFallback: 'Озвучка устройства',
    thinkingMessage: 'Проверяю официальный архив музея Хивы...',
    visionDetectedBadge: 'Определено по фото (Vision)',
    switchDetectedLandmark: 'Перейти к памятнику:',
    welcomePrefix:
      'Добро пожаловать! Я ваш проверенный AI-гид SmartGuide по этому памятнику. Выберите быстрый вопрос, сделайте фото или спросите на своём языке.',
    photoAttached: 'Фото готово к отправке',
    removePhoto: 'Удалить',
    identifyingPhoto: 'Определяю памятник по фото...',
    errorPrefix: 'Ошибка связи:',
  },
  ja: {
    siteBadge: 'ユネスコ世界遺産 · イチャン・カラ（ヒヴァ）',
    heroTitle: '博物館認定・あなた専属のAIツアーガイド',
    heroSubtitle:
      '公式博物館アーカイブに基づくQR音声ガイド。アプリ不要・ハルシネーションゼロ。写真・音声・テキストで何でも質問できます。',
    verifiedTag: '博物館公式アーカイブ認定',
    snapAnyButton: '写真を撮って建造物をAI認識',
    snapAnyHint: 'ヒヴァの建造物を撮影すると即座に認識して解説します',
    landmarksHeading: 'イチャン・カラ 5大名所',
    exploreGuide: 'AIガイドを開く',
    backToAll: '名所一覧へ',
    verifiedArchive: '認定アーカイブ',
    eraLabel: '建造年代',
    architectLabel: '建築家・創建者',
    dossierToggleOpen: '公式歴史資料を見る',
    dossierToggleClose: '歴史資料を閉じる',
    factsTab: '歴史',
    architectureTab: '建築',
    legendsTab: '伝説',
    suggestedTitle: 'おすすめの質問',
    inputPlaceholder: 'この建造物について質問してください...',
    snapButton: '写真で質問',
    voiceListening: '聞き取り中...',
    voiceButton: '音声',
    autoPlayAudio: '音声を自動再生',
    audioPlay: 'ガイド音声を再生',
    audioPause: '一時停止',
    audioReplay: 'もう一度聞く',
    audioVoiceTag: 'Gemini 3.8 AI音声',
    audioBrowserFallback: '端末音声読み上げ',
    thinkingMessage: 'ヒヴァ博物館の公式アーカイブを確認中...',
    visionDetectedBadge: 'Snap & Ask 画像認識',
    switchDetectedLandmark: '詳細ガイドを開く:',
    welcomePrefix:
      'ようこそ！この建造物の公式認定AIガイドです。質問チップをタップするか、写真を撮ってお尋ねください。',
    photoAttached: '写真が添付されました',
    removePhoto: '削除',
    identifyingPhoto: '写真から建造物を特定しています...',
    errorPrefix: '通信エラー:',
  },
  ko: {
    siteBadge: '유네스코 세계유산 · 히바 이찬 칼라',
    heroTitle: '박물관 공식 인증 나만의 AI 투어 가이드',
    heroSubtitle:
      '공식 박물관 아카이브 기반 QR 오디오 가이드. 앱 설치 없이, 왜곡 없는 정확한 역사를 사진·음성·텍스트로 물어보세요.',
    verifiedTag: '100% 박물관 공식 아카이브',
    snapAnyButton: '사진 찍고 유적지 바로 인식하기',
    snapAnyHint: '히바 유적지를 촬영하면 AI가 즉시 인식하여 안내합니다',
    landmarksHeading: '이찬 칼라 대표 유적 5선',
    exploreGuide: 'AI 가이드 열기',
    backToAll: '전체 유적지',
    verifiedArchive: '인증 아카이브',
    eraLabel: '건립 시기',
    architectLabel: '건축가 / 건립자',
    dossierToggleOpen: '공식 역사 자료 보기',
    dossierToggleClose: '역사 자료 닫기',
    factsTab: '역사',
    architectureTab: '건축',
    legendsTab: '전설',
    suggestedTitle: '추천 질문',
    inputPlaceholder: '이 유적지에 대해 궁금한 점을 물어보세요...',
    snapButton: '사진 질문',
    voiceListening: '듣는 중...',
    voiceButton: '음성',
    autoPlayAudio: '음성 자동 재생',
    audioPlay: '가이드 음성 듣기',
    audioPause: '일시정지',
    audioReplay: '다시 듣기',
    audioVoiceTag: 'Gemini 3.8 AI 음성',
    audioBrowserFallback: '기기 음성 읽기',
    thinkingMessage: '히바 박물관 공식 기록을 조회하는 중...',
    visionDetectedBadge: '사진 인식으로 확인됨',
    switchDetectedLandmark: '상세 가이드 보기:',
    welcomePrefix:
      '환영합니다! 이 유적지의 공식 인증 SmartGuide AI 가이드입니다. 추천 질문을 누르거나 사진을 찍어 질문해 보세요.',
    photoAttached: '사진이 첨부되었습니다',
    removePhoto: '삭제',
    identifyingPhoto: '사진 속 유적지를 인식하고 있습니다...',
    errorPrefix: '연결 오류:',
  },
  es: {
    siteBadge: 'Patrimonio Mundial UNESCO · Ichan-Qala, Jiva',
    heroTitle: 'Tu Guía Turístico IA Verificado',
    heroSubtitle:
      'Audioguía QR instantánea respaldada por archivos oficiales del museo. Sin descargas ni alucinaciones: pregunta por voz, texto o cámara.',
    verifiedTag: '100% Archivo Verificado del Museo',
    snapAnyButton: 'Fotografiar e Identificar Monumento',
    snapAnyHint: 'Apunta tu cámara a cualquier monumento de Jiva para reconocerlo al instante',
    landmarksHeading: '5 Monumentos Icónicos de Ichan-Qala',
    exploreGuide: 'Abrir Guía IA',
    backToAll: 'Todos los Monumentos',
    verifiedArchive: 'Archivo Verificado',
    eraLabel: 'Época',
    architectLabel: 'Maestro / Mecenas',
    dossierToggleOpen: 'Ver Dossier Histórico Verificado',
    dossierToggleClose: 'Ocultar Dossier',
    factsTab: 'Historia',
    architectureTab: 'Arquitectura',
    legendsTab: 'Leyendas',
    suggestedTitle: 'Preguntas Rápidas',
    inputPlaceholder: 'Pregunta cualquier cosa sobre este monumento...',
    snapButton: 'Foto y Pregunta',
    voiceListening: 'Escuchando...',
    voiceButton: 'Voz',
    autoPlayAudio: 'Reproducción automática',
    audioPlay: 'Escuchar al Guía',
    audioPause: 'Pausar',
    audioReplay: 'Repetir',
    audioVoiceTag: 'Voz IA Gemini 3.8',
    audioBrowserFallback: 'Voz del dispositivo',
    thinkingMessage: 'Consultando el archivo oficial del museo de Jiva...',
    visionDetectedBadge: 'Identificado por Visión IA',
    switchDetectedLandmark: 'Abrir guía completa de',
    welcomePrefix:
      '¡Bienvenido! Soy tu guía IA verificado de SmartGuide para este monumento. Toca una pregunta sugerida, toma una foto o pregúntame en tu idioma.',
    photoAttached: 'Foto lista para enviar',
    removePhoto: 'Quitar',
    identifyingPhoto: 'Identificando el monumento en tu foto...',
    errorPrefix: 'Error de conexión:',
  },
};
