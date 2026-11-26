'use client';

import Link from 'next/link';
import type { LandmarkSummary, SupportedLanguage } from '@smartguide/shared';
import { saveLanguage } from '@/lib/session';

interface MonumentQuickNavProps {
  landmarks: LandmarkSummary[];
  currentSlug: string;
  language: SupportedLanguage;
}

export function MonumentQuickNav({
  landmarks,
  currentSlug,
  language,
}: MonumentQuickNavProps) {
  if (landmarks.length === 0) return null;

  return (
    <nav
      aria-label="Quick monument switcher"
      className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1"
    >
      {landmarks.map((item, idx) => {
        const isCurrent = item.slug === currentSlug;
        const localized = item.localizedNames[language] || item.name;
        return (
          <Link
            key={item.slug}
            href={`/l/${item.slug}?lang=${language}`}
            onClick={() => saveLanguage(language)}
            className={[
              'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition whitespace-nowrap',
              isCurrent
                ? 'border-[#0E7470] bg-[#0E7470] text-white shadow-xs'
                : 'border-[#EAE6DF] bg-white text-[#14181F] hover:border-[#0E7470]/45 hover:bg-[#EEF7F6]/70',
            ].join(' ')}
          >
            <span
              className={[
                'inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold tabular-nums',
                isCurrent ? 'bg-white/20 text-white' : 'bg-[#FAF8F5] text-[#5C6370]',
              ].join(' ')}
            >
              {idx + 1}
            </span>
            <span>{localized}</span>
          </Link>
        );
      })}
    </nav>
  );
}
