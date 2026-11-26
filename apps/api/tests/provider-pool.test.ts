import test from 'node:test';
import assert from 'node:assert/strict';
import { ProviderPool, ProviderUnavailable, InvalidProviderOutput, retryAfterMs } from '../src/ai/provider-pool.js';
import { normalizeAudio } from '../src/ai/providers.js';

function fixture(responses: (Response | Error)[], options: { keys?: string[]; now?: () => number; timeoutMs?: number } = {}) {
  const calls: string[] = [];
  const pool = new ProviderPool({ keys: options.keys ?? ['key-a', 'key-b'], models: ['primary', 'secondary'], ...options,
    fetcher: (async (url: string) => { calls.push(url); const response = responses.shift(); if (response instanceof Error) throw response; assert.ok(response); return response; }) as typeof fetch,
  });
  const run = (parse: (raw: unknown) => unknown = (raw) => raw) => pool.run((model, key) => ({ url: `${model}/${key}`, init: {} }), parse);
  return { calls, run };
}
const ok = () => Response.json({ ok: true });

test('429 switches model without cycling keys, and observes cooldown across requests', async () => {
  let clock = 1000;
  const f = fixture([Response.json({ error: {} }, { status: 429, headers: { 'retry-after': '120' } }), ok(), ok(), ok()], { now: () => clock });
  assert.equal((await f.run()).modelUsed, 'secondary');
  await f.run();
  assert.deepEqual(f.calls.map((c) => c.split('/')[0]), ['primary', 'secondary', 'secondary']);
  clock += 120_001;
  assert.equal((await f.run()).modelUsed, 'primary');
});
test('Groq reset headers are respected when Retry-After is absent', async () => {
  let clock = 1000;
  const f = fixture([Response.json({}, { status: 429, headers: { 'x-ratelimit-remaining-tokens': '0', 'x-ratelimit-reset-tokens': '2m3s' } }), ok(), ok(), ok()], { now: () => clock });
  await f.run(); clock += 120_000; await f.run();
  assert.ok(f.calls[2].startsWith('secondary/'));
  clock += 3001; await f.run(); assert.ok(f.calls[3].startsWith('primary/'));
});
test('401 excludes a bad credential and retries the same model with another', async () => {
  const f = fixture([Response.json({}, { status: 401 }), ok(), ok()]);
  await f.run(); await f.run();
  assert.deepEqual(f.calls, ['primary/key-a', 'primary/key-b', 'primary/key-b']);
});
test('organization billing quota does not cause model/key retry storm', async () => {
  const f = fixture([Response.json({ error: { code: 'insufficient_quota' } }, { status: 429 })]);
  await assert.rejects(f.run(), ProviderUnavailable);
  await assert.rejects(f.run(), ProviderUnavailable);
  assert.equal(f.calls.length, 1);
});
test('per-model free-tier 429 mentioning billing details still falls back to secondary model', async () => {
  const f = fixture([
    Response.json(
      { error: { code: 429, message: 'You exceeded your current quota, please check your plan and billing details. limit: 10, model: primary' } },
      { status: 429 },
    ),
    ok(),
  ], { keys: ['key-a'] });
  assert.equal((await f.run()).modelUsed, 'secondary');
  assert.deepEqual(f.calls, ['primary/key-a', 'secondary/key-a']);
});
test('503, invalid JSON and invalid output move to a different model', async () => {
  for (const response of [Response.json({}, { status: 503 }), new Response('{'), ok()]) {
    const f = fixture([response, ok()]);
    let count = 0;
    await f.run((raw) => { if (response.ok && ++count === 1 && response.headers.get('content-type')?.includes('json')) throw new InvalidProviderOutput(); return raw; });
    assert.ok(f.calls[1].startsWith('secondary/'));
  }
});
test('ordinary 400 does not cycle every credential', async () => {
  const f = fixture([Response.json({}, { status: 400 }), ok()]); await f.run();
  assert.equal(f.calls.length, 2); assert.ok(f.calls[1].startsWith('secondary/'));
});
test('network timeout falls back and total time budget terminates attempts', async () => {
  const f = fixture([new Error('network'), ok()]); await f.run(); assert.equal(f.calls.length, 2);
  let clock = 0;
  const bounded = fixture([new Error('timeout')], { now: () => { clock += 1000; return clock; }, timeoutMs: 1000 });
  await assert.rejects(bounded.run(), ProviderUnavailable);
  assert.equal(bounded.calls.length, 0);
});
test('missing keys make no upstream call', async () => {
  const f = fixture([], { keys: [] }); await assert.rejects(f.run(), ProviderUnavailable); assert.equal(f.calls.length, 0);
});
test('Retry-After supports seconds and HTTP dates', () => {
  assert.equal(retryAfterMs('3'), 3000);
  assert.equal(retryAfterMs('Thu, 26 Nov 2026 00:01:00 GMT', Date.parse('2026-11-26T00:00:00Z')), 60_000);
  assert.equal(retryAfterMs('invalid'), 60_000);
});
test('PCM becomes a valid WAV, existing WAV is preserved, unsupported audio rejected', () => {
  const pcm = Buffer.alloc(100, 1);
  const result = normalizeAudio(pcm.toString('base64'), 'audio/L16;codec=pcm;rate=24000');
  const wav = Buffer.from(result.audioBase64, 'base64');
  assert.equal(wav.toString('ascii', 0, 4), 'RIFF');
  assert.equal(wav.readUInt32LE(24), 24000);
  assert.equal(wav.readUInt32LE(40), 100);
  assert.deepEqual(wav.subarray(44), pcm);
  assert.deepEqual(normalizeAudio(result.audioBase64, 'audio/wav'), result);
  assert.throws(() => normalizeAudio(pcm.toString('base64'), 'audio/mp3'));
  assert.throws(() => normalizeAudio(pcm.toString('base64'), 'audio/wav'));
});
