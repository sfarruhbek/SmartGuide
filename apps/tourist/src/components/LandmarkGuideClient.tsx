'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Camera,
  ChevronDown,
  ChevronUp,
  Loader2,
  Mic,
  MicOff,
  Send,
  ShieldCheck,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import {
  SUPPORTED_LANGUAGES,
  type GuideAskResponse,
  type LandmarkDetail,
  type SupportedLanguage,
} from '@smartguide/shared';
import { askGuide } from '@/lib/api';
import { TOURIST_UI } from '@/lib/i18n';
import { compressImageToBase64 } from '@/lib/image-utils';
import { getOrCreateSessionId, getSavedLanguage, saveLanguage } from '@/lib/session';
import { AudioGuidePlayer } from './AudioGuidePlayer';
import { LandmarkArt } from './LandmarkArt';
import { LanguageSwitcher } from './LanguageSwitcher';

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
  modelUsed?: string;
  language: SupportedLanguage;
}

interface LandmarkGuideClientProps {
  landmark: LandmarkDetail;
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

export function LandmarkGuideClient({ landmark, initialLang }: LandmarkGuideClientProps) {
  const router = useRouter();
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [sessionId, setSessionId] = useState<string>('guest-session');
  const [question, setQuestion] = useState('');
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [dossierTab, setDossierTab] = useState<'facts' | 'architecture' | 'legends'>('facts');
  const [pendingPhoto, setPendingPhoto] = useState<{
    base64: string;
    mimeType: string;
    previewDataUrl: string;
  } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const resolvedLang = getSavedLanguage(initialLang);
    setLanguage(resolvedLang);
    setSessionId(getOrCreateSessionId());
  }, [initialLang]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleLanguageChange = (nextLang: SupportedLanguage) => {
    setLanguage(nextLang);
    saveLanguage(nextLang);
  };

  const ui = TOURIST_UI[language];
  const localizedName = landmark.localizedNames[language] || landmark.name;
  const localizedDesc =
    landmark.localizedShortDescriptions[language] || landmark.shortDescription;
  const quickQuestions =
    landmark.suggestedQuestions[language] ?? landmark.suggestedQuestions.en;

  const submitQuestion = async (
    rawText: string,
    photoOverride?: { base64: string; mimeType: string; previewDataUrl: string } | null,
  ) => {
    const trimmed = rawText.trim();
    const photoToSend = photoOverride !== undefined ? photoOverride : pendingPhoto;

    if ((!trimmed && !photoToSend) || isLoading) return;

    setErrorMessage(null);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed || ui.snapButton,
      imagePreviewUrl: photoToSend?.previewDataUrl,
      language,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setPendingPhoto(null);
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
        modelUsed: response.modelUsed,
        language: response.language,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Request failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const compressed = await compressImageToBase64(file);
      // If user hasn't typed a question yet, immediately send Snap & Ask for instant wow UX
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
      setErrorMessage('Voice dictation is not supported in this browser; please type your question.');
      return;
    }

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

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col pb-40">
      {/* Top Sticky Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#090D16]/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2">
          <Link
            href={`/?lang=${language}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-amber-400/50 hover:text-amber-200 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{ui.backToAll}</span>
          </Link>

          <span className="inline-flex items-center gap-1 rounded-full border border-teal-400/30 bg-teal-500/10 px-2.5 py-1 text-[11px] font-medium text-teal-200">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-300" />
            {landmark.archiveCode}
          </span>
        </div>

        <div className="mt-2.5">
          <LanguageSwitcher value={language} onChange={handleLanguageChange} compact />
        </div>
      </header>

      {/* Landmark Hero Banner */}
      <section className="px-4 pt-4">
        <div className="overflow-hidden rounded-3xl border border-amber-400/25 bg-slate-900/90 shadow-2xl">
          <div className="relative h-44 w-full sm:h-52">
            <LandmarkArt slug={landmark.slug} className="h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/35 to-transparent" />
            <div className="absolute bottom-3.5 left-4 right-4">
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-slate-950/75 px-2.5 py-0.5 text-[11px] font-medium text-amber-200 backdrop-blur-sm">
                <Sparkles className="h-3 w-3 text-amber-300" />
                {landmark.builtYear} · {landmark.era}
              </div>
              <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
                {localizedName}
              </h1>
            </div>
          </div>

          <div className="p-4">
            <p className="text-sm leading-relaxed text-slate-300">{localizedDesc}</p>

            <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-xs">
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-slate-400">
                  {ui.eraLabel}
                </span>
                <span className="font-medium text-slate-100">{landmark.builtYear}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-slate-400">
                  {ui.architectLabel}
                </span>
                <span className="line-clamp-2 font-medium text-slate-100">{landmark.architect}</span>
              </div>
            </div>

            {/* Collapsible Verified Museum Dossier */}
            <button
              type="button"
              onClick={() => setIsDossierOpen((open) => !open)}
              className="mt-3 flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 px-3.5 py-2.5 text-xs font-semibold text-amber-200 hover:border-amber-400/40 transition cursor-pointer"
            >
              <span className="inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-amber-300" />
                {isDossierOpen ? ui.dossierToggleClose : ui.dossierToggleOpen}
              </span>
              {isDossierOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {isDossierOpen && (
              <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5">
                <div className="mb-3 flex gap-1.5">
                  {(
                    [
                      { id: 'facts', label: ui.factsTab },
                      { id: 'architecture', label: ui.architectureTab },
                      { id: 'legends', label: ui.legendsTab },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setDossierTab(tab.id)}
                      className={[
                        'rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer',
                        dossierTab === tab.id
                          ? 'bg-amber-400/20 text-amber-200 border border-amber-400/50'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800',
                      ].join(' ')}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <ul className="space-y-2 text-xs leading-relaxed text-slate-300">
                  {(dossierTab === 'facts'
                    ? landmark.historicalFacts
                    : dossierTab === 'architecture'
                      ? landmark.architecturalDetails
                      : landmark.localLegends
                  ).map((item, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-3 border-t border-slate-800 pt-2 text-[11px] text-teal-300/90">
                  {ui.verifiedArchive}: {landmark.verifiedBy} ({landmark.archiveCode})
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Suggested Quick Questions */}
      <section className="px-4 pt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-300/90">
            {ui.suggestedTitle}
          </h2>
          <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={autoPlayAudio}
              onChange={(e) => setAutoPlayAudio(e.target.checked)}
              className="h-3.5 w-3.5 rounded accent-amber-400"
            />
            <Volume2 className="h-3 w-3 text-teal-300" />
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
              className="rounded-2xl border border-amber-400/25 bg-slate-900/85 px-3.5 py-2 text-left text-xs font-medium text-slate-200 hover:border-amber-400/70 hover:bg-amber-400/10 hover:text-amber-100 transition disabled:opacity-50 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </section>

      {/* Conversation Thread */}
      <section className="flex-1 space-y-4 px-4 pt-5">
        {/* Welcome Guide Card */}
        <div className="rounded-2xl border border-teal-500/25 bg-slate-900/75 p-4 text-sm leading-relaxed text-slate-200">
          <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-teal-300">
            <ShieldCheck className="h-4 w-4" />
            <span>SmartGuide · {localizedName}</span>
          </div>
          <p>{ui.welcomePrefix}</p>
        </div>

        {messages.map((msg) => {
          if (msg.role === 'user') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm border border-amber-400/35 bg-amber-400/15 px-4 py-3 text-sm text-amber-50">
                  {msg.imagePreviewUrl && (
                    <img
                      src={msg.imagePreviewUrl}
                      alt="Uploaded landmark photo"
                      className="mb-2 max-h-44 w-full rounded-xl border border-amber-400/30 object-cover"
                    />
                  )}
                  <p>{msg.text}</p>
                </div>
              </div>
            );
          }

          const detectedDifferentMonument =
            msg.detectedLandmarkSlug && msg.detectedLandmarkSlug !== landmark.slug;

          return (
            <div key={msg.id} className="flex justify-start">
              <div className="w-full rounded-2xl rounded-bl-sm border border-slate-700/80 bg-slate-900/95 p-4 shadow-lg">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-teal-400/30 bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-medium text-teal-200">
                    <ShieldCheck className="h-3 w-3" />
                    {ui.verifiedArchive} {msg.archiveCode}
                  </span>
                  {msg.identifiedByVision && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/35 bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-200">
                      <Camera className="h-3 w-3" />
                      {ui.visionDetectedBadge}
                    </span>
                  )}
                </div>

                <p className="text-sm leading-relaxed text-slate-100 whitespace-pre-line">
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
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/15 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-400/25 transition cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>
                      {ui.switchDetectedLandmark} {msg.detectedLandmarkName}
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-teal-400/25 bg-slate-900/80 px-4 py-3 text-xs text-teal-200">
            <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
            <span>{ui.thinkingMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-950/50 px-4 py-3 text-xs text-rose-200">
            {ui.errorPrefix} {errorMessage}
          </div>
        )}

        <div ref={chatEndRef} />
      </section>

      {/* Bottom Sticky Snap & Ask + Voice + Text Composer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/90 bg-[#090D16]/95 px-3 pb-4 pt-3 backdrop-blur-lg">
        <div className="mx-auto w-full max-w-2xl">
          {pendingPhoto && (
            <div className="mb-2 flex items-center justify-between rounded-xl border border-amber-400/35 bg-slate-900 px-3 py-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={pendingPhoto.previewDataUrl}
                  alt="Attached monument"
                  className="h-10 w-10 rounded-lg object-cover"
                />
                <span className="text-xs font-medium text-amber-200">{ui.photoAttached}</span>
              </div>
              <button
                type="button"
                onClick={() => setPendingPhoto(null)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                {ui.removePhoto}
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
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
            {/* Snap & Ask Camera Button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => fileInputRef.current?.click()}
              title={ui.snapButton}
              className="flex h-11 shrink-0 items-center gap-1.5 rounded-2xl border border-teal-400/45 bg-teal-500/15 px-3 text-xs font-semibold text-teal-200 hover:bg-teal-500/25 transition disabled:opacity-50 cursor-pointer"
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
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition cursor-pointer',
                isListening
                  ? 'border-rose-400 bg-rose-500/25 text-rose-200 animate-pulse'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-amber-400/50 hover:text-amber-200',
              ].join(' ')}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={isListening ? ui.voiceListening : ui.inputPlaceholder}
              className="h-11 min-w-0 flex-1 rounded-2xl border border-slate-700/90 bg-slate-900/90 px-4 text-sm text-white placeholder-slate-400 focus:border-amber-400/70 focus:outline-none"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || (!question.trim() && !pendingPhoto)}
              aria-label="Send question"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/25 hover:brightness-110 transition disabled:opacity-40 cursor-pointer"
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
    </div>
  );
}
