'use client';

import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@smartguide/shared';

interface LanguageSwitcherProps {
  value: SupportedLanguage;
  onChange: (lang: SupportedLanguage) => void;
  compact?: boolean;
}

/**
 * Clean single-row 6-language pill capsule without duplicate flag/text codes.
 * Fits cleanly across 375px+ mobile viewports on a single row.
 */
export function LanguageSwitcher({ value, onChange, compact = false }: LanguageSwitcherProps) {
  return (
    <div
      className={[
        'grid grid-cols-6 items-center rounded-full border border-[#EAE6DF] bg-white p-1 shadow-2xs',
        compact ? 'gap-0.5' : 'gap-1',
      ].join(' ')}
      role="group"
      aria-label="Select guide language"
    >
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isActive = lang.code === value;
        return (
          <button
            key={lang.code}
            type="button"
            title={lang.nativeLabel}
            aria-label={lang.nativeLabel}
            aria-pressed={isActive}
            onClick={() => onChange(lang.code)}
            className={[
              'rounded-full text-center font-semibold uppercase tracking-wide cursor-pointer whitespace-nowrap',
              compact ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs',
              isActive
                ? 'bg-[#0E7470] text-white shadow-2xs'
                : 'text-[#5C6370] hover:bg-[#EEF7F6]/70 hover:text-[#14181F]',
            ].join(' ')}
          >
            {lang.code}
          </button>
        );
      })}
    </div>
  );
}
