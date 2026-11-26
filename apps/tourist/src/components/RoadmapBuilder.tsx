'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Camera,
  Clock3,
  Crown,
  Headphones,
  Landmark,
  Leaf,
  Loader2,
  Sparkles,
} from 'lucide-react';
import type { LandmarkSummary, SupportedLanguage } from '@smartguide/shared';
import { generateRoadmap } from '@/lib/api';
import { curatedRoadmap } from '@/lib/curated-roadmap';
import { EXPERIENCE_COPY } from '@/lib/experience-copy';
import {
  readSavedRoadmap,
  roadmapLink,
  saveRoadmap,
  type SavedRoadmap,
  type TravelVibe,
} from '@/lib/experience';
import { getOrCreateSessionId } from '@/lib/session';
import { LandmarkArt } from './LandmarkArt';

const VIBES = [
  { value: 'legends', icon: Sparkles },
  { value: 'photography', icon: Camera },
  { value: 'architecture', icon: Landmark },
  { value: 'royalty', icon: Crown },
  { value: 'spiritual', icon: Leaf },
] as const;
const DURATIONS = [60, 120, 240] as const;

export function RoadmapBuilder({
  landmarks,
  language,
}: {
  landmarks: LandmarkSummary[];
  language: SupportedLanguage;
}) {
  const [duration, setDuration] = useState<60 | 120 | 240>(120);
  const [vibes, setVibes] = useState<TravelVibe[]>(['legends', 'photography']);
  const [saved, setSaved] = useState<SavedRoadmap | null>(null);
  const [editing, setEditing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const generation = useRef(0);
  const busyRef = useRef(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const copy = EXPERIENCE_COPY[language];

  useEffect(() => {
    generation.current += 1;
    busyRef.current = false;
    setIsLoading(false);
    setError(false);
    const stored = readSavedRoadmap();
    if (stored) {
      setDuration(stored.durationMinutes);
      setVibes(stored.vibes);
    }
    const compatible =
      stored?.roadmap.language === language &&
      stored.roadmap.stops.every((stop) =>
        landmarks.some((item) => item.slug === stop.slug),
      );
    setSaved(compatible ? stored : null);
    setEditing(!compatible);
    return () => {
      generation.current += 1;
    };
  }, [language, landmarks]);

  const build = async () => {
    if (vibes.length === 0 || landmarks.length === 0 || busyRef.current) return;
    busyRef.current = true;
    const current = ++generation.current;
    const sessionId = getOrCreateSessionId();
    setIsLoading(true);
    setError(false);
    let result: SavedRoadmap;
    try {
      const roadmap = await generateRoadmap({
        sessionId,
        language,
        durationMinutes: duration,
        vibes,
      });
      if (
        !Number.isInteger(roadmap.roadmapId) ||
        !roadmap.roadmapId ||
        roadmap.roadmapId < 0 ||
        roadmap.language !== language ||
        typeof roadmap.headline !== 'string' ||
        !Number.isFinite(roadmap.totalMinutes) ||
        !Array.isArray(roadmap.stops) ||
        roadmap.stops.length === 0 ||
        roadmap.stops.length > 5 ||
        new Set(roadmap.stops.map((stop) => stop.slug)).size !==
          roadmap.stops.length ||
        !roadmap.stops.every(
          (stop) =>
            landmarks.some((item) => item.slug === stop.slug) &&
            typeof stop.name === 'string' &&
            typeof stop.whyVisit === 'string' &&
            typeof stop.emotionalPayoff === 'string' &&
            Number.isFinite(stop.estimatedMinutes),
        )
      )
        throw new Error('Invalid route');
      result = {
        roadmap,
        durationMinutes: duration,
        vibes,
        source: 'personalized',
      };
    } catch {
      result = curatedRoadmap(landmarks, language, duration, vibes, sessionId);
    }
    if (current !== generation.current) return;
    if (result.roadmap.stops.length === 0) setError(true);
    else {
      setSaved(result);
      saveRoadmap(result);
      setEditing(false);
    }
    busyRef.current = false;
    setIsLoading(false);
  };

  useEffect(() => {
    if (saved && !editing)
      resultRef.current?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
        block: 'nearest',
      });
  }, [saved, editing]);

  return (
    <section
      className="personal-walk"
      id="personal-walk"
      aria-labelledby="personal-walk-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 className="section-title" id="personal-walk-title">
            {copy.title}
          </h2>
        </div>
        {saved && (
          <button
            className="text-action"
            type="button"
            disabled={isLoading}
            onClick={() => setEditing(!editing)}
          >
            {copy.edit}
          </button>
        )}
      </div>
      {editing && (
        <form
          className="walk-builder"
          onSubmit={(event) => {
            event.preventDefault();
            void build();
          }}
        >
          <fieldset disabled={isLoading}>
            <legend>{copy.time}</legend>
            <div className="duration-options">
              {DURATIONS.map((minutes, index) => (
                <button
                  key={minutes}
                  type="button"
                  aria-pressed={duration === minutes}
                  onClick={() => setDuration(minutes)}
                >
                  {copy.durations[index]}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset disabled={isLoading}>
            <legend>{copy.interests}</legend>
            <p className="builder-hint">{copy.chooseUpTo}</p>
            <div className="vibe-options">
              {VIBES.map(({ value, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={vibes.includes(value)}
                  disabled={vibes.length === 3 && !vibes.includes(value)}
                  onClick={() =>
                    setVibes((previous) =>
                      previous.includes(value)
                        ? previous.filter((item) => item !== value)
                        : [...previous, value],
                    )
                  }
                >
                  <Icon aria-hidden="true" />
                  {copy.vibes[value]}
                </button>
              ))}
            </div>
          </fieldset>
          <button
            className="primary-action build-action"
            type="submit"
            disabled={isLoading || vibes.length === 0 || landmarks.length === 0}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles aria-hidden="true" />
            )}
            {isLoading ? copy.building : copy.build}
          </button>
          {error && (
            <p className="feedback-error" role="alert">
              {copy.buildError}
            </p>
          )}
        </form>
      )}
      {saved && (
        <div className="personal-roadmap" ref={resultRef} aria-live="polite">
          <div className="roadmap-heading">
            <h3>{saved.roadmap.headline}</h3>
            <p>
              <Clock3 aria-hidden="true" />
              {saved.roadmap.totalMinutes} {copy.minutes}
            </p>
          </div>
          {(saved.source === 'curated' || saved.roadmap.dataDrivenNote) && (
            <p className="roadmap-note">
              {saved.source === 'curated'
                ? copy.curatedNote
                : saved.roadmap.dataDrivenNote}
            </p>
          )}
          <ol className="roadmap-timeline">
            {saved.roadmap.stops.map((stop, index) => (
              <li key={stop.slug}>
                <span className="timeline-number" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="timeline-content">
                  <div className="timeline-photo">
                    <LandmarkArt slug={stop.slug} alt={stop.name} />
                  </div>
                  <div className="timeline-copy">
                    <div className="timeline-meta">
                      <span>
                        {stop.estimatedMinutes} {copy.minutes}
                      </span>
                      {typeof stop.interestScore === 'number' &&
                        Number.isFinite(stop.interestScore) && (
                          <span>
                            {copy.recommendation}:{' '}
                            {Math.max(
                              0,
                              Math.min(100, Math.round(stop.interestScore)),
                            )}
                            /100
                          </span>
                        )}
                    </div>
                    <h4>{stop.name}</h4>
                    <p>{stop.whyVisit}</p>
                    <p className="emotional-promise">
                      <Sparkles aria-hidden="true" />
                      {stop.emotionalPayoff}
                    </p>
                    {stop.topSignalHighlight && (
                      <p className="signal-highlight">
                        <strong>{copy.highlight}</strong>
                        {stop.topSignalHighlight}
                      </p>
                    )}
                    <Link
                      className="text-action"
                      href={roadmapLink(
                        stop.slug,
                        language,
                        saved.roadmap.roadmapId,
                      )}
                    >
                      <Headphones aria-hidden="true" />
                      {copy.open}
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
