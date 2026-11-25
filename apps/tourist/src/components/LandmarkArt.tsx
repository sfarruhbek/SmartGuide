'use client';

interface LandmarkArtProps {
  slug: string;
  className?: string;
}

/**
 * Bespoke architectural Silk Road illustrations for each of the 5 Ichan-Qala landmarks.
 * Renders cleanly offline with zero external image dependencies.
 */
export function LandmarkArt({ slug, className = 'w-full h-full' }: LandmarkArtProps) {
  switch (slug) {
    case 'kalta-minor':
      return (
        <svg viewBox="0 0 400 220" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="km-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0C1729" />
              <stop offset="100%" stopColor="#162A3E" />
            </linearGradient>
            <linearGradient id="km-tile" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0D9488" />
              <stop offset="48%" stopColor="#2DD4BF" />
              <stop offset="100%" stopColor="#0F766E" />
            </linearGradient>
          </defs>
          <rect width="400" height="220" fill="url(#km-sky)" />
          <circle cx="320" cy="48" r="24" fill="#F3D27A" opacity="0.22" />
          <circle cx="320" cy="48" r="14" fill="#F3D27A" opacity="0.6" />
          {/* Background madrasah */}
          <rect x="28" y="128" width="135" height="92" fill="#2A2420" opacity="0.7" />
          <path d="M55 220 V165 Q75 142 95 165 V220 Z" fill="#131926" />
          {/* Kalta Minor wide glazed turquoise cylinder */}
          <path d="M148 220 L158 56 L242 56 L252 220 Z" fill="url(#km-tile)" />
          <rect x="157" y="64" width="86" height="12" fill="#D4AF37" opacity="0.9" />
          <rect x="155" y="88" width="90" height="10" fill="#0F172A" opacity="0.55" />
          <rect x="153" y="112" width="94" height="14" fill="#E0F2FE" opacity="0.28" />
          <rect x="151" y="140" width="98" height="10" fill="#D4AF37" opacity="0.72" />
          <rect x="149" y="168" width="102" height="12" fill="#0F172A" opacity="0.45" />
          <line x1="158" y1="56" x2="242" y2="56" stroke="#F3D27A" strokeWidth="3.5" />
          {/* Ground desert glow */}
          <rect x="0" y="206" width="400" height="14" fill="#090D16" opacity="0.85" />
        </svg>
      );

    case 'juma-mosque':
      return (
        <svg viewBox="0 0 400 220" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="jm-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1B1611" />
              <stop offset="100%" stopColor="#0C0F18" />
            </linearGradient>
            <linearGradient id="jm-beam" x1="0" y1="0" x2="0.4" y2="1">
              <stop offset="0%" stopColor="#F6D365" stopOpacity="0.42" />
              <stop offset="100%" stopColor="#F6D365" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="400" height="220" fill="url(#jm-bg)" />
          {/* Flat beamed wooden roof & skylight */}
          <rect x="0" y="0" width="400" height="28" fill="#2A1E15" />
          <rect x="150" y="0" width="100" height="28" fill="#0F2940" />
          {/* Diagonal sunlight shaft from open skylight */}
          <polygon points="150,28 250,28 315,220 115,220" fill="url(#jm-beam)" />
          {/* Carved wooden columns forest */}
          {[46, 102, 158, 242, 298, 354].map((x, idx) => (
            <g key={x}>
              <rect x={x - 10} y="26" width="20" height="10" fill="#B68A45" opacity="0.7" />
              <rect
                x={x - 6}
                y="36"
                width="12"
                height="164"
                fill={idx % 2 === 0 ? '#8C6239' : '#6F4A27'}
              />
              <rect x={x - 10} y="198" width="20" height="14" rx="2" fill="#475569" />
            </g>
          ))}
          <rect x="0" y="210" width="400" height="10" fill="#090D16" />
        </svg>
      );

    case 'tosh-hovli':
      return (
        <svg viewBox="0 0 400 220" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="th-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0C1C38" />
              <stop offset="100%" stopColor="#09111E" />
            </linearGradient>
          </defs>
          <rect width="400" height="220" fill="url(#th-bg)" />
          {/* Majolica tiled palace iwan wall */}
          <rect x="52" y="24" width="296" height="170" rx="4" fill="#133B6E" stroke="#38BDF8" strokeWidth="2" />
          {/* Painted red-and-gold wooden ceiling band */}
          <rect x="64" y="34" width="272" height="26" fill="#7F1D1D" />
          <rect x="64" y="56" width="272" height="5" fill="#D4AF37" />
          {/* Decorative tile bays */}
          <rect x="74" y="72" width="66" height="108" rx="3" fill="#0EA5E9" opacity="0.22" stroke="#7DD3FC" strokeWidth="1" />
          <rect x="260" y="72" width="66" height="108" rx="3" fill="#0EA5E9" opacity="0.22" stroke="#7DD3FC" strokeWidth="1" />
          {/* Central arched alcove + single carved pillar */}
          <path d="M164 194 V92 Q200 68 236 92 V194 Z" fill="#0A192F" stroke="#D4AF37" strokeWidth="2" />
          <rect x="195" y="60" width="10" height="134" fill="#C89B3C" />
          {/* Circular brick yurt plinth in courtyard */}
          <ellipse cx="200" cy="206" rx="74" ry="10" fill="#B48A5A" opacity="0.7" />
          <ellipse cx="200" cy="204" rx="58" ry="6" fill="#D4AF37" opacity="0.35" />
        </svg>
      );

    case 'kunya-ark':
      return (
        <svg viewBox="0 0 400 220" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="ka-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E1410" />
              <stop offset="65%" stopColor="#3B2416" />
              <stop offset="100%" stopColor="#141824" />
            </linearGradient>
          </defs>
          <rect width="400" height="220" fill="url(#ka-sky)" />
          {/* Sunset glow behind citadel */}
          <circle cx="200" cy="118" r="68" fill="#F59E0B" opacity="0.22" />
          {/* Fortress battered walls */}
          <polygon points="0,220 26,115 374,115 400,220" fill="#7C5A3C" />
          {/* Twin battered gate towers */}
          <polygon points="104,220 116,66 154,66 164,220" fill="#9A724D" />
          <polygon points="236,220 246,66 284,66 296,220" fill="#9A724D" />
          {/* Turquoise tile bands on towers */}
          <rect x="114" y="84" width="42" height="9" fill="#14B8A6" />
          <rect x="244" y="84" width="42" height="9" fill="#14B8A6" />
          {/* Central arched citadel gate */}
          <rect x="158" y="96" width="84" height="124" fill="#8A6341" />
          <path d="M174 220 V142 Q200 112 226 142 V220 Z" fill="#111827" stroke="#D4AF37" strokeWidth="2" />
          <rect x="0" y="208" width="400" height="12" fill="#090D16" />
        </svg>
      );

    case 'pahlavon-mahmud':
    default:
      return (
        <svg viewBox="0 0 400 220" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="pm-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#091526" />
              <stop offset="100%" stopColor="#11273A" />
            </linearGradient>
            <linearGradient id="pm-dome" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="55%" stopColor="#0D9488" />
              <stop offset="100%" stopColor="#115E59" />
            </linearGradient>
          </defs>
          <rect width="400" height="220" fill="url(#pm-sky)" />
          {/* Stars */}
          <circle cx="62" cy="36" r="1.6" fill="#F3D27A" opacity="0.8" />
          <circle cx="332" cy="44" r="1.8" fill="#F3D27A" opacity="0.7" />
          <circle cx="295" cy="24" r="1.2" fill="#E0F2FE" opacity="0.7" />
          {/* Golden spire finial (qubba) */}
          <line x1="200" y1="16" x2="200" y2="42" stroke="#F6D365" strokeWidth="3" />
          <circle cx="200" cy="26" r="4.5" fill="#F6D365" />
          {/* Great turquoise mausoleum dome */}
          <path d="M126 118 C126 52, 274 52, 274 118 Z" fill="url(#pm-dome)" />
          {/* Drum calligraphy band */}
          <rect x="132" y="114" width="136" height="18" fill="#0F172A" stroke="#D4AF37" strokeWidth="1.5" />
          {/* Sanctuary walls & portal */}
          <rect x="94" y="132" width="212" height="84" fill="#6B5340" />
          <path d="M168 216 V154 Q200 132 232 154 V216 Z" fill="#0B192C" stroke="#22D3EE" strokeWidth="2" />
          <rect x="0" y="208" width="400" height="12" fill="#090D16" />
        </svg>
      );
  }
}
