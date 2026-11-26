import test from 'node:test';
import assert from 'node:assert/strict';

test('photo recognition accepts only catalog IDs, never guesses the first landmark, and uses Groq', async () => {
  process.env.GROQ_API_KEYS = 'test-key'; process.env.GEMINI_API_KEY = 'test-key';
  const { identifyLandmarkFromImage, generateVerifiedGuideAnswer } = await import('../src/services/ai.service.js');
  const { loadLandmarksFromJson } = await import('../src/db/seed.js');
  const { pool } = await import('../src/db/index.js');
  const landmarks = loadLandmarksFromJson().map((p) => ({ id: 0, ...p }));
  const original = globalThis.fetch;
  const calls: string[] = [];
  let content = '{"slug":"unknown"}';
  globalThis.fetch = (async (url: string) => {
    calls.push(url);
    assert.ok(url.startsWith('https://api.groq.com/'));
    return Response.json({ choices: [{ finish_reason: 'stop', message: { content } }] });
  }) as typeof fetch;
  try {
    const image = Buffer.alloc(10).toString('base64');
    assert.deepEqual(await identifyLandmarkFromImage(image, 'image/jpeg', landmarks), { slug: '', identifiedByVision: false });
    assert.deepEqual(await identifyLandmarkFromImage(image, 'image/jpeg', landmarks, 'kunya-ark'), { slug: 'kunya-ark', identifiedByVision: false });
    content = '{"slug":"kalta-minor"}';
    assert.deepEqual(await identifyLandmarkFromImage(image, 'image/jpeg', landmarks), { slug: 'kalta-minor', identifiedByVision: true });
    const before = calls.length;
    assert.equal((await identifyLandmarkFromImage(image, 'image/svg+xml', landmarks)).identifiedByVision, false);
    assert.equal(calls.length, before);
    content = '{"slug":"made-up"}';
    assert.equal((await identifyLandmarkFromImage(image, 'image/jpeg', landmarks)).slug, '');
    content = 'Это краткий ответ по досье.';
    const answer = await generateVerifiedGuideAnswer({ landmark: landmarks[0], question: 'Когда построен?', language: 'ru' });
    assert.equal(answer.sourceMode, 'groq-rag');
    assert.equal(answer.answer, content);
  } finally { globalThis.fetch = original; await pool.end(); }
});
