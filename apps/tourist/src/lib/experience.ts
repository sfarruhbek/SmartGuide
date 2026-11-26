import type { GuideAskResponse, SupportedLanguage } from '@smartguide/shared';

// Frontend additions from API_CONTRACT.md; shared contracts remain team-owned.
export type TravelVibe =
  | 'legends'
  | 'architecture'
  | 'photography'
  | 'royalty'
  | 'spiritual';
export type FeedbackRating = 'fascinating' | 'surprising' | 'not_relevant';
export interface RoadmapStop {
  order: number;
  slug: string;
  name: string;
  estimatedMinutes: number;
  whyVisit: string;
  emotionalPayoff: string;
  topSignalHighlight?: string;
  noiseFilteredNote?: string;
  interestScore?: number;
}
export interface Roadmap {
  roadmapId: number | null;
  sessionId: string;
  language: SupportedLanguage;
  headline: string;
  totalMinutes: number;
  dataDrivenNote?: string;
  stops: RoadmapStop[];
  createdAt: string;
}
export interface SavedRoadmap {
  roadmap: Roadmap;
  durationMinutes: 60 | 120 | 240;
  vibes: TravelVibe[];
  source: 'personalized' | 'curated';
}
export interface GuideResponse extends GuideAskResponse {
  insight?: {
    detectedTopicKey: string;
    detectedTopicLabel: string;
    signalCategory: string;
    sentiment: string;
    interestScore: number;
  };
  nextStopSuggestion?: { slug: string; name: string; teaser: string };
}
const ROADMAP_KEY = 'smartguide_roadmap_v1';

export function readSavedRoadmap(): SavedRoadmap | null {
  try {
    const raw = JSON.parse(
      localStorage.getItem(ROADMAP_KEY) ?? 'null',
    ) as SavedRoadmap | null;
    if (
      !raw ||
      ![60, 120, 240].includes(raw.durationMinutes) ||
      !Array.isArray(raw.vibes) ||
      raw.vibes.length < 1 ||
      raw.vibes.length > 3 ||
      !raw.vibes.every((vibe) =>
        [
          'legends',
          'architecture',
          'photography',
          'royalty',
          'spiritual',
        ].includes(vibe),
      ) ||
      !Array.isArray(raw.roadmap?.stops) ||
      raw.roadmap.stops.length === 0 ||
      raw.roadmap.stops.length > 5
    )
      return null;
    if (
      !Number.isFinite(raw.roadmap.totalMinutes) ||
      typeof raw.roadmap.headline !== 'string' ||
      new Set(raw.roadmap.stops.map((stop) => stop.slug)).size !==
        raw.roadmap.stops.length
    )
      return null;
    if (
      !raw.roadmap.stops.every(
        (stop) =>
          typeof stop.slug === 'string' &&
          typeof stop.name === 'string' &&
          typeof stop.whyVisit === 'string' &&
          typeof stop.emotionalPayoff === 'string' &&
          Number.isFinite(stop.estimatedMinutes),
      )
    )
      return null;
    if (
      !['en', 'uz', 'ru', 'ja', 'ko', 'es'].includes(raw.roadmap.language) ||
      !['curated', 'personalized'].includes(raw.source)
    )
      return null;
    return raw;
  } catch {
    return null;
  }
}

export function saveRoadmap(value: SavedRoadmap): void {
  try {
    localStorage.setItem(ROADMAP_KEY, JSON.stringify(value));
  } catch {
    /* A walk can still be used without storage. */
  }
}

export function roadmapLink(
  slug: string,
  language: SupportedLanguage,
  roadmapId?: number | null,
): string {
  const query = new URLSearchParams({ lang: language });
  if (typeof roadmapId === 'number' && roadmapId > 0)
    query.set('roadmapId', String(roadmapId));
  return `/l/${encodeURIComponent(slug)}?${query}`;
}
