'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Camera,
  Headphones,
  Loader2,
  Map,
  RefreshCw,
  ScanLine,
  ShieldCheck,
} from 'lucide-react';
import type {
  GuideAskResponse,
  LandmarkSummary,
  SupportedLanguage,
} from '@smartguide/shared';
import { askGuide, fetchLandmarks } from '@/lib/api';
import { TOURIST_UI } from '@/lib/i18n';
import { ROUTE_COPY } from '@/lib/route-copy';
import { compressImageToBase64 } from '@/lib/image-utils';
import {
  getOrCreateSessionId,
  getSavedLanguage,
  saveLanguage,
  updateLanguage,
} from '@/lib/session';
import { AudioGuidePlayer } from './AudioGuidePlayer';
import { IchanQalaMap } from './IchanQalaMap';
import { LandmarkArt } from './LandmarkArt';
import { TouristHeader } from './TouristHeader';
import { RoadmapBuilder } from './RoadmapBuilder';

interface TouristHomeClientProps {
  initialLandmarks: LandmarkSummary[];
  initialLang?: string;
}

interface CompressedPhoto {
  base64: string;
  mimeType: string;
  previewDataUrl: string;
}

export function KhivaPilotClient({
  initialLandmarks,
  initialLang,
}: TouristHomeClientProps) {
  const [landmarks, setLandmarks] = useState(initialLandmarks);
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [activeMapSlug, setActiveMapSlug] = useState(
    initialLandmarks[0]?.slug ?? 'kalta-minor',
  );
  const [showMap, setShowMap] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [snapPreviewUrl, setSnapPreviewUrl] = useState<string | null>(null);
  const [snapResult, setSnapResult] = useState<GuideAskResponse | null>(null);
  const [snapError, setSnapError] = useState(false);
  const [lastFailedImage, setLastFailedImage] =
    useState<CompressedPhoto | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);
  const ui = TOURIST_UI[language];
  const copy = ROUTE_COPY[language];
  const first = landmarks[0];
  const heroLandmark =
    landmarks.find((landmark) => landmark.slug === 'pahlavon-mahmud') ?? first;

  useEffect(() => {
    const lang = getSavedLanguage(initialLang);
    setLanguage(lang);
    saveLanguage(lang);
    if (initialLandmarks.length === 0)
      fetchLandmarks()
        .then(setLandmarks)
        .catch(() => {});
  }, [initialLang, initialLandmarks.length]);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
    updateLanguage(lang);
  };

  const identifyPhoto = async (photo: CompressedPhoto) => {
    setSnapError(false);
    setSnapResult(null);
    setLastFailedImage(null);
    setSnapPreviewUrl(photo.previewDataUrl);
    setIsIdentifying(true);
    busyRef.current = true;
    try {
      const result = await askGuide({
        question: '',
        language,
        sessionId: getOrCreateSessionId(),
        imageBase64: photo.base64,
        imageMimeType: photo.mimeType,
        includeAudio: true,
      });
      setSnapResult(result);
      setActiveMapSlug(result.landmarkSlug);
    } catch {
      setLastFailedImage(photo);
      setSnapError(true);
    } finally {
      busyRef.current = false;
      setIsIdentifying(false);
    }
  };

  const handlePhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || busyRef.current) return;
    busyRef.current = true;
    setIsIdentifying(true);
    setSnapError(false);
    setSnapResult(null);
    setLastFailedImage(null);
    const preview = URL.createObjectURL(file);
    setSnapPreviewUrl(preview);
    try {
      await identifyPhoto(await compressImageToBase64(file));
    } catch {
      setSnapError(true);
      busyRef.current = false;
      setIsIdentifying(false);
    } finally {
      URL.revokeObjectURL(preview);
    }
  };

  return (
    <div className="tourist-app">
      <TouristHeader
        language={language}
        onLanguageChange={handleLanguageChange}
      />
      <main className="home-layout">
        <section className="route-hero" aria-labelledby="walk-title">
          <div className="hero-intro">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 id="walk-title" className="hero-title">
              {copy.title}
              <em>{copy.titleAccent}</em>
            </h1>
          </div>
          <figure className="hero-photograph">
            <LandmarkArt
              slug={heroLandmark?.slug ?? 'pahlavon-mahmud'}
              alt={heroLandmark?.localizedNames[language] ?? copy.route}
              className="hero-image"
              priority
            />
            <figcaption>
              <span>Ichan-Qala</span>
              <span>Khiva, Uzbekistan</span>
            </figcaption>
          </figure>
          <p className="hero-description">{copy.description}</p>
          <div className="hero-actions">
            <Link href="#personal-walk" className="primary-action">
              <Headphones aria-hidden="true" />
              <span>{copy.start}</span>
            </Link>
            <p className="quiet-meta">{copy.noAccount}</p>
          </div>
        </section>

        <RoadmapBuilder landmarks={landmarks} language={language} />

        <section className="snap-section" aria-label={copy.cameraTitle}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            className="sr-only"
            tabIndex={-1}
            aria-label={ui.snapButton}
            disabled={isIdentifying}
          />
          <button
            className="camera-action"
            type="button"
            disabled={isIdentifying}
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="camera-glyph">
              {isIdentifying ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <ScanLine aria-hidden="true" />
              )}
            </span>
            <span>
              <strong>
                {isIdentifying ? ui.scanningPhoto : copy.cameraTitle}
              </strong>
              <small>{copy.cameraDescription}</small>
            </span>
            <Camera className="camera-end-icon" aria-hidden="true" />
          </button>
          {isIdentifying && (
            <div className="scan-progress" role="status">
              {snapPreviewUrl && (
                <div className="scan-thumbnail">
                  <img src={snapPreviewUrl} alt={copy.photoAlt} />
                  <span className="scan-beam" />
                </div>
              )}
              <span>{ui.scanningPhoto}</span>
            </div>
          )}
          {snapError && (
            <div className="feedback-error" role="alert">
              <p>{lastFailedImage ? copy.requestError : copy.photoError}</p>
              <button
                type="button"
                className="text-action"
                onClick={() =>
                  lastFailedImage
                    ? void identifyPhoto(lastFailedImage)
                    : fileInputRef.current?.click()
                }
              >
                <RefreshCw aria-hidden="true" />
                {ui.retryButton}
              </button>
            </div>
          )}
          {snapResult && (
            <article className="snap-result" aria-live="polite">
              <p className="eyebrow">
                {snapResult.identifiedByVision
                  ? ui.visionDetectedBadge
                  : copy.source}
              </p>
              <h2 className="section-title">{snapResult.landmarkName}</h2>
              <p>{snapResult.answer}</p>
              <AudioGuidePlayer
                key={snapResult.interactionId}
                audioBase64={snapResult.audioBase64}
                audioMimeType={snapResult.audioMimeType}
                fallbackText={snapResult.answer}
                language={snapResult.language}
                autoPlay
              />
              <Link
                className="text-action"
                href={`/l/${snapResult.landmarkSlug}?lang=${language}`}
              >
                {ui.switchDetectedLandmark} {snapResult.landmarkName}
              </Link>
            </article>
          )}
        </section>

        <section
          id="city-walk"
          className="city-walk"
          aria-labelledby="route-heading"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">ICHAN-QALA · UNESCO</p>
              <h2 id="route-heading" className="section-title">
                {copy.route}
              </h2>
            </div>
            <button
              type="button"
              className="text-action map-toggle"
              aria-expanded={showMap}
              aria-controls="walking-map"
              onClick={() => setShowMap(!showMap)}
            >
              <Map aria-hidden="true" />
              {showMap ? copy.hideMap : copy.map}
            </button>
          </div>
          {landmarks.length > 0 && (
            <nav className="walk-progress" aria-label={copy.route}>
              {landmarks.map((landmark, index) => (
                <Link
                  key={landmark.slug}
                  href={`#stop-${landmark.slug}`}
                  aria-label={`${index + 1}. ${landmark.localizedNames[language]}`}
                >
                  <span className="walk-node">{index + 1}</span>
                  <span className="walk-node-label">
                    {landmark.localizedNames[language]}
                  </span>
                </Link>
              ))}
            </nav>
          )}
          {showMap && (
            <div id="walking-map" className="walking-map">
              <IchanQalaMap
                landmarks={landmarks}
                activeSlug={activeMapSlug}
                onSelectSlug={setActiveMapSlug}
                language={language}
                title={ui.mapTitle}
                subtitle={ui.mapSubtitle}
                openLabel={ui.exploreGuide}
              />
            </div>
          )}
          <div className="route-stops">
            {landmarks.map((landmark, index) => (
              <Link
                id={`stop-${landmark.slug}`}
                key={landmark.slug}
                href={`/l/${landmark.slug}?lang=${language}`}
                className="route-stop"
              >
                <div className="stop-photo">
                  <LandmarkArt
                    slug={landmark.slug}
                    alt={landmark.localizedNames[language]}
                  />
                </div>
                <div className="stop-copy">
                  <span className="stop-kicker">
                    {ui.stopLabel} {String(index + 1).padStart(2, '0')}{' '}
                    <span> / {String(landmarks.length).padStart(2, '0')}</span>
                  </span>
                  <h3>{landmark.localizedNames[language]}</h3>
                  <p>{landmark.localizedShortDescriptions[language]}</p>
                  <span className="stop-listen">
                    <Headphones aria-hidden="true" />
                    {ui.openStopLink}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          {landmarks.length === 0 && (
            <div className="archive-empty" role="status">
              <p>{copy.connecting}</p>
              <button
                className="text-action"
                type="button"
                onClick={() =>
                  fetchLandmarks()
                    .then(setLandmarks)
                    .catch(() => {})
                }
              >
                <RefreshCw aria-hidden="true" />
                {ui.retryButton}
              </button>
            </div>
          )}
        </section>
        <footer className="tourist-footer">
          <span className="brand-wordmark">smartguide</span>
          <p>
            <ShieldCheck aria-hidden="true" />
            {copy.source}
          </p>
          <span className="quiet-meta">Ichan-Qala · Khiva</span>
        </footer>
      </main>
    </div>
  );
}
