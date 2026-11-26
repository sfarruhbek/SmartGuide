import type { SupportedLanguage } from '@smartguide/shared';

export interface TouristUiStrings {
  siteBadge: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  tourMetaLabel: string;
  verifiedTag: string;
  snapAnyButton: string;
  snapAnyHint: string;
  landmarksHeading: string;
  routeSummary: string;
  startHereBadge: string;
  startAudioGuide: string;
  audioIntroBadge: string;
  openStopLink: string;
  viewFullPhoto: string;
  closeLabel: string;
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
  voiceUnsupported: string;
  autoPlayAudio: string;
  audioPlay: string;
  audioPause: string;
  audioReplay: string;
  audioVoiceTag: string;
  audioBrowserFallback: string;
  tapToListenHint: string;
  thinkingMessage: string;
  scanningPhoto: string;
  visionDetectedBadge: string;
  switchDetectedLandmark: string;
  welcomePrefix: string;
  photoAttached: string;
  removePhoto: string;
  identifyingPhoto: string;
  errorPrefix: string;
  retryButton: string;
  introTourButton: string;
  introTourPrompt: string;
  clearChat: string;
  copyButton: string;
  copiedButton: string;
  instantCacheLabel: string;
  verifiedSourceLabel: string;
  conversationHeading: string;
  stopLabel: string;
  audioGuidePill: string;
}

export const TOURIST_UI: Record<SupportedLanguage, TouristUiStrings> = {
  en: {
    siteBadge: 'UNESCO · Khiva',
    heroEyebrow: 'Self-Guided Walking Tour',
    heroTitle: 'Ichan-Qala Audio Guide',
    heroSubtitle:
      'Tap a monument along your walk or point your camera at any facade to hear its verified museum story.',
    tourMetaLabel: '5 UNESCO Stops · ~35 min walk · 6 Languages',
    verifiedTag: 'Museum Archive',
    snapAnyButton: 'Snap & Ask Any Monument',
    snapAnyHint: 'Camera or photo gallery · Instant recognition',
    landmarksHeading: 'Walking Route',
    routeSummary: '5 stops · West Gate → South Quarter',
    startHereBadge: '01 · Start Here',
    startAudioGuide: 'Start Audio Guide',
    audioIntroBadge: '~30s audio',
    openStopLink: 'Open',
    viewFullPhoto: 'Expand photo',
    closeLabel: 'Close',
    exploreGuide: 'Open Audio Guide',
    backToAll: 'All Monuments',
    verifiedArchive: 'Verified Museum Archive',
    eraLabel: 'Period',
    architectLabel: 'Master / Patron',
    dossierToggleOpen: 'Museum Dossier & Verified Facts',
    dossierToggleClose: 'Hide Museum Dossier',
    factsTab: 'History',
    architectureTab: 'Architecture',
    legendsTab: 'Legends',
    suggestedTitle: 'Curated Questions',
    inputPlaceholder: 'Ask anything about this monument...',
    snapButton: 'Snap & Ask',
    voiceListening: 'Listening...',
    voiceButton: 'Voice',
    voiceUnsupported: 'Voice dictation is unavailable in this browser — please type your question below.',
    autoPlayAudio: 'Auto-play audio',
    audioPlay: 'Play Audio Guide',
    audioPause: 'Pause',
    audioReplay: 'Replay',
    audioVoiceTag: 'Audio Guide',
    audioBrowserFallback: 'Device Voice',
    tapToListenHint: 'Tap play to listen',
    thinkingMessage: 'Consulting verified Khiva museum archive...',
    scanningPhoto: 'Identifying monument...',
    visionDetectedBadge: 'Identified by Snap & Ask Vision',
    switchDetectedLandmark: 'Open full guide for',
    welcomePrefix:
      'Welcome! Start the 30-second intro tour above, tap a curated question, or upload a photo of any architectural detail.',
    photoAttached: 'Photo ready for Snap & Ask',
    removePhoto: 'Remove',
    identifyingPhoto: 'Identifying monument...',
    errorPrefix: 'Connection issue:',
    retryButton: 'Retry sending',
    introTourButton: '30-Second Intro Tour',
    introTourPrompt:
      'Give me a vivid 30-second introductory audio tour of this monument, highlighting its most remarkable verified historical facts and local legend.',
    clearChat: 'Clear chat',
    copyButton: 'Copy',
    copiedButton: 'Copied',
    instantCacheLabel: 'Instant Cache',
    verifiedSourceLabel: 'Gemini RAG',
    conversationHeading: 'Guide Conversation',
    stopLabel: 'Stop',
    audioGuidePill: 'Audio Guide',
  },
  uz: {
    siteBadge: 'UNESCO · Xiva',
    heroEyebrow: 'Mustaqil Piyoda Ekskursiya',
    heroTitle: "Ichan-Qal'a Ovozli Gidi",
    heroSubtitle:
      "Yo'lingizdagi obidani tanlang yoki kamerani binoga qarating — muzey arxivi tasdiqlagan hikoyani eshiting.",
    tourMetaLabel: '5 ta UNESCO obidasi · ~35 daqiqa · 6 til',
    verifiedTag: 'Muzey Arxivi',
    snapAnyButton: 'Rasmga olib obidani aniqlash',
    snapAnyHint: 'Kamera yoki galereya · Tezkor aniqlash',
    landmarksHeading: 'Sayohat marshruti',
    routeSummary: "5 ta obida · G'arbiy darvozadan janubga",
    startHereBadge: '01 · Boshlash nuqtasi',
    startAudioGuide: 'Gidni boshlash',
    audioIntroBadge: '~30s audio',
    openStopLink: 'Ochish',
    viewFullPhoto: 'Kattalashtirish',
    closeLabel: 'Yopish',
    exploreGuide: 'Gidni ochish',
    backToAll: 'Barcha obidalar',
    verifiedArchive: 'Tasdiqlangan muzey arxivi',
    eraLabel: 'Davr',
    architectLabel: "Me'mor / Homiy",
    dossierToggleOpen: "Tasdiqlangan tarixiy pasportni ko'rish",
    dossierToggleClose: 'Tarixiy pasportni yopish',
    factsTab: 'Tarix',
    architectureTab: "Me'morchilik",
    legendsTab: 'Afsonalar',
    suggestedTitle: 'Tezkor savollar',
    inputPlaceholder: 'Ushbu obida haqida savolingizni yozing...',
    snapButton: 'Rasm + Savol',
    voiceListening: 'Tinglayapman...',
    voiceButton: 'Ovoz',
    voiceUnsupported: "Bu brauzerda ovozli kiritish ishlamaydi — savolingizni matn maydoniga yozing.",
    autoPlayAudio: 'Avto-ovozli javob',
    audioPlay: 'Gidni tinglash',
    audioPause: "To'xtatish",
    audioReplay: 'Qayta',
    audioVoiceTag: 'Ovozli gid',
    audioBrowserFallback: 'Qurilma ovozi',
    tapToListenHint: 'Tinglash uchun bosing',
    thinkingMessage: 'Xiva muzey arxivi tekshirilmoqda...',
    scanningPhoto: 'Obida aniqlanmoqda...',
    visionDetectedBadge: 'Snap & Ask orqali aniqlandi',
    switchDetectedLandmark: "To'liq gidni ochish:",
    welcomePrefix:
      "Xush kelibsiz! Yuqoridagi 30 soniyalik kirish ekskursiyasini bosing, tezkor savolni tanlang yoki obidani rasmga oling.",
    photoAttached: 'Rasm yuborishga tayyor',
    removePhoto: "O'chirish",
    identifyingPhoto: 'Obida aniqlanmoqda...',
    errorPrefix: 'Ulanish xatosi:',
    retryButton: 'Qayta yuborish',
    introTourButton: '30 soniyalik kirish ekskursiyasi',
    introTourPrompt:
      "Ushbu obida haqida eng qiziqarli tasdiqlangan tarixiy faktlar va mahalliy afsonani o'z ichiga olgan 30 soniyalik jonli kirish ekskursiyasini aytib bering.",
    clearChat: 'Chatni tozalash',
    copyButton: 'Nusxalash',
    copiedButton: 'Nusxalandi',
    instantCacheLabel: 'Tezkor kesh',
    verifiedSourceLabel: 'Gemini RAG',
    conversationHeading: 'Gid bilan suhbat',
    stopLabel: 'Bekat',
    audioGuidePill: 'Ovozli gid',
  },
  ru: {
    siteBadge: 'ЮНЕСКО · Хива',
    heroEyebrow: 'Пешеходный аудиомаршрут',
    heroTitle: 'Аудиогид по Ичан-Кале',
    heroSubtitle:
      'Выберите памятник по ходу прогулки или наведите камеру на фасад — услышьте проверенную историю из архива музея.',
    tourMetaLabel: '5 объектов ЮНЕСКО · ~35 мин прогулки · 6 языков',
    verifiedTag: 'Архив музея',
    snapAnyButton: 'Сфотографировать памятник',
    snapAnyHint: 'Камера или фото из галереи · Мгновенное распознавание',
    landmarksHeading: 'Маршрут по крепости',
    routeSummary: '5 остановок · От Западных ворот на юг',
    startHereBadge: '01 · Начать здесь',
    startAudioGuide: 'Начать аудиогид',
    audioIntroBadge: '~30 сек аудио',
    openStopLink: 'Открыть',
    viewFullPhoto: 'Увеличить фото',
    closeLabel: 'Закрыть',
    exploreGuide: 'Открыть аудиогид',
    backToAll: 'Все памятники',
    verifiedArchive: 'Проверенный архив музея',
    eraLabel: 'Эпоха',
    architectLabel: 'Зодчий / Заказчик',
    dossierToggleOpen: 'Открыть музейное досье',
    dossierToggleClose: 'Скрыть музейное досье',
    factsTab: 'История',
    architectureTab: 'Архитектура',
    legendsTab: 'Легенды',
    suggestedTitle: 'Популярные вопросы',
    inputPlaceholder: 'Задайте вопрос об этом памятнике...',
    snapButton: 'Фото + Вопрос',
    voiceListening: 'Слушаю...',
    voiceButton: 'Голос',
    voiceUnsupported: 'Голосовой ввод недоступен в этом браузере — введите вопрос вручную.',
    autoPlayAudio: 'Автовоспроизведение',
    audioPlay: 'Слушать гида',
    audioPause: 'Пауза',
    audioReplay: 'Повтор',
    audioVoiceTag: 'Аудиогид',
    audioBrowserFallback: 'Голос устройства',
    tapToListenHint: 'Нажмите, чтобы послушать',
    thinkingMessage: 'Проверяю официальный архив музея Хивы...',
    scanningPhoto: 'Определяем памятник...',
    visionDetectedBadge: 'Определено через Snap & Ask Vision',
    switchDetectedLandmark: 'Открыть полный гид по',
    welcomePrefix:
      'Добро пожаловать! Запустите 30-секундную вводную экскурсию выше, выберите вопрос или загрузите фото деталей памятника.',
    photoAttached: 'Фото готово к отправке',
    removePhoto: 'Удалить',
    identifyingPhoto: 'Определяем памятник...',
    errorPrefix: 'Ошибка связи:',
    retryButton: 'Повторить отправку',
    introTourButton: '30-секундная вводная экскурсия',
    introTourPrompt:
      'Проведи яркую 30-секундную вводную аудиоэкскурсию по этому памятнику: назови главные проверенные факты из истории и самую известную местную легенду.',
    clearChat: 'Очистить чат',
    copyButton: 'Копировать',
    copiedButton: 'Скопировано',
    instantCacheLabel: 'Мгновенный кэш',
    verifiedSourceLabel: 'Gemini RAG',
    conversationHeading: 'Диалог с гидом',
    stopLabel: 'Объект',
    audioGuidePill: 'Аудиогид',
  },
  ja: {
    siteBadge: 'ユネスコ世界遺産 · ヒヴァ',
    heroEyebrow: 'セルフガイド散策ツアー',
    heroTitle: 'イチャン・カラ音声ガイド',
    heroSubtitle:
      '散策ルートから名所を選ぶか、カメラを向けるだけで博物館公式アーカイブの物語を音声で聴けます。',
    tourMetaLabel: 'ユネスコ5名所 · 徒歩約35分 · 6言語',
    verifiedTag: '博物館アーカイブ',
    snapAnyButton: '写真を撮って建造物を認識',
    snapAnyHint: 'カメラ撮影・ギャラリー選択に対応',
    landmarksHeading: '散策ルート',
    routeSummary: '5スポット · 西門から南区画へ',
    startHereBadge: '01 · ここから開始',
    startAudioGuide: '音声ガイドを開始',
    audioIntroBadge: '約30秒音声',
    openStopLink: '開く',
    viewFullPhoto: '拡大表示',
    closeLabel: '閉じる',
    exploreGuide: '音声ガイドを開く',
    backToAll: '名所一覧',
    verifiedArchive: '博物館公式アーカイブ',
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
    voiceUnsupported: 'このブラウザは音声入力に対応していません。下の入力欄からご入力ください。',
    autoPlayAudio: '音声を自動再生',
    audioPlay: '音声ガイドを再生',
    audioPause: '一時停止',
    audioReplay: 'もう一度',
    audioVoiceTag: '音声ガイド',
    audioBrowserFallback: '端末音声',
    tapToListenHint: 'タップして再生',
    thinkingMessage: 'ヒヴァ博物館の公式アーカイブを確認中...',
    scanningPhoto: '建造物を認識中...',
    visionDetectedBadge: 'Snap & Ask 画像認識で特定',
    switchDetectedLandmark: '詳細ガイドを開く:',
    welcomePrefix:
      'ようこそ！上の「30秒イントロツアー」をタップするか、おすすめの質問・写真撮影でお尋ねください。',
    photoAttached: '写真が添付されました',
    removePhoto: '削除',
    identifyingPhoto: '建造物を認識中...',
    errorPrefix: '通信エラー:',
    retryButton: '再送信',
    introTourButton: '30秒イントロツアー',
    introTourPrompt:
      'この建造物について、最も重要な公式歴史事実と地元の伝説を交えた30秒間の分かりやすい導入ツアーを行ってください。',
    clearChat: '履歴をクリア',
    copyButton: 'コピー',
    copiedButton: 'コピー済み',
    instantCacheLabel: '高速キャッシュ',
    verifiedSourceLabel: 'Gemini RAG',
    conversationHeading: 'ガイドとの会話',
    stopLabel: 'スポット',
    audioGuidePill: '音声ガイド',
  },
  ko: {
    siteBadge: '유네스코 세계유산 · 히바',
    heroEyebrow: '셀프 도보 오디오 투어',
    heroTitle: '이찬 칼라 오디오 가이드',
    heroSubtitle:
      '산책 동선에 따라 유적을 선택하거나 카메라를 비추면 박물관 공식 기록을 들려드립니다.',
    tourMetaLabel: '유네스코 5대 명소 · 도보 약 35분 · 6개 언어',
    verifiedTag: '박물관 아카이브',
    snapAnyButton: '사진 찍고 유적지 인식',
    snapAnyHint: '카메라 촬영 또는 갤러리 사진 선택',
    landmarksHeading: '도보 탐방 코스',
    routeSummary: '5개 코스 · 서문에서 남쪽 구역까지',
    startHereBadge: '01 · 여기서 시작',
    startAudioGuide: '가이드 시작하기',
    audioIntroBadge: '약 30초 음성',
    openStopLink: '열기',
    viewFullPhoto: '사진 확대',
    closeLabel: '닫기',
    exploreGuide: '오디오 가이드 열기',
    backToAll: '전체 유적지',
    verifiedArchive: '박물관 공식 아카이브',
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
    voiceUnsupported: '이 브라우저에서는 음성 인식을 지원하지 않습니다. 아래 입력창에 입력해 주세요.',
    autoPlayAudio: '음성 자동 재생',
    audioPlay: '가이드 듣기',
    audioPause: '일시정지',
    audioReplay: '다시 듣기',
    audioVoiceTag: '오디오 가이드',
    audioBrowserFallback: '기기 음성',
    tapToListenHint: '눌러서 듣기',
    thinkingMessage: '히바 박물관 공식 기록을 조회하는 중...',
    scanningPhoto: '유적지 인식 중...',
    visionDetectedBadge: 'Snap & Ask 사진 인식으로 확인',
    switchDetectedLandmark: '전체 가이드 열기:',
    welcomePrefix:
      '환영합니다! 위의 30초 소개 투어를 누르거나 추천 질문·사진 촬영으로 유적지를 탐색해 보세요.',
    photoAttached: '사진이 첨부되었습니다',
    removePhoto: '삭제',
    identifyingPhoto: '유적지 인식 중...',
    errorPrefix: '연결 오류:',
    retryButton: '다시 보내기',
    introTourButton: '30초 소개 투어',
    introTourPrompt:
      '이 유적지의 가장 핵심적인 공식 역사 사실과 대표적인 현지 전설을 담아 생생한 30초 오디오 소개 투어를 들려주세요.',
    clearChat: '대화 지우기',
    copyButton: '복사',
    copiedButton: '복사됨',
    instantCacheLabel: '즉시 캐시',
    verifiedSourceLabel: 'Gemini RAG',
    conversationHeading: '가이드 대화',
    stopLabel: '명소',
    audioGuidePill: '오디오 가이드',
  },
  es: {
    siteBadge: 'UNESCO · Jiva',
    heroEyebrow: 'Recorrido a pie autoguiado',
    heroTitle: 'Audioguía de Ichan-Qala',
    heroSubtitle:
      'Elige un monumento en tu paseo o apunta tu cámara a cualquier fachada para escuchar su historia verificada.',
    tourMetaLabel: '5 paradas UNESCO · ~35 min a pie · 6 idiomas',
    verifiedTag: 'Archivo del Museo',
    snapAnyButton: 'Fotografiar monumento',
    snapAnyHint: 'Cámara o galería de fotos · Reconocimiento al instante',
    landmarksHeading: 'Ruta a pie',
    routeSummary: '5 paradas · Puerta Oeste → Barrio Sur',
    startHereBadge: '01 · Empezar aquí',
    startAudioGuide: 'Iniciar audioguía',
    audioIntroBadge: '~30s audio',
    openStopLink: 'Abrir',
    viewFullPhoto: 'Ampliar foto',
    closeLabel: 'Cerrar',
    exploreGuide: 'Abrir Audioguía',
    backToAll: 'Todos los Monumentos',
    verifiedArchive: 'Archivo Verificado del Museo',
    eraLabel: 'Época',
    architectLabel: 'Maestro / Mecenas',
    dossierToggleOpen: 'Ver Dossier Histórico Verificado',
    dossierToggleClose: 'Ocultar Dossier',
    factsTab: 'Historia',
    architectureTab: 'Arquitectura',
    legendsTab: 'Leyendas',
    suggestedTitle: 'Preguntas Destacadas',
    inputPlaceholder: 'Pregunta cualquier cosa sobre este monumento...',
    snapButton: 'Foto y Pregunta',
    voiceListening: 'Escuchando...',
    voiceButton: 'Voz',
    voiceUnsupported: 'El dictado por voz no está disponible en este navegador; escribe tu pregunta abajo.',
    autoPlayAudio: 'Reproducción automática',
    audioPlay: 'Escuchar Audioguía',
    audioPause: 'Pausar',
    audioReplay: 'Repetir',
    audioVoiceTag: 'Audioguía',
    audioBrowserFallback: 'Voz del dispositivo',
    tapToListenHint: 'Toca para escuchar',
    thinkingMessage: 'Consultando el archivo oficial del museo de Jiva...',
    scanningPhoto: 'Identificando monumento...',
    visionDetectedBadge: 'Identificado por Snap & Ask Vision',
    switchDetectedLandmark: 'Abrir guía completa de',
    welcomePrefix:
      '¡Bienvenido! Pulsa el tour introductorio de 30 s arriba, toca una pregunta rápida o sube una foto de cualquier detalle.',
    photoAttached: 'Foto lista para enviar',
    removePhoto: 'Quitar',
    identifyingPhoto: 'Identificando monumento...',
    errorPrefix: 'Error de conexión:',
    retryButton: 'Reintentar',
    introTourButton: 'Tour introductorio de 30 s',
    introTourPrompt:
      'Dame un recorrido de audio introductorio de 30 segundos sobre este monumento, destacando sus datos históricos verificados más fascinantes y su leyenda local.',
    clearChat: 'Limpiar chat',
    copyButton: 'Copiar',
    copiedButton: 'Copiado',
    instantCacheLabel: 'Caché instantánea',
    verifiedSourceLabel: 'Gemini RAG',
    conversationHeading: 'Conversación con el Guía',
    stopLabel: 'Parada',
    audioGuidePill: 'Audioguía',
  },
};
