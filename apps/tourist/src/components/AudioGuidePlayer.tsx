'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Volume2 } from 'lucide-react';
import {
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '@smartguide/shared';
import { TOURIST_UI } from '@/lib/i18n';
import { ROUTE_COPY } from '@/lib/route-copy';

const AUDIO_PLAY_EVENT = 'smartguide:audio-play';
let activePlayerId: string | null = null;

interface Props {
  audioBase64?: string;
  audioMimeType?: string;
  fallbackText: string;
  language: SupportedLanguage;
  autoPlay?: boolean;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

export function AudioGuidePlayer({
  audioBase64,
  audioMimeType = 'audio/wav',
  fallbackText,
  language,
  autoPlay = false,
}: Props) {
  const playerId = useId();
  const audioRef = useRef<HTMLAudioElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioFailed, setAudioFailed] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPausedSpeech, setIsPausedSpeech] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState<1 | 1.25>(1);
  const rateRef = useRef(rate);
  rateRef.current = rate;
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const ui = TOURIST_UI[language];
  const copy = ROUTE_COPY[language];
  const useRecordedAudio = Boolean(audioUrl && !audioFailed);

  useEffect(() => {
    setSpeechAvailable('speechSynthesis' in window);
    setAudioFailed(false);
    setCurrentTime(0);
    setDuration(0);
    setAutoplayBlocked(false);
    if (!audioBase64) {
      setAudioUrl(null);
      return;
    }
    try {
      const bytes = Uint8Array.from(window.atob(audioBase64), (character) =>
        character.charCodeAt(0),
      );
      const url = URL.createObjectURL(
        new Blob([bytes], { type: audioMimeType }),
      );
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    } catch {
      setAudioUrl(null);
    }
  }, [audioBase64, audioMimeType]);

  const claimPlayback = useCallback(() => {
    if (activePlayerId !== playerId && 'speechSynthesis' in window)
      window.speechSynthesis.cancel();
    activePlayerId = playerId;
    window.dispatchEvent(
      new CustomEvent(AUDIO_PLAY_EVENT, { detail: { id: playerId } }),
    );
  }, [playerId]);

  useEffect(() => {
    const stopOther = (event: Event) => {
      if ((event as CustomEvent<{ id: string }>).detail.id === playerId) return;
      audioRef.current?.pause();
      utteranceRef.current = null;
      setIsPlaying(false);
      setIsPausedSpeech(false);
    };
    window.addEventListener(AUDIO_PLAY_EVENT, stopOther);
    const audio = audioRef.current;
    return () => {
      window.removeEventListener(AUDIO_PLAY_EVENT, stopOther);
      audio?.pause();
      if (activePlayerId === playerId) {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        activePlayerId = null;
      }
    };
  }, [playerId]);

  const playRecorded = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    claimPlayback();
    audio.playbackRate = rateRef.current;
    try {
      await audio.play();
      setAutoplayBlocked(false);
    } catch {
      setAutoplayBlocked(true);
    }
  }, [claimPlayback]);

  useEffect(() => {
    if (autoPlay && audioUrl && !audioFailed) void playRecorded();
  }, [autoPlay, audioUrl, audioFailed, playRecorded]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate]);

  const toggleSpeech = () => {
    if (!speechAvailable) return;
    const synth = window.speechSynthesis;
    if (isPlaying) {
      synth.pause();
      setIsPlaying(false);
      setIsPausedSpeech(true);
      return;
    }
    if (isPausedSpeech && activePlayerId === playerId) {
      synth.resume();
      setIsPlaying(true);
      setIsPausedSpeech(false);
      return;
    }
    claimPlayback();
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(fallbackText);
    utterance.lang =
      SUPPORTED_LANGUAGES.find((item) => item.code === language)
        ?.speechRecognitionLang ?? 'en-US';
    utterance.rate = rate;
    utterance.onend = () => {
      if (utteranceRef.current === utterance) {
        setIsPlaying(false);
        setIsPausedSpeech(false);
        utteranceRef.current = null;
      }
    };
    utterance.onerror = (event) => {
      if (utteranceRef.current === utterance) {
        setIsPlaying(false);
        setIsPausedSpeech(false);
        setAutoplayBlocked(
          event.error !== 'canceled' && event.error !== 'interrupted',
        );
        utteranceRef.current = null;
      }
    };
    utteranceRef.current = utterance;
    setIsPlaying(true);
    setIsPausedSpeech(false);
    setAutoplayBlocked(false);
    synth.speak(utterance);
  };

  const togglePlayback = () => {
    if (!useRecordedAudio) {
      toggleSpeech();
      return;
    }
    if (isPlaying) audioRef.current?.pause();
    else void playRecorded();
  };

  const safeDuration = Number.isFinite(duration) ? duration : 0;
  const progress =
    safeDuration > 0 ? Math.min(100, (currentTime / safeDuration) * 100) : 0;

  return (
    <div className={`audio-player ${autoplayBlocked ? 'audio-needs-tap' : ''}`}>
      {useRecordedAudio && (
        <audio
          ref={audioRef}
          src={audioUrl!}
          preload="metadata"
          onPlay={() => {
            setIsPlaying(true);
            setAutoplayBlocked(false);
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
          onError={() => {
            setAudioFailed(true);
            setIsPlaying(false);
          }}
          onLoadedMetadata={(event) => {
            setDuration(event.currentTarget.duration);
            event.currentTarget.playbackRate = rateRef.current;
          }}
          onTimeUpdate={(event) =>
            setCurrentTime(event.currentTarget.currentTime)
          }
        />
      )}
      <div className="audio-player-main">
        <button
          className="audio-play"
          type="button"
          disabled={!useRecordedAudio && !speechAvailable}
          onClick={togglePlayback}
          aria-label={isPlaying ? ui.audioPause : ui.audioPlay}
          aria-pressed={isPlaying}
        >
          {isPlaying ? (
            <Pause aria-hidden="true" />
          ) : useRecordedAudio ? (
            <Play aria-hidden="true" />
          ) : (
            <Volume2 aria-hidden="true" />
          )}
        </button>
        <div className="audio-player-track">
          <div className="audio-player-label">
            <span>
              {autoplayBlocked
                ? ui.tapToListenHint
                : useRecordedAudio
                  ? ui.audioVoiceTag
                  : ui.audioBrowserFallback}
            </span>
            {useRecordedAudio && (
              <span className="audio-time">
                {formatTime(currentTime)} / {formatTime(safeDuration)}
              </span>
            )}
          </div>
          {useRecordedAudio ? (
            <input
              type="range"
              min={0}
              max={safeDuration || 1}
              step={0.05}
              value={Math.min(currentTime, safeDuration || 0)}
              aria-label={copy.progress}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (audioRef.current) audioRef.current.currentTime = value;
                setCurrentTime(value);
              }}
              style={
                { '--audio-progress': `${progress}%` } as React.CSSProperties
              }
            />
          ) : (
            <p className="audio-fallback-hint">{copy.playHint}</p>
          )}
        </div>
        <button
          className="audio-speed"
          type="button"
          aria-label={`${copy.speed}: ${rate}×`}
          onClick={() => setRate(rate === 1 ? 1.25 : 1)}
        >
          {rate === 1 ? '1.0×' : '1.25×'}
        </button>
      </div>
      {useRecordedAudio && (
        <button
          className="audio-replay text-action"
          type="button"
          onClick={() => {
            if (audioRef.current) audioRef.current.currentTime = 0;
            setCurrentTime(0);
            void playRecorded();
          }}
        >
          <RotateCcw aria-hidden="true" />
          {ui.audioReplay}
        </button>
      )}
    </div>
  );
}
