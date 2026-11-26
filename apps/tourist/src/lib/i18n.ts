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
  mapTitle: string;
  mapSubtitle: string;
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
    heroEyebrow: 'Ichan-Qala Citadel · Khiva',
    heroTitle: 'Your Khiva Audio Guide',
    heroSubtitle:
      'Point your camera at any monument or pick a stop along the citadel walk.',
    tourMetaLabel: '5 UNESCO Stops · ~35 min walk · 6 Languages',
    verifiedTag: 'Museum Archive',
    snapAnyButton: 'Snap & Ask Any Monument',
    snapAnyHint: 'Camera or photo gallery',
    mapTitle: 'Citadel Walking Map',
    mapSubtitle: 'Tap any numbered monument inside Ichan-Qala',
    landmarksHeading: 'All 5 Monument Stops',
    routeSummary: 'West Gate → South Quarter',
    startHereBadge: '01 · Start Here',
    startAudioGuide: 'Listen Now',
    audioIntroBadge: '~30s audio',
    openStopLink: 'Listen',
    viewFullPhoto: 'Expand photo',
    closeLabel: 'Close',
    exploreGuide: 'Open Audio Guide',
    backToAll: 'All Monuments',
    verifiedArchive: 'Verified Archive',
    eraLabel: 'Period',
    architectLabel: 'Master / Patron',
    dossierToggleOpen: 'Museum Dossier & Verified Facts',
    dossierToggleClose: 'Hide Museum Dossier',
    factsTab: 'History',
    architectureTab: 'Architecture',
    legendsTab: 'Legends',
    suggestedTitle: 'Quick Questions',
    inputPlaceholder: 'Ask about this monument...',
    snapButton: 'Snap & Ask',
    voiceListening: 'Listening...',
    voiceButton: 'Voice',
    voiceUnsupported: 'Voice dictation is unavailable in this browser — please type below.',
    autoPlayAudio: 'Auto-play',
    audioPlay: 'Play Audio',
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
      'Tap "30-Second Intro Tour" above, pick a quick question, or upload a photo of any detail.',
    photoAttached: 'Photo ready',
    removePhoto: 'Remove',
    identifyingPhoto: 'Identifying monument...',
    errorPrefix: 'Connection issue:',
    retryButton: 'Retry',
    introTourButton: '30-Second Intro Tour',
    introTourPrompt:
      'Give me a vivid 30-second introductory audio tour of this monument, highlighting its most remarkable verified historical facts and local legend.',
    clearChat: 'Clear chat',
    copyButton: 'Copy',
    copiedButton: 'Copied',
    instantCacheLabel: 'Cached',
    verifiedSourceLabel: 'Gemini RAG',
    conversationHeading: 'Audio Guide',
    stopLabel: 'Stop',
    audioGuidePill: 'Audio Guide',
  },
  uz: {
    siteBadge: 'UNESCO · Xiva',
    heroEyebrow: "Ichan-Qal'a qal'asi · Xiva",
    heroTitle: 'Xiva Ovozli Gidi',
    heroSubtitle:
      "Binoni rasmga oling yoki qal'a bo'ylab marshrutdan kerakli obidani tanlang.",
    tourMetaLabel: '5 ta UNESCO obidasi · ~35 daqiqa · 6 til',
    verifiedTag: 'Muzey Arxivi',
    snapAnyButton: 'Rasmga olib obidani aniqlash',
    snapAnyHint: 'Kamera yoki galereya',
    mapTitle: "Qal'a bo'ylab xarita",
    mapSubtitle: "Ichan-Qal'a ichidagi raqamlangan obidani bosing",
    landmarksHeading: 'Barcha 5 ta obida',
    routeSummary: "G'arbiy darvozadan janubga",
    startHereBadge: '01 · Boshlash nuqtasi',
    startAudioGuide: 'Tinglash',
    audioIntroBadge: '~30s audio',
    openStopLink: 'Tinglash',
    viewFullPhoto: 'Kattalashtirish',
    closeLabel: 'Yopish',
    exploreGuide: 'Gidni ochish',
    backToAll: 'Barcha obidalar',
    verifiedArchive: 'Tasdiqlangan arxiv',
    eraLabel: 'Davr',
    architectLabel: "Me'mor / Homiy",
    dossierToggleOpen: "Tasdiqlangan tarixiy pasportni ko'rish",
    dossierToggleClose: 'Tarixiy pasportni yopish',
    factsTab: 'Tarix',
    architectureTab: "Me'morchilik",
    legendsTab: 'Afsonalar',
    suggestedTitle: 'Tezkor savollar',
    inputPlaceholder: "Obida haqida so'rang...",
    snapButton: 'Rasm + Savol',
    voiceListening: 'Tinglayapman...',
    voiceButton: 'Ovoz',
    voiceUnsupported: "Bu brauzerda ovozli kiritish ishlamaydi — matn yozing.",
    autoPlayAudio: 'Avto-ovoz',
    audioPlay: 'Tinglash',
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
      "Yuqoridagi 30 soniyalik kirish ekskursiyasini bosing, tezkor savolni tanlang yoki rasmga oling.",
    photoAttached: 'Rasm tayyor',
    removePhoto: "O'chirish",
    identifyingPhoto: 'Obida aniqlanmoqda...',
    errorPrefix: 'Ulanish xatosi:',
    retryButton: 'Qayta',
    introTourButton: '30 soniyalik kirish ekskursiyasi',
    introTourPrompt:
      "Ushbu obida haqida eng qiziqarli tasdiqlangan tarixiy faktlar va mahalliy afsonani o'z ichiga olgan 30 soniyalik jonli kirish ekskursiyasini aytib bering.",
    clearChat: 'Tozalash',
    copyButton: 'Nusxalash',
    copiedButton: 'Nusxalandi',
    instantCacheLabel: 'Kesh',
    verifiedSourceLabel: 'Gemini RAG',
    conversationHeading: 'Ovozli gid',
    stopLabel: 'Bekat',
    audioGuidePill: 'Ovozli gid',
  },
  ru: {
    siteBadge: 'ЮНЕСКО · Хива',
    heroEyebrow: 'Цитадель Ичан-Кала · Хива',
    heroTitle: 'Аудиогид по Хиве',
    heroSubtitle:
      'Наведите камеру на памятник или выберите остановку на карте маршрута.',
    tourMetaLabel: '5 объектов ЮНЕСКО · ~35 мин прогулки · 6 языков',
    verifiedTag: 'Архив музея',
    snapAnyButton: 'Сфотографировать памятник',
    snapAnyHint: 'Камера или галерея',
    mapTitle: 'Карта маршрута по крепости',
    mapSubtitle: 'Нажмите на любой номер памятника внутри Ичан-Калы',
    landmarksHeading: 'Все 5 остановок маршрута',
    routeSummary: 'От Западных ворот на юг',
    startHereBadge: '01 · Начать здесь',
    startAudioGuide: 'Слушать гид',
    audioIntroBadge: '~30 сек',
    openStopLink: 'Слушать',
    viewFullPhoto: 'Увеличить фото',
    closeLabel: 'Закрыть',
    exploreGuide: 'Открыть аудиогид',
    backToAll: 'Все памятники',
    verifiedArchive: 'Проверенный архив',
    eraLabel: 'Эпоха',
    architectLabel: 'Зодчий / Заказчик',
    dossierToggleOpen: 'Открыть музейное досье',
    dossierToggleClose: 'Скрыть музейное досье',
    factsTab: 'История',
    architectureTab: 'Архитектура',
    legendsTab: 'Легенды',
    suggestedTitle: 'Быстрые вопросы',
    inputPlaceholder: 'Спросить о памятнике...',
    snapButton: 'Фото + Вопрос',
    voiceListening: 'Слушаю...',
    voiceButton: 'Голос',
    voiceUnsupported: 'Голосовой ввод недоступен в этом браузере — введите текст.',
    autoPlayAudio: 'Автозвук',
    audioPlay: 'Слушать',
    audioPause: 'Пауза',
    audioReplay: 'Повтор',
    audioVoiceTag: 'Аудиогид',
    audioBrowserFallback: 'Голос устройства',
    tapToListenHint: 'Нажмите для звука',
    thinkingMessage: 'Проверяю официальный архив музея Хивы...',
    scanningPhoto: 'Определяем памятник...',
    visionDetectedBadge: 'Определено через Snap & Ask Vision',
    switchDetectedLandmark: 'Открыть полный гид по',
    welcomePrefix:
      'Запустите 30-секундную вводную экскурсию выше, выберите быстрый вопрос или сделайте фото.',
    photoAttached: 'Фото готово',
    removePhoto: 'Удалить',
    identifyingPhoto: 'Определяем памятник...',
    errorPrefix: 'Ошибка связи:',
    retryButton: 'Повторить',
    introTourButton: '30-секундная вводная экскурсия',
    introTourPrompt:
      'Проведи яркую 30-секундную вводную аудиоэкскурсию по этому памятнику: назови главные проверенные факты из истории и самую известную местную легенду.',
    clearChat: 'Очистить',
    copyButton: 'Копировать',
    copiedButton: 'Готово',
    instantCacheLabel: 'Кэш',
    verifiedSourceLabel: 'Gemini RAG',
    conversationHeading: 'Аудиогид',
    stopLabel: 'Объект',
    audioGuidePill: 'Аудиогид',
  },
  ja: {
    siteBadge: 'ユネスコ · ヒヴァ',
    heroEyebrow: 'イチャン・カラ城塞 · ヒヴァ',
    heroTitle: 'ヒヴァ音声ガイド',
    heroSubtitle:
      'カメラで建造物を撮影するか、下の城内マップから名所をお選びください。',
    tourMetaLabel: 'ユネスコ5名所 · 徒歩約35分 · 6言語',
    verifiedTag: '博物館アーカイブ',
    snapAnyButton: '写真を撮って建造物を認識',
    snapAnyHint: 'カメラまたは写真を選択',
    mapTitle: '城内ウォーキングマップ',
    mapSubtitle: 'イチャン・カラ内の番号をタップしてください',
    landmarksHeading: '全5スポット一覧',
    routeSummary: '西門から南区画へ',
    startHereBadge: '01 · ここから開始',
    startAudioGuide: '音声を聴く',
    audioIntroBadge: '約30秒',
    openStopLink: '聴く',
    viewFullPhoto: '拡大表示',
    closeLabel: '閉じる',
    exploreGuide: '音声ガイドを開く',
    backToAll: '名所一覧',
    verifiedArchive: '公式アーカイブ',
    eraLabel: '建造年代',
    architectLabel: '建築家・創建者',
    dossierToggleOpen: '公式歴史資料を見る',
    dossierToggleClose: '歴史資料を閉じる',
    factsTab: '歴史',
    architectureTab: '建築',
    legendsTab: '伝説',
    suggestedTitle: 'おすすめの質問',
    inputPlaceholder: 'この建造物について質問...',
    snapButton: '写真で質問',
    voiceListening: '聞き取り中...',
    voiceButton: '音声',
    voiceUnsupported: 'このブラウザは音声入力に対応していません。テキストでご入力ください。',
    autoPlayAudio: '自動再生',
    audioPlay: '再生する',
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
      '上の「30秒イントロツアー」をタップするか、質問・写真撮影でお尋ねください。',
    photoAttached: '写真添付済み',
    removePhoto: '削除',
    identifyingPhoto: '建造物を認識中...',
    errorPrefix: '通信エラー:',
    retryButton: '再試行',
    introTourButton: '30秒イントロツアー',
    introTourPrompt:
      'この建造物について、最も重要な公式歴史事実と地元の伝説を交えた30秒間の分かりやすい導入ツアーを行ってください。',
    clearChat: 'クリア',
    copyButton: 'コピー',
    copiedButton: '完了',
    instantCacheLabel: 'キャッシュ',
    verifiedSourceLabel: 'Gemini RAG',
    conversationHeading: '音声ガイド',
    stopLabel: 'スポット',
    audioGuidePill: '音声ガイド',
  },
  ko: {
    siteBadge: '유네스코 · 히바',
    heroEyebrow: '이찬 칼라 성채 · 히바',
    heroTitle: '히바 오디오 가이드',
    heroSubtitle:
      '유적지를 촬영하거나 아래 성채 지도에서 원하는 코스를 선택하세요.',
    tourMetaLabel: '유네스코 5대 명소 · 도보 약 35분 · 6개 언어',
    verifiedTag: '박물관 아카이브',
    snapAnyButton: '사진 찍고 유적지 인식',
    snapAnyHint: '카메라 또는 갤러리 선택',
    mapTitle: '이찬 칼라 도보 지도',
    mapSubtitle: '성채 안의 번호 핀을 눌러 유적지를 살펴보세요',
    landmarksHeading: '전체 5개 코스',
    routeSummary: '서문에서 남쪽 구역까지',
    startHereBadge: '01 · 여기서 시작',
    startAudioGuide: '오디오 듣기',
    audioIntroBadge: '약 30초',
    openStopLink: '듣기',
    viewFullPhoto: '사진 확대',
    closeLabel: '닫기',
    exploreGuide: '오디오 가이드 열기',
    backToAll: '전체 유적지',
    verifiedArchive: '공식 아카이브',
    eraLabel: '건립 시기',
    architectLabel: '건축가 / 건립자',
    dossierToggleOpen: '공식 역사 자료 보기',
    dossierToggleClose: '역사 자료 닫기',
    factsTab: '역사',
    architectureTab: '건축',
    legendsTab: '전설',
    suggestedTitle: '추천 질문',
    inputPlaceholder: '이 유적지에 대해 질문...',
    snapButton: '사진 질문',
    voiceListening: '듣는 중...',
    voiceButton: '음성',
    voiceUnsupported: '이 브라우저에서는 음성 인식을 지원하지 않습니다.',
    autoPlayAudio: '자동 재생',
    audioPlay: '듣기',
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
      '위의 30초 소개 투어를 누르거나 추천 질문·사진 촬영으로 탐색해 보세요.',
    photoAttached: '사진 첨부됨',
    removePhoto: '삭제',
    identifyingPhoto: '유적지 인식 중...',
    errorPrefix: '연결 오류:',
    retryButton: '재시도',
    introTourButton: '30초 소개 투어',
    introTourPrompt:
      '이 유적지의 가장 핵심적인 공식 역사 사실과 대표적인 현지 전설을 담아 생생한 30초 오디오 소개 투어를 들려주세요.',
    clearChat: '지우기',
    copyButton: '복사',
    copiedButton: '완료',
    instantCacheLabel: '캐시',
    verifiedSourceLabel: 'Gemini RAG',
    conversationHeading: '오디오 가이드',
    stopLabel: '명소',
    audioGuidePill: '오디오 가이드',
  },
  es: {
    siteBadge: 'UNESCO · Jiva',
    heroEyebrow: 'Ciudadela Ichan-Qala · Jiva',
    heroTitle: 'Audioguía de Jiva',
    heroSubtitle:
      'Fotografía cualquier monumento o toca una parada en el mapa de la ciudadela.',
    tourMetaLabel: '5 paradas UNESCO · ~35 min a pie · 6 idiomas',
    verifiedTag: 'Archivo del Museo',
    snapAnyButton: 'Fotografiar monumento',
    snapAnyHint: 'Cámara o galería',
    mapTitle: 'Mapa interactivo de la ruta',
    mapSubtitle: 'Toca cualquier parada numerada dentro de Ichan-Qala',
    landmarksHeading: 'Las 5 paradas del recorrido',
    routeSummary: 'Puerta Oeste → Barrio Sur',
    startHereBadge: '01 · Empezar aquí',
    startAudioGuide: 'Escuchar ahora',
    audioIntroBadge: '~30s',
    openStopLink: 'Escuchar',
    viewFullPhoto: 'Ampliar foto',
    closeLabel: 'Cerrar',
    exploreGuide: 'Abrir Audioguía',
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
    inputPlaceholder: 'Pregunta sobre este lugar...',
    snapButton: 'Foto y Pregunta',
    voiceListening: 'Escuchando...',
    voiceButton: 'Voz',
    voiceUnsupported: 'El dictado por voz no está disponible en este navegador.',
    autoPlayAudio: 'Autoplay',
    audioPlay: 'Escuchar',
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
      'Pulsa el tour de 30 s arriba, elige una pregunta o sube una foto de cualquier detalle.',
    photoAttached: 'Foto lista',
    removePhoto: 'Quitar',
    identifyingPhoto: 'Identificando monumento...',
    errorPrefix: 'Error de conexión:',
    retryButton: 'Reintentar',
    introTourButton: 'Tour introductorio de 30 s',
    introTourPrompt:
      'Dame un recorrido de audio introductorio de 30 segundos sobre este monumento, destacando sus datos históricos verificados más fascinantes y su leyenda local.',
    clearChat: 'Limpiar',
    copyButton: 'Copiar',
    copiedButton: 'Listo',
    instantCacheLabel: 'Caché',
    verifiedSourceLabel: 'Gemini RAG',
    conversationHeading: 'Audioguía',
    stopLabel: 'Parada',
    audioGuidePill: 'Audioguía',
  },
};
