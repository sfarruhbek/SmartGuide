import test from 'node:test';
import assert from 'node:assert/strict';
import { CITIES, PLACES } from '../src/lib/places';
import {
  DISCOVERY_KEY,
  TRIP_KEY,
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
  budget: 2000000,
  interests: ['local'],
  accommodation: true,
  customCity: '',
};
test('budget and timetable invariants across cities, budgets and 1–14 days', () => {
  for (let days = 1; days <= 14; days++)
    for (const budget of [1, 150000, 2000000, 10000000])
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
        assert.equal(
          trip.reserve,
          Math.ceil((trip.subtotal * 0.1) / 1000) * 1000,
        );
        assert.equal(trip.shortfall, Math.max(0, trip.total - budget));
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
