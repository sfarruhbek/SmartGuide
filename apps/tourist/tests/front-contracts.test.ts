import test from 'node:test';
import assert from 'node:assert/strict';
import { CITIES, PLACES } from '../src/lib/places';
import { generateTrip } from '../src/lib/journey';
import {
  readJourneyNavigation,
  journeyUrl,
} from '../src/lib/journey-navigation';
import { tripBreakdown, tripText } from '../src/lib/trip-summary';
import { requestJson, ApiError } from '../src/lib/http';
import { askGuide } from '../src/lib/api';

test('route state survives refresh and rejects unknown cities, places and days', () => {
  const route = readJourneyNavigation(
    'view=map&city=bukhara&place=poi-kalyan&collection=discovery&day=99',
    CITIES,
    PLACES,
  );
  assert.equal(route.view, 'map');
  assert.equal(route.place, 'poi-kalyan');
  assert.equal(route.collection, 'all');
  assert.equal(route.day, 13);
  const invalid = readJourneyNavigation(
    'view=unknown&city=unknown&place=unknown&day=NaN',
    CITIES,
    PLACES,
  );
  assert.equal(invalid.view, 'plan');
  assert.equal(invalid.city, 'bukhara');
  assert.equal(invalid.day, 0);
  const url = new URL('https://example.test/?lang=ru&ref=hotel#trip-planner');
  const mapUrl = journeyUrl(url, route, PLACES);
  assert.ok(mapUrl.includes('lang=ru'));
  assert.ok(mapUrl.includes('ref=hotel'));
  assert.ok(mapUrl.includes('place=poi-kalyan'));
  assert.ok(!mapUrl.includes('#'));
  const planUrl = journeyUrl(
    new URL(mapUrl, url),
    { ...route, view: 'plan' },
    PLACES,
  );
  assert.ok(!planUrl.includes('place='));
  assert.ok(!planUrl.includes('city='));
});
test('downloaded trip includes every day, sources and an exact cost breakdown', () => {
  const trip = generateTrip(
    {
      cities: ['bukhara', 'samarkand'],
      days: 4,
      budget: 160,
      interests: ['local'],
      accommodation: true,
      customCity: '',
    },
    CITIES,
    PLACES,
  );
  assert.equal(
    Object.values(tripBreakdown(trip)).reduce((sum, value) => sum + value, 0),
    trip.total,
  );
  const output = tripText(trip, 'ru', CITIES, PLACES);
  for (let day = 1; day <= 4; day++) assert.ok(output.includes(`День ${day}`));
  assert.ok(output.includes('https://'));
  assert.ok(output.includes('USD'));
  assert.ok(output.includes('ориентировочная смета'));
});
test('HTTP failures and malformed JSON produce recoverable errors', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ error: 'Not available' }), { status: 404 });
    await assert.rejects(
      requestJson('https://example.test'),
      (error) => error instanceof ApiError && error.status === 404,
    );
    globalThis.fetch = async () => new Response('not json');
    await assert.rejects(
      requestJson('https://example.test'),
      /Invalid API response/,
    );
  } finally {
    globalThis.fetch = original;
  }
});
test('a stalled request times out and a navigation abort cancels it', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async (_url, init) =>
      new Promise((_resolve, reject) => {
        const abort = () => reject(new DOMException('Aborted', 'AbortError'));
        if (init?.signal?.aborted) abort();
        else init?.signal?.addEventListener('abort', abort, { once: true });
      });
    await assert.rejects(requestJson('https://example.test', {}, 5), {
      name: 'AbortError',
    });
    const controller = new AbortController();
    const request = requestJson(
      'https://example.test',
      { signal: controller.signal },
      10000,
    );
    controller.abort();
    await assert.rejects(request, { name: 'AbortError' });
  } finally {
    globalThis.fetch = original;
  }
});
test('the guide rejects malformed response bodies before rendering', async () => {
  const original = globalThis.fetch;
  const payload = {
    landmarkSlug: 'kalta-minor',
    question: 'Test',
    language: 'en' as const,
    sessionId: 'qa-session',
  };
  try {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ answer: { text: 'bad' } }));
    await assert.rejects(askGuide(payload), /Invalid guide response/);
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          answer: 'Test answer',
          landmarkSlug: 'kalta-minor',
          landmarkName: 'Kalta Minor',
          language: 'en',
          interactionId: 0,
          identifiedByVision: false,
        }),
      );
    assert.equal((await askGuide(payload)).answer, 'Test answer');
  } finally {
    globalThis.fetch = original;
  }
});
