'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Minus,
  Plus,
  Landmark,
  Sparkles,
} from 'lucide-react';
import type { SupportedLanguage } from '@smartguide/shared';
import {
  local,
  project,
  unproject,
  type City,
  type Discovery,
  type Place,
} from '@/lib/journey';
import { journeyCopy } from '@/lib/journey-copy';

export function DiscoveryMap({
  city,
  places,
  drafts,
  selected,
  onSelect,
  language,
}: {
  city: City;
  places: Place[];
  drafts: Discovery[];
  selected: string | null;
  onSelect: (id: string) => void;
  language: SupportedLanguage;
}) {
  const copy = journeyCopy(language);
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    cx: number;
    cy: number;
    moved: boolean;
  } | null>(null);
  const [size, setSize] = useState({ width: 600, height: 480 });
  const [view, setView] = useState({ lat: city.lat, lng: city.lng, zoom: 12 });
  const [failed, setFailed] = useState(false);
  const target = [...places, ...drafts].find((place) => place.id === selected);
  useEffect(() => {
    setView({ lat: city.lat, lng: city.lng, zoom: 12 });
    setFailed(false);
  }, [city.id, city.lat, city.lng]);
  useEffect(() => {
    if (target)
      setView((current) => ({ ...current, lat: target.lat, lng: target.lng }));
  }, [target?.lat, target?.lng]);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const center = project(view.lat, view.lng, view.zoom);
  const left = center.x - size.width / 2,
    top = center.y - size.height / 2;
  const tiles = [];
  for (
    let y = Math.floor(top / 256);
    y <= Math.floor((top + size.height) / 256);
    y++
  ) {
    for (
      let x = Math.floor(left / 256);
      x <= Math.floor((left + size.width) / 256);
      x++
    ) {
      if (y >= 0 && x >= 0 && y < 2 ** view.zoom && x < 2 ** view.zoom)
        tiles.push({ x, y });
    }
  }
  const pan = (dx: number, dy: number) =>
    setView({ ...view, ...unproject(center.x + dx, center.y + dy, view.zoom) });
  return (
    <div
      ref={ref}
      className="discovery-map"
      role="region"
      aria-label={copy('map')}
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest('button,a')) return;
        drag.current = {
          x: event.clientX,
          y: event.clientY,
          cx: center.x,
          cy: center.y,
          moved: false,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!drag.current) return;
        const dx = event.clientX - drag.current.x,
          dy = event.clientY - drag.current.y;
        if (Math.abs(dx) + Math.abs(dy) > 5) drag.current.moved = true;
        setView((current) => ({
          ...current,
          ...unproject(
            drag.current!.cx - dx,
            drag.current!.cy - dy,
            current.zoom,
          ),
        }));
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
    >
      <div className="map-tiles" aria-hidden="true">
        {tiles.map((tile) => (
          <img
            key={`${view.zoom}/${tile.x}/${tile.y}`}
            src={`https://tile.openstreetmap.org/${view.zoom}/${tile.x}/${tile.y}.png`}
            alt=""
            draggable={false}
            onError={() => setFailed(true)}
            style={{ left: tile.x * 256 - left, top: tile.y * 256 - top }}
          />
        ))}
      </div>
      {[...places, ...drafts].map((place) => {
        const point = project(place.lat, place.lng, view.zoom);
        const x = point.x - left,
          y = point.y - top;
        if (x < -30 || x > size.width + 30 || y < -30 || y > size.height + 30)
          return null;
        const name =
          typeof place.name === 'string'
            ? place.name
            : local(place.name, language);
        return (
          <button
            key={place.id}
            type="button"
            className={`discovery-pin ${selected === place.id ? 'selected' : ''} ${'kind' in place ? 'draft' : place.category}`}
            style={{ left: x, top: y }}
            aria-label={name}
            aria-pressed={selected === place.id}
            title={name}
            onClick={() => onSelect(place.id)}
          >
            <span>
              {'kind' in place ? (
                '◇'
              ) : place.category === 'discovery' ? (
                <Sparkles size={15} />
              ) : (
                <Landmark size={15} />
              )}
            </span>
          </button>
        );
      })}
      <div className="map-controls">
        <button
          type="button"
          aria-label={copy('zoomIn')}
          disabled={view.zoom >= 17}
          onClick={() => setView({ ...view, zoom: view.zoom + 1 })}
        >
          <Plus />
        </button>
        <button
          type="button"
          aria-label={copy('zoomOut')}
          disabled={view.zoom <= 6}
          onClick={() => setView({ ...view, zoom: view.zoom - 1 })}
        >
          <Minus />
        </button>
        <button
          type="button"
          aria-label={copy('north')}
          onClick={() => pan(0, -180)}
        >
          <ArrowUp />
        </button>
        <button
          type="button"
          aria-label={copy('south')}
          onClick={() => pan(0, 180)}
        >
          <ArrowDown />
        </button>
        <button
          type="button"
          aria-label={copy('west')}
          onClick={() => pan(-180, 0)}
        >
          <ArrowLeft />
        </button>
        <button
          type="button"
          aria-label={copy('east')}
          onClick={() => pan(180, 0)}
        >
          <ArrowRight />
        </button>
      </div>
      {failed && (
        <p role="status" className="map-failed">
          {copy('tilesError')}
        </p>
      )}
      <a
        className="osm-credit"
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noreferrer"
      >
        © OpenStreetMap contributors
      </a>
    </div>
  );
}
