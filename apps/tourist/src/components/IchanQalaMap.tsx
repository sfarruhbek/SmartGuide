'use client';

import Link from 'next/link';
import { ArrowRight, Headphones, MapPin } from 'lucide-react';
import type { LandmarkSummary, SupportedLanguage } from '@smartguide/shared';
import { saveLanguage } from '@/lib/session';
import { LandmarkArt } from './LandmarkArt';

interface IchanQalaMapProps {
  landmarks: LandmarkSummary[];
  activeSlug: string;
  onSelectSlug: (slug: string) => void;
  language: SupportedLanguage;
  title: string;
  subtitle: string;
  openLabel: string;
}

const PIN_POSITIONS: Record<string, { x: number; y: number; gateHint?: string }> = {
  'kunya-ark': { x: 64, y: 52 },
  'kalta-minor': { x: 78, y: 98 },
  'juma-mosque': { x: 184, y: 94 },
  'pahlavon-mahmud': { x: 196, y: 138 },
  'tosh-hovli': { x: 294, y: 78 },
};

export function IchanQalaMap({
  landmarks,
  activeSlug,
  onSelectSlug,
  language,
  title,
  subtitle,
  openLabel,
}: IchanQalaMapProps) {
  if (landmarks.length === 0) return null;

  const activeLandmark = landmarks.find((lm) => lm.slug === activeSlug) ?? landmarks[0];
  const activeIndex = landmarks.findIndex((lm) => lm.slug === activeLandmark.slug);
  const localizedName = activeLandmark.localizedNames[language] || activeLandmark.name;
  const localizedDesc =
    activeLandmark.localizedShortDescriptions[language] || activeLandmark.shortDescription;

  return (
    <section className="overflow-hidden rounded-3xl border border-[#EAE6DF] bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-[#EAE6DF] px-4 py-3 sm:px-5">
        <div>
          <h2 className="font-display text-base font-semibold text-[#14181F] sm:text-lg">
            {title}
          </h2>
          <p className="text-[11px] text-[#5C6370]">{subtitle}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#B47B38]/25 bg-[#FDF6EC] px-2.5 py-0.5 text-[11px] font-semibold text-[#B47B38]">
          <MapPin className="h-3 w-3" />
          <span>Khiva</span>
        </span>
      </div>

      {/* Schematic Walled Citadel Interactive Map */}
      <div className="bg-[#FAF8F5] px-3 pt-3 pb-2">
        <div className="relative w-full overflow-hidden rounded-2xl border border-[#EAE6DF] bg-[#F5F0E6]">
          <svg
            viewBox="0 0 360 176"
            className="block h-auto w-full select-none"
            role="img"
            aria-label="Interactive walking map of Ichan-Qala monuments"
          >
            {/* Outer desert context grid */}
            <rect width="360" height="176" fill="#F5F0E6" />
            {/* Citadel outer clay wall silhouette */}
            <rect
              x="28"
              y="22"
              width="304"
              height="134"
              rx="14"
              fill="#FAF8F5"
              stroke="#D8CFC0"
              strokeWidth="4"
            />
            <rect
              x="34"
              y="28"
              width="292"
              height="122"
              rx="10"
              fill="none"
              stroke="#EAE6DF"
              strokeWidth="1"
            />

            {/* Main East-West Silk Road central street */}
            <line
              x1="28"
              y1="94"
              x2="332"
              y2="94"
              stroke="#E6DEC8"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Walking route dotted path connecting all 5 stops */}
            <path
              d="M 78 98 L 64 52 L 184 94 L 196 138 L 294 78"
              fill="none"
              stroke="#0E7470"
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.55"
            />

            {/* West Gate (Ata-Darvoza) & East Gate (Palvan-Darvoza) */}
            <rect x="22" y="83" width="12" height="22" rx="3" fill="#B47B38" />
            <text
              x="16"
              y="76"
              fontSize="7.5"
              fontWeight="700"
              fill="#B47B38"
              letterSpacing="0.06em"
            >
              WEST GATE
            </text>

            <rect x="326" y="83" width="12" height="22" rx="3" fill="#B47B38" />
            <text
              x="294"
              y="122"
              fontSize="7.5"
              fontWeight="700"
              fill="#B47B38"
              letterSpacing="0.06em"
            >
              EAST GATE
            </text>

            {/* 5 Interactive Monument Pins */}
            {landmarks.map((lm, idx) => {
              const pos = PIN_POSITIONS[lm.slug] ?? { x: 70 + idx * 55, y: 90 };
              const isSelected = lm.slug === activeLandmark.slug;
              const shortTitle = (lm.localizedNames[language] || lm.name)
                .replace(' Minaret', '')
                .replace(' Palace', '')
                .replace(' Fortress', '')
                .replace(' Mausoleum', '')
                .replace(' minorasi', '')
                .replace(' saroyi', '')
                .replace(" qal'asi", '')
                .replace(' maqbarasi', '');

              const labelY = pos.y < 70 ? pos.y - 18 : pos.y + 26;

              return (
                <g
                  key={lm.slug}
                  onClick={() => onSelectSlug(lm.slug)}
                  className="cursor-pointer outline-none focus:outline-none"
                  role="button"
                  tabIndex={0}
                  aria-label={`${idx + 1}. ${lm.name}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectSlug(lm.slug);
                    }
                  }}
                >
                  {isSelected && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="17"
                      fill="#0E7470"
                      opacity="0.16"
                    />
                  )}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 12.5 : 10.5}
                    fill={isSelected ? '#0E7470' : '#FFFFFF'}
                    stroke={isSelected ? '#0A5C59' : '#0E7470'}
                    strokeWidth={isSelected ? 2.5 : 1.75}
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 3.5}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill={isSelected ? '#FFFFFF' : '#0E7470'}
                  >
                    {idx + 1}
                  </text>
                  <text
                    x={pos.x}
                    y={labelY}
                    textAnchor="middle"
                    fontSize="8.5"
                    fontWeight={isSelected ? '700' : '600'}
                    fill={isSelected ? '#0E7470' : '#14181F'}
                  >
                    {shortTitle.length > 16 ? `${shortTitle.slice(0, 15)}…` : shortTitle}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Selected Pin Quick Card */}
      <Link
        href={`/l/${activeLandmark.slug}?lang=${language}`}
        onClick={() => saveLanguage(language)}
        className="group flex items-center gap-3.5 border-t border-[#EAE6DF] bg-white p-3.5 transition hover:bg-[#FAF8F5] sm:p-4"
      >
        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-[#EAE6DF] bg-[#EAE6DF]/40">
          <LandmarkArt
            slug={activeLandmark.slug}
            alt={localizedName}
            className="h-full w-full transition duration-300 group-hover:scale-105"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#0E7470]">
            <span className="tabular-nums">0{activeIndex + 1}</span>
            <span>·</span>
            <span>{activeLandmark.builtYear}</span>
          </div>
          <h3 className="truncate font-display text-base font-semibold text-[#14181F] group-hover:text-[#0E7470]">
            {localizedName}
          </h3>
          <p className="line-clamp-1 text-xs text-[#5C6370]">{localizedDesc}</p>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#0E7470] px-3 py-2 text-xs font-semibold text-white transition group-hover:bg-[#0A5C59]">
          <Headphones className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{openLabel}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </Link>
    </section>
  );
}
