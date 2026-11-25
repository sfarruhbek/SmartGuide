'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Camera,
  ChevronRight,
  Compass,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Volume2,
} from 'lucide-react';
import type { GuideAskResponse, LandmarkSummary, SupportedLanguage } from '@smartguide/shared';
import { askGuide, fetchLandmarks } from '@/lib/api';
import { TOURIST_UI } from '@/lib/i18n';
import { compressImageToBase64 } from '@/lib/image-utils';
import { getOrCreateSessionId, getSavedLanguage, saveLanguage } from '@/lib/session';
import { AudioGuidePlayer } from './AudioGuidePlayer';
import { LandmarkArt } from './LandmarkArt';
import { LanguageSwitcher } from './LanguageSwitcher';

interface TouristHomeClientProps {
  initialLandmarks: LandmarkSummary[];
  initialLang?: string;
}

export function TouristHomeClient({ initialLandmarks, initialLang }: TouristHomeClientProps) {
  const router = useRouter();
  const [landmarks, setLandmarks] = useState<LandmarkSummary[]>(initialLandmarks);
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [sessionId, setSessionId] = useState<string>('guest-session');
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [snapPreviewUrl, setSnapPreviewUrl] = useState<string | null>(null);
  const [snapResult, setSnapResult] = useState<GuideAskResponse | null>(null);
  const [snapError, setSnapError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLanguage(getSavedLanguage(initialLang));
    setSessionId(getOrCreateSessionId());

    if (initialLandmarks.length === 0) {
      fetchLandmarks()
        .then(setLandmarks)
        .catch(() => {});
    }
  }, [initialLang, initialLandmarks.length]);

  const handleLanguageChange = (nextLang: SupportedLanguage) => {
    setLanguage(nextLang);
    saveLanguage(nextLang);
  };

  const handleSnapAnyPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setSnapError(null);
    setSnapResult(null);
    setIsIdentifying(true);

    try {
      const compressed = await compressImageToBase64(file);
      setSnapPreviewUrl(compressed.previewDataUrl);

      const response = await askGuide({
        question: '',
        language,
        sessionId,
        imageBase64: compressed.base64,
        imageMimeType: compressed.mimeType,
        includeAudio: true,
      });

      setSnapResult(response);
    } catch (error) {
      setSnapError(error instanceof Error ? error.message : 'Unable to identify photo');
    } finally {
      setIsIdentifying(false);
    }
  };

  const ui = TOURIST_UI[language];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 pb-12 pt-5 sm:px-6">
      {/* Top Bar */}
      <header className="mb-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/40 bg-gradient-to-br from-amber-400/20 to-teal-500/20 shadow-lg shadow-amber-500/10">
              <Compass className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <span className="font-display text-lg font-bold tracking-wide text-amber-200">
                SmartGuide
              </span>
              <p className="text-[11px] uppercase tracking-[0.18em] text-teal-300/90">
                Ichan-Qala · Khiva
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-400/35 bg-teal-500/10 px-3 py-1 text-[11px] font-medium text-teal-200">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-300" />
            0% Hallucinations
          </span>
        </div>

        <LanguageSwitcher value={language} onChange={handleLanguageChange} />
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-amber-400/25 bg-gradient-to-br from-slate-900/95 via-[#0F182A] to-teal-950/50 p-5 shadow-2xl shadow-black/40 sm:p-6">
        <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-amber-200">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          {ui.siteBadge}
        </div>

        <h1 className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
          {ui.heroTitle}
        </h1>
        <p className="mt-2.5 text-sm leading-relaxed text-slate-300">{ui.heroSubtitle}</p>

        {/* Quick Snap & Identify Monument CTA */}
        <div className="mt-5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleSnapAnyPhoto}
          />
          <button
            type="button"
            disabled={isIdentifying}
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition hover:brightness-105 active:scale-[0.99] disabled:opacity-70 cursor-pointer"
          >
            {isIdentifying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{ui.identifyingPhoto}</span>
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                <span>{ui.snapAnyButton}</span>
              </>
            )}
          </button>
          <p className="mt-2 text-center text-xs text-slate-400">{ui.snapAnyHint}</p>
        </div>

        {/* Snap & Identify Result Card */}
        {snapError && (
          <div className="mt-4 rounded-2xl border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-200">
            {ui.errorPrefix} {snapError}
          </div>
        )}

        {snapResult && (
          <div className="mt-4 rounded-2xl border border-teal-400/40 bg-slate-950/85 p-4">
            <div className="flex items-start gap-3">
              {snapPreviewUrl && (
                <img
                  src={snapPreviewUrl}
                  alt="Captured monument"
                  className="h-16 w-16 shrink-0 rounded-xl border border-slate-700 object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/15 px-2.5 py-0.5 text-[11px] font-medium text-teal-300">
                  <Camera className="h-3 w-3" />
                  {ui.visionDetectedBadge}
                </span>
                <h3 className="mt-1 font-display text-base font-bold text-amber-200">
                  {snapResult.landmarkName}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-200">{snapResult.answer}</p>
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
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-400/50 bg-amber-400/15 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-400/25 transition cursor-pointer"
            >
              <span>
                {ui.switchDetectedLandmark} {snapResult.landmarkName}
              </span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </section>

      {/* 5 Landmarks Grid */}
      <section className="mt-7 flex-1">
        <div className="mb-3.5 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-amber-100">{ui.landmarksHeading}</h2>
          <span className="text-xs text-slate-400">{ui.verifiedTag}</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {landmarks.map((landmark, index) => {
            const localizedName = landmark.localizedNames[language] || landmark.name;
            const localizedDesc =
              landmark.localizedShortDescriptions[language] || landmark.shortDescription;

            return (
              <Link
                key={landmark.slug}
                href={`/l/${landmark.slug}?lang=${language}`}
                className="group relative overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/75 transition hover:border-amber-400/50 hover:bg-slate-900/95 hover:shadow-xl hover:shadow-amber-500/10"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="relative h-36 w-full shrink-0 overflow-hidden sm:h-auto sm:w-40">
                    <LandmarkArt slug={landmark.slug} className="h-full w-full transition duration-500 group-hover:scale-105" />
                    <div className="absolute left-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full border border-amber-400/50 bg-slate-950/80 text-xs font-bold text-amber-300">
                      {index + 1}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-teal-300">
                          {landmark.builtYear}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                          <Volume2 className="h-3 w-3 text-amber-300" />
                          Audio AI
                        </span>
                      </div>

                      <h3 className="mt-1 font-display text-lg font-bold text-white group-hover:text-amber-200 transition">
                        {localizedName}
                      </h3>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-300">
                        {localizedDesc}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5">
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 truncate max-w-[65%]">
                        <MapPin className="h-3 w-3 shrink-0 text-amber-400/80" />
                        <span className="truncate">{landmark.locationInSite}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 group-hover:translate-x-0.5 transition">
                        {ui.exploreGuide}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="mt-10 border-t border-slate-800/80 pt-5 text-center text-xs text-slate-500">
        SmartGuide · Official Digital Tour Guide Infrastructure · Ichan-Qala State Museum-Reserve, Khiva
      </footer>
    </main>
  );
}
