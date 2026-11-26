import test from 'node:test';
import assert from 'node:assert/strict';
import { CITIES, PLACES } from '../src/lib/places';
import {
  DISCOVERY_KEY,
  TRIP_KEY,
  LEGACY_TRIP_KEY,
  money,
  budgetCents,
  matchesPlaceFilter,
  generateTrip,
  project,
  readDiscoveries,
  readTrip,
  unproject,
  type TripInput,
} from '../src/lib/journey';

const input: TripInput = {
  cities: ['bukhara'],
  days: 4,
  budget: 160,
  interests: ['local'],
  accommodation: true,
  customCity: '',
};
test('budget and timetable invariants across cities, budgets and 1–14 days', () => {
  for (let days = 1; days <= 14; days++)
    for (const budget of [0.01, 12, 160, 800])
      for (const accommodation of [true, false]) {
        const trip = generateTrip(
          {
            ...input,
            days,
            budget,
            accommodation,
            cities: CITIES.slice(0, Math.min(days, 4)).map((c) => c.id),
          },
          CITIES,
          PLACES,
        );
        assert.equal(trip.days.length, days);
        const slots = trip.days.flatMap((day) => day.slots);
        assert.equal(
          trip.subtotal,
          slots.reduce((sum, slot) => sum + slot.cost, 0),
        );
        assert.equal(trip.total, trip.subtotal + trip.reserve);
        assert.equal(trip.reserve, Math.ceil(trip.subtotal / 10));
        assert.equal(
          trip.shortfall,
          Math.max(0, trip.total - budgetCents(budget)),
        );
        assert.equal(trip.currency, 'USD');
        assert.equal(
          slots.filter((s) => s.kind === 'stay').length,
          accommodation ? days - 1 : 0,
        );
        const visited = slots.flatMap((s) => (s.placeId ? [s.placeId] : []));
        assert.equal(visited.length, new Set(visited).size);
        for (const [index, day] of trip.days.entries()) {
          assert.equal(day.number, index + 1);
          assert.equal(
            day.total,
            day.slots.reduce((sum, s) => sum + s.cost, 0),
          );
          for (let i = 0; i < day.slots.length; i++) {
            const slot = day.slots[i];
            assert.ok(slot.cost >= 0 && Number.isInteger(slot.cost));
            assert.ok(slot.time < slot.end && slot.end <= '23:59');
            if (i) assert.ok(day.slots[i - 1].end <= slot.time);
            if (slot.placeId)
              assert.equal(
                PLACES.find((p) => p.id === slot.placeId)?.city,
                day.city,
              );
          }
          if (index && trip.days[index - 1].city !== day.city) {
            assert.equal(
              day.slots.filter((s) => s.kind === 'transfer').length,
              2,
            );
            assert.ok(!day.slots.some((s) => s.kind === 'visit'));
          }
        }
      }
});
test('budget shortage is visible; custom destinations and sparse catalogs stay honest', () => {
  const affordable = generateTrip(input, CITIES, PLACES);
  assert.equal(affordable.shortfall, 0);
  assert.ok(affordable.total <= budgetCents(input.budget));
  const low = generateTrip({ ...input, budget: 1 }, CITIES, PLACES);
  assert.ok(low.shortfall > 0);
  const sparse = generateTrip(
    { ...input, cities: [], customCity: 'Rishton' },
    CITIES,
    PLACES,
  );
  assert.ok(sparse.days.every((d) => d.city === 'custom'));
  assert.ok(
    sparse.days.flatMap((d) => d.slots).some((s) => s.kind === 'explore'),
  );
  assert.ok(
    !sparse.days.flatMap((d) => d.slots).some((s) => s.kind === 'visit'),
  );
  const food = generateTrip(
    { ...input, cities: ['tashkent'], days: 1, interests: ['food'] },
    CITIES,
    PLACES,
  );
  assert.equal(
    food.days[0].slots.find((s) => s.kind === 'visit')?.placeId,
    'chorsu',
  );
});
test('rejects invalid duration, budget, destinations and persisted input', () => {
  for (const patch of [
    { days: 0 },
    { days: 15 },
    { days: 1.5 },
    { budget: NaN },
    { budget: -1 },
    { budget: 1.001 },
    { budget: 1000001 },
    { cities: [] },
    { cities: ['bukhara', 'khiva'], days: 1 },
    { cities: ['unknown'] },
    { interests: ['bad'] },
    { customCity: 'x'.repeat(101) },
  ]) {
    assert.throws(() =>
      generateTrip({ ...input, ...patch } as TripInput, CITIES, PLACES),
    );
  }
  const data = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: (key: string) => data.get(key) ?? null },
  });
  data.set(TRIP_KEY, 'not-json');
  assert.equal(readTrip(CITIES, PLACES), null);
  data.set(
    TRIP_KEY,
    JSON.stringify({ version: 1, input: { ...input, days: NaN } }),
  );
  assert.equal(readTrip(CITIES, PLACES), null);
  data.set(
    TRIP_KEY,
    JSON.stringify({ ...generateTrip(input, CITIES, PLACES), total: 1 }),
  );
  assert.ok(readTrip(CITIES, PLACES)!.total > 1);
  data.set(
    DISCOVERY_KEY,
    JSON.stringify([
      {
        id: 'x',
        name: 'test',
        city: 'bukhara',
        story: 'x',
        source: 'x',
        kind: 'personal',
        lat: 0,
        lng: 64,
      },
    ]),
  );
  assert.deepEqual(readDiscoveries(), []);
  delete (globalThis as { localStorage?: unknown }).localStorage;
});
test('map projection round trips across Uzbekistan and zoom levels', () => {
  for (const city of CITIES)
    for (const zoom of [6, 12, 17]) {
      const point = project(city.lat, city.lng, zoom),
        roundTrip = unproject(point.x, point.y, zoom);
      assert.ok(Math.abs(roundTrip.lat - city.lat) < 1e-8);
      assert.ok(Math.abs(roundTrip.lng - city.lng) < 1e-8);
    }
});

test('USD amounts use cents and migrate the old UZS budget without treating it as dollars', () => {
  assert.equal(money(12345, 'en'), '$123.45');
  assert.ok(money(12345, 'ru').includes('123,45'));
  assert.equal(budgetCents(0.29), 29);
  const one = generateTrip(
    { ...input, days: 1, accommodation: false },
    CITIES,
    PLACES,
  );
  const breakfast = one.days[0].slots.find(
    (slot) => slot.kind === 'breakfast',
  )!;
  assert.ok(breakfast.cost >= 200 && breakfast.cost <= 360);
  const data = new Map([
    [
      LEGACY_TRIP_KEY,
      JSON.stringify({ version: 1, input: { ...input, budget: 2000000 } }),
    ],
  ]);
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: (key: string) => data.get(key) ?? null },
  });
  const migrated = readTrip(CITIES, PLACES)!;
  assert.equal(migrated.input.budget, 160);
  assert.equal(migrated.version, 2);
  assert.equal(migrated.currency, 'USD');
  data.set(
    TRIP_KEY,
    JSON.stringify({ ...migrated, input: { ...input, budget: 159.99 } }),
  );
  assert.equal(readTrip(CITIES, PLACES)!.input.budget, 159.99);
  delete (globalThis as { localStorage?: unknown }).localStorage;
});

test('map collections separate established landmarks from editorial discoveries', () => {
  const landmarks = PLACES.filter((place) =>
    matchesPlaceFilter(place, 'landmark'),
  );
  const discoveries = PLACES.filter((place) =>
    matchesPlaceFilter(place, 'discovery'),
  );
  assert.equal(landmarks.length + discoveries.length, PLACES.length);
  assert.ok(landmarks.some((place) => place.id === 'registan'));
  assert.ok(landmarks.some((place) => place.id === 'chorsu'));
  assert.ok(discoveries.some((place) => place.id === 'fayzabad'));
  assert.ok(discoveries.some((place) => place.id === 'turki-jandi'));
  assert.ok(
    discoveries
      .filter((place) => ['fayzabad', 'turki-jandi'].includes(place.id))
      .every(
        (place) => place.history?.ru && place.source.startsWith('https://'),
      ),
  );
  assert.ok(
    PLACES.every(
      (place) => Number.isInteger(place.admission) && place.admission >= 0,
    ),
  );
});
