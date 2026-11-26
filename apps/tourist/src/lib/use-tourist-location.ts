'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { VoicePosition } from './live-voice';
import { startLocationWatch } from './location-watch';

export function useTouristLocation() {
  const [position, setPosition] = useState<VoicePosition | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState(false);
  const watch = useRef<(() => void) | null>(null);
  const release = useCallback(() => { watch.current?.(); watch.current = null; }, []);
  const clear = useCallback(() => {
    release(); setPosition(null); setLocating(false); setError(false);
  }, [release]);
  const toggle = useCallback(() => {
    if (locating || position) { clear(); return; }
    release();
    if (!navigator.geolocation) { setError(true); return; }
    setError(false); setLocating(true);
    watch.current = startLocationWatch(navigator.geolocation, point => {
      setPosition(point); setLocating(false);
    }, () => {
      watch.current = null; setPosition(null); setLocating(false); setError(true);
    });
  }, [position, locating, clear, release]);
  useEffect(() => release, [release]);
  return { position, locating, error, toggle, clear };
}
