export type SupportedLanguage = 'en' | 'uz' | 'ru' | 'ja' | 'ko' | 'es';

export interface LanguageMeta {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  countryLabel: string;
  flag: string;
  speechRecognitionLang: string;
  ttsVoiceHint: string;
}

export const SUPPORTED_LANGUAGES: readonly LanguageMeta[] = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    countryLabel: 'International / UK & US',
    flag: '🇬🇧',
    speechRecognitionLang: 'en-US',
    ttsVoiceHint: 'Sulafat',
  },
  {
    code: 'uz',
    label: 'Uzbek',
    nativeLabel: "O'zbekcha",
    countryLabel: 'Uzbekistan',
    flag: '🇺🇿',
    speechRecognitionLang: 'uz-UZ',
    ttsVoiceHint: 'Sulafat',
  },
  {
    code: 'ru',
    label: 'Russian',
    nativeLabel: 'Русский',
    countryLabel: 'Russia / CIS',
    flag: '🇷🇺',
    speechRecognitionLang: 'ru-RU',
    ttsVoiceHint: 'Sulafat',
  },
  {
    code: 'ja',
    label: 'Japanese',
    nativeLabel: '日本語',
    countryLabel: 'Japan',
    flag: '🇯🇵',
    speechRecognitionLang: 'ja-JP',
    ttsVoiceHint: 'Sulafat',
  },
  {
    code: 'ko',
    label: 'Korean',
    nativeLabel: '한국어',
    countryLabel: 'South Korea',
    flag: '🇰🇷',
    speechRecognitionLang: 'ko-KR',
    ttsVoiceHint: 'Sulafat',
  },
  {
    code: 'es',
    label: 'Spanish',
    nativeLabel: 'Español',
    countryLabel: 'Spain & Latin America',
    flag: '🇪🇸',
    speechRecognitionLang: 'es-ES',
    ttsVoiceHint: 'Sulafat',
  },
] as const;

export const LANGUAGE_CODES: readonly SupportedLanguage[] = ['en', 'uz', 'ru', 'ja', 'ko', 'es'];

export type LocalizedTextMap = Record<SupportedLanguage, string>;
export type LocalizedStringArrayMap = Record<SupportedLanguage, string[]>;

export interface LandmarkSummary {
  id: number;
  slug: string;
  name: string;
  localizedNames: LocalizedTextMap;
  era: string;
  builtYear: string;
  architect: string;
  locationInSite: string;
  shortDescription: string;
  localizedShortDescriptions: LocalizedTextMap;
  accentColor: string;
  suggestedQuestions: LocalizedStringArrayMap;
}

export interface LandmarkDetail extends LandmarkSummary {
  historicalFacts: string[];
  architecturalDetails: string[];
  localLegends: string[];
  visualCues: string[];
  verifiedBy: string;
  archiveCode: string;
}

export interface GuideAskRequest {
  landmarkSlug?: string;
  question: string;
  language: SupportedLanguage;
  sessionId: string;
  imageBase64?: string;
  imageMimeType?: string;
  includeAudio?: boolean;
}

export interface GuideAskResponse {
  interactionId: number;
  landmarkSlug: string;
  landmarkName: string;
  language: SupportedLanguage;
  answer: string;
  audioBase64?: string;
  audioMimeType?: string;
  identifiedByVision: boolean;
  verifiedBy: string;
  archiveCode: string;
  modelUsed: string;
  sourceMode: 'groq-rag' | 'gemini-rag' | 'verified-rag-fallback';
  responseTimeMs: number;
}

export interface LandmarkVisitMetric {
  slug: string;
  name: string;
  visits: number;
  uniqueTourists: number;
  photoScans: number;
  sharePercent: number;
}

export interface LanguageBreakdownMetric {
  code: SupportedLanguage;
  language: string;
  countryLabel: string;
  tourists: number;
  interactions: number;
  sharePercent: number;
}

export interface HourlyActivityPoint {
  hour: string;
  interactions: number;
  tourists: number;
}

export interface RecentQuestionItem {
  id: number;
  landmarkSlug: string;
  landmarkName: string;
  language: SupportedLanguage;
  question: string;
  answerPreview: string;
  hasImage: boolean;
  sessionId: string;
  createdAt: string;
}

export interface RevenueMetrics {
  pricePerTouristUsd: number;
  grossRevenueUsd: number;
  museumSharePercent: number;
  museumShareUsd: number;
  smartGuideSharePercent: number;
  smartGuideShareUsd: number;
  estimatedApiCostPerTouristUsd: number;
  totalEstimatedApiCostUsd: number;
  grossMarginPercent: number;
}

export interface AnalyticsSummary {
  siteName: string;
  totalTourists: number;
  totalInteractions: number;
  totalPhotoScans: number;
  avgQuestionsPerTourist: number;
  topLandmark: {
    slug: string;
    name: string;
    visits: number;
    sharePercent: number;
  } | null;
  revenue: RevenueMetrics;
  visitsByLandmark: LandmarkVisitMetric[];
  touristsByLanguage: LanguageBreakdownMetric[];
  hourlyActivity: HourlyActivityPoint[];
  recentQuestions: RecentQuestionItem[];
  updatedAt: string;
}
