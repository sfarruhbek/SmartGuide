'use client';

import Link from 'next/link';
import type { LandmarkSummary, SupportedLanguage } from '@smartguide/shared';
import { saveLanguage } from '@/lib/session';
import { ROUTE_COPY } from '@/lib/route-copy';
import { roadmapLink } from '@/lib/experience';

interface MonumentQuickNavProps {
  landmarks: LandmarkSummary[];
  currentSlug: string;
  language: SupportedLanguage;
  roadmapId?: number | null;
}

export function MonumentQuickNav({
  landmarks,
  currentSlug,
  language,
  roadmapId,
}: MonumentQuickNavProps) {
  if (landmarks.length === 0) return null;

  return (
    <nav aria-label={ROUTE_COPY[language].route} className="monument-nav">
      {landmarks.map((item, idx) => {
        const isCurrent = item.slug === currentSlug;
        const localized = item.localizedNames[language] || item.name;
        return (
          <Link
            key={item.slug}
            href={roadmapLink(item.slug, language, roadmapId)}
            onClick={() => saveLanguage(language)}
            aria-current={isCurrent ? 'page' : undefined}
          >
            <span className="nav-number">
              {String(idx + 1).padStart(2, '0')}
            </span>
            <span>{localized}</span>
          </Link>
        );
      })}
    </nav>
  );
}
