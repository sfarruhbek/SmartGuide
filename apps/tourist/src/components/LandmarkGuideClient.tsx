'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
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
  type GuideAskResponse,
  type LandmarkDetail,
  type LandmarkSummary,
  type SupportedLanguage,
} from '@smartguide/shared';
import { askGuide, fetchLandmarks, trackLandmarkScan } from '@/lib/api';
import { TOURIST_UI } from '@/lib/i18n';
import { compressImageToBase64 } from '@/lib/image-utils';
import { getOrCreateSessionId, getSavedLanguage, saveLanguage } from '@/lib/session';
import { AudioGuidePlayer } from './AudioGuidePlayer';
import { LandmarkArt } from './LandmarkArt';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MonumentQuickNav } from './MonumentQuickNav';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  imagePreviewUrl?: string;
  audioBase64?: string;
  audioMimeType?: string;
  identifiedByVision?: boolean;
  detectedLandmarkSlug?: string;
  detectedLandmarkName?: string;
  archiveCode?: string;
  sourceMode?: 'gemini-rag' | 'verified-rag-fallback';
  responseTimeMs?: number;
  language: SupportedLanguage;
}

interface PendingPhotoPayload {
  base64: string;
  mimeType: string;
  previewDataUrl: string;
}

interface FailedRequestPayload {
  text: string;
  photo: PendingPhotoPayload | null;
}

interface LandmarkGuideClientProps {
  landmark: LandmarkDetail;
  allLandmarks?: LandmarkSummary[];
  initialLang?: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

export function LandmarkGuideClient({
  landmark,
  allLandmarks: initialAllLandmarks = [],
  initialLang,
}: LandmarkGuideClientProps) {
  const router = useRouter();
  const [allLandmarks, setAllLandmarks] = useState<LandmarkSummary[]>(initialAllLandmarks);
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [sessionId, setSessionId] = useState<string>('guest-session');
  const [question, setQuestion] = useState('');
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhotoPreview, setLoadingPhotoPreview] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceHint, setVoiceHint] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFailedPayload, setLastFailedPayload] = useState<FailedRequestPayload | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [dossierTab, setDossierTab] = useState<'facts' | 'architecture' | 'legends'>('facts');
  const [pendingPhoto, setPendingPhoto] = useState<PendingPhotoPayload | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isLightboxOpen]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textInputRef = useRef<HTMLInputElement | null>(null);
  const latestAssistantRef = useRef<HTMLDivElement | null>(null);
  const loadingCardRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const resolvedLang = getSavedLanguage(initialLang);
    const resolvedSession = getOrCreateSessionId();
    setLanguage(resolvedLang);
    setSessionId(resolvedSession);

    if (initialAllLandmarks.length === 0) {
      fetchLandmarks()
        .then(setAllLandmarks)
        .catch(() => {});
    }

    // FE-04: Track QR scan once per session per monument (silent fail)
    try {
      const scanKey = `scanned:${landmark.slug}`;
      if (!window.sessionStorage.getItem(scanKey)) {
        window.sessionStorage.setItem(scanKey, '1');
        void trackLandmarkScan({
          slug: landmark.slug,
          sessionId: resolvedSession,
          language: resolvedLang,
        });
      }
    } catch {
      // Ignore storage access errors in private browsing
    }
  }, [initialLang, initialAllLandmarks.length, landmark.slug]);

  // Smoothly scroll to loading card or newest AI response
  useEffect(() => {
    if (isLoading) {
      loadingCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else if (messages.length > 0) {
      latestAssistantRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [messages.length, isLoading]);

  const handleLanguageChange = (nextLang: SupportedLanguage) => {
    setLanguage(nextLang);
    saveLanguage(nextLang);
    setVoiceHint(null);
  };

  const ui = TOURIST_UI[language];
  const localizedName = landmark.localizedNames[language] || landmark.name;
  const localizedDesc =
    landmark.localizedShortDescriptions[language] || landmark.shortDescription;
  const quickQuestions =
    landmark.suggestedQuestions[language] ?? landmark.suggestedQuestions.en;

  const submitQuestion = async (
    rawText: string,
    photoOverride?: PendingPhotoPayload | null,
    displayLabelOverride?: string,
    skipUserEcho = false,
  ) => {
    const trimmed = rawText.trim();
    const photoToSend = photoOverride !== undefined ? photoOverride : pendingPhoto;

    if ((!trimmed && !photoToSend) || isLoading) return;

    // Close mobile keyboard immediately on submit (FE-03)
    textInputRef.current?.blur();

    setErrorMessage(null);
    setVoiceHint(null);
    setLastFailedPayload(null);

    if (!skipUserEcho) {
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: displayLabelOverride || trimmed || ui.snapButton,
        imagePreviewUrl: photoToSend?.previewDataUrl,
        language,
      };
      setMessages((prev) => [...prev, userMessage]);
    }

    setQuestion('');
    setPendingPhoto(null);
    setLoadingPhotoPreview(photoToSend?.previewDataUrl ?? null);
    setIsLoading(true);

    try {
      const response: GuideAskResponse = await askGuide({
        landmarkSlug: landmark.slug,
        question: trimmed,
        language,
        sessionId,
        imageBase64: photoToSend?.base64,
        imageMimeType: photoToSend?.mimeType,
        includeAudio: true,
      });

      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: response.answer,
        audioBase64: response.audioBase64,
        audioMimeType: response.audioMimeType,
        identifiedByVision: response.identifiedByVision,
        detectedLandmarkSlug: response.landmarkSlug,
        detectedLandmarkName: response.landmarkName,
        archiveCode: response.archiveCode,
        sourceMode: response.sourceMode,
        responseTimeMs: response.responseTimeMs,
        language: response.language,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setLastFailedPayload({ text: trimmed, photo: photoToSend });
      setErrorMessage(error instanceof Error ? error.message : 'Request failed');
    } finally {
      setIsLoading(false);
      setLoadingPhotoPreview(null);
    }
  };

  const handleRetryFailed = () => {
    if (!lastFailedPayload || isLoading) return;
    const payload = lastFailedPayload;
    void submitQuestion(payload.text, payload.photo, undefined, true);
  };

  const handlePhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const compressed = await compressImageToBase64(file);
      if (question.trim().length === 0) {
        await submitQuestion('', compressed);
      } else {
        setPendingPhoto(compressed);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not process image');
    }
  };

  const handleVoiceToggle = () => {
    if (typeof window === 'undefined') return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const speechWindow = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRec = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRec) {
      setVoiceHint(ui.voiceUnsupported);
      textInputRef.current?.focus();
      return;
    }

    setVoiceHint(null);
    const recognition = new SpeechRec();
    const meta = SUPPORTED_LANGUAGES.find((item) => item.code === language);
    recognition.lang = meta?.speechRecognitionLang ?? 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) {
        setQuestion(transcript);
        void submitQuestion(transcript);
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  const handleCopyAnswer = async (msgId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMsgId(msgId);
      setTimeout(() => setCopiedMsgId((curr) => (curr === msgId ? null : curr)), 2000);
    } catch {
      // Clipboard unavailable on insecure HTTP origins
    }
  };

  const handleIntroTour = () => {
    setAutoPlayAudio(true);
    void submitQuestion(ui.introTourPrompt, null, ui.introTourButton);
  };

  const lastMessageId = messages[messages.length - 1]?.id;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col pb-36">
      {/* Single Clean Sticky Top Bar (Back/Map left + LanguageSwitcher right + QuickNav) */}
      <header className="sticky top-0 z-30 border-b border-[#EAE6DF] bg-[#FAF8F5]/95 px-4 py-2.5 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href={`/?lang=${language}`}
            onClick={() => saveLanguage(language)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#EAE6DF] bg-white px-3 py-1.5 text-xs font-semibold text-[#14181F] shadow-xs transition hover:border-[#0E7470]/45 hover:text-[#0E7470]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{ui.backToAll}</span>
          </Link>

          <LanguageSwitcher value={language} onChange={handleLanguageChange} compact />
        </div>

        {allLandmarks.length > 0 && (
          <div className="mt-2">
            <MonumentQuickNav
              landmarks={allLandmarks}
              currentSlug={landmark.slug}
              language={language}
            />
          </div>
        )}
      </header>

      {/* Sunlit Monument Hero Card */}
      <section className="px-4 pt-4">
        <article className="overflow-hidden rounded-3xl border border-[#EAE6DF] bg-white shadow-sm">
          {/* Unobstructed Monument Photo (FE-06: local compressed .webp + SVG fallback) */}
          <div className="group relative h-52 w-full bg-[#EAE6DF]/40 sm:h-64 overflow-hidden">
            <LandmarkArt
              slug={landmark.slug}
              alt={localizedName}
              className="h-full w-full transition duration-500 group-hover:scale-[1.02]"
            />
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              aria-label={ui.viewFullPhoto}
              className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-[#EAE6DF] bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#14181F] shadow-xs backdrop-blur-xs transition hover:bg-white cursor-pointer"
            >
              <Maximize2 className="h-3 w-3 text-[#0E7470]" />
              <span className="hidden sm:inline">{ui.viewFullPhoto}</span>
            </button>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0E7470]">
                {landmark.builtYear} · {landmark.era}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#B47B38]/25 bg-[#FDF6EC] px-2.5 py-0.5 text-[11px] font-semibold text-[#B47B38]">
                <ShieldCheck className="h-3 w-3" />
                <span>{ui.verifiedTag}</span>
              </span>
            </div>

            <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#14181F] sm:text-3xl">
              {localizedName}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#5C6370]">{localizedDesc}</p>

            {/* FE-08: 1-Tap 30-Second Intro Tour CTA */}
            <button
              type="button"
              disabled={isLoading}
              onClick={handleIntroTour}
              className="mt-4 flex w-full items-center justify-between gap-2 rounded-xl bg-[#0E7470] px-4 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-[#0A5C59] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              <span className="inline-flex items-center gap-2">
                <Play className="h-4 w-4 fill-current" />
                <span>{ui.introTourButton}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium text-white">
                <Headphones className="h-3 w-3" />
                <span>{ui.audioIntroBadge}</span>
              </span>
            </button>

            <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-3.5 text-xs">
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#5C6370]">
                  {ui.eraLabel}
                </span>
                <span className="mt-0.5 block font-semibold text-[#14181F]">
                  {landmark.builtYear}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#5C6370]">
                  {ui.architectLabel}
                </span>
                <span className="mt-0.5 line-clamp-2 block font-semibold text-[#14181F]">
                  {landmark.architect}
                </span>
              </div>
            </div>

            {/* Collapsible Verified Museum Dossier */}
            <button
              type="button"
              onClick={() => setIsDossierOpen((open) => !open)}
              className="mt-3 flex w-full items-center justify-between rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-3.5 py-2.5 text-xs font-semibold text-[#14181F] transition hover:border-[#0E7470]/45 hover:bg-[#EEF7F6]/60 cursor-pointer"
            >
              <span className="inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#0E7470]" />
                <span>{isDossierOpen ? ui.dossierToggleClose : ui.dossierToggleOpen}</span>
              </span>
              {isDossierOpen ? (
                <ChevronUp className="h-4 w-4 text-[#5C6370]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[#5C6370]" />
              )}
            </button>

            {isDossierOpen && (
              <div className="mt-3 rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-4 animate-fade-slide">
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {(
                    [
                      { id: 'facts', label: ui.factsTab, count: landmark.historicalFacts.length },
                      {
                        id: 'architecture',
                        label: ui.architectureTab,
                        count: landmark.architecturalDetails.length,
                      },
                      { id: 'legends', label: ui.legendsTab, count: landmark.localLegends.length },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setDossierTab(tab.id)}
                      className={[
                        'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition cursor-pointer',
                        dossierTab === tab.id
                          ? 'border-[#0E7470] bg-[#0E7470] text-white'
                          : 'border-[#EAE6DF] bg-white text-[#5C6370] hover:text-[#14181F]',
                      ].join(' ')}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={[
                          'rounded-full px-1.5 py-0.2 text-[10px] tabular-nums',
                          dossierTab === tab.id
                            ? 'bg-white/20 text-white'
                            : 'bg-[#FAF8F5] text-[#5C6370]',
                        ].join(' ')}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                <ul className="space-y-2 text-xs leading-relaxed text-[#14181F]">
                  {(dossierTab === 'facts'
                    ? landmark.historicalFacts
                    : dossierTab === 'architecture'
                      ? landmark.architecturalDetails
                      : landmark.localLegends
                  ).map((item, idx) => (
                    <li key={idx} className="flex gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0E7470]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-3 border-t border-[#EAE6DF] pt-2.5 text-[11px] font-medium text-[#B47B38]">
                  {ui.verifiedArchive}: {landmark.verifiedBy} · {landmark.archiveCode}
                </p>
              </div>
            )}
          </div>
        </article>
      </section>

      {/* Curated Quick Questions */}
      <section className="px-4 pt-5">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#5C6370]">
            {ui.suggestedTitle}
          </h2>
          <label className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#5C6370] cursor-pointer">
            <input
              type="checkbox"
              checked={autoPlayAudio}
              onChange={(e) => setAutoPlayAudio(e.target.checked)}
              className="h-3.5 w-3.5 rounded accent-[#0E7470]"
            />
            <Volume2 className="h-3.5 w-3.5 text-[#0E7470]" />
            <span>{ui.autoPlayAudio}</span>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={isLoading}
              onClick={() => void submitQuestion(prompt)}
              className="rounded-xl border border-[#EAE6DF] bg-white px-3.5 py-2 text-left text-xs font-medium text-[#14181F] shadow-2xs transition hover:border-[#0E7470] hover:bg-[#EEF7F6] disabled:opacity-50 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </section>

      {/* Conversation Thread */}
      <section className="flex-1 space-y-4 px-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#5C6370]">
            {ui.conversationHeading}
          </h2>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setMessages([]);
                setErrorMessage(null);
                setLastFailedPayload(null);
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-[#EAE6DF] bg-white px-2.5 py-1 text-[11px] font-medium text-[#5C6370] transition hover:border-[#0E7470]/40 hover:text-[#14181F] cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>{ui.clearChat}</span>
            </button>
          )}
        </div>

        {/* Welcome Card */}
        <div className="rounded-2xl border border-[#EAE6DF] bg-white p-4 text-sm leading-relaxed text-[#14181F] shadow-2xs">
          <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-[#0E7470]">
            <ShieldCheck className="h-4 w-4" />
            <span>SmartGuide · {localizedName}</span>
          </div>
          <p className="text-[#5C6370]">{ui.welcomePrefix}</p>
        </div>

        {messages.map((msg) => {
          const isLatest = msg.id === lastMessageId;

          if (msg.role === 'user') {
            return (
              <div
                key={msg.id}
                ref={isLatest ? latestAssistantRef : undefined}
                className="flex justify-end animate-fade-slide"
              >
                <div className="max-w-[85%] rounded-2xl rounded-br-sm border border-[#0E7470]/20 bg-[#EEF7F6] px-4 py-3 text-sm font-medium text-[#14181F]">
                  {msg.imagePreviewUrl && (
                    <img
                      src={msg.imagePreviewUrl}
                      alt="Uploaded landmark photo"
                      className="mb-2 max-h-44 w-full rounded-xl border border-[#EAE6DF] object-cover"
                    />
                  )}
                  <p>{msg.text}</p>
                </div>
              </div>
            );
          }

          const detectedDifferentMonument =
            msg.detectedLandmarkSlug && msg.detectedLandmarkSlug !== landmark.slug;
          const isCopied = copiedMsgId === msg.id;
          const formattedSeconds =
            typeof msg.responseTimeMs === 'number'
              ? `${(msg.responseTimeMs / 1000).toFixed(1)}s`
              : null;
          const isInstantCache =
            typeof msg.responseTimeMs === 'number' && msg.responseTimeMs < 250;

          return (
            <div
              key={msg.id}
              ref={isLatest ? latestAssistantRef : undefined}
              className="flex justify-start animate-fade-slide"
            >
              <article className="w-full overflow-hidden rounded-2xl rounded-bl-sm border border-[#EAE6DF] bg-white shadow-sm">
                <div className="p-4 sm:p-5">
                  {msg.identifiedByVision && (
                    <div className="mb-2.5 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#B47B38]/25 bg-[#FDF6EC] px-2.5 py-0.5 text-[11px] font-semibold text-[#B47B38]">
                        <Camera className="h-3 w-3" />
                        <span>{ui.visionDetectedBadge}</span>
                      </span>
                    </div>
                  )}

                  <p className="whitespace-pre-line text-[15px] leading-relaxed text-[#14181F]">
                    {msg.text}
                  </p>

                  <AudioGuidePlayer
                    audioBase64={msg.audioBase64}
                    audioMimeType={msg.audioMimeType}
                    fallbackText={msg.text}
                    language={msg.language}
                    autoPlay={autoPlayAudio}
                  />

                  {detectedDifferentMonument && msg.detectedLandmarkSlug && (
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/l/${msg.detectedLandmarkSlug}?lang=${language}`)
                      }
                      className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-[#0E7470]/30 bg-[#EEF7F6] px-3.5 py-2 text-xs font-semibold text-[#0E7470] transition hover:bg-[#0E7470] hover:text-white cursor-pointer"
                    >
                      <span>
                        {ui.switchDetectedLandmark} {msg.detectedLandmarkName}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* FE-07: Discreet Verified Museum Trust Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#EAE6DF] bg-[#FAF8F5] px-4 py-2 text-[11px]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 font-semibold text-[#B47B38]">
                      <Check className="h-3 w-3" />
                      <span>
                        {ui.verifiedArchive}
                        {msg.archiveCode ? ` · ${msg.archiveCode}` : ''}
                      </span>
                    </span>
                    <span className="text-[#5C6370] tabular-nums">
                      {isInstantCache ? ui.instantCacheLabel : ui.verifiedSourceLabel}
                      {formattedSeconds ? ` · ${formattedSeconds}` : ''}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleCopyAnswer(msg.id, msg.text)}
                    className="inline-flex items-center gap-1 rounded-md border border-[#EAE6DF] bg-white px-2 py-0.5 text-[11px] font-medium text-[#5C6370] transition hover:border-[#0E7470]/40 hover:text-[#14181F] cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3 w-3 text-[#0E7470]" />
                        <span className="text-[#0E7470]">{ui.copiedButton}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>{ui.copyButton}</span>
                      </>
                    )}
                  </button>
                </div>
              </article>
            </div>
          );
        })}

        {/* FE-03: Loading / Photo Scanning Preview */}
        {isLoading && (
          <div
            ref={loadingCardRef}
            className="rounded-2xl border border-[#EAE6DF] bg-white p-4 shadow-sm animate-fade-slide"
          >
            {loadingPhotoPreview ? (
              <div className="flex items-center gap-3.5">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#EAE6DF]">
                  <img
                    src={loadingPhotoPreview}
                    alt="Scanning photo"
                    className="h-full w-full object-cover"
                  />
                  <span className="pointer-events-none absolute left-1 top-1 h-2 w-2 border-l-2 border-t-2 border-[#0E7470]" />
                  <span className="pointer-events-none absolute right-1 top-1 h-2 w-2 border-r-2 border-t-2 border-[#0E7470]" />
                  <span className="pointer-events-none absolute bottom-1 left-1 h-2 w-2 border-b-2 border-l-2 border-[#0E7470]" />
                  <span className="pointer-events-none absolute bottom-1 right-1 h-2 w-2 border-b-2 border-r-2 border-[#0E7470]" />
                  <div className="animate-scan-line absolute left-0 right-0 h-0.5 bg-[#0E7470]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#14181F]">{ui.scanningPhoto}</p>
                  <p className="mt-0.5 text-xs text-[#5C6370]">{ui.thinkingMessage}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 text-xs font-medium text-[#0E7470]">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{ui.thinkingMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* FE-03: Error Card with Retry */}
        {errorMessage && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800 animate-fade-slide">
            <span className="min-w-0 flex-1">
              {ui.errorPrefix} {errorMessage}
            </span>
            {lastFailedPayload && (
              <button
                type="button"
                onClick={handleRetryFailed}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-800 transition cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>{ui.retryButton}</span>
              </button>
            )}
          </div>
        )}

        {voiceHint && (
          <div className="rounded-xl border border-[#B47B38]/30 bg-[#FDF6EC] px-3.5 py-2.5 text-xs text-[#B47B38] animate-fade-slide">
            {voiceHint}
          </div>
        )}
      </section>

      {/* Bottom Sticky Composer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#EAE6DF] bg-white/95 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
        <div className="mx-auto w-full max-w-2xl">
          {pendingPhoto && (
            <div className="mb-2 flex items-center justify-between rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-3 py-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={pendingPhoto.previewDataUrl}
                  alt="Attached monument"
                  className="h-10 w-10 rounded-lg border border-[#EAE6DF] object-cover"
                />
                <span className="text-xs font-semibold text-[#14181F]">{ui.photoAttached}</span>
              </div>
              <button
                type="button"
                onClick={() => setPendingPhoto(null)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[#5C6370] hover:text-[#14181F] cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>{ui.removePhoto}</span>
              </button>
            </div>
          )}

          {/* No capture="environment" so iOS & Android allow Camera OR Gallery */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoSelect}
          />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submitQuestion(question);
            }}
            className="flex items-center gap-2"
          >
            {/* Snap & Ask Photo Button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => fileInputRef.current?.click()}
              title={ui.snapButton}
              className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-[#0E7470]/30 bg-[#EEF7F6] px-3 text-xs font-semibold text-[#0E7470] transition hover:bg-[#0E7470] hover:text-white disabled:opacity-50 cursor-pointer"
            >
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">{ui.snapButton}</span>
            </button>

            {/* Voice Dictation Button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={handleVoiceToggle}
              title={isListening ? ui.voiceListening : ui.voiceButton}
              className={[
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition cursor-pointer',
                isListening
                  ? 'border-rose-300 bg-rose-50 text-rose-600 animate-pulse'
                  : 'border-[#EAE6DF] bg-[#FAF8F5] text-[#14181F] hover:border-[#0E7470]/45 hover:text-[#0E7470]',
              ].join(' ')}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            {/* Text Input */}
            <input
              ref={textInputRef}
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={isListening ? ui.voiceListening : ui.inputPlaceholder}
              className="h-11 min-w-0 flex-1 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-4 text-sm text-[#14181F] placeholder-[#5C6370] focus:border-[#0E7470] focus:bg-white focus:outline-none"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || (!question.trim() && !pendingPhoto)}
              aria-label="Send question"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0E7470] text-white shadow-xs transition hover:bg-[#0A5C59] disabled:opacity-40 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Sunlit Fullscreen Photo Lightbox */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={localizedName}
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#14181F]/80 p-4 backdrop-blur-xs animate-fade-slide"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-[#EAE6DF] bg-white shadow-2xl"
          >
            <div className="relative aspect-[4/3] w-full bg-[#FAF8F5]">
              <LandmarkArt slug={landmark.slug} alt={localizedName} className="h-full w-full" />
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                aria-label={ui.closeLabel}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#EAE6DF] bg-white/95 text-[#14181F] shadow-sm transition hover:bg-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div>
                <h3 className="font-display text-lg font-semibold text-[#14181F]">
                  {localizedName}
                </h3>
                <p className="text-xs text-[#5C6370]">
                  {landmark.builtYear} · {landmark.locationInSite}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-[#B47B38]/25 bg-[#FDF6EC] px-2.5 py-0.5 text-[11px] font-semibold text-[#B47B38]">
                {landmark.archiveCode}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
