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
              'inline-flex items-center gap-1.5 rounded-full border transition-all cursor-pointer font-medium',
              compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs sm:text-sm',
              isActive
                ? 'border-amber-400/80 bg-amber-400/20 text-amber-200 shadow-[0_0_14px_rgba(212,175,55,0.28)]'
                : 'border-slate-700/80 bg-slate-900/70 text-slate-300 hover:border-teal-400/50 hover:text-white',
            ].join(' ')}
          >
            <span aria-hidden="true">{lang.flag}</span>
            <span className="uppercase tracking-wider">{lang.code}</span>
          </button>
        );
      })}
    </div>
  );
}
