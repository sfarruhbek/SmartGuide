import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { generateTrip, type TripInput } from '../src/planner/trip.js';
import { catalog, tripInputSchema } from '../src/planner/catalog.js';
import { validateRanking } from '../src/planner/service.js';
import { loadContentImport, summarizeContentImport } from '../src/ai/content-import.js';

const input: TripInput = { cities: ['khiva', 'bukhara'], days: 4, budget: 200, interests: ['local', 'history'], accommodation: true, customCity: '' };
test('national planner validates input, keeps exact cents and never hides shortfall', () => {
  const trip = generateTrip(input, catalog.cities, catalog.places);
  assert.equal(trip.days.length, 4);
  assert.equal(trip.total, trip.days.reduce((sum, day) => sum + day.slots.reduce((n, slot) => n + slot.cost, 0), 0) + trip.reserve);
  assert.equal(trip.reserve, Math.ceil(trip.subtotal / 10));
  const poor = generateTrip({ ...input, budget: 1 }, catalog.cities, catalog.places);
  assert.ok(poor.shortfall > 0); assert.equal(poor.shortfall, poor.total - 100);
  assert.equal(trip.currency, 'USD');
  for (const day of trip.days) for (const slot of day.slots) { assert.ok(Number.isInteger(slot.cost)); assert.ok(slot.end > slot.time); }
  assert.ok(trip.days.some((day) => day.slots.some((slot) => slot.kind === 'transfer')));
});
test('invalid money, days, city, extra fields and too many destinations are rejected', () => {
  for (const changes of [{ budget: 1.001 }, { budget: -1 }, { days: 0 }, { days: 15 }, { cities: ['unknown'] }, { days: 1 }, { currency: 'UZS' }]) {
    assert.equal(tripInputSchema.safeParse({ ...input, ...changes }).success, false);
  }
});
test('AI cannot inject unknown IDs, duplicate IDs, prices or malformed JSON', () => {
  assert.deepEqual(validateRanking('{"placeIds":["one"]}', ['one']), ['one']);
  for (const value of ['{}', '{"placeIds":[]}', '{"placeIds":["evil"]}', '{"placeIds":["one","one"]}', '{"placeIds":["one"],"cost":1}', '```json {} ```']) assert.throws(() => validateRanking(value, ['one']));
});
test('ranking changes visits while money remains catalog based', () => {
  const cityPlaces = catalog.places.filter((p) => p.city === 'khiva');
  const preferred = cityPlaces.slice().reverse().map((p) => p.id);
  const trip = generateTrip({ ...input, cities: ['khiva'], days: 1 }, catalog.cities, catalog.places, false, preferred);
  const visits = trip.days[0].slots.filter((s) => s.kind === 'visit');
  assert.equal(visits[0].placeId, preferred[0]);
  for (const slot of visits) assert.equal(slot.cost, cityPlaces.find((p) => p.id === slot.placeId)?.admission);
});
test('missing city content stays explicit exploration without fabricated places', () => {
  const trip = generateTrip({ ...input, cities: ['nukus'], days: 1 }, catalog.cities, catalog.places);
  assert.equal(trip.days[0].slots.filter((s) => s.kind === 'explore').length, 2);
  assert.equal(trip.days[0].slots.filter((s) => s.placeId).length, 0);
});
test('imported JSON is intact, validated and staged with content conflicts', () => {
  const data = loadContentImport();
  assert.equal(data.monuments.length, 5);
  const review = summarizeContentImport();
  assert.equal(review.status, 'needs-historical-review');
  assert.equal(review.monuments.find((p) => p.id === 'tosh-hovli-palace')?.legacySlug, 'tosh-hovli');
  assert.ok(review.conflicts.length >= 4);
});
test('server catalog snapshot matches authored frontend catalog IDs and cost source', () => {
  const source = readFileSync(new URL('../../tourist/src/lib/places.ts', import.meta.url), 'utf8');
  for (const place of catalog.places) {
    assert.ok(source.includes(`id: '${place.id}'`));
    const block = source.slice(source.indexOf(`id: '${place.id}'`));
    assert.equal(Number(/admission: (\d+)/.exec(block)?.[1]), place.admission);
  }
  assert.equal(catalog.cities.length, 16); assert.equal(catalog.places.length, 15);
});
