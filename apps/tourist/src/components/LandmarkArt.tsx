'use client';

import { useEffect, useState } from 'react';

interface LandmarkArtProps {
  slug: string;
  alt?: string;
  className?: string;
}

/**
 * Renders compressed local WebP photography for each Ichan-Qala monument,
 * seamlessly falling back to bespoke offline architectural SVG art on error.
 */
export function LandmarkArt({ slug, alt, className = 'w-full h-full' }: LandmarkArtProps) {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [slug]);

  if (!imgFailed) {
    return (
      <img
        src={`/landmarks/${slug}.webp`}
        alt={alt || slug}
        loading="lazy"
        onError={() => setImgFailed(true)}
        className={`${className} object-cover`}
      />
    );
  }

  switch (slug) {
    case 'kalta-minor':
      return (
        <svg viewBox="0 0 400 220" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="km-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E6F4F3" />
              <stop offset="100%" stopColor="#F5EFE6" />
            </linearGradient>
            <linearGradient id="km-tile" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0E7470" />
              <stop offset="50%" stopColor="#149A94" />
              <stop offset="100%" stopColor="#0A5C59" />
            </linearGradient>
          </defs>
          <rect width="400" height="220" fill="url(#km-sky)" />
          <circle cx="320" cy="48" r="24" fill="#B47B38" opacity="0.16" />
          <rect x="28" y="128" width="135" height="92" fill="#E3D7C4" />
          <path d="M55 220 V165 Q75 142 95 165 V220 Z" fill="#C9B9A2" />
          <path d="M148 220 L158 56 L242 56 L252 220 Z" fill="url(#km-tile)" />
          <rect x="157" y="64" width="86" height="12" fill="#B47B38" opacity="0.9" />
          <rect x="155" y="88" width="90" height="10" fill="#FAF8F5" opacity="0.65" />
          <rect x="153" y="112" width="94" height="14" fill="#FFFFFF" opacity="0.35" />
          <rect x="151" y="140" width="98" height="10" fill="#B47B38" opacity="0.75" />
          <rect x="149" y="168" width="102" height="12" fill="#14181F" opacity="0.2" />
          <line x1="158" y1="56" x2="242" y2="56" stroke="#B47B38" strokeWidth="3.5" />
          <rect x="0" y="206" width="400" height="14" fill="#DDD2C0" />
        </svg>
      );

    case 'juma-mosque':
      return (
        <svg viewBox="0 0 400 220" className={className} preserveAspectRatio="xMidYMid slice">
          <rect width="400" height="220" fill="#F3ECE2" />
          <rect x="0" y="0" width="400" height="28" fill="#6F4E37" />
          <rect x="150" y="0" width="100" height="28" fill="#D9ECEB" />
          <polygon points="150,28 250,28 315,220 115,220" fill="#FFFFFF" opacity="0.5" />
          {[46, 102, 158, 242, 298, 354].map((x, idx) => (
            <g key={x}>
              <rect x={x - 10} y="26" width="20" height="10" fill="#B47B38" opacity="0.85" />
              <rect
                x={x - 6}
                y="36"
                width="12"
                height="164"
                fill={idx % 2 === 0 ? '#8C6239' : '#734E2B'}
              />
              <rect x={x - 10} y="198" width="20" height="14" rx="2" fill="#94A3B8" />
            </g>
          ))}
          <rect x="0" y="210" width="400" height="10" fill="#D7CCBA" />
        </svg>
      );

    case 'tosh-hovli':
      return (
        <svg viewBox="0 0 400 220" className={className} preserveAspectRatio="xMidYMid slice">
          <rect width="400" height="220" fill="#EDF4F6" />
          <rect x="52" y="24" width="296" height="170" rx="4" fill="#1D4E89" stroke="#0E7470" strokeWidth="2" />
          <rect x="64" y="34" width="272" height="26" fill="#9A3412" />
          <rect x="64" y="56" width="272" height="5" fill="#B47B38" />
          <rect x="74" y="72" width="66" height="108" rx="3" fill="#EEF7F6" opacity="0.35" stroke="#BAE6FD" strokeWidth="1" />
          <rect x="260" y="72" width="66" height="108" rx="3" fill="#EEF7F6" opacity="0.35" stroke="#BAE6FD" strokeWidth="1" />
          <path d="M164 194 V92 Q200 68 236 92 V194 Z" fill="#FAF8F5" stroke="#B47B38" strokeWidth="2" />
          <rect x="195" y="60" width="10" height="134" fill="#B47B38" />
          <ellipse cx="200" cy="206" rx="74" ry="10" fill="#D5C5AE" />
        </svg>
      );

    case 'kunya-ark':
      return (
        <svg viewBox="0 0 400 220" className={className} preserveAspectRatio="xMidYMid slice">
          <rect width="400" height="220" fill="#F2ECE4" />
          <circle cx="200" cy="108" r="64" fill="#FDF6EC" />
          <polygon points="0,220 26,115 374,115 400,220" fill="#C4A681" />
          <polygon points="104,220 116,66 154,66 164,220" fill="#D1B592" />
          <polygon points="236,220 246,66 284,66 296,220" fill="#D1B592" />
          <rect x="114" y="84" width="42" height="9" fill="#0E7470" />
          <rect x="244" y="84" width="42" height="9" fill="#0E7470" />
          <rect x="158" y="96" width="84" height="124" fill="#B99873" />
          <path d="M174 220 V142 Q200 112 226 142 V220 Z" fill="#473A2C" stroke="#B47B38" strokeWidth="2" />
          <rect x="0" y="208" width="400" height="12" fill="#DDD2C0" />
        </svg>
      );

    case 'pahlavon-mahmud':
    default:
      return (
        <svg viewBox="0 0 400 220" className={className} preserveAspectRatio="xMidYMid slice">
          <rect width="400" height="220" fill="#EAF2F2" />
          <line x1="200" y1="16" x2="200" y2="42" stroke="#B47B38" strokeWidth="3" />
          <circle cx="200" cy="26" r="4.5" fill="#B47B38" />
          <path d="M126 118 C126 52, 274 52, 274 118 Z" fill="#0E7470" />
          <rect x="132" y="114" width="136" height="18" fill="#FAF8F5" stroke="#B47B38" strokeWidth="1.5" />
          <rect x="94" y="132" width="212" height="84" fill="#C9B398" />
          <path d="M168 216 V154 Q200 132 232 154 V216 Z" fill="#FAF8F5" stroke="#0E7470" strokeWidth="2" />
          <rect x="0" y="208" width="400" height="12" fill="#DDD2C0" />
        </svg>
      );
  }
}
