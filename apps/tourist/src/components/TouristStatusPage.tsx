'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Compass, RefreshCw } from 'lucide-react';
import type { SupportedLanguage } from '@smartguide/shared';
import { getSavedLanguage, saveLanguage, updateLanguage } from '@/lib/session';
import { journeyCopy } from '@/lib/journey-copy';
import { TouristHeader } from './TouristHeader';

export function TouristStatusPage({
  kind,
  onRetry,
}: {
  kind: 'missing' | 'error';
  onRetry?: () => void;
}) {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  useEffect(() => {
    const value = getSavedLanguage(
      new URLSearchParams(window.location.search).get('lang'),
    );
    setLanguage(value);
    saveLanguage(value);
  }, []);
  const copy = journeyCopy(language);
  return (
    <div className="tourist-app">
      <TouristHeader
        language={language}
        onLanguageChange={(value) => {
          setLanguage(value);
          updateLanguage(value);
        }}
      />
      <main className="tourist-status">
        <Compass aria-hidden="true" />
        <h1>
          {copy(kind === 'missing' ? 'missingTitle' : 'unavailableTitle')}
        </h1>
        <p>
          {copy(
            kind === 'missing'
              ? 'missingDescription'
              : 'unavailableDescription',
          )}
        </p>
        <div>
          {onRetry && (
            <button type="button" className="journey-outline" onClick={onRetry}>
              <RefreshCw size={16} />
              {copy('retry')}
            </button>
          )}
          <Link
            className="journey-primary"
            href={`/?lang=${language}&view=map`}
          >
            {copy('map')}
          </Link>
        </div>
      </main>
    </div>
  );
}
