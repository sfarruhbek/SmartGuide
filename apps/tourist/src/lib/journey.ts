import type { SupportedLanguage } from '@smartguide/shared';

export type LocalText = {
  en: string;
  ru: string;
  uz: string;
  es?: string;
  ja?: string;
  ko?: string;
};
export const local = (text: LocalText, language: SupportedLanguage) =>
  text[language] || text.en;
export type Interest = 'history' | 'local' | 'food' | 'nature' | 'sacred';
export type PlaceCategory = 'landmark' | 'discovery';
export type PlaceFilter = 'all' | PlaceCategory;
export interface City {
  id: string;
  name: LocalText;
  lat: number;
  lng: number;
  image?: string;
}
export interface Place {
  id: string;
  city: string;
  name: LocalText;
  story: LocalText;
  lat: number;
  lng: number;
  interests: Interest[];
  category: PlaceCategory;
  history?: LocalText;
  /** Authored admission allowance in USD cents, not a live ticket quote. */
  admission: number;
  minutes: number;
  source: string;
  guideSlug?: string;
}
export interface TripInput {
  cities: string[];
  days: number;
  /** User-entered total in US dollars. All calculated amounts use integer cents. */
  budget: number;
  interests: Interest[];
  accommodation: boolean;
  customCity: string;
}
export type SlotKind =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'visit'
  | 'explore'
  | 'taxi'
  | 'stay'
  | 'transfer';
export interface TripSlot {
  time: string;
  end: string;
  kind: SlotKind;
  cost: number;
  placeId?: string;
  from?: string;
  to?: string;
}
export interface TripDay {
  number: number;
  city: string;
  slots: TripSlot[];
  total: number;
}
export interface Trip {
  version: 2;
  currency: 'USD';
  input: TripInput;
  days: TripDay[];
  subtotal: number;
  reserve: number;
  total: number;
  shortfall: number;
  createdAt: string;
  generation?: {
    source: 'groq' | 'local-fallback';
    modelUsed: string;
    fallbackReason: string | null;
  };
}
export interface Discovery {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  story: string;
  source: string;
  kind: 'fact' | 'legend' | 'personal';
  createdAt: string;
}
export const TRIP_KEY = 'smartguide_trip_v2';
export const LEGACY_TRIP_KEY = 'smartguide_trip_v1';
export const DISCOVERY_KEY = 'smartguide_discoveries_v1';

export function money(value: number, language: SupportedLanguage) {
  return new Intl.NumberFormat(language === 'uz' ? 'uz-UZ' : language, {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}
export const budgetCents = (dollars: number) => Math.round(dollars * 100);
export const matchesPlaceFilter = (place: Place, filter: PlaceFilter) =>
  filter === 'all' || place.category === filter;
export function project(lat: number, lng: number, zoom: number) {
  const clamped = Math.max(-85.0511, Math.min(85.0511, lat));
  const size = 256 * 2 ** zoom;
  const sine = Math.sin((clamped * Math.PI) / 180);
  return {
    x: ((lng + 180) / 360) * size,
    y: (0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * size,
  };
}
export function unproject(x: number, y: number, zoom: number) {
  const size = 256 * 2 ** zoom;
  return {
    lng: (x / size) * 360 - 180,
    lat: (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / size))) * 180) / Math.PI,
  };
}
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const rad = Math.PI / 180;
  const q =
    Math.sin(((b.lat - a.lat) * rad) / 2) ** 2 +
    Math.cos(a.lat * rad) *
      Math.cos(b.lat * rad) *
      Math.sin(((b.lng - a.lng) * rad) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q));
}
const clock = (minute: number) =>
  `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
export function generateTrip(
  input: TripInput,
  cities: City[],
  places: Place[],
  useEconomy = false,
): Trip {
  if (
    !Number.isInteger(input.days) ||
    input.days < 1 ||
    input.days > 14 ||
    !Number.isFinite(input.budget) ||
    input.budget <= 0 ||
    input.budget > 1000000 ||
    Math.abs(input.budget * 100 - budgetCents(input.budget)) > 1e-6
  )
    throw new Error('Invalid trip');
  if (
    !Array.isArray(input.cities) ||
    input.cities.some((id) => !cities.some((city) => city.id === id)) ||
    typeof input.customCity !== 'string' ||
    input.customCity.length > 100 ||
    typeof input.accommodation !== 'boolean' ||
    !Array.isArray(input.interests) ||
    input.interests.some(
      (i) => !['history', 'local', 'food', 'nature', 'sacred'].includes(i),
    )
  )
    throw new Error('Invalid preferences');
  const destinations = [...new Set(input.cities)].filter((id) =>
    cities.some((city) => city.id === id),
  );
  if (input.customCity.trim()) destinations.push('custom');
  if (!destinations.length || destinations.length > input.days)
    throw new Error('Invalid destinations');
  const perDay = input.budget / input.days;
  const economical = useEconomy || perDay < (input.accommodation ? 40 : 24);
  const used = new Set<string>();
  const days: TripDay[] = [];
  for (let index = 0; index < input.days; index++) {
    const city =
      destinations[Math.floor((index * destinations.length) / input.days)];
    const previous = days[index - 1]?.city;
    const slots: TripSlot[] = [];
    let now = 8 * 60;
    const add = (
      kind: SlotKind,
      duration: number,
      cost: number,
      extra: Partial<TripSlot> = {},
    ) => {
      slots.push({
        kind,
        time: clock(now),
        end: clock(now + duration),
        cost,
        ...extra,
      });
      now += duration;
    };
    add('breakfast', 45, economical ? 200 : 360);
    // Each new city gets an entire transfer day: no fabricated train timetable or rushed sightseeing.
    if (previous && previous !== city) {
      const from = cities.find((value) => value.id === previous);
      const to = cities.find((value) => value.id === city);
      const km = from && to ? distanceKm(from, to) : 400;
      const transfer = { from: previous, to: city };
      add('transfer', 4 * 60, Math.ceil((640 + km * 3.6) / 80) * 80, transfer);
      add('lunch', 60, economical ? 360 : 640);
      add('transfer', 5 * 60, 0, transfer);
      add('dinner', 60, economical ? 360 : 640);
    } else {
      const candidates = places
        .filter((place) => place.city === city && !used.has(place.id))
        .sort((a, b) => {
          const score = (p: Place) =>
            p.interests.filter((i) => input.interests.includes(i)).length * 10 +
            (p.category === 'discovery' ? 3 : 0) -
            (economical ? p.admission / 240 : 0);
          return score(b) - score(a) || a.id.localeCompare(b.id);
        })
        .slice(0, 2);
      for (let stop = 0; stop < 2; stop++) {
        const place = candidates[stop];
        add('taxi', 30, economical ? 120 : 240);
        if (place) {
          add('visit', place.minutes, place.admission, { placeId: place.id });
          used.add(place.id);
        } else add('explore', 90, 0);
        if (!stop) {
          now = Math.max(now, 12 * 60 + 30);
          add('lunch', 60, economical ? 360 : 640);
        }
      }
      now = Math.max(now, 18 * 60);
      add('dinner', 60, economical ? 360 : 640);
    }
    if (input.accommodation && index < input.days - 1) {
      now = 21 * 60;
      add('stay', 60, economical ? 1440 : 2800);
    }
    days.push({
      number: index + 1,
      city,
      slots,
      total: slots.reduce((sum, slot) => sum + slot.cost, 0),
    });
  }
  const subtotal = days.reduce((sum, day) => sum + day.total, 0);
  const reserve = Math.ceil(subtotal / 10);
  const trip: Trip = {
    version: 2,
    currency: 'USD',
    input: { ...input, cities: destinations.filter((id) => id !== 'custom') },
    days,
    subtotal,
    reserve,
    total: subtotal + reserve,
    shortfall: Math.max(0, subtotal + reserve - budgetCents(input.budget)),
    createdAt: new Date().toISOString(),
  };
  // Try the lower daily allowances before reporting a shortfall that can be avoided.
  return !economical && trip.shortfall > 0
    ? generateTrip(input, cities, places, true)
    : trip;
}

/** Validate the returned itinerary itself, preserving the AI's order across reloads. */
export function validateTrip(value: unknown, cities: City[], places: Place[]): Trip {
  if (!value || typeof value !== 'object') throw new Error('Invalid trip');
  const trip = value as Trip;
  if (trip.version !== 2 || trip.currency !== 'USD' || !trip.input ||
      typeof trip.createdAt !== 'string' || !Number.isFinite(Date.parse(trip.createdAt))) throw new Error('Invalid trip');
  const baseline = generateTrip(trip.input, cities, places);
  if (!Array.isArray(trip.days) || trip.days.length !== trip.input.days) throw new Error('Invalid days');
  const cents = (n: unknown): n is number => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0 && n <= 1_000_000_000;
  const time = (s: unknown): s is string => typeof s === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(s);
  const kinds: SlotKind[] = ['breakfast','lunch','dinner','visit','explore','taxi','stay','transfer'];
  const visited = new Set<string>();
  for (const [index, day] of trip.days.entries()) {
    if (!day || day.number !== index + 1 || day.city !== baseline.days[index].city ||
        !Array.isArray(day.slots) || !day.slots.length || day.slots.length > 30) throw new Error('Invalid day');
    for (const [i, slot] of day.slots.entries()) {
      if (!slot || !kinds.includes(slot.kind) || !time(slot.time) || !time(slot.end) || slot.time >= slot.end ||
          (i > 0 && day.slots[i - 1].end > slot.time) || !cents(slot.cost)) throw new Error('Invalid slot');
      if (slot.kind === 'visit') {
        const place = places.find((p) => p.id === slot.placeId && p.city === day.city);
        if (!place || visited.has(place.id)) throw new Error('Invalid place');
        visited.add(place.id);
      } else if (slot.placeId !== undefined) throw new Error('Invalid place');
      if (slot.kind === 'transfer' && (!baseline.days.some((d) => d.city === slot.from) || slot.to !== day.city || slot.from === slot.to)) throw new Error('Invalid transfer');
    }
    if (!cents(day.total) || day.total !== day.slots.reduce((sum, slot) => sum + slot.cost, 0)) throw new Error('Invalid day cost');
  }
  const subtotal = trip.days.reduce((sum, day) => sum + day.total, 0);
  if (!cents(trip.subtotal) || trip.subtotal !== subtotal || trip.reserve !== Math.ceil(subtotal / 10) ||
      trip.total !== subtotal + trip.reserve || trip.shortfall !== Math.max(0, trip.total - budgetCents(trip.input.budget))) throw new Error('Invalid totals');
  if (trip.generation && (!['groq','local-fallback'].includes(trip.generation.source) ||
      typeof trip.generation.modelUsed !== 'string' || trip.generation.modelUsed.length > 150 ||
      !(trip.generation.fallbackReason === null || typeof trip.generation.fallbackReason === 'string'))) throw new Error('Invalid generation metadata');
  return trip;
}

export function readTrip(cities: City[], places: Place[]): Trip | null {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(TRIP_KEY) ??
        localStorage.getItem(LEGACY_TRIP_KEY) ??
        'null',
    );
    if (!value || typeof value !== 'object') return null;
    // New API plans must restore their actual stops, never silently regenerate another order.
    if ('generation' in value) return validateTrip(value, cities, places);
    const { version, input, currency } = value as Omit<Trip, 'version'> & {
      version: number;
    };
    if (
      (version !== 1 && version !== 2) ||
      (version === 2 && currency !== 'USD') ||
      !input ||
      !Number.isFinite(input.budget) ||
      !Array.isArray(input.cities) ||
      !input.cities.every((id) => typeof id === 'string') ||
      !Array.isArray(input.interests) ||
      !input.interests.every((i) =>
        ['history', 'local', 'food', 'nature', 'sacred'].includes(i),
      ) ||
      typeof input.accommodation !== 'boolean' ||
      typeof input.customCity !== 'string' ||
      input.customCity.length > 100
    )
      return null;
    // v1 used UZS. Its historical planning basis is used ONLY to migrate the old input,
    // never as a claim about the current exchange rate. Recalculate all costs in cents.
    const migrated =
      version === 1
        ? { ...input, budget: Math.round((input.budget / 12500) * 100) / 100 }
        : input;
    return generateTrip(migrated, cities, places);
  } catch {
    return null;
  }
}
export function readDiscoveries(): Discovery[] {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(DISCOVERY_KEY) || '[]',
    );
    if (!Array.isArray(value)) return [];
    return value
      .filter(
        (p): p is Discovery =>
          p &&
          typeof p.id === 'string' &&
          typeof p.name === 'string' &&
          p.name.length <= 100 &&
          typeof p.city === 'string' &&
          typeof p.story === 'string' &&
          p.story.length <= 2000 &&
          typeof p.source === 'string' &&
          p.source.length <= 500 &&
          ['fact', 'legend', 'personal'].includes(p.kind) &&
          Number.isFinite(p.lat) &&
          Number.isFinite(p.lng) &&
          p.lat >= 37 &&
          p.lat <= 46 &&
          p.lng >= 55 &&
          p.lng <= 74,
      )
      .slice(0, 50);
  } catch {
    return [];
  }
}
