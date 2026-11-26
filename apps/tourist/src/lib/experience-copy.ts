import type { SupportedLanguage } from '@smartguide/shared';
import type { TravelVibe } from './experience';

interface ExperienceCopy {
  eyebrow: string;
  title: string;
  time: string;
  interests: string;
  chooseUpTo: string;
  durations: [string, string, string];
  vibes: Record<TravelVibe, string>;
  build: string;
  building: string;
  edit: string;
  yourWalk: string;
  curatedNote: string;
  minutes: string;
  why: string;
  highlight: string;
  recommendation: string;
  open: string;
  progress: string;
  feedback: string;
  ratings: [string, string, string];
  thanks: string;
  feedbackError: string;
  retry: string;
  buildError: string;
  promises: Record<string, string>;
}

export const EXPERIENCE_COPY: Record<SupportedLanguage, ExperienceCopy> = {
  en: {
    eyebrow: 'A WALK THAT FEELS LIKE YOU',
    title: 'Make the city your own.',
    time: 'How much time do you have?',
    interests: 'What draws you in?',
    chooseUpTo: 'Choose up to 3 interests',
    durations: ['1 hour', '2 hours', 'Half a day'],
    vibes: {
      legends: 'Legends & mysteries',
      photography: 'Photography & light',
      architecture: 'Architectural wonders',
      royalty: 'Khans & palace life',
      spiritual: 'Quiet & spiritual places',
    },
    build: 'Find my walk',
    building: 'Putting your walk together…',
    edit: 'Change my walk',
    yourWalk: 'Your personal city walk',
    curatedNote:
      'A suggested walk based on your interests. Visitor recommendations will appear as reviews arrive.',
    minutes: 'min',
    why: 'Why stop here',
    highlight: 'A visitor favourite',
    recommendation: 'interest score',
    open: 'Open the audio guide',
    progress: 'Your walk',
    feedback: 'How did this story feel?',
    ratings: ['Fascinating', 'Surprising', 'Not for me'],
    thanks: 'Thank you! Your reaction helps shape future walks.',
    feedbackError: 'Your reaction could not be saved. Please try again.',
    retry: 'Try again',
    buildError: 'We could not put your walk together. Please try again.',
    promises: {
      'kalta-minor': 'Turquoise tiles & an unfinished dream',
      'juma-mosque': 'Cool shade, carved wood & quiet light',
      'tosh-hovli': 'Royal courtyards & intricate blue tiles',
      'kunya-ark': 'Palace stories & a city within a city',
      'pahlavon-mahmud': 'Poetry, stillness & a turquoise dome',
    },
  },
  uz: {
    eyebrow: 'SIZGA MOS SAYR',
    title: 'Shaharni o‘zingizcha kashf eting.',
    time: 'Qancha vaqtingiz bor?',
    interests: 'Sizni nima qiziqtiradi?',
    chooseUpTo: '3 tagacha qiziqish tanlang',
    durations: ['1 soat', '2 soat', 'Yarim kun'],
    vibes: {
      legends: 'Afsonalar va sirlar',
      photography: 'Foto va go‘zallik',
      architecture: 'Me’morchilik mo‘jizalari',
      royalty: 'Xonlar va saroy hayoti',
      spiritual: 'Ruhiy xotirjamlik',
    },
    build: 'Menga mos sayrni topish',
    building: 'Sayringizni tuzyapmiz…',
    edit: 'Marshrutni o‘zgartirish',
    yourWalk: 'Shaxsiy shahar sayringiz',
    curatedNote:
      'Qiziqishlaringiz asosida tavsiya etilgan sayr. Sayyohlar baholari fikrlar yig‘ilgach paydo bo‘ladi.',
    minutes: 'daq',
    why: 'Nega bu yerga borish kerak',
    highlight: 'Sayyohlar yoqtirgan hikoya',
    recommendation: 'qiziqish balli',
    open: 'Ovozli gidni ochish',
    progress: 'Sizning sayringiz',
    feedback: 'Hikoya sizga qanday ta’sir qildi?',
    ratings: ['Juda qiziq', 'Hayratlanarli', 'Menga kerak emas'],
    thanks: 'Rahmat! Taassurotingiz kelgusi sayrlarni yaxshilaydi.',
    feedbackError: 'Bahoni saqlab bo‘lmadi. Qayta urinib ko‘ring.',
    retry: 'Qayta urinish',
    buildError: 'Sayrni tuzib bo‘lmadi. Qayta urinib ko‘ring.',
    promises: {
      'kalta-minor': 'Firuza koshinlar va tugallanmagan orzu',
      'juma-mosque': 'Salqin soya, o‘ymakor ustunlar va sokin nur',
      'tosh-hovli': 'Saroy hovlilari va nafis ko‘k koshinlar',
      'kunya-ark': 'Xonlar hikoyalari va shahar ichidagi shahar',
      'pahlavon-mahmud': 'She’riyat, sokinlik va firuza gumbaz',
    },
  },
  ru: {
    eyebrow: 'ПРОГУЛКА ПОД ТВОЁ НАСТРОЕНИЕ',
    title: 'Открой свою Хиву.',
    time: 'Сколько у тебя времени?',
    interests: 'Что тебя увлекает?',
    chooseUpTo: 'Выбери до 3 интересов',
    durations: ['1 час', '2 часа', 'Полдня'],
    vibes: {
      legends: 'Легенды и тайны',
      photography: 'Фотографии и свет',
      architecture: 'Чудеса архитектуры',
      royalty: 'Ханы и жизнь дворца',
      spiritual: 'Тишина и духовность',
    },
    build: 'Подобрать мою прогулку',
    building: 'Собираем твою прогулку…',
    edit: 'Изменить маршрут',
    yourWalk: 'Твоя личная прогулка',
    curatedNote:
      'Подобрали маршрут по твоим интересам. Рекомендации путешественников появятся после первых отзывов.',
    minutes: 'мин',
    why: 'Ради чего остановиться',
    highlight: 'Любимая история путешественников',
    recommendation: 'оценка интереса',
    open: 'Открыть аудиогид',
    progress: 'Твоя прогулка',
    feedback: 'Как тебе эта история?',
    ratings: ['Очень интересно', 'Удивительно', 'Не моё'],
    thanks: 'Спасибо! Твоё впечатление помогает улучшать следующие прогулки.',
    feedbackError: 'Не удалось сохранить впечатление. Попробуй ещё раз.',
    retry: 'Повторить',
    buildError: 'Не получилось составить маршрут. Попробуй ещё раз.',
    promises: {
      'kalta-minor': 'Бирюзовые узоры и незаконченная мечта',
      'juma-mosque': 'Прохлада, резные колонны и тихий свет',
      'tosh-hovli': 'Дворцовые дворы и тонкая синяя майолика',
      'kunya-ark': 'Истории ханов и город внутри города',
      'pahlavon-mahmud': 'Поэзия, тишина и бирюзовый купол',
    },
  },
  ja: {
    eyebrow: 'あなたらしい街歩き',
    title: '自分だけのヒヴァを見つけよう。',
    time: 'どのくらい時間がありますか？',
    interests: '何に心を惹かれますか？',
    chooseUpTo: '興味を3つまで選択',
    durations: ['1時間', '2時間', '半日'],
    vibes: {
      legends: '伝説と謎',
      photography: '写真と光',
      architecture: '建築の驚き',
      royalty: 'ハンと宮殿の暮らし',
      spiritual: '静けさと祈り',
    },
    build: '街歩きを見つける',
    building: '街歩きを準備しています…',
    edit: 'コースを変更',
    yourWalk: 'あなたの街歩き',
    curatedNote:
      '興味に合わせたおすすめコースです。旅行者の評価が集まると、おすすめの物語が表示されます。',
    minutes: '分',
    why: '立ち寄りたい理由',
    highlight: '旅行者に人気の物語',
    recommendation: '関心スコア',
    open: '音声ガイドを開く',
    progress: 'あなたのコース',
    feedback: 'この物語はいかがでしたか？',
    ratings: ['興味深い', '驚いた', '好みではない'],
    thanks: 'ありがとうございます！感想が次の街歩きに役立ちます。',
    feedbackError: '感想を保存できませんでした。もう一度お試しください。',
    retry: '再試行',
    buildError: 'コースを作成できませんでした。もう一度お試しください。',
    promises: {
      'kalta-minor': 'トルコ石のタイルと未完の夢',
      'juma-mosque': '涼しい木陰、彫刻の柱、静かな光',
      'tosh-hovli': '宮殿の中庭と繊細な青いタイル',
      'kunya-ark': 'ハンの物語と城壁の中の都市',
      'pahlavon-mahmud': '詩と静けさとトルコ石のドーム',
    },
  },
  ko: {
    eyebrow: '나를 닮은 산책',
    title: '나만의 히바를 발견하세요.',
    time: '시간은 얼마나 있으세요?',
    interests: '무엇에 마음이 끌리나요?',
    chooseUpTo: '관심사를 3개까지 선택하세요',
    durations: ['1시간', '2시간', '반나절'],
    vibes: {
      legends: '전설과 미스터리',
      photography: '사진과 빛',
      architecture: '놀라운 건축',
      royalty: '칸과 궁전의 생활',
      spiritual: '고요함과 영성',
    },
    build: '나만의 산책 찾기',
    building: '산책 코스를 만들고 있어요…',
    edit: '코스 변경',
    yourWalk: '나만의 도시 산책',
    curatedNote:
      '관심사에 맞춘 추천 코스입니다. 여행자들의 후기가 모이면 인기 있는 이야기가 표시됩니다.',
    minutes: '분',
    why: '이곳에 들르는 이유',
    highlight: '여행자들이 좋아한 이야기',
    recommendation: '관심도 점수',
    open: '오디오 가이드 열기',
    progress: '나의 산책',
    feedback: '이야기는 어떠셨나요?',
    ratings: ['흥미로워요', '놀라워요', '내 취향은 아니에요'],
    thanks: '감사합니다! 감상이 다음 여행자의 산책에 도움이 됩니다.',
    feedbackError: '감상을 저장하지 못했어요. 다시 시도해 주세요.',
    retry: '다시 시도',
    buildError: '코스를 만들지 못했어요. 다시 시도해 주세요.',
    promises: {
      'kalta-minor': '청록색 타일과 미완성의 꿈',
      'juma-mosque': '시원한 그늘, 조각 기둥, 고요한 빛',
      'tosh-hovli': '궁전의 안뜰과 섬세한 푸른 타일',
      'kunya-ark': '칸의 이야기와 성 안의 도시',
      'pahlavon-mahmud': '시와 고요함, 청록색 돔',
    },
  },
  es: {
    eyebrow: 'UN PASEO A TU MEDIDA',
    title: 'Descubre tu propia Jiva.',
    time: '¿De cuánto tiempo dispones?',
    interests: '¿Qué te inspira?',
    chooseUpTo: 'Elige hasta 3 intereses',
    durations: ['1 hora', '2 horas', 'Medio día'],
    vibes: {
      legends: 'Leyendas y misterios',
      photography: 'Fotografía y luz',
      architecture: 'Maravillas arquitectónicas',
      royalty: 'Kanes y vida de palacio',
      spiritual: 'Calma y espiritualidad',
    },
    build: 'Encontrar mi paseo',
    building: 'Preparando tu paseo…',
    edit: 'Cambiar el recorrido',
    yourWalk: 'Tu paseo personal',
    curatedNote:
      'Un paseo sugerido según tus intereses. Las recomendaciones de viajeros aparecerán cuando lleguen las primeras opiniones.',
    minutes: 'min',
    why: 'Por qué detenerte aquí',
    highlight: 'Una historia favorita',
    recommendation: 'puntuación de interés',
    open: 'Abrir la audioguía',
    progress: 'Tu recorrido',
    feedback: '¿Qué te pareció esta historia?',
    ratings: ['Fascinante', 'Sorprendente', 'No es para mí'],
    thanks: '¡Gracias! Tu reacción ayuda a mejorar los próximos paseos.',
    feedbackError: 'No se pudo guardar tu reacción. Inténtalo de nuevo.',
    retry: 'Reintentar',
    buildError: 'No pudimos preparar el paseo. Inténtalo de nuevo.',
    promises: {
      'kalta-minor': 'Azulejos turquesa y un sueño sin terminar',
      'juma-mosque': 'Sombra fresca, columnas talladas y luz serena',
      'tosh-hovli': 'Patios reales y delicados azulejos azules',
      'kunya-ark': 'Historias de kanes y una ciudad dentro de otra',
      'pahlavon-mahmud': 'Poesía, calma y una cúpula turquesa',
    },
  },
};
