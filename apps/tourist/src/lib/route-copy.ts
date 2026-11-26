import type { SupportedLanguage } from '@smartguide/shared';

interface RouteCopy {
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  start: string;
  noAccount: string;
  route: string;
  stops: string;
  map: string;
  hideMap: string;
  cameraTitle: string;
  cameraDescription: string;
  guideEyebrow: string;
  listen: string;
  transcript: string;
  questions: string;
  questionsHint: string;
  next: string;
  finish: string;
  language: string;
  speed: string;
  progress: string;
  send: string;
  connecting: string;
  photoError: string;
  requestError: string;
  source: string;
  photoAlt: string;
  playHint: string;
}

export const ROUTE_COPY: Record<SupportedLanguage, RouteCopy> = {
  en: {
    eyebrow: 'KHIVA, AT YOUR OWN PACE',
    title: 'Five places.',
    titleAccent: 'A thousand stories.',
    description:
      'Wander the old city with a personal guide in your pocket. Pick a place. Listen. Look a little closer.',
    start: 'Start your walk',
    noAccount: '6 languages · No sign-up',
    route: 'Your city walk',
    stops: '5 stops',
    map: 'See the map',
    hideMap: 'Hide the map',
    cameraTitle: 'What am I looking at?',
    cameraDescription: 'Take a photo. Discover its story.',
    guideEyebrow: 'A STORY WORTH STOPPING FOR',
    listen: 'Listen to the story',
    transcript: 'Read the story',
    questions: 'Look a little closer',
    questionsHint: 'Every detail has a story. Ask your guide.',
    next: 'Next stop',
    finish: 'Back to your walk',
    language: 'Guide language',
    speed: 'Playback speed',
    progress: 'Audio progress',
    send: 'Send question',
    connecting: 'The city’s stories are taking a little longer to arrive.',
    photoError: 'We could not open this photo. Try another image.',
    requestError: 'Your guide is temporarily unavailable. Please try again.',
    source: 'Stories from the museum archive',
    photoAlt: 'Your monument photo',
    playHint: 'Tap to listen using your device’s voice.',
  },
  uz: {
    eyebrow: 'XIVA, O‘Z MAROMINGIZDA',
    title: 'Besh manzil.',
    titleAccent: 'Ming bir hikoya.',
    description:
      'Cho‘ntagingizdagi shaxsiy gid bilan qadimiy shaharni kezing. Manzilni tanlang. Tinglang. Yaqinroq nazar soling.',
    start: 'Sayrni boshlash',
    noAccount: '6 til · Ro‘yxatdan o‘tishsiz',
    route: 'Shahar bo‘ylab sayringiz',
    stops: '5 ta manzil',
    map: 'Xaritani ochish',
    hideMap: 'Xaritani yopish',
    cameraTitle: 'Bu qanday obida?',
    cameraDescription: 'Rasmga oling. Hikoyasini tinglang.',
    guideEyebrow: 'TO‘XTAB TINGLASHGA ARZIYDIGAN HIKOYA',
    listen: 'Hikoyani tinglash',
    transcript: 'Hikoyani o‘qish',
    questions: 'Yaqinroq nazar soling',
    questionsHint: 'Har bir naqshning hikoyasi bor. Giddan so‘rang.',
    next: 'Keyingi manzil',
    finish: 'Sayrga qaytish',
    language: 'Gid tili',
    speed: 'Tinglash tezligi',
    progress: 'Audio jarayoni',
    send: 'Savolni yuborish',
    connecting: 'Shahar hikoyalariga ulanish biroz cho‘zildi.',
    photoError: 'Rasmni ochib bo‘lmadi. Boshqa rasmni tanlang.',
    requestError: 'Gid vaqtincha javob bera olmayapti. Qayta urinib ko‘ring.',
    source: 'Muzey arxividan hikoyalar',
    photoAlt: 'Siz yuklagan obida rasmi',
    playHint: 'Qurilma ovozida tinglash uchun bosing.',
  },
  ru: {
    eyebrow: 'ХИВА В ТВОЁМ ТЕМПЕ',
    title: 'Пять мест.',
    titleAccent: 'Тысяча историй.',
    description:
      'Прогулка по старому городу с личным гидом в кармане. Выбери место. Послушай. Присмотрись к деталям.',
    start: 'Начать прогулку',
    noAccount: '6 языков · Без регистрации',
    route: 'Твоя прогулка по Хиве',
    stops: '5 остановок',
    map: 'Открыть карту',
    hideMap: 'Скрыть карту',
    cameraTitle: 'Что передо мной?',
    cameraDescription: 'Сфотографируй — гид расскажет.',
    guideEyebrow: 'ИСТОРИЯ, РАДИ КОТОРОЙ СТОИТ ОСТАНОВИТЬСЯ',
    listen: 'Слушать историю',
    transcript: 'Прочитать историю',
    questions: 'Присмотрись к деталям',
    questionsHint: 'У каждого узора своя история. Спроси гида.',
    next: 'Следующая остановка',
    finish: 'Вернуться к прогулке',
    language: 'Язык аудиогида',
    speed: 'Скорость воспроизведения',
    progress: 'Прогресс аудио',
    send: 'Отправить вопрос',
    connecting: 'Истории города загружаются чуть дольше обычного.',
    photoError: 'Не удалось открыть фото. Попробуй другое изображение.',
    requestError: 'Гид временно недоступен. Попробуй ещё раз.',
    source: 'Истории из музейного архива',
    photoAlt: 'Твоё фото памятника',
    playHint: 'Нажми, чтобы послушать голосом устройства.',
  },
  ja: {
    eyebrow: '自分のペースで、ヒヴァを歩く',
    title: '5つの名所。',
    titleAccent: '千の物語。',
    description:
      'ポケットの中のガイドと旧市街へ。名所を選び、物語を聴き、細部に目を向けてみましょう。',
    start: '街歩きを始める',
    noAccount: '6言語・登録不要',
    route: 'ヒヴァの街歩き',
    stops: '5つのスポット',
    map: '地図を見る',
    hideMap: '地図を閉じる',
    cameraTitle: '目の前の建物は何？',
    cameraDescription: '写真を撮って、物語を聴こう。',
    guideEyebrow: '足を止めて聴きたい物語',
    listen: '物語を聴く',
    transcript: '物語を読む',
    questions: '細部を見つめてみよう',
    questionsHint:
      '模様のひとつひとつに物語があります。ガイドに聞いてみましょう。',
    next: '次のスポット',
    finish: '街歩きに戻る',
    language: 'ガイドの言語',
    speed: '再生速度',
    progress: '再生位置',
    send: '質問を送る',
    connecting: '街の物語を読み込むのに少し時間がかかっています。',
    photoError: '写真を開けませんでした。別の画像をお試しください。',
    requestError: 'ガイドに接続できません。もう一度お試しください。',
    source: '博物館の記録から生まれる物語',
    photoAlt: 'アップロードした建造物の写真',
    playHint: 'タップすると端末の音声で再生します。',
  },
  ko: {
    eyebrow: '나만의 속도로 걷는 히바',
    title: '다섯 명소.',
    titleAccent: '천 가지 이야기.',
    description:
      '주머니 속 나만의 가이드와 구시가지를 걸어보세요. 명소를 고르고, 이야기를 듣고, 작은 디테일까지 살펴보세요.',
    start: '산책 시작하기',
    noAccount: '6개 언어 · 가입 없이',
    route: '히바 산책 코스',
    stops: '5개 명소',
    map: '지도 보기',
    hideMap: '지도 닫기',
    cameraTitle: '눈앞의 건물은 무엇일까요?',
    cameraDescription: '사진을 찍고 이야기를 들어보세요.',
    guideEyebrow: '발걸음을 멈추게 하는 이야기',
    listen: '이야기 듣기',
    transcript: '이야기 읽기',
    questions: '자세히 들여다보세요',
    questionsHint: '작은 문양에도 이야기가 있습니다. 가이드에게 물어보세요.',
    next: '다음 명소',
    finish: '산책 코스로 돌아가기',
    language: '가이드 언어',
    speed: '재생 속도',
    progress: '오디오 재생 위치',
    send: '질문 보내기',
    connecting: '도시의 이야기를 불러오는 데 조금 더 시간이 걸리네요.',
    photoError: '사진을 열 수 없습니다. 다른 이미지를 선택해 주세요.',
    requestError: '가이드에 연결할 수 없습니다. 다시 시도해 주세요.',
    source: '박물관 기록에서 만나는 이야기',
    photoAlt: '업로드한 유적지 사진',
    playHint: '눌러서 기기 음성으로 들어보세요.',
  },
  es: {
    eyebrow: 'JIVA, A TU RITMO',
    title: 'Cinco lugares.',
    titleAccent: 'Mil historias.',
    description:
      'Pasea por la ciudad antigua con un guía en el bolsillo. Elige un lugar. Escucha. Descubre cada detalle.',
    start: 'Empezar el paseo',
    noAccount: '6 idiomas · Sin registro',
    route: 'Tu paseo por Jiva',
    stops: '5 paradas',
    map: 'Ver el mapa',
    hideMap: 'Cerrar el mapa',
    cameraTitle: '¿Qué tengo delante?',
    cameraDescription: 'Haz una foto. Descubre su historia.',
    guideEyebrow: 'UNA HISTORIA PARA DETENERSE',
    listen: 'Escuchar la historia',
    transcript: 'Leer la historia',
    questions: 'Mira más de cerca',
    questionsHint: 'Cada detalle tiene una historia. Pregunta a tu guía.',
    next: 'Siguiente parada',
    finish: 'Volver al paseo',
    language: 'Idioma del guía',
    speed: 'Velocidad de reproducción',
    progress: 'Progreso del audio',
    send: 'Enviar pregunta',
    connecting:
      'Las historias de la ciudad están tardando un poco más en llegar.',
    photoError: 'No pudimos abrir la foto. Prueba con otra imagen.',
    requestError:
      'Tu guía no está disponible por el momento. Inténtalo de nuevo.',
    source: 'Historias del archivo del museo',
    photoAlt: 'Tu foto del monumento',
    playHint: 'Toca para escuchar con la voz de tu dispositivo.',
  },
};

export const MAP_GATES: Record<
  SupportedLanguage,
  { west: string; east: string }
> = {
  en: { west: 'WEST GATE', east: 'EAST GATE' },
  uz: { west: 'G‘ARBIY DARVOZA', east: 'SHARQIY DARVOZA' },
  ru: { west: 'ЗАПАДНЫЕ ВОРОТА', east: 'ВОСТОЧНЫЕ ВОРОТА' },
  ja: { west: '西門', east: '東門' },
  ko: { west: '서문', east: '동문' },
  es: { west: 'PUERTA OESTE', east: 'PUERTA ESTE' },
};
