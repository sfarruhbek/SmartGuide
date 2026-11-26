import type { VoicePosition } from './live-voice';

/** Stops the native watch and ignores callbacks already queued by the browser. */
export function startLocationWatch(
  geo: Pick<Geolocation, 'watchPosition' | 'clearWatch'>,
  onPosition: (position: VoicePosition) => void,
  onError: () => void,
) {
  let active = true;
  let watchId: number | null = null;
  let lastUpdate = -Infinity;
  const stop = () => {
    active = false;
    if (watchId !== null) geo.clearWatch(watchId);
    watchId = null;
  };
  const fail = () => { if (active) { stop(); onError(); } };
  try {
    const id = geo.watchPosition(({ coords }) => {
      if (!active) return;
      const { latitude: lat, longitude: lng, accuracy } = coords;
      if (![lat, lng, accuracy].every(Number.isFinite) || Math.abs(lat) > 90 || Math.abs(lng) > 180 || accuracy < 0) { fail(); return; }
      if (Date.now() - lastUpdate < 5000) return;
      lastUpdate = Date.now();
      onPosition({ lat, lng, accuracy });
    }, fail, { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 });
    if (active) watchId = id;
    else geo.clearWatch(id);
  } catch { fail(); }
  return stop;
}
