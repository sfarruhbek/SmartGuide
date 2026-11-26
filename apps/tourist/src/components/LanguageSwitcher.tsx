'use client';

import { ChevronDown, Languages } from 'lucide-react';
import {
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '@smartguide/shared';
import { ROUTE_COPY } from '@/lib/route-copy';

interface LanguageSwitcherProps {
  value: SupportedLanguage;
  onChange: (lang: SupportedLanguage) => void;
  compact?: boolean;
}

export function LanguageSwitcher({ value, onChange }: LanguageSwitcherProps) {
  return (
    <label className="language-picker">
      <Languages aria-hidden="true" />
      <span className="language-code" aria-hidden="true">
        {value.toUpperCase()}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as SupportedLanguage)}
        aria-label={ROUTE_COPY[value].language}
      >
        {SUPPORTED_LANGUAGES.map((language) => (
          <option
            key={language.code}
            value={language.code}
            lang={language.code}
          >
            {language.nativeLabel}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" />
    </label>
  );
}
