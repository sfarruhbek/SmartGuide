import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';

test('HTTP routes validate requests, expose real provider metadata and degrade honestly', async () => {
  process.env.GROQ_API_KEYS = 'test-key'; process.env.GEMINI_API_KEY = 'test-key';
  const { createApp } = await import('../src/app.js');
  const { pool } = await import('../src/db/index.js');
  const server = createServer(createApp()); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const address = server.address(); assert.ok(address && typeof address === 'object');
  const base = `http://127.0.0.1:${address.port}`;
  const realFetch = globalThis.fetch;
  let failing = false; let providerCalls = 0;
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    if (String(url).startsWith(base)) return realFetch(url, init);
    providerCalls++;
    if (failing) return Response.json({}, { status: 503 });
    if (String(url).startsWith('https://api.groq.com/')) return Response.json({ choices: [{ finish_reason: 'stop', message: { content: '{"placeIds":["kalta-minor"]}' } }] });
    if (String(url).startsWith('https://generativelanguage.googleapis.com/')) return Response.json({ candidates: [{ content: { parts: [{ inlineData: { mimeType: 'audio/L16;rate=24000', data: Buffer.alloc(100).toString('base64') } }] } }] });
    throw new Error('Unexpected external URL');
  }) as typeof fetch;
  const post = (path: string, body: unknown) => fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const input = { cities: ['khiva'], days: 2, budget: 100, interests: ['history'], accommodation: true, customCity: '' };
  try {
    const invalid = await post('/api/trips/generate', { ...input, budget: -1 }); assert.equal(invalid.status, 400); assert.equal(providerCalls, 0);
    const response = await post('/api/trips/generate', input); assert.equal(response.status, 200);
    const body = await response.json(); assert.equal(body.source, 'groq'); assert.equal(body.trip.currency, 'USD'); assert.equal(body.trip.days.length, 2);
    assert.ok(!JSON.stringify(body).includes('test-key'));
    const audio = await post('/api/audio/speech', { text: 'Привет', language: 'ru' }); assert.equal(audio.status, 200);
    const speech = await audio.json(); assert.equal(speech.audioMimeType, 'audio/wav'); assert.equal(Buffer.from(speech.audioBase64, 'base64').toString('ascii', 0, 4), 'RIFF');
    assert.equal((await post('/api/audio/speech', { text: '', language: 'ru' })).status, 400);
    failing = true;
    const fallback = await (await post('/api/trips/generate', input)).json(); assert.equal(fallback.source, 'local-fallback'); assert.equal(fallback.fallbackReason, 'exhausted'); assert.equal(fallback.trip.days.length, 2);
    const unavailable = await post('/api/audio/speech', { text: 'Привет', language: 'ru' }); assert.equal(unavailable.status, 503); assert.equal((await unavailable.json()).code, 'AUDIO_UNAVAILABLE');
  } finally {
    globalThis.fetch = realFetch;
    server.closeAllConnections(); await new Promise<void>((resolve) => server.close(() => resolve())); await pool.end();
  }
});
