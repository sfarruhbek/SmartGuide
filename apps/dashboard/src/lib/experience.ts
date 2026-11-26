import type {
  AnalyticsSummary,
  LandmarkVisitMetric,
  RecentQuestionItem,
} from '@smartguide/shared';

export type Sentiment = 'awe' | 'fascinated' | 'curious' | 'neutral' | 'bored';
export type FeedbackRating = 'fascinating' | 'surprising' | 'not_relevant';
export interface ExperienceQuestion extends RecentQuestionItem {
  detectedTopic?: string;
  detectedTopicLabel?: string;
  sentiment?: Sentiment;
  userFeedback?: FeedbackRating | null;
  interestScore?: number;
  insight?: {
    detectedTopicLabel?: string;
    signalCategory?: string;
    sentiment?: Sentiment;
    interestScore?: number;
  };
}
export interface TopicSignal {
  landmarkSlug: string;
  landmarkName: string;
  topicKey: string;
  topicLabel: string;
  category: string;
  askCount: number;
  positiveReactions: number;
  negativeReactions: number;
  signalScore: number;
}
export interface ExperienceAnalytics extends AnalyticsSummary {
  totalRoadmapsGenerated?: number;
  avgInterestScore?: number;
  visitsByLandmark: Array<LandmarkVisitMetric & { avgInterestScore?: number }>;
  recentQuestions: ExperienceQuestion[];
  signalVsNoise?: {
    topHighSignalTopics: TopicSignal[];
    lowInterestNoiseTopics: TopicSignal[];
  };
  sentimentBreakdown?: Array<{
    sentiment: Sentiment;
    count: number;
    sharePercent: number;
  }>;
  curiosityGaps?: Array<{
    landmarkSlug: string;
    landmarkName: string;
    question: string;
    language: string;
    createdAt: string;
  }>;
}
export const SENTIMENT_LABELS: Record<Sentiment, string> = {
  awe: 'Awe',
  fascinated: 'Fascinated',
  curious: 'Curious',
  neutral: 'Neutral',
  bored: 'Bored',
};
export const SENTIMENT_EMOJI: Record<Sentiment, string> = {
  awe: '🤯',
  fascinated: '🔥',
  curious: '💬',
  neutral: '😐',
  bored: '💤',
};
export const FEEDBACK_LABELS: Record<FeedbackRating, string> = {
  fascinating: '🔥 Fascinating',
  surprising: '🤯 Surprising',
  not_relevant: '😐 Not relevant',
};
