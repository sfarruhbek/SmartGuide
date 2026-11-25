'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Volume2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@smartguide/shared';
import { TOURIST_UI } from '@/lib/i18n';

interface AudioGuidePlayerProps {
  audioBase64?: string;
  audioMimeType?: string;
  fallbackText: string;
  language: SupportedLanguage;
  autoPlay?: boolean;
}

function formatSeconds(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const mins = Math.floor(sec / 60);
  const rem = Math.floor(sec % 60);
  return `${mins}:${rem.toString().padStart(2, '0')}`;
}

export function AudioGuidePlayer({
  audioBase64,
  audioMimeType = 'audio/wav',
  fallbackText,
  language,
  autoPlay = false,
}: AudioGuidePlayerProps) {
  const ui = TOURIST_UI[language];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSpeakingFallback, setIsSpeakingFallback] = useState(false);

  const objectUrl = useMemo(() => {
    if (!audioBase64 || typeof window === 'undefined') return null;
    try {
      const binary = window.atob(audioBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: audioMimeType });
      return URL.createObjectURL(blob);
    } catch {
      return null;
    }
  }, [audioBase64, audioMimeType]);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [objectUrl]);

  useEffect(() => {
    if (!autoPlay || !objectUrl || !audioRef.current) return;
    audioRef.current.play().catch(() => {
      // Mobile browsers block autoplay before direct gesture; user can tap Play
    });
  }, [autoPlay, objectUrl]);

  const toggleGeminiAudio = () => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
    } else {
      el.play().catch(() => {});
    }
  };

  const replayGeminiAudio = () => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = 0;
    el.play().catch(() => {});
  };

  const toggleBrowserFallbackSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeakingFallback) {
      window.speechSynthesis.cancel();
      setIsSpeakingFallback(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(fallbackText);
    const meta = SUPPORTED_LANGUAGES.find((item) => item.code === language);
    utterance.lang = meta?.speechRecognitionLang ?? 'en-US';
    utterance.rate = 0.98;
    utterance.onend = () => setIsSpeakingFallback(false);
    utterance.onerror = () => setIsSpeakingFallback(false);
    setIsSpeakingFallback(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!objectUrl) {
    // Graceful fallback when running without GEMINI_API_KEY (browser Web Speech readout)
    return (
      <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-slate-700/70 bg-slate-950/70 px-3 py-2">
        <button
          type="button"
          onClick={toggleBrowserFallbackSpeech}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-400/15 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-400/25 transition-colors cursor-pointer"
        >
          {isSpeakingFallback ? <Pause className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          <span>{isSpeakingFallback ? ui.audioPause : ui.audioPlay}</span>
        </button>
        <span className="text-[11px] text-slate-400">{ui.audioBrowserFallback}</span>
      </div>
    );
  }

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="mt-3 rounded-xl border border-amber-400/30 bg-gradient-to-r from-slate-950/90 via-slate-900/90 to-teal-950/40 p-3">
      <audio
        ref={audioRef}
        src={objectUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleGeminiAudio}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/25 hover:brightness-110 transition cursor-pointer"
          aria-label={isPlaying ? ui.audioPause : ui.audioPlay}
        >
          {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center justify-between text-[11px]">
            <span className="inline-flex items-center gap-1.5 font-medium text-teal-300">
              <span className="flex items-end gap-0.5 h-3" aria-hidden="true">
                {[0, 1, 2, 3].map((bar) => (
                  <span
                    key={bar}
                    className={[
                      'w-0.5 rounded-full bg-teal-300 transition-all',
                      isPlaying ? 'animate-sound-bar h-3' : 'h-1.5 opacity-50',
                    ].join(' ')}
                    style={{ animationDelay: `${bar * 0.14}s` }}
                  />
                ))}
              </span>
              {ui.audioVoiceTag}
            </span>
            <span className="tabular-nums text-slate-400">
              {formatSeconds(currentTime)} / {formatSeconds(duration)}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={(e) => {
              const nextTime = Number(e.target.value);
              setCurrentTime(nextTime);
              if (audioRef.current) {
                audioRef.current.currentTime = nextTime;
              }
            }}
            aria-label="Audio progress"
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-amber-400"
            style={{
              background: `linear-gradient(to right, #D4AF37 ${progressPercent}%, #1E293B ${progressPercent}%)`,
            }}
          />
        </div>

        <button
          type="button"
          onClick={replayGeminiAudio}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700/80 text-slate-300 hover:border-amber-400/50 hover:text-amber-200 transition cursor-pointer"
          title={ui.audioReplay}
          aria-label={ui.audioReplay}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
