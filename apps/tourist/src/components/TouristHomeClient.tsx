'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Camera,
  ChevronRight,
  Compass,
  Headphones,
  RefreshCw,
  ScanLine,
  Sparkles,
} from 'lucide-react';
import type { GuideAskResponse, LandmarkSummary, SupportedLanguage } from '@smartguide/shared';
import { askGuide, fetchLandmarks } from '@/lib/api';
import { TOURIST_UI } from '@/lib/i18n';
import { compressImageToBase64 } from '@/lib/image-utils';
import { getOrCreateSessionId, getSavedLanguage, saveLanguage } from '@/lib/session';
import { AudioGuidePlayer } from './AudioGuidePlayer';
import { IchanQalaMap } from './IchanQalaMap';
import { LandmarkArt } from './LandmarkArt';
import { LanguageSwitcher } from './LanguageSwitcher';

interface TouristHomeClientProps {
  initialLandmarks: LandmarkSummary[];
  initialLang?: string;
}

interface PendingCompressedImage {
  base64: string;
  mimeType: string;
  previewDataUrl: string;
}

export function TouristHomeClient({ initialLandmarks, initialLang }: TouristHomeClientProps) {
  const router = useRouter();
  const [landmarks, setLandmarks] = useState<LandmarkSummary[]>(initialLandmarks);
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [sessionId, setSessionId] = useState<string>('guest-session');
  const [activeMapSlug, setActiveMapSlug] = useState<string>(
    initialLandmarks[0]?.slug ?? 'kalta-minor',
  );
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [snapPreviewUrl, setSnapPreviewUrl] = useState<string | null>(null);
  const [snapResult, setSnapResult] = useState<GuideAskResponse | null>(null);
  const [snapError, setSnapError] = useState<string | null>(null);
  const [lastFailedImage, setLastFailedImage] = useState<PendingCompressedImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLanguage(getSavedLanguage(initialLang));
    setSessionId(getOrCreateSessionId());

    if (initialLandmarks.length === 0) {
      fetchLandmarks()
        .then((items) => {
          setLandmarks(items);
          if (items[0]) setActiveMapSlug(items[0].slug);
        })
        .catch(() => {});
    }
  }, [initialLang, initialLandmarks.length]);

  const handleLanguageChange = (nextLang: SupportedLanguage) => {
    setLanguage(nextLang);
    saveLanguage(nextLang);
  };

  const runSnapIdentify = async (compressed: PendingCompressedImage) => {
    setSnapError(null);
    setSnapResult(null);
    setLastFailedImage(null);
    setSnapPreviewUrl(compressed.previewDataUrl);
    setIsIdentifying(true);

    try {
      const response = await askGuide({
        question: '',
        language,
        sessionId,
        imageBase64: compressed.base64,
        imageMimeType: compressed.mimeType,
        includeAudio: true,
      });

      setSnapResult(response);
      setActiveMapSlug(response.landmarkSlug);
    } catch (error) {
      setLastFailedImage(compressed);
      setSnapError(error instanceof Error ? error.message : 'Unable to identify photo');
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleSnapAnyPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const compressed = await compressImageToBase64(file);
      await runSnapIdentify(compressed);
    } catch (error) {
      setSnapError(error instanceof Error ? error.message : 'Could not process image');
    }
  };

  const ui = TOURIST_UI[language];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 pb-14 pt-4 sm:px-6">
      {/* Clean Top Bar + Single-Row 6-Language Capsule */}
      <header className="mb-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#EAE6DF] bg-white">
              <Compass className="h-4 w-4 text-[#0E7470]" />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight text-[#14181F]">
              SmartGuide
            </span>
          </div>

          <span className="rounded-full border border-[#B47B38]/25 bg-[#FDF6EC] px-2.5 py-0.5 text-[11px] font-semibold text-[#B47B38]">
            {ui.siteBadge}
          </span>
        </div>

        <LanguageSwitcher value={language} onChange={handleLanguageChange} />
      </header>

      {/* Compact Sunlit Hero + Camera Action (Zero Duplicate Photo, Zero Text Truncation) */}
      <section className="rounded-3xl border border-[#EAE6DF] bg-white p-5 shadow-sm sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0E7470]">
          {ui.heroEyebrow}
        </p>
        <h1 className="mt-1 font-display text-[28px] font-semibold leading-[1.12] tracking-tight text-[#14181F] sm:text-4xl">
          {ui.heroTitle}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#5C6370]">
          {ui.heroSubtitle}
        </p>

        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#EAE6DF] bg-[#FAF8F5] px-3 py-1 text-[11px] font-medium text-[#5C6370]">
          <Headphones className="h-3.5 w-3.5 text-[#0E7470]" />
          <span>{ui.tourMetaLabel}</span>
        </div>

        {/* Snap & Ask Viewfinder Button */}
        <div className="mt-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleSnapAnyPhoto}
          />
          <button
            type="button"
            disabled={isIdentifying}
            onClick={() => fileInputRef.current?.click()}
            className="group flex w-full items-center justify-between gap-3 rounded-2xl bg-[#0E7470] px-4 py-3.5 text-left text-white shadow-xs transition hover:bg-[#0A5C59] active:scale-[0.99] disabled:opacity-70 cursor-pointer sm:px-5"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <span className="block text-sm font-semibold">
                  {isIdentifying ? ui.scanningPhoto : ui.snapAnyButton}
                </span>
                <span className="block text-xs text-white/85">{ui.snapAnyHint}</span>
              </div>
            </div>
            <ScanLine className="h-5 w-5 shrink-0 text-white/90 transition group-hover:scale-110" />
          </button>
        </div>

        {/* Scanning Preview State */}
        {isIdentifying && snapPreviewUrl && (
          <div className="mt-4 flex items-center gap-3.5 rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-3.5 animate-fade-slide">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#EAE6DF]">
              <img
                src={snapPreviewUrl}
                alt="Scanning monument"
                className="h-full w-full object-cover"
              />
              <span className="pointer-events-none absolute left-1 top-1 h-2.5 w-2.5 border-l-2 border-t-2 border-[#0E7470]" />
              <span className="pointer-events-none absolute right-1 top-1 h-2.5 w-2.5 border-r-2 border-t-2 border-[#0E7470]" />
              <span className="pointer-events-none absolute bottom-1 left-1 h-2.5 w-2.5 border-b-2 border-l-2 border-[#0E7470]" />
              <span className="pointer-events-none absolute bottom-1 right-1 h-2.5 w-2.5 border-b-2 border-r-2 border-[#0E7470]" />
              <div className="animate-scan-line absolute left-0 right-0 h-0.5 bg-[#0E7470]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#14181F]">{ui.scanningPhoto}</p>
              <p className="mt-0.5 text-xs text-[#5C6370]">{ui.thinkingMessage}</p>
            </div>
          </div>
        )}

        {/* Error + Retry Card */}
        {snapError && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800 animate-fade-slide">
            <span className="min-w-0 flex-1">
              {ui.errorPrefix} {snapError}
            </span>
            {lastFailedImage && (
              <button
                type="button"
                onClick={() => void runSnapIdentify(lastFailedImage)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-800 transition cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>{ui.retryButton}</span>
              </button>
            )}
          </div>
        )}

        {/* Snap & Identify Result Card */}
        {snapResult && (
          <div className="mt-4 rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-4 animate-fade-slide">
            <div className="flex items-start gap-3.5">
              {snapPreviewUrl && (
                <img
                  src={snapPreviewUrl}
                  alt="Captured monument"
                  className="h-16 w-16 shrink-0 rounded-xl border border-[#EAE6DF] object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1 rounded-full border border-[#B47B38]/25 bg-[#FDF6EC] px-2.5 py-0.5 text-[11px] font-semibold text-[#B47B38]">
                  <Camera className="h-3 w-3" />
                  <span>{ui.visionDetectedBadge}</span>
                </span>
                <h3 className="mt-1.5 font-display text-lg font-semibold text-[#14181F]">
                  {snapResult.landmarkName}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#5C6370]">
                  {snapResult.answer}
                </p>
              </div>
            </div>

            <AudioGuidePlayer
              audioBase64={snapResult.audioBase64}
              audioMimeType={snapResult.audioMimeType}
              fallbackText={snapResult.answer}
              language={language}
              autoPlay
            />

            <button
              type="button"
              onClick={() => router.push(`/l/${snapResult.landmarkSlug}?lang=${language}`)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#0E7470]/30 bg-[#EEF7F6] px-3.5 py-2.5 text-xs font-semibold text-[#0E7470] transition hover:bg-[#0E7470] hover:text-white cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>
                {ui.switchDetectedLandmark} {snapResult.landmarkName}
              </span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </section>

      {/* Interactive Citadel Walking Map (Immediately Visible on Mobile!) */}
      <div className="mt-5">
        <IchanQalaMap
          landmarks={landmarks}
          activeSlug={activeMapSlug}
          onSelectSlug={setActiveMapSlug}
          language={language}
          title={ui.mapTitle}
          subtitle={ui.mapSubtitle}
          openLabel={ui.startAudioGuide}
        />
      </div>

      {/* All 5 Monument Cards — Clean 2-Column Editorial Gallery */}
      <section className="mt-7 flex-1">
        <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-xl font-semibold tracking-tight text-[#14181F] sm:text-2xl">
            {ui.landmarksHeading}
          </h2>
          <span className="text-xs font-medium text-[#5C6370]">{ui.routeSummary}</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {landmarks.map((landmark, idx) => {
            const stopNum = String(idx + 1).padStart(2, '0');
            const localizedName = landmark.localizedNames[language] || landmark.name;
            const localizedDesc =
              landmark.localizedShortDescriptions[language] || landmark.shortDescription;
            const isFirst = idx === 0;

            return (
              <Link
                key={landmark.slug}
                href={`/l/${landmark.slug}?lang=${language}`}
                onClick={() => saveLanguage(language)}
                className={[
                  'group flex flex-col overflow-hidden rounded-2xl border border-[#EAE6DF] bg-white shadow-sm transition-all hover:border-[#0E7470]/45 hover:shadow-md',
                  isFirst ? 'sm:col-span-2 sm:grid sm:grid-cols-12' : '',
                ].join(' ')}
              >
                <div
                  className={[
                    'relative overflow-hidden bg-[#EAE6DF]/40',
                    isFirst ? 'h-48 sm:col-span-6 sm:h-full sm:min-h-[210px]' : 'aspect-[16/10] w-full',
                  ].join(' ')}
                >
                  <LandmarkArt
                    slug={landmark.slug}
                    alt={localizedName}
                    className="h-full w-full transition duration-500 group-hover:scale-[1.03]"
                  />
                  <span className="absolute left-3 top-3 rounded-full border border-[#EAE6DF] bg-white/95 px-2.5 py-0.5 text-[11px] font-bold tabular-nums text-[#14181F] shadow-xs backdrop-blur-xs">
                    {isFirst ? ui.startHereBadge : stopNum}
                  </span>
                </div>

                <div
                  className={[
                    'flex flex-1 flex-col justify-between p-4 sm:p-5',
                    isFirst ? 'sm:col-span-6' : '',
                  ].join(' ')}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0E7470]">
                        {landmark.builtYear}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5C6370]">
                        <Headphones className="h-3 w-3 text-[#0E7470]" />
                        <span>{ui.audioIntroBadge}</span>
                      </span>
                    </div>

                    <h3
                      className={[
                        'mt-1.5 font-display font-semibold leading-snug text-[#14181F] transition group-hover:text-[#0E7470]',
                        isFirst ? 'text-2xl' : 'text-xl',
                      ].join(' ')}
                    >
                      {localizedName}
                    </h3>
                    <p
                      className={[
                        'mt-1.5 text-xs leading-relaxed text-[#5C6370]',
                        isFirst ? 'line-clamp-3 sm:text-sm' : 'line-clamp-2',
                      ].join(' ')}
                    >
                      {localizedDesc}
                    </p>
                  </div>

                  <div className="mt-3.5 flex items-center justify-between border-t border-[#EAE6DF] pt-3">
                    <span className="truncate pr-2 text-[11px] text-[#5C6370]">{landmark.era}</span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#0E7470] transition group-hover:translate-x-0.5">
                      <span>{isFirst ? ui.startAudioGuide : ui.openStopLink}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {landmarks.length === 0 && (
          <div className="rounded-2xl border border-[#EAE6DF] bg-white p-6 text-center text-sm text-[#5C6370] shadow-sm">
            <p>Connecting to Ichan-Qala monument archive...</p>
            <button
              type="button"
              onClick={() => {
                fetchLandmarks().then(setLandmarks).catch(() => {});
              }}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#0E7470] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0A5C59] transition cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>{ui.retryButton}</span>
            </button>
          </div>
        )}
      </section>

      <footer className="mt-12 border-t border-[#EAE6DF] pt-5 text-center text-xs text-[#5C6370]">
        Ichan-Qala State Historical &amp; Architectural Museum-Reserve · Khiva
      </footer>
    </main>
  );
}
