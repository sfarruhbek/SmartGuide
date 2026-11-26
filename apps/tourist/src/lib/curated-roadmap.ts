import type { LandmarkSummary, SupportedLanguage } from '@smartguide/shared';
import type { SavedRoadmap, TravelVibe } from './experience';
import { EXPERIENCE_COPY } from './experience-copy';

const THEMES: Record<string, TravelVibe[]> = {
  'kalta-minor': ['legends', 'photography', 'architecture'],
  'juma-mosque': ['architecture', 'spiritual', 'photography'],
  'tosh-hovli': ['royalty', 'architecture', 'legends'],
  'kunya-ark': ['royalty', 'legends', 'photography'],
  'pahlavon-mahmud': ['spiritual', 'legends', 'architecture'],
};

export function curatedRoadmap(
  landmarks: LandmarkSummary[],
  language: SupportedLanguage,
  durationMinutes: 60 | 120 | 240,
  vibes: TravelVibe[],
  sessionId: string,
): SavedRoadmap {
  const copy = EXPERIENCE_COPY[language];
  const limit = durationMinutes === 60 ? 2 : durationMinutes === 120 ? 4 : 5;
  const ranked = landmarks
    .map((landmark, index) => ({
      landmark,
      index,
      score: vibes.reduce(
        (score, vibe, preference) =>
          score +
          (THEMES[landmark.slug]?.includes(vibe) ? 3 - preference * 0.25 : 0),
        0,
      ),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit);
  const stops = ranked.map(({ landmark }, index) => ({
    order: index + 1,
    slug: landmark.slug,
    name: landmark.localizedNames[language],
    estimatedMinutes:
      landmark.slug === 'juma-mosque' || landmark.slug === 'tosh-hovli'
        ? 25
        : 20,
    whyVisit: landmark.localizedShortDescriptions[language],
    emotionalPayoff:
      copy.promises[landmark.slug] ??
      landmark.localizedShortDescriptions[language],
  }));
  return {
    source: 'curated',
    durationMinutes,
    vibes,
    roadmap: {
      roadmapId: null,
      sessionId,
      language,
      headline: copy.yourWalk,
      totalMinutes:
        stops.reduce((sum, stop) => sum + stop.estimatedMinutes, 0) +
        Math.max(0, stops.length - 1) * 5,
      stops,
      createdAt: new Date().toISOString(),
    },
  };
}
