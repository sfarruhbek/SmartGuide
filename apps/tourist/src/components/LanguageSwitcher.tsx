'use client';

import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@smartguide/shared';

interface LanguageSwitcherProps {
  value: SupportedLanguage;
  onChange: (lang: SupportedLanguage) => void;
  compact?: boolean;
}

export function LanguageSwitcher({ value, onChange, compact = false }: LanguageSwitcherProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      role="group"
      aria-label="Select guide language"
    >
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isActive = lang.code === value;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => onChange(lang.code)}
            className={[
              'inline-flex items-center gap-1 rounded-full border transition-all cursor-pointer font-medium whitespace-nowrap',
              compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs sm:text-sm',
              isActive
                ? 'border-[#0E7470] bg-[#0E7470] text-white shadow-xs'
                : 'border-[#EAE6DF] bg-white text-[#14181F] hover:border-[#0E7470]/45 hover:bg-[#EEF7F6]/70',
            ].join(' ')}
          >
            <span aria-hidden="true">{lang.flag}</span>
            <span className="uppercase tracking-wide">{lang.code}</span>
          </button>
        );
      })}
    </div>
  );
}
