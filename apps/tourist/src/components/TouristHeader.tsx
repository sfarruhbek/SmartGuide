'use client';

import Link from 'next/link';
import { ArrowLeft, AudioLines } from 'lucide-react';
import type { SupportedLanguage } from '@smartguide/shared';
import { LanguageSwitcher } from './LanguageSwitcher';

interface TouristHeaderProps {
  language: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  backLabel?: string;
}

export function TouristHeader({
  language,
  onLanguageChange,
  backLabel,
}: TouristHeaderProps) {
  return (
    <header className="tourist-header">
      <div className="tourist-header-inner">
        {backLabel ? (
          <Link href={`/?lang=${language}`} className="back-link">
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
