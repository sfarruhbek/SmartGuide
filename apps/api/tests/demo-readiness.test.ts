import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type IncomingMessage } from 'node:http';
import { once } from 'node:events';
import { ProviderPool, ProviderUnavailable } from '../src/ai/provider-pool.js';
import { parseTrustProxy, resolveClientIp } from '../src/config/proxy.js';

function fakeReq(remoteAddress: string, forwardedFor?: string): IncomingMessage {
  return {
    socket: { remoteAddress },
    headers: forwardedFor ? { 'x-forwarded-for': forwardedFor } : {},
  } as unknown as IncomingMessage;
}

test('B04: parseTrustProxy and resolveClientIp protect against X-Forwarded-For spoofing while fixing Nginx proxy IP', () => {
  assert.equal(parseTrustProxy('false'), false);
  assert.equal(parseTrustProxy('0'), false);
  assert.equal(parseTrustProxy('loopback'), 'loopback');
  assert.equal(parseTrustProxy('1'), 1);

  // Disabled: always use direct socket peer even if client sends X-Forwarded-For
  assert.equal(resolveClientIp(fakeReq('127.0.0.1', '203.0.113.5'), 'false'), '127.0.0.1');

  // Loopback proxy (local Nginx): trust X-Forwarded-For only when peer is loopback
  assert.equal(resolveClientIp(fakeReq('127.0.0.1', '198.51.100.9, 203.0.113.7'), 'loopback'), '203.0.113.7');
  assert.equal(resolveClientIp(fakeReq('::ffff:127.0.0.1', '203.0.113.8'), 'loopback'), '203.0.113.8');
  assert.equal(resolveClientIp(fakeReq('198.51.100.22', '203.0.113.99'), 'loopback'), '198.51.100.22');

  // Numeric hop count: take the hop added by the trusted proxy, not spoofed left-most value
  assert.equal(resolveClientIp(fakeReq('10.0.0.5', '1.2.3.4, 203.0.113.42'), '1'), '203.0.113.42');
});

test('B03: ProviderPool honors caller AbortSignal immediately without cycling models', async () => {
  const calls: string[] = [];
  const controller = new AbortController();
  const pool = new ProviderPool({
    keys: ['key-a'],
    models: ['primary', 'secondary'],
    timeoutMs: 20_000,
    fetcher: (async (url: string, init?: RequestInit) => {
      calls.push(url);
      return await new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
      });
    }) as typeof fetch,
  });

  setTimeout(() => controller.abort(), 30);
  await assert.rejects(
    pool.run((model, key) => ({ url: `${model}/${key}`, init: {} }), (b) => b, undefined, {
      signal: controller.signal,
    }),
    (err: unknown) => err instanceof ProviderUnavailable && err.reason === 'aborted',
  );
  assert.equal(calls.length, 1);
});

test('B02 + B03: DB outage degrades tourist routes safely with id=0, returns 503 on analytics/health, and bounds slow TTS', async () => {
  process.env.LANDMARK_STORE = 'postgres';
  process.env.DATABASE_URL = 'postgresql://smartguide:wrong@127.0.0.1:1/smartguide';
  process.env.DB_CONNECT_TIMEOUT_MS = '500';
  process.env.DB_QUERY_TIMEOUT_MS = '500';
  process.env.GUIDE_REQUEST_TIMEOUT_MS = '5000';
  process.env.GUIDE_MIN_TTS_BUDGET_MS = '2500';
  process.env.GROQ_API_KEYS = 'test-key';
  process.env.GEMINI_API_KEY = 'test-key';
  process.env.TRUST_PROXY = 'loopback';

  const { createApp } = await import('../src/app.js');
  const { pool } = await import('../src/db/index.js');
  const server = createServer(createApp());
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const base = `http://127.0.0.1:${address.port}`;

  const realFetch = globalThis.fetch;
  let slowTts = true;
  let ttsAborted = false;

  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    const href = String(url);
    if (href.startsWith(base)) return realFetch(url, init);
    if (href.startsWith('https://api.groq.com/')) {
      return Response.json({
        choices: [{ finish_reason: 'stop', message: { content: 'Kalta Minor began in 1851.' } }],
      });
    }
    if (href.startsWith('https://generativelanguage.googleapis.com/')) {
      if (slowTts) {
        return await new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => {
              ttsAborted = true;
              reject(new Error('tts-aborted'));
            },
            { once: true },
          );
        });
      }
      return Response.json({
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: 'audio/L16;rate=24000',
                    data: Buffer.alloc(64).toString('base64'),
                  },
                },
              ],
            },
          },
        ],
      });
    }
    throw new Error(`Unexpected URL: ${href}`);
  }) as typeof fetch;

  try {
    // 1. Health & analytics fail fast with 503 when PostgreSQL is unreachable
    const healthStarted = Date.now();
    const healthRes = await realFetch(`${base}/api/health`);
    const healthElapsed = Date.now() - healthStarted;
    assert.equal(healthRes.status, 503);
    assert.ok(healthElapsed < 3000, `health check took too long: ${healthElapsed}ms`);
    const healthBody = await healthRes.json();
    assert.equal(healthBody.database, 'disconnected');
    assert.equal(healthBody.status, 'degraded');
    assert.equal(healthBody.trustProxy, 'loopback');

    const analyticsRes = await realFetch(`${base}/api/analytics/summary`);
    assert.equal(analyticsRes.status, 503);
    assert.equal((await analyticsRes.json()).code, 'DATABASE_UNAVAILABLE');

    // 2. Tourist landmarks degrade cleanly to local JSON with id=0 (never fabricated DB IDs)
    const landmarksRes = await realFetch(`${base}/api/landmarks`);
    assert.equal(landmarksRes.status, 200);
    const landmarksBody = await landmarksRes.json();
    assert.equal(landmarksBody.landmarkStore, 'fallback-json');
    assert.ok(landmarksBody.landmarks.length >= 5);
    assert.ok(landmarksBody.landmarks.every((item: { id: number }) => item.id === 0));

    // 3. Slow TTS is aborted by unified deadline, while text answer still succeeds with explicit metadata
    const askStarted = Date.now();
    const askRes = await realFetch(`${base}/api/guide/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        landmarkSlug: 'kalta-minor',
        question: 'When did construction start?',
        language: 'en',
        sessionId: 'qa-session',
        includeAudio: true,
      }),
    });
    const askElapsed = Date.now() - askStarted;
    assert.equal(askRes.status, 200);
    assert.ok(askElapsed < 6500, `guide ask exceeded unified deadline: ${askElapsed}ms`);
    assert.equal(ttsAborted, true, 'expected slow TTS upstream request to be aborted at deadline');
    const askBody = await askRes.json();
    assert.equal(askBody.answer, 'Kalta Minor began in 1851.');
    assert.equal(askBody.sourceMode, 'groq-rag');
    assert.equal(askBody.audioBase64, undefined);
    assert.equal(askBody.audioStatus, 'skipped-deadline');
    assert.equal(askBody.interactionId, 0);
    assert.equal(askBody.analyticsRecorded, false);
    assert.equal(askBody.analyticsStatus, 'db-unavailable');
    assert.equal(askBody.landmarkStore, 'fallback-json');

    // 4. Separate /api/audio/speech retry succeeds when Gemini recovers
    slowTts = false;
    const speechRes = await realFetch(`${base}/api/audio/speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: askBody.answer, language: 'en' }),
    });
    assert.equal(speechRes.status, 200);
    const speechBody = await speechRes.json();
    assert.equal(speechBody.audioMimeType, 'audio/wav');
  } finally {
    globalThis.fetch = realFetch;
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await pool.end();
  }
});

test('B01: seedDemoAnalytics refuses to run in production without explicit override', async () => {
  const prev = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    const { seedDemoAnalytics } = await import('../src/db/seed.js');
    await assert.rejects(
      seedDemoAnalytics(),
      /Refusing to seed synthetic demo interactions in NODE_ENV=production/,
    );
  } finally {
    if (prev === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = prev;
  }
});
