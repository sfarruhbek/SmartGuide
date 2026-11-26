'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Camera,
  Check,
  ChevronDown,
  Copy,
  Headphones,
  Loader2,
  Maximize2,
  Mic,
  MicOff,
  Play,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldCheck,
  Volume2,
  X,
} from 'lucide-react';
import {
  SUPPORTED_LANGUAGES,
  type LandmarkDetail,
  type LandmarkSummary,
  type SupportedLanguage,
} from '@smartguide/shared';
import { askGuide, fetchLandmarks, trackLandmarkScan } from '@/lib/api';
import { TOURIST_UI } from '@/lib/i18n';
import { ROUTE_COPY } from '@/lib/route-copy';
import { EXPERIENCE_COPY } from '@/lib/experience-copy';
import {
  readSavedRoadmap,
  roadmapLink,
  type GuideResponse,
  type SavedRoadmap,
} from '@/lib/experience';
import { compressImageToBase64 } from '@/lib/image-utils';
import {
  getOrCreateSessionId,
  getSavedLanguage,
  saveLanguage,
  updateLanguage,
  createLocalId,
} from '@/lib/session';
import { AudioGuidePlayer } from './AudioGuidePlayer';
import { LandmarkArt } from './LandmarkArt';
import { MonumentQuickNav } from './MonumentQuickNav';
import { TouristHeader } from './TouristHeader';
import { GuideFeedback } from './GuideFeedback';
import { journeyCopy } from '@/lib/journey-copy';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  language: SupportedLanguage;
  imagePreviewUrl?: string;
  response?: GuideResponse;
}

interface PhotoPayload {
  base64: string;
  mimeType: string;
  previewDataUrl: string;
}
interface FailedPayload {
  text: string;
  photo: PhotoPayload | null;
  intro: boolean;
}
interface Props {
  landmark: LandmarkDetail;
  allLandmarks?: LandmarkSummary[];
  initialLang?: string;
  initialRoadmapId?: string;
}
interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult:
    | ((event: {
        results: ArrayLike<ArrayLike<{ transcript: string }>>;
      }) => void)
    | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

export function LandmarkGuideClient({
  landmark,
  allLandmarks: initialLandmarks = [],
  initialLang,
  initialRoadmapId,
}: Props) {
  const [allLandmarks, setAllLandmarks] = useState(initialLandmarks);
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [question, setQuestion] = useState('');
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [requestMode, setRequestMode] = useState<'intro' | 'question'>(
    'question',
  );
  const [loadingPhotoPreview, setLoadingPhotoPreview] = useState<string | null>(
    null,
  );
  const [introResponse, setIntroResponse] = useState<GuideResponse | null>(
    null,
  );
  const [isListening, setIsListening] = useState(false);
  const [voiceHint, setVoiceHint] = useState(false);
  const [errorMessage, setErrorMessage] = useState<'photo' | 'request' | null>(
    null,
  );
  const [lastFailedPayload, setLastFailedPayload] =
    useState<FailedPayload | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [dossierTab, setDossierTab] = useState<
    'facts' | 'architecture' | 'legends'
  >('facts');
  const [pendingPhoto, setPendingPhoto] = useState<PhotoPayload | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeRoadmap, setActiveRoadmap] = useState<SavedRoadmap | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const latestResponseRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const busyRef = useRef(false);
  const requestController = useRef<AbortController | null>(null);
  const photoBusyRef = useRef(false);
  const languageRef = useRef(language);
  languageRef.current = language;
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ui = TOURIST_UI[language];
  const copy = ROUTE_COPY[language];
  const experienceCopy = EXPERIENCE_COPY[language];
  const localizedName = landmark.localizedNames[language];
  const localizedDescription = landmark.localizedShortDescriptions[language];
  const questions = landmark.suggestedQuestions[language];
  const allStopIndex = allLandmarks.findIndex(
    (item) => item.slug === landmark.slug,
  );
  const routeIndex =
    activeRoadmap?.roadmap.stops.findIndex(
      (stop) => stop.slug === landmark.slug,
    ) ?? -1;
  const routeStop = activeRoadmap?.roadmap.stops[routeIndex];
  const nextRouteStop = activeRoadmap?.roadmap.stops[routeIndex + 1];
  const latestResponse =
    messages
      .slice()
      .reverse()
      .find((message) => message.response)?.response ?? introResponse;
  const suggestedNext = allLandmarks.find(
    (item) => item.slug === latestResponse?.nextStopSuggestion?.slug,
  );
  const nextLandmark = activeRoadmap
    ? allLandmarks.find((item) => item.slug === nextRouteStop?.slug)
    : (suggestedNext ??
      (allStopIndex >= 0 ? allLandmarks[allStopIndex + 1] : undefined));
  const navigationLandmarks = activeRoadmap
    ? activeRoadmap.roadmap.stops.flatMap((stop) => {
        const item = allLandmarks.find((item) => item.slug === stop.slug);
        return item ? [item] : [];
      })
    : allLandmarks;
  const emotionalPromise =
    activeRoadmap?.roadmap.language === language
      ? routeStop?.emotionalPayoff
      : experienceCopy.promises[landmark.slug];
  const busy = isLoading || isProcessingPhoto;

  useEffect(() => {
    const stored = readSavedRoadmap();
    const matchingId =
      !initialRoadmapId ||
      String(stored?.roadmap.roadmapId) === initialRoadmapId;
    setActiveRoadmap(
      matchingId &&
        stored?.roadmap.stops.some((stop) => stop.slug === landmark.slug)
        ? stored
        : null,
    );
  }, [landmark.slug, initialRoadmapId]);

  useEffect(() => {
    const lang = getSavedLanguage(initialLang);
    setLanguage(lang);
    saveLanguage(lang);
    if (initialLandmarks.length === 0)
      fetchLandmarks()
        .then(setAllLandmarks)
        .catch(() => {});
    try {
      const scanKey = `scanned:${landmark.slug}`;
      if (!sessionStorage.getItem(scanKey)) {
        sessionStorage.setItem(scanKey, '1');
        void trackLandmarkScan({
          slug: landmark.slug,
          sessionId: getOrCreateSessionId(),
          language: lang,
        });
      }
    } catch {
      /* Storage can be unavailable in private browsing. */
    }
  }, [initialLang, initialLandmarks.length, landmark.slug]);

  useEffect(
    () => () => {
      requestController.current?.abort();
      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.onresult = null;
        recognition.onend = null;
        recognition.onerror = null;
        recognition.stop();
      }
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (requestMode === 'intro') return;
    const target =
      isLoading || isProcessingPhoto
        ? loadingRef.current
        : latestResponseRef.current;
    if (target)
      target.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
        block: 'nearest',
      });
  }, [messages.length, isLoading, isProcessingPhoto, requestMode]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    dialogRef.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isLightboxOpen]);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    requestController.current?.abort();
    requestController.current = null;
    busyRef.current = false;
    setIsLoading(false);
    setLoadingPhotoPreview(null);
    setLastFailedPayload(null);
    setErrorMessage(null);
    recognitionRef.current?.stop();
    setIsListening(false);
    setLanguage(lang);
    updateLanguage(lang);
    setIntroResponse(null);
    setVoiceHint(false);
  };

  const submitQuestion = async (
    text: string,
    photo: PhotoPayload | null = pendingPhoto,
    intro = false,
    retry = false,
  ) => {
    const trimmed = text.trim();
    if ((!trimmed && !photo) || busyRef.current) return;
    busyRef.current = true;
    const controller = new AbortController();
    requestController.current = controller;
    textInputRef.current?.blur();
    recognitionRef.current?.stop();
    setErrorMessage(null);
    setVoiceHint(false);
    setLastFailedPayload(null);
    setRequestMode(intro ? 'intro' : 'question');
    if (!intro && !retry)
      setMessages((previous) => [
        ...previous,
        {
          id: createLocalId('user'),
          role: 'user',
          text: trimmed || ui.snapButton,
          imagePreviewUrl: photo?.previewDataUrl,
          language,
        },
      ]);
    setQuestion('');
    setPendingPhoto(null);
    setLoadingPhotoPreview(photo?.previewDataUrl ?? null);
    setIsLoading(true);
    try {
      const response = await askGuide(
        {
          landmarkSlug: landmark.slug,
          roadmapId: activeRoadmap?.roadmap.roadmapId ?? undefined,
          question: trimmed,
          language,
          sessionId: getOrCreateSessionId(),
          imageBase64: photo?.base64,
          imageMimeType: photo?.mimeType,
          includeAudio: true,
        },
        { signal: controller.signal },
      );
      if (controller.signal.aborted) return;
      if (intro && response.language === languageRef.current)
        setIntroResponse(response);
      else if (intro) return;
      else
        setMessages((previous) => [
          ...previous,
          {
            id: createLocalId('ai'),
            role: 'assistant',
            text: response.answer,
            language: response.language,
            response,
          },
        ]);
    } catch {
      if (controller.signal.aborted) return;
      setLastFailedPayload({ text: trimmed, photo, intro });
      setErrorMessage('request');
    } finally {
      if (requestController.current === controller) {
        requestController.current = null;
        busyRef.current = false;
        setIsLoading(false);
        setLoadingPhotoPreview(null);
      }
    }
  };

  const handlePhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || busyRef.current || photoBusyRef.current) return;
    photoBusyRef.current = true;
    setIsProcessingPhoto(true);
    setRequestMode('question');
    setErrorMessage(null);
    setLastFailedPayload(null);
    const preview = URL.createObjectURL(file);
    setLoadingPhotoPreview(preview);
    try {
      const photo = await compressImageToBase64(file);
      if (question.trim()) setPendingPhoto(photo);
      else await submitQuestion('', photo);
    } catch {
      setErrorMessage('photo');
    } finally {
      URL.revokeObjectURL(preview);
      photoBusyRef.current = false;
      setIsProcessingPhoto(false);
      setLoadingPhotoPreview(null);
    }
  };

  const handleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const speechWindow = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRecognition =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceHint(true);
      textInputRef.current?.focus();
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang =
      SUPPORTED_LANGUAGES.find((item) => item.code === language)
        ?.speechRecognitionLang ?? 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript?.trim();
      if (text) void submitQuestion(text);
    };
    recognition.onerror = () => {
      setIsListening(false);
      setVoiceHint(true);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    setVoiceHint(false);
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setVoiceHint(true);
      setIsListening(false);
      textInputRef.current?.focus();
    }
  };

  const copyAnswer = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMsgId(id);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopiedMsgId(null), 2000);
    } catch {
      /* Clipboard access is optional on local HTTP. */
    }
  };

  const errorFeedback = errorMessage && (
    <div className="feedback-error" role="alert">
      <p>{errorMessage === 'photo' ? copy.photoError : copy.requestError}</p>
      <button
        className="text-action"
        type="button"
        disabled={busy}
        onClick={() =>
          lastFailedPayload
            ? void submitQuestion(
                lastFailedPayload.text,
                lastFailedPayload.photo,
                lastFailedPayload.intro,
                true,
              )
            : fileInputRef.current?.click()
        }
      >
        <RefreshCw aria-hidden="true" />
        {ui.retryButton}
      </button>
    </div>
  );

  return (
    <div className="tourist-app guide-app">
      <TouristHeader
        language={language}
        onLanguageChange={handleLanguageChange}
        backLabel={
          activeRoadmap ? ui.backToAll : journeyCopy(language)('navMap')
        }
        backHref={
          activeRoadmap
            ? `/khiva?lang=${language}`
            : `/?lang=${language}&view=map&city=khiva&place=${landmark.slug}`
        }
      />
      <main className="guide-layout">
        {activeRoadmap && (
          <Link
            className="roadmap-progress"
            href={`/?lang=${language}#personal-walk`}
          >
            <span>
              {experienceCopy.progress}
              <strong>
                {routeIndex + 1} / {activeRoadmap.roadmap.stops.length}
              </strong>
            </span>
            <progress
              max={activeRoadmap.roadmap.stops.length}
              value={routeIndex + 1}
              aria-label={experienceCopy.progress}
            />
          </Link>
        )}
        <MonumentQuickNav
          landmarks={navigationLandmarks}
          currentSlug={landmark.slug}
          language={language}
          roadmapId={activeRoadmap?.roadmap.roadmapId}
        />
        <section className="guide-hero" aria-labelledby="monument-title">
          <div className="guide-title-block">
            <p className="eyebrow">{copy.guideEyebrow}</p>
            <h1 id="monument-title" className="monument-title">
              {localizedName}
            </h1>
            <p className="guide-date">
              {landmark.builtYear}
              <span>Ichan-Qala, Khiva</span>
            </p>
            {emotionalPromise && (
              <p className="guide-promise">{emotionalPromise}</p>
            )}
          </div>
          <div className="guide-story">
            {introResponse ? (
              <div className="intro-story" lang={introResponse.language}>
                <AudioGuidePlayer
                  audioBase64={introResponse.audioBase64}
                  audioMimeType={introResponse.audioMimeType}
                  fallbackText={introResponse.answer}
                  language={introResponse.language}
                  autoPlay
                />
                <details className="story-transcript">
                  <summary>
                    {copy.transcript}
                    <ChevronDown aria-hidden="true" />
                  </summary>
                  <p>{introResponse.answer}</p>
                  <small>
                    {ui.verifiedArchive} · {introResponse.archiveCode}
                  </small>
                </details>
                {introResponse.insight?.detectedTopicLabel && (
                  <p className="topic-label">
                    {introResponse.insight.detectedTopicLabel}
                  </p>
                )}
                <GuideFeedback
                  interactionId={introResponse.interactionId}
                  language={language}
                />
              </div>
            ) : (
              <button
                className="primary-action intro-action"
                type="button"
                disabled={busy}
                onClick={() => {
                  setAutoPlayAudio(true);
                  void submitQuestion(ui.introTourPrompt, null, true);
                }}
              >
                <span>
                  {isLoading && requestMode === 'intro' ? (
                    <Loader2 className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Play aria-hidden="true" />
                  )}
                  {isLoading && requestMode === 'intro'
                    ? ui.thinkingMessage
                    : copy.listen}
                </span>
                <small>{ui.audioIntroBadge}</small>
              </button>
            )}
            {requestMode === 'intro' && errorFeedback}
            <p className="museum-credit">
              <ShieldCheck aria-hidden="true" />
              {copy.source}
            </p>
          </div>
          <button
            className="guide-photograph"
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            aria-label={ui.viewFullPhoto}
          >
            <LandmarkArt
              slug={landmark.slug}
              alt={localizedName}
              className="guide-image"
              priority
            />
            <span className="expand-photo">
              <Maximize2 aria-hidden="true" />
              <span>{ui.viewFullPhoto}</span>
            </span>
          </button>
          <p className="guide-description">{localizedDescription}</p>
        </section>

        <section
          className="guide-questions"
          aria-labelledby="questions-heading"
        >
          <div className="section-heading">
            <div>
              <h2 className="section-title" id="questions-heading">
                {copy.questions}
              </h2>
              <p>{copy.questionsHint}</p>
            </div>
            <button
              className="icon-action question-camera"
              type="button"
              disabled={busy}
              onClick={() => fileInputRef.current?.click()}
              aria-label={ui.snapButton}
            >
              <Camera aria-hidden="true" />
            </button>
          </div>
          <div className="question-prompts">
            {questions.map((prompt) => (
              <button
                className="question-prompt"
                key={prompt}
                type="button"
                disabled={busy}
                onClick={() => void submitQuestion(prompt)}
              >
                {prompt}
                <span>
                  <Headphones aria-hidden="true" />
                </span>
              </button>
            ))}
          </div>
          <label className="autoplay-option">
            <input
              type="checkbox"
              checked={autoPlayAudio}
              onChange={(event) => setAutoPlayAudio(event.target.checked)}
            />
            <Volume2 aria-hidden="true" />
            {ui.autoPlayAudio}
          </label>
        </section>

        {(messages.length > 0 ||
          (busy && requestMode === 'question') ||
          (errorMessage && requestMode === 'question') ||
          voiceHint) && (
          <section className="conversation" aria-label={ui.conversationHeading}>
            {messages.length > 0 && (
              <div className="conversation-heading">
                <h2 className="eyebrow">{ui.conversationHeading}</h2>
                <button
                  className="text-action"
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setMessages([]);
                    setErrorMessage(null);
                    setLastFailedPayload(null);
                  }}
                >
                  <RotateCcw aria-hidden="true" />
                  {ui.clearChat}
                </button>
              </div>
            )}
            <div role="log" aria-live="polite" aria-relevant="additions">
              {messages.map((message, index) => (
                <div
                  className={`chat-message chat-${message.role}`}
                  key={message.id}
                  ref={
                    index === messages.length - 1
                      ? latestResponseRef
                      : undefined
                  }
                  lang={message.language}
                >
                  {message.imagePreviewUrl && (
                    <img
                      className="chat-upload"
                      src={message.imagePreviewUrl}
                      alt={copy.photoAlt}
                    />
                  )}
                  {message.response?.identifiedByVision && (
                    <p className="vision-label">
                      <Camera aria-hidden="true" />
                      {ui.visionDetectedBadge}
                    </p>
                  )}
                  {message.response?.insight?.detectedTopicLabel && (
                    <p className="topic-label">
                      {message.response.insight.detectedTopicLabel}
                    </p>
                  )}
                  <p className="chat-text">{message.text}</p>
                  {message.response && (
                    <>
                      <AudioGuidePlayer
                        audioBase64={message.response.audioBase64}
                        audioMimeType={message.response.audioMimeType}
                        fallbackText={message.text}
                        language={message.language}
                        autoPlay={
                          autoPlayAudio && index === messages.length - 1
                        }
                      />
                      <GuideFeedback
                        interactionId={message.response.interactionId}
                        language={language}
                      />
                      {message.response.landmarkSlug !== landmark.slug && (
                        <Link
                          className="text-action detected-landmark"
                          href={roadmapLink(
                            message.response.landmarkSlug,
                            language,
                            activeRoadmap?.roadmap.roadmapId,
                          )}
                        >
                          {ui.switchDetectedLandmark}{' '}
                          {message.response.landmarkName}
                        </Link>
                      )}
                      <footer className="answer-footer">
                        <span>
                          <Check aria-hidden="true" />
                          {ui.verifiedArchive} · {message.response.archiveCode}
                        </span>
                        <button
                          type="button"
                          className="text-action"
                          onClick={() =>
                            void copyAnswer(message.id, message.text)
                          }
                        >
                          {copiedMsgId === message.id ? (
                            <Check aria-hidden="true" />
                          ) : (
                            <Copy aria-hidden="true" />
                          )}
                          {copiedMsgId === message.id
                            ? ui.copiedButton
                            : ui.copyButton}
                        </button>
                      </footer>
                    </>
                  )}
                </div>
              ))}
            </div>
            {busy && requestMode === 'question' && (
              <div ref={loadingRef} className="scan-progress" role="status">
                {loadingPhotoPreview ? (
                  <div className="scan-thumbnail">
                    <img src={loadingPhotoPreview} alt={copy.photoAlt} />
                    <span className="scan-beam" />
                  </div>
                ) : (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                )}
                <span>
                  {loadingPhotoPreview ? ui.scanningPhoto : ui.thinkingMessage}
                </span>
              </div>
            )}
            {requestMode === 'question' && errorFeedback}
            {voiceHint && (
              <p className="voice-hint" role="status">
                {ui.voiceUnsupported}
              </p>
            )}
          </section>
        )}

        <section className="museum-dossier">
          <button
            className="dossier-toggle"
            type="button"
            onClick={() => setIsDossierOpen(!isDossierOpen)}
            aria-expanded={isDossierOpen}
            aria-controls="museum-dossier"
          >
            <BookOpen aria-hidden="true" />
            <span>
              {isDossierOpen ? ui.dossierToggleClose : ui.dossierToggleOpen}
            </span>
            <ChevronDown
              className={isDossierOpen ? 'is-rotated' : ''}
              aria-hidden="true"
            />
          </button>
          {isDossierOpen && (
            <div id="museum-dossier" className="dossier-content">
              <dl className="dossier-facts">
                <div>
                  <dt>{ui.eraLabel}</dt>
                  <dd>{landmark.builtYear}</dd>
                </div>
                <div>
                  <dt>{ui.architectLabel}</dt>
                  <dd lang="en">{landmark.architect}</dd>
                </div>
              </dl>
              <div
                className="dossier-tabs"
                role="tablist"
                aria-label={ui.dossierToggleOpen}
              >
                {(
                  [
                    { id: 'facts', label: ui.factsTab },
                    { id: 'architecture', label: ui.architectureTab },
                    { id: 'legends', label: ui.legendsTab },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    id={`dossier-tab-${tab.id}`}
                    role="tab"
                    aria-selected={dossierTab === tab.id}
                    aria-controls={`dossier-panel-${tab.id}`}
                    type="button"
                    onClick={() => setDossierTab(tab.id)}
                    onKeyDown={(event) => {
                      const tabs = [
                        'facts',
                        'architecture',
                        'legends',
                      ] as const;
                      if (
                        event.key === 'ArrowRight' ||
                        event.key === 'ArrowLeft'
                      ) {
                        event.preventDefault();
                        const next =
                          tabs[
                            (tabs.indexOf(tab.id) +
                              (event.key === 'ArrowRight' ? 1 : 2)) %
                              3
                          ];
                        setDossierTab(next);
                        document.getElementById(`dossier-tab-${next}`)?.focus();
                      }
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {(
                [
                  { id: 'facts', items: landmark.historicalFacts },
                  { id: 'architecture', items: landmark.architecturalDetails },
                  { id: 'legends', items: landmark.localLegends },
                ] as const
              ).map((tab) => (
                <div
                  key={tab.id}
                  id={`dossier-panel-${tab.id}`}
                  role="tabpanel"
                  aria-labelledby={`dossier-tab-${tab.id}`}
                  hidden={dossierTab !== tab.id}
                >
                  <ul lang="en">
                    {tab.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="archive-footnote">
                {landmark.verifiedBy} · {landmark.archiveCode}
              </p>
            </div>
          )}
        </section>

        <Link
          href={
            nextLandmark
              ? roadmapLink(
                  nextLandmark.slug,
                  language,
                  activeRoadmap?.roadmap.roadmapId,
                )
              : `/?lang=${language}`
          }
          className="next-stop"
        >
          {nextLandmark && (
            <div className="next-stop-photo">
              <LandmarkArt
                slug={nextLandmark.slug}
                alt={nextLandmark.localizedNames[language]}
              />
            </div>
          )}
          <span>
            <small>{nextLandmark ? copy.next : copy.finish}</small>
            <strong>
              {nextLandmark
                ? nextLandmark.localizedNames[language]
                : copy.route}
            </strong>
            {nextLandmark && (
              <span className="next-stop-teaser">
                {activeRoadmap?.roadmap.language === language
                  ? nextRouteStop?.emotionalPayoff
                  : experienceCopy.promises[nextLandmark.slug]}
              </span>
            )}
          </span>
          <Headphones aria-hidden="true" />
        </Link>
      </main>

      <div className="composer-dock">
        <div className="composer-inner">
          {pendingPhoto && (
            <div className="attached-photo">
              <img src={pendingPhoto.previewDataUrl} alt={copy.photoAlt} />
              <span>{ui.photoAttached}</span>
              <button
                className="icon-action"
                type="button"
                onClick={() => setPendingPhoto(null)}
                aria-label={ui.removePhoto}
              >
                <X aria-hidden="true" />
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            aria-label={ui.snapButton}
            onChange={handlePhoto}
            disabled={busy}
          />
          <form
            className="question-composer"
            onSubmit={(event) => {
              event.preventDefault();
              if (!busy) void submitQuestion(question);
            }}
          >
            <button
              className="icon-action"
              type="button"
              disabled={busy}
              onClick={() => fileInputRef.current?.click()}
              aria-label={ui.snapButton}
            >
              <Camera aria-hidden="true" />
            </button>
            <input
              ref={textInputRef}
              type="text"
              value={question}
              maxLength={500}
              disabled={busy}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder={
                isListening ? ui.voiceListening : ui.inputPlaceholder
              }
              aria-label={ui.inputPlaceholder}
            />
            <button
              className={`icon-action ${isListening ? 'is-listening' : ''}`}
              type="button"
              disabled={busy}
              onClick={handleVoice}
              aria-label={isListening ? ui.voiceListening : ui.voiceButton}
              aria-pressed={isListening}
            >
              {isListening ? (
                <MicOff aria-hidden="true" />
              ) : (
                <Mic aria-hidden="true" />
              )}
            </button>
            <button
              className="send-action"
              type="submit"
              disabled={busy || (!question.trim() && !pendingPhoto)}
              aria-label={copy.send}
            >
              {busy ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Send aria-hidden="true" />
              )}
            </button>
          </form>
        </div>
      </div>

      {isLightboxOpen && (
        <dialog
          ref={dialogRef}
          className="photo-dialog"
          aria-label={localizedName}
          onClose={() => setIsLightboxOpen(false)}
          onClick={(event) => {
            if (event.target === event.currentTarget)
              dialogRef.current?.close();
          }}
        >
          <div className="photo-dialog-content">
            <button
              className="icon-action lightbox-close"
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label={ui.closeLabel}
            >
              <X aria-hidden="true" />
            </button>
            <LandmarkArt
              slug={landmark.slug}
              alt={localizedName}
              className="lightbox-image"
              priority
            />
            <div>
              <h2>{localizedName}</h2>
              <p>{landmark.builtYear} · Ichan-Qala</p>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
