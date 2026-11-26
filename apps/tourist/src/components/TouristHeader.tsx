'use client';

import Link from 'next/link';
import { ArrowLeft, AudioLines } from 'lucide-react';
import type { SupportedLanguage } from '@smartguide/shared';
import { LanguageSwitcher } from './LanguageSwitcher';

interface TouristHeaderProps {
  language: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  backLabel?: string;
  backHref?: string;
}

export function TouristHeader({
  language,
  onLanguageChange,
  backLabel,
  backHref,
}: TouristHeaderProps) {
  return (
    <header className="tourist-header">
      <div className="tourist-header-inner">
        {backLabel ? (
          <Link href={backHref ?? `/?lang=${language}`} className="back-link">
            <ArrowLeft aria-hidden="true" />
            <span>{backLabel}</span>
          </Link>
        ) : (
          <Link
            href={`/?lang=${language}`}
            className="brand-wordmark"
            aria-label="SmartGuide"
          >
            <AudioLines aria-hidden="true" />
            smartguide
          </Link>
        )}
        <LanguageSwitcher value={language} onChange={onLanguageChange} />
      </div>
    </header>
  );
}
