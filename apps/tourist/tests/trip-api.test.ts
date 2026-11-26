import test from 'node:test';
import assert from 'node:assert/strict';
import { CITIES, PLACES } from '../src/lib/places';
import { generateTrip, readTrip, TRIP_KEY, type TripInput } from '../src/lib/journey';
import { parseTripResponse, requestTrip } from '../src/lib/trip-api';

const input: TripInput = { cities:['khiva'],days:2,budget:120,interests:['local'],accommodation:true,customCity:'' };
const response = () => ({ trip:generateTrip(input,CITIES,PLACES),source:'groq',modelUsed:'test-model',fallbackReason:null });
test('frontend actually posts to our trip API and preserves the returned plan and AI metadata', async () => {
  const original = globalThis.fetch;
  const data = response();
  const visits = data.trip.days[0].slots.filter((slot) => slot.kind === 'visit');
  assert.equal(visits.length,2);
  [visits[0].placeId,visits[1].placeId] = [visits[1].placeId,visits[0].placeId];
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    assert.ok(url.endsWith('/api/trips/generate')); assert.equal(init?.method,'POST');
    assert.deepEqual(JSON.parse(String(init?.body)),input);
    return Response.json(data);
  }) as typeof fetch;
  try {
    const trip = await requestTrip(input);
    assert.deepEqual(trip.days,data.trip.days); assert.equal(trip.generation?.source,'groq');
    const saved = JSON.stringify(trip);
    Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string) => key === TRIP_KEY ? saved : null}});
    assert.deepEqual(readTrip(CITIES,PLACES),trip);
  } finally { globalThis.fetch = original; }
});
test('malformed server plans, mismatched preferences and incorrect totals are rejected', () => {
  for (const patch of [
    {source:'fake'}, {modelUsed:42}, {trip:{...response().trip,total:1}},
    {trip:{...response().trip,days:[]}}, {trip:{...response().trip,currency:'UZS'}},
    {trip:{...response().trip,input:{...input,budget:121}}},
  ]) assert.throws(() => parseTripResponse({...response(),...patch},input));
  const invalid = response(); invalid.trip.days[0].slots.find((s) => s.kind === 'visit')!.placeId = 'invented';
  assert.throws(() => parseTripResponse(invalid,input));
});
test('API failure stays an error instead of silently generating an instant local AI plan', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = (async () => Response.json({error:'Offline'},{status:503})) as typeof fetch;
  try { await assert.rejects(requestTrip(input)); } finally { globalThis.fetch = original; }
  assert.equal(parseTripResponse({...response(),source:'local-fallback',fallbackReason:'exhausted'},input).generation?.source,'local-fallback');
});
