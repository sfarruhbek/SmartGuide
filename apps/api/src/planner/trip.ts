/** Server planner v2. Catalog and baseline math match the existing frontend; AI may only rank catalog IDs. */
export type LocalText = {
  en: string;
  ru: string;
  uz: string;
  es?: string;
  ja?: string;
  ko?: string;
};
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
  /** Public reference record has no verified ticket tariff. Zero is an allowance, not a free-entry claim. */
  estimatedAdmission?: boolean;
  /** Language of the sourced description when the other LocalText values are aliases. */
  storyLanguage?: 'en';
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
  title?: string;
  note?: string;
}
export interface TripDay {
  number: number;
  city: string;
  slots: TripSlot[];
  total: number;
  theme?: string;
  vibe?: string;
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
}

const budgetCents = (dollars: number) => Math.round(dollars * 100);
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
  preferredIds: string[] = [],
  dayPlaceIds?: string[][],
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
      const candidates = dayPlaceIds ? (dayPlaceIds[index]??[]).slice(0, 3).map(id=>places.find(place=>place.id===id&&place.city===city&&!used.has(id))).filter((place):place is Place=>!!place) : places
        .filter((place) => place.city === city && !used.has(place.id))
        .sort((a, b) => {
          const score = (p: Place) =>
            p.interests.filter((i) => input.interests.includes(i)).length * 10 +
            (p.category === 'discovery' ? 3 : 0) -
            (economical ? p.admission / 240 : 0);
          const rank = (p: Place) => preferredIds.includes(p.id) ? preferredIds.length - preferredIds.indexOf(p.id) : 0;
          return rank(b) - rank(a) || score(b) - score(a) || a.id.localeCompare(b.id);
        })
        .slice(0, 2);
      const stopCount = dayPlaceIds ? Math.max(2, candidates.length) : 2;
      for (let stop = 0; stop < stopCount; stop++) {
        const place = candidates[stop];
        const taxiDuration = stopCount === 3 && stop > 0 ? 20 : 30;
        add('taxi', taxiDuration, economical ? 120 : 240);
        if (place) {
          const visitMinutes =
            stopCount === 3
              ? stop === 0
                ? Math.min(place.minutes, 120)
                : stop === 1
                  ? Math.min(place.minutes, 90)
                  : Math.min(place.minutes, 75)
              : place.minutes;
          add('visit', visitMinutes, place.admission, { placeId: place.id });
          used.add(place.id);
        } else add('explore', 90, 0);
        if (stop === 0) {
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
    ? generateTrip(input, cities, places, true, preferredIds, dayPlaceIds)
    : trip;
}
