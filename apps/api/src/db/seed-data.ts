import type { SupportedLanguage } from '@smartguide/shared';

export interface SeedInteractionSpec {
  landmarkSlug: string;
  language: SupportedLanguage;
  question: string;
  answerPreview: string;
  hasImage: boolean;
  identifiedByVision: boolean;
  sessionId: string;
  hoursAgo: number;
  responseTimeMs: number;
}

/**
 * Realistic initial Ichan-Qala tourist interactions seeded into PostgreSQL
 * on first boot so the B2B Museum Dashboard immediately displays rich,
 * pitch-ready real-time telemetry across all 5 landmarks and 6 languages.
 */
export const INITIAL_ANALYTICS_SEED: SeedInteractionSpec[] = [
  // Kalta Minor — highest traffic (right at West Gate / Ata-Darvoza)
  {
    landmarkSlug: 'kalta-minor',
    language: 'en',
    question: 'Why is Kalta Minor unfinished?',
    answerPreview:
      'Construction began in 1851 under Muhammad Amin Khan to reach 70–80 meters, but halted abruptly at 29 meters in 1855 after the Khan died in battle near Serakhs.',
    hasImage: true,
    identifiedByVision: true,
    sessionId: 'sess-uk-01',
    hoursAgo: 15.2,
    responseTimeMs: 1120,
  },
  {
    landmarkSlug: 'kalta-minor',
    language: 'en',
    question: 'Tell me the local legend about the architect',
    answerPreview:
      'According to Khivan folklore, the Emir of Bukhara bribed the master architect to build an even taller tower; warned of the Khan’s wrath, the architect fled overnight.',
    hasImage: false,
    identifiedByVision: false,
    sessionId: 'sess-uk-01',
    hoursAgo: 15.1,
    responseTimeMs: 980,
  },
  {
    landmarkSlug: 'kalta-minor',
    language: 'ja',
    question: 'なぜカルタ・ミノルは未完成のままなのですか？',
    answerPreview:
      '1851年にムハンマド・アミン・ハンが70〜80メートルの高さを目指して着工しましたが、1855年の戦死により29メートルで工事が中断されました。',
    hasImage: true,
    identifiedByVision: true,
    sessionId: 'sess-jp-01',
    hoursAgo: 14.4,
    responseTimeMs: 1240,
  },
  {
    landmarkSlug: 'kalta-minor',
    language: 'ja',
    question: 'タイルのカリグラフィーは誰が書いたのですか？',
    answerPreview:
      '上部のペルシャ語詩文は19世紀ホラズムの名詩人・歴史家ムハンマド・リザ・アガヒによって詠まれました。',
    hasImage: false,
    identifiedByVision: false,
    sessionId: 'sess-jp-01',
    hoursAgo: 14.3,
    responseTimeMs: 950,
  },
  {
    landmarkSlug: 'kalta-minor',
    language: 'ko',
    question: '칼타 미노르의 기초 깊이는 얼마나 되나요?',
    answerPreview:
      '원래 70m 이상을 지탱하기 위해 지름 14.2m의 원형 기단 아래 약 15m 깊이로 지진 완충 목재와 갈대층을 깔아 세웠습니다.',
    hasImage: true,
    identifiedByVision: true,
    sessionId: 'sess-kr-01',
    hoursAgo: 13.6,
    responseTimeMs: 1180,
  },
  {
    landmarkSlug: 'kalta-minor',
    language: 'ru',
    question: 'Кто изготовил бирюзовую майолику Кальта-Минора?',
    answerPreview:
      'Изразцы из бирюзы, кобальта и белого глянца создал легендарный мастер Абдулла, прозванный «Абдулла Джин» за филигранное искусство.',
    hasImage: false,
    identifiedByVision: false,
    sessionId: 'sess-ru-01',
    hoursAgo: 12.8,
    responseTimeMs: 890,
  },
  {
    landmarkSlug: 'kalta-minor',
    language: 'es',
    question: '¿Por qué quedó inacabado Kalta Minor?',
    answerPreview:
      'Muhammad Amin Khan inició la obra en 1851 para alcanzar hasta 80 metros, pero tras morir en batalla en 1855 la torre quedó en 29 metros.',
    hasImage: true,
    identifiedByVision: true,
    sessionId: 'sess-es-01',
    hoursAgo: 11.5,
    responseTimeMs: 1090,
  },
  {
    landmarkSlug: 'kalta-minor',
    language: 'uz',
    question: 'Kalta Minor nega oxirigacha qurilmagan?',
    answerPreview:
      '1851-yilda Muhammad Aminxon 70–80 metr balandlikda qurishni buyurgan, biroq 1855-yilda Saraxs yaqinidagi jangda halok bo‘lgach, qurilish 29 metrda to‘xtagan.',
    hasImage: false,
    identifiedByVision: false,
    sessionId: 'sess-uz-01',
    hoursAgo: 10.7,
    responseTimeMs: 860,
  },
  {
    landmarkSlug: 'kalta-minor',
    language: 'en',
    question: 'Could you really see Bukhara from the top?',
    answerPreview:
      'Local legend says Muhammad Amin Khan dreamed of gazing toward rival Bukhara 400 km away, symbolizing Khiva’s ambition across the Kyzylkum Desert.',
    hasImage: false,
    identifiedByVision: false,
    sessionId: 'sess-us-02',
    hoursAgo: 9.4,
    responseTimeMs: 910,
  },
  {
    landmarkSlug: 'kalta-minor',
    language: 'ja',
    question: '建築家にまつわる地元の伝説を教えてください',
    answerPreview:
      'ブハラのアミールがさらに高い塔を建てるよう建築家を招こうとしたため、処刑を恐れた名工が一夜にして翼を作り脱出したと伝えられています。',
    hasImage: true,
    identifiedByVision: true,
    sessionId: 'sess-jp-02',
    hoursAgo: 8.2,
    responseTimeMs: 1210,
  },
  {
    landmarkSlug: 'kalta-minor',
    language: 'ko',
    question: '칼타 미노르가 미완성으로 남은 이유는 무엇인가요?',
    answerPreview:
      '1855년 무함마드 아민 칸이 세락스 전투에서 전사하면서 거대한 공사가 중단되었고, 29m 높이의 청록색 탑으로 남았습니다.',
    hasImage: false,
    identifiedByVision: false,
    sessionId: 'sess-kr-02',
    hoursAgo: 6.9,
    responseTimeMs: 930,
  },
  {
    landmarkSlug: 'kalta-minor',
    language: 'en',
    question: 'How did the muezzin enter the minaret originally?',
    answerPreview:
      'An arched wooden bridge connected the second floor of Muhammad Amin Khan Madrasah straight into an elevated doorway inside the minaret.',
    hasImage: true,
    identifiedByVision: true,
    sessionId: 'sess-de-03',
    hoursAgo: 4.5,
    responseTimeMs: 1050,
  },
  {
    landmarkSlug: 'kalta-minor',
    language: 'es',
    question: '¿Qué significa el nombre Kalta Minor?',
    answerPreview:
      'En uzbeko significa «Minarete Corto», un apodo irónico porque fue concebido como la torre más alta de Asia Central y quedó en 29 metros.',
    hasImage: false,
    identifiedByVision: false,
    sessionId: 'sess-es-02',
    hoursAgo: 2.3,
    responseTimeMs: 880,
  },
  {
    landmarkSlug: 'kalta-minor',
    language: 'ja',
    question: 'この青いタイルはなぜ170年以上も色あせないのですか？',
    answerPreview:
      '名工アブドゥッラ・ジンが砂漠の植物灰（イシュコル）とコバルト顔料を調合した伝統釉薬で焼き上げたため、今も鮮やかな輝きを保っています。',
    hasImage: true,
    identifiedByVision: true,
    sessionId: 'sess-jp-03',
    hoursAgo: 0.9,
    responseTimeMs: 1140,
  },
  {
    landmarkSlug: 'kalta-minor',
    language: 'en',
    question: 'What is the diameter of the base?',
    answerPreview:
      'Its circular brick base measures an extraordinary 14.2 meters in diameter, with walls over 3 meters thick at ground level.',
    hasImage: false,
    identifiedByVision: false,
    sessionId: 'sess-fr-04',
    hoursAgo: 0.3,
    responseTimeMs: 820,
  },

  // Juma Mosque — #2 popularity
  {
    landmarkSlug: 'juma-mosque',
    language: 'en',
    question: 'How many wooden columns are in Juma Mosque and how old are the oldest ones?',
    answerPreview:
      'There are 213 carved wooden columns inside: 4 rare columns date to the 10th–11th centuries, 17 to the 12th–15th centuries, and the rest to the 18th–19th centuries.',
    hasImage: true,
    identifiedByVision: true,
    sessionId: 'sess-uk-01',
    hoursAgo: 14.6,
    responseTimeMs: 1150,
  },
  {
    landmarkSlug: 'juma-mosque',
    language: 'ja',
    question: 'なぜジュマ・モスクにはドームや大きな中庭がないのですか？',
    answerPreview:
      '10世紀に記録されたアラビア式の多柱建築（ヒポスタイル）様式を継承し、55m×46mの平屋根を213本の木柱で支える極めて珍しい構造だからです。',
    hasImage: true,
    identifiedByVision: true,
    sessionId: 'sess-jp-01',
    hoursAgo: 13.8,
    responseTimeMs: 1220,
  },
  {
    landmarkSlug: 'juma-mosque',
    language: 'ko',
    question: '여름 더위 속에서도 모스크 안이 시원한 비결은 무엇인가요?',
    answerPreview:
      '평지붕에 뚫린 두 개의 천창이 자연 채광과 대류 환기 통로 역할을 하여, 한여름에도 바깥보다 10도 이상 시원하게 유지됩니다.',
    hasImage: false,
    identifiedByVision: false,
    sessionId: 'sess-kr-01',
    hoursAgo: 12.9,
    responseTimeMs: 940,
  },
  {
    landmarkSlug: 'juma-mosque',
    language: 'ru',
    question: 'Из какого дерева вырезаны 213 колонн мечети Джума?',
    answerPreview:
      'Мастера использовали прочный чёрный карагач (гуджум) и тополь, устанавливая колонны на каменные базы для защиты от почвенной соли.',
    hasImage: false,
    identifiedByVision: false,
    sessionId: 'sess-ru-02',
    hoursAgo: 11.2,
    responseTimeMs: 890,
  },
  {
    landmarkSlug: 'juma-mosque',
    language: 'es',
    question: '¿Cómo se escuchaba al imán sin micrófonos?',
    answerPreview:
      'El techo bajo de vigas de madera y la cuadrícula de columnas cada 3,15 metros crean una acústica natural que proyecta la voz por toda la sala.',
    hasImage: false,
    identifiedByVision: false,
    sessionId: 'sess-es-01',
    hoursAgo: 10.4,
    responseTimeMs: 920,
  },
  {
    landmarkSlug: 'juma-mosque',
    language: 'uz',
    question: 'Juma masjidi qachon qayta tiklangan?',
    answerPreview:
      '1788–1789-yillarda Avaz Inoq davrida xivalik davlat arbobi Abdurahmon Mehtar mablag‘i hisobidan qayta qurilgan.',
    hasImage: false,
    identifiedByVision: false,
    sessionId: 'sess-uz-02',
    hoursAgo: 8.8,
    responseTimeMs: 840,
  },
  {
    landmarkSlug: 'juma-mosque',
    language: 'en',
    question: 'Tell me a local legend about the ancient columns',
    answerPreview:
      'Khiva woodcarvers say the black elm columns seasoned for years faintly creak at dawn as if echoing a thousand years of whispered prayers.',
    hasImage: true,
    identifiedByVision: true,
    sessionId: 'sess-us-02',
    hoursAgo: 7.5,
    responseTimeMs: 1080,
  },
  {
    landmarkSlug: 'juma-mosque',
    language: 'ja',
    question: '一番古い10世紀の柱はどこにありますか？',
    answerPreview:
      '中央の天窓付近に現存する10〜11世紀のクーフィー体植物文様の柱があり、何世紀にもわたり巡礼者に大切にされてきました。',
    hasImage: false,
    identifiedByVision: false,
    sessionId: 'sess-jp-04',
    hoursAgo: 5.1,
    responseTimeMs: 970,
  },
  {
    landmarkSlug: 'juma-mosque',
    language: 'ko',
    question: '주마 모스크에는 나무 기둥이 몇 개 있나요?',
    answerPreview:
      '총 213개의 수작업 나무 기둥이 서 있으며, 어느 두 기둥도 똑같은 문양이 없을 정도로 다채로운 호레즘 목각을 보여줍니다.',
    hasImage: true,
    identifiedByVision: true,
    sessionId: 'sess-kr-03',
    hoursAgo: 3.2,
    responseTimeMs: 1130,
  },
  {
    landmarkSlug: 'juma-mosque',
    language: 'en',
    question: 'What is written on the marble plaque at the entrance?',
    answerPreview:
      'The 1788–1789 engraved marble waqf tablet records the endowment lands permanently dedicated to sustaining the mosque and its scholars.',
    hasImage: false,
    identifiedByVision: false,
    sessionId: 'sess-au-05',
    hoursAgo: 1.4,
    responseTimeMs: 870,
  },
  {
    landmarkSlug: 'juma-mosque',
    language: 'ru',
    question: 'Какова высота минарета у мечети Джума?',
    answerPreview:
      'Кирпичный минарет мечети Джума возвышается на 32,5 метра при диаметре основания 6,2 метра.',
    hasImage: false,
    identifiedByVision: false,
    sessionId: 'sess-ru-03',
    hoursAgo: 0.6,
    responseTimeMs: 850,
  },

  // Tosh-Hovli Palace — #3 popularity
  {
    landmarkSlug: 'tosh-hovli',
    language: 'en',
    question: 'Why did Allakuli Khan execute the palace’s first architect?',
    answerPreview:
      'When Allakuli Khan demanded the palace in just two years, master Usto Nurmuhammad Tajikhan honestly warned it was impossible; the furious Khan ordered his execution.',
    hasImage: false,
    identifiedByVision: false,
    sessionId: 'sess-us-02',
    hoursAgo: 13.1,
    responseTimeMs: 960,
  },
  {
    landmarkSlug: 'tosh-hovli',
    language: 'en',
    question: 'What are the circular brick platforms in the courtyards for?',
    answerPreview:
      'Those raised circular plinths (sufa) were built so the Khan could pitch felt winter yurts right inside the palace courtyards, honoring Qungrat nomadic traditions.',
    hasImage: true,
    identifiedByVision: true,
    sessionId: 'sess-uk-06',
    hoursAgo: 11.9,
    responseTimeMs: 1190,
  },
  {
    landmarkSlug: 'tosh-hovli',
    language: 'ja',
    question: 'ハーレムの5つのイーワーンについて教えてください',
    answerPreview:
      '北向きの5つの大きなイーワーンのうち、同じ大きさの4つは4人の正妃のため、より大きく豪華な5番目はハン専用に造られました。',
    hasImage: true,
    identifiedByVision: true,
    sessionId: 'sess-jp-02',
    hoursAgo: 9.8,
    responseTimeMs: 1230,
  },
  {
    landmarkSlug: 'tosh-hovli',
    language: 'ru',
    question: 'Сколько комнат во дворце Таш-Хаули?',
    answerPreview:
      'Во дворце более 163 помещений, сгруппированных вокруг трёх дворов: Гарема, Ишрат-Хаули для приёмов и Арз-Хаули для суда.',
    hasImage: false,
    identifiedByVision: false,
    sessionId: 'sess-ru-01',
    hoursAgo: 8.4,
    responseTimeMs: 900,
  },
  {
    landmarkSlug: 'tosh-hovli',
    language: 'ko',
    question: '타시 하울리의 복도가 미로처럼 좁은 이유는 무엇인가요?',
    answerPreview:
      '어둡고 구불구불한 복도는 하렘의 엄격한 사생활을 보호하고, 침입자가 궁전 내부 방향을 잃게 만드는 방어 설계였습니다.',
    hasImage: false,
    identifiedByVision: false,
    sessionId: 'sess-kr-02',
    hoursAgo: 6.1,
    responseTimeMs: 950,
  },
  {
    landmarkSlug: 'tosh-hovli',
    language: 'es',
    question: '¿Cómo se utilizaban los tres patios de Tosh-Hovli?',
    answerPreview:
      'El Harén era la zona familiar, Ishrat-Hovli acogía banquetes y embajadores, y Arz-Hovli servía como corte de justicia del Khan.',
    hasImage: true,
    identifiedByVision: true,
    sessionId: 'sess-es-03',
    hoursAgo: 4.0,
    responseTimeMs: 1110,
  },
  {
    landmarkSlug: 'tosh-hovli',
    language: 'uz',
    question: 'Tosh-Hovli saroyini qaysi usta bitkazgan?',
    answerPreview:
      'Saroyni mohir me’mor Usto Qalandar Xivakiy 8 yil davomida (1830–1838) nihoyasiga yetkazgan, koshinlarini esa Abdulla Jin bezagan.',
    hasImage: false,
    identifiedByVision: false,
    sessionId: 'sess-uz-03',
    hoursAgo: 2.1,
    responseTimeMs: 880,
  },
  {
    landmarkSlug: 'tosh-hovli',
    language: 'en',
    question: 'Why are there two separate doorways in the Arz-Hovli court?',
    answerPreview:
      'One gateway admitted petitioners coming before the Khan, while a separate exit door escorted those sentenced to punishment out of public view.',
    hasImage: false,
    identifiedByVision: false,
    sessionId: 'sess-ca-07',
    hoursAgo: 0.7,
    responseTimeMs: 910,
  },

  // Pahlavon Mahmud Mausoleum — #4 popularity
  {
    landmarkSlug: 'pahlavon-mahmud',
    language: 'en',
    question: 'Who was Pahlavon Mahmud and why is he Khiva’s patron saint?',
    answerPreview:
      'Pahlavon Mahmud (1247–1326) was a Khivan furrier, Sufi poet, and undefeated master wrestler revered for his moral nobility and protection of Khorezm.',
    hasImage: true,
    identifiedByVision: true,
    sessionId: 'sess-de-03',
    hoursAgo: 12.2,
    responseTimeMs: 1170,
  },
  {
    landmarkSlug: 'pahlavon-mahmud',
    language: 'uz',
    question: 'Uning Hindistondagi mashhur kurash musobaqasi haqidagi afsonani aytib bering',
    answerPreview:
      'Raqibining keksaygan onasining duosini eshitib, rahmdillik yuzasidan ataylab yengilgan va Hindiston podshosidan bitta sigir terisiga sig‘adigan barcha xorazmlik asirlarni ozod qilishni so‘rab, terini ingichka tasma qilib qirqib hammasini qutqargan.',
    hasImage: false,
    identifiedByVision: false,
    sessionId: 'sess-uz-01',
    hoursAgo: 10.1,
    responseTimeMs: 980,
  },
  {
    landmarkSlug: 'pahlavon-mahmud',
    language: 'ja',
    question: '巨大なトルコ石のドームの特徴は何ですか？',
    answerPreview:
      '高さ25メートル・内径17.5メートルを誇るヒヴァ最大のドームで、1810〜1835年の再建時に美しいトルコ石タイルと金色の尖塔が戴かれました。',
    hasImage: true,
    identifiedByVision: true,
    sessionId: 'sess-jp-05',
    hoursAgo: 7.8,
    responseTimeMs: 1200,
  },
  {
    landmarkSlug: 'pahlavon-mahmud',
    language: 'ru',
    question: 'Какие хивинские ханы похоронены в этом мавзолее?',
    answerPreview:
      'Рядом со святым покоятся Абулгази-хан, Ануша-хан, Мухаммад Рахим-хан I, Аллакули-хан и члены семьи Исфандияр-хана.',
    hasImage: false,
    identifiedByVision: false,
    sessionId: 'sess-ru-04',
    hoursAgo: 5.6,
    responseTimeMs: 910,
  },
  {
    landmarkSlug: 'pahlavon-mahmud',
    language: 'ko',
    question: '안뜰 우물의 특별한 의미는 무엇인가요?',
    answerPreview:
      '영묘 중정의 성스러운 우물물은 힘과 겸손, 축복을 준다고 전해져 지금도 히바의 신혼부부들이 결혼식 날 찾아옵니다.',
    hasImage: false,
    identifiedByVision: false,
    sessionId: 'sess-kr-04',
    hoursAgo: 3.8,
    responseTimeMs: 930,
  },
  {
    landmarkSlug: 'pahlavon-mahmud',
    language: 'es',
    question: '¿Qué versos están escritos en la mayólica interior?',
    answerPreview:
      'Los paneles de mayólica azul y blanca citan los propios rubaiyat filosóficos de Pahlavon Mahmud junto con caligrafía coránica.',
    hasImage: false,
    identifiedByVision: false,
    sessionId: 'sess-es-02',
    hoursAgo: 1.9,
    responseTimeMs: 890,
  },
  {
    landmarkSlug: 'pahlavon-mahmud',
    language: 'en',
    question: 'Tell me the famous legend of his wrestling match in India',
    answerPreview:
      'Hearing his opponent’s elderly mother pray tearfully, Pahlavon Mahmud purposely took his only loss out of compassion—then freed every Khorezmian captive using a single cowhide cut into a razor-thin strip.',
    hasImage: true,
    identifiedByVision: true,
    sessionId: 'sess-fr-04',
    hoursAgo: 0.4,
    responseTimeMs: 1120,
  },

  // Kunya-Ark Fortress — #5 popularity
  {
    landmarkSlug: 'kunya-ark',
    language: 'en',
    question: 'Tell me the story of Khiva’s famous silk money minted here',
    answerPreview:
      'During 1919–1920, Kunya-Ark’s Royal Mint printed unique silk-fabric banknotes alongside silver tanga coins—later families could even wash off the ink and reuse the silk.',
    hasImage: false,
    identifiedByVision: false,
    sessionId: 'sess-uk-06',
    hoursAgo: 11.4,
    responseTimeMs: 950,
  },
  {
    landmarkSlug: 'kunya-ark',
    language: 'ja',
    question: 'アク・シェイフ・ボボ見張り塔の由来は何ですか？',
    answerPreview:
      '要塞建設前に丘の上で瞑想していた高僧アク・シェイフ・ボボに敬意を表して名付けられ、イチャン・カラを一望できる最高地点です。',
    hasImage: true,
    identifiedByVision: true,
    sessionId: 'sess-jp-03',
    hoursAgo: 7.2,
    responseTimeMs: 1160,
  },
  {
    landmarkSlug: 'kunya-ark',
    language: 'ru',
    question: 'Где сегодня находится подлинный серебряный трон хивинского хана?',
    answerPreview:
      'Оригинальный деревянный трон 1816 года с чеканным серебром хранится в Оружейной палате в Москве, а в зале Куриниш-хана выставлена точная копия.',
    hasImage: false,
    identifiedByVision: false,
    sessionId: 'sess-ru-02',
    hoursAgo: 5.0,
    responseTimeMs: 920,
  },
  {
    landmarkSlug: 'kunya-ark',
    language: 'ko',
    question: '쿠냐 아르크 요새 안에는 어떤 건물들이 있었나요?',
    answerPreview:
      '약 1.2헥타르 부지 안에 알현실 쿠리니시하나, 여름·겨울 모스크, 왕실 조폐국, 무기고, 하렘, 감옥 진단이 모두 갖춰진 성 안의 도시였습니다.',
    hasImage: true,
    identifiedByVision: true,
    sessionId: 'sess-kr-03',
    hoursAgo: 2.8,
    responseTimeMs: 1140,
  },
  {
    landmarkSlug: 'kunya-ark',
    language: 'uz',
    question: 'Ko‘hna Ark qachon va kim tomonidan barpo etilgan?',
    answerPreview:
      'Dastlab 1686–1688-yillarda Arangxon tomonidan asos solingan, 1804–1806-yillarda Eltuzarxon hamda keyinchalik Olloqulixon davrida qayta qurilgan.',
    hasImage: false,
    identifiedByVision: false,
    sessionId: 'sess-uz-04',
    hoursAgo: 1.1,
    responseTimeMs: 860,
  },
  {
    landmarkSlug: 'kunya-ark',
    language: 'es',
    question: '¿Desde dónde se ve la mejor puesta de sol en Ichan-Qala?',
    answerPreview:
      'Desde la terraza del bastión Ak-Sheikh-Bobo dentro de Kunya-Ark se disfruta una vista panorámica de 360 grados de todas las cúpulas turquesa de Jiva.',
    hasImage: false,
    identifiedByVision: false,
    sessionId: 'sess-es-04',
    hoursAgo: 0.2,
    responseTimeMs: 890,
  },
];
