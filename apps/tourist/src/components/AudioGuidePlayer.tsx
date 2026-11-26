'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Volume2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@smartguide/shared';
import { TOURIST_UI } from '@/lib/i18n';

const AUDIO_PLAY_EVENT = 'smartguide:audio-play';

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
  const playerId = useId();
  const ui = TOURIST_UI[language];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<1 | 1.25>(1);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
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

  const broadcastPlay = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
      new CustomEvent<{ id: string }>(AUDIO_PLAY_EVENT, {
        detail: { id: playerId },
      }),
    );
  }, [playerId]);

  // Single Active Audio Manager: pause/cancel whenever another player starts
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOtherPlay = (event: Event) => {
      const custom = event as CustomEvent<{ id?: string }>;
      if (custom.detail?.id !== playerId) {
        audioRef.current?.pause();
        setIsPlaying(false);
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        setIsSpeakingFallback(false);
      }
    };

    window.addEventListener(AUDIO_PLAY_EVENT, handleOtherPlay);
    return () => {
      window.removeEventListener(AUDIO_PLAY_EVENT, handleOtherPlay);
    };
  }, [playerId]);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [objectUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, objectUrl]);

  const playbackRateRef = useRef<1 | 1.25>(1);
  playbackRateRef.current = playbackRate;

  useEffect(() => {
    if (!autoPlay || !objectUrl || !audioRef.current) return;
    const el = audioRef.current;

    const attemptAutoplay = async () => {
      broadcastPlay();
      el.playbackRate = playbackRateRef.current;
      try {
        await el.play();
        setAutoplayBlocked(false);
      } catch {
        // Mobile Safari/Chrome blocks ungesture-backed play() — show tap prompt
        setAutoplayBlocked(true);
      }
    };

    void attemptAutoplay();
  }, [autoPlay, objectUrl, broadcastPlay]);

  const toggleGeminiAudio = async () => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
      return;
    }

    broadcastPlay();
    el.playbackRate = playbackRate;
    try {
      await el.play();
      setAutoplayBlocked(false);
    } catch {
      setAutoplayBlocked(true);
    }
  };

  const replayGeminiAudio = async () => {
    const el = audioRef.current;
    if (!el) return;
    broadcastPlay();
    el.currentTime = 0;
    el.playbackRate = playbackRate;
    try {
      await el.play();
      setAutoplayBlocked(false);
    } catch {
      setAutoplayBlocked(true);
    }
  };

  const toggleSpeed = () => {
    const nextRate: 1 | 1.25 = playbackRate === 1 ? 1.25 : 1;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const toggleBrowserFallbackSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeakingFallback) {
      window.speechSynthesis.cancel();
      setIsSpeakingFallback(false);
      return;
    }

    broadcastPlay();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(fallbackText);
    const meta = SUPPORTED_LANGUAGES.find((item) => item.code === language);
    utterance.lang = meta?.speechRecognitionLang ?? 'en-US';
    utterance.rate = playbackRate === 1.25 ? 1.2 : 0.98;
    utterance.onend = () => setIsSpeakingFallback(false);
    utterance.onerror = () => setIsSpeakingFallback(false);
    setIsSpeakingFallback(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!objectUrl) {
    return (
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-3 py-2.5">
        <button
          type="button"
          onClick={toggleBrowserFallbackSpeech}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0E7470] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#0A5C59] cursor-pointer"
        >
          {isSpeakingFallback ? <Pause className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          <span>{isSpeakingFallback ? ui.audioPause : ui.audioPlay}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSpeed}
            className="rounded-lg border border-[#EAE6DF] bg-white px-2 py-1 text-[11px] font-semibold tabular-nums text-[#14181F] hover:border-[#0E7470]/45 transition cursor-pointer"
          >
            {playbackRate === 1 ? '1.0x' : '1.25x'}
          </button>
          <span className="text-[11px] font-medium text-[#5C6370]">{ui.audioBrowserFallback}</span>
        </div>
      </div>
    );
  }

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="mt-3.5 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] p-3">
      <audio
        ref={audioRef}
        src={objectUrl}
        onPlay={() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
          e.currentTarget.playbackRate = playbackRate;
        }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void toggleGeminiAudio()}
          className={[
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0E7470] text-white shadow-xs transition hover:bg-[#0A5C59] cursor-pointer',
            autoplayBlocked && !isPlaying ? 'ring-2 ring-[#0E7470]/50 animate-pulse' : '',
          ].join(' ')}
          aria-label={isPlaying ? ui.audioPause : ui.audioPlay}
        >
          {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#0E7470]">
              <span className="flex h-3 items-end gap-0.5" aria-hidden="true">
                {[0, 1, 2, 3].map((bar) => (
                  <span
                    key={bar}
                    className={[
                      'w-0.5 rounded-full bg-[#0E7470] transition-all',
                      isPlaying ? 'animate-sound-bar h-3' : 'h-1.5 opacity-45',
                    ].join(' ')}
                    style={{ animationDelay: `${bar * 0.14}s` }}
                  />
                ))}
              </span>
              <span>
                {autoplayBlocked && !isPlaying ? ui.tapToListenHint : ui.audioVoiceTag}
              </span>
            </span>

            <span className="tabular-nums font-medium text-[#5C6370]">
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
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#EAE6DF] accent-[#0E7470]"
            style={{
              background: `linear-gradient(to right, #0E7470 ${progressPercent}%, #EAE6DF ${progressPercent}%)`,
            }}
          />
        </div>

        <button
          type="button"
          onClick={toggleSpeed}
          className="h-8 shrink-0 rounded-lg border border-[#EAE6DF] bg-white px-2 text-[11px] font-semibold tabular-nums text-[#14181F] hover:border-[#0E7470]/45 hover:bg-[#EEF7F6] transition cursor-pointer"
          aria-label="Toggle playback speed"
        >
          {playbackRate === 1 ? '1.0x' : '1.25x'}
        </button>

        <button
          type="button"
          onClick={() => void replayGeminiAudio()}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#EAE6DF] bg-white text-[#5C6370] hover:border-[#0E7470]/45 hover:text-[#0E7470] transition cursor-pointer"
          title={ui.audioReplay}
          aria-label={ui.audioReplay}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
