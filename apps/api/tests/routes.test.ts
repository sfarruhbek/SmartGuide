import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

test('HTTP routes validate requests, expose real provider metadata and degrade honestly', async () => {
  const temp=await mkdtemp(path.join(os.tmpdir(),'smartguide-routes-'));
  process.env.ACCESS_STORE_FILE=path.join(temp,'access.json');process.env.AUTH_STORE_FILE=path.join(temp,'accounts.json');
  process.env.GROQ_API_KEYS = 'test-key'; process.env.GEMINI_API_KEY = 'test-key';
  process.env.LANDMARK_STORE = 'json';
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
    if (String(url).startsWith('https://api.groq.com/')) {
      const request = JSON.parse(String(init?.body));
      const system = String(request.messages[0].content);
      const content = system.startsWith('Create a short')
        ? JSON.stringify({headline:'A walk',stops:[{slug:'kalta-minor',whyVisit:'Architecture',emotionalPayoff:'Colour'},{slug:'juma-mosque',whyVisit:'Columns',emotionalPayoff:'Calm'}]})
        : system.startsWith('You are SmartGuide') ? 'An answer grounded in the dossier.'
        : system.startsWith('Match the photo') ? '{"slug":"unknown"}' : '{"placeIds":["kalta-minor"]}';
      return Response.json({ choices: [{ finish_reason: 'stop', message: { content } }] });
    }
    if (String(url).startsWith('https://generativelanguage.googleapis.com/')) return Response.json({ candidates: [{ content: { parts: [{ inlineData: { mimeType: 'audio/L16;rate=24000', data: Buffer.alloc(100).toString('base64') } }] } }] });
    throw new Error('Unexpected external URL');
  }) as typeof fetch;
  const post = (path: string, body: unknown) => fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const input = { cities: ['khiva'], days: 2, budget: 100, interests: ['history'], accommodation: true, customCity: '' };
  try {
    const health = await realFetch(base+'/api/health'); assert.equal(health.status,200);
    const healthBody = await health.json(); assert.equal(healthBody.database,'not-used'); assert.equal(healthBody.analyticsAvailable,false);
    const analytics = await realFetch(base+'/api/analytics/summary'); assert.equal(analytics.status,503);
    assert.equal((await analytics.json()).code,'ANALYTICS_UNAVAILABLE');
    const invalid = await post('/api/trips/generate', { ...input, budget: -1 }); assert.equal(invalid.status, 400); assert.equal(providerCalls, 0);
    const response = await post('/api/trips/generate', input); assert.equal(response.status, 200);
    const body = await response.json(); assert.equal(body.source, 'groq'); assert.equal(body.trip.currency, 'USD'); assert.equal(body.trip.days.length, 2);
    assert.ok(!JSON.stringify(body).includes('test-key'));
    const audio = await post('/api/audio/speech', { text: 'Привет', language: 'ru' }); assert.equal(audio.status, 200);
    const speech = await audio.json(); assert.equal(speech.audioMimeType, 'audio/wav'); assert.equal(Buffer.from(speech.audioBase64, 'base64').toString('ascii', 0, 4), 'RIFF');
    assert.equal((await post('/api/audio/speech', { text: '', language: 'ru' })).status, 400);
    const guideResponse = await post('/api/guide/ask',{landmarkSlug:'kalta-minor',question:'Why?',language:'en',sessionId:'test',includeAudio:false});
    assert.equal(guideResponse.status,200);
    const guide = await guideResponse.json(); assert.equal(guide.sourceMode,'groq-rag'); assert.equal(guide.interactionId,0);
    const unknownPhoto = await post('/api/guide/ask',{imageBase64:Buffer.alloc(10).toString('base64'),imageMimeType:'image/jpeg',language:'en',sessionId:'test',includeAudio:false});
    assert.equal(unknownPhoto.status,422);
    const walkResponse = await post('/api/roadmap/generate',{sessionId:'test',language:'en',durationMinutes:60,vibes:['architecture']});
    assert.equal(walkResponse.status,200);
    const walk = await walkResponse.json(); assert.equal(walk.source,'groq'); assert.equal(walk.roadmapId,null);
    assert.equal(walk.stops.length,2); assert.equal(walk.stops.reduce((sum: number,stop: {estimatedMinutes:number}) => sum + stop.estimatedMinutes,0),60);
    assert.equal((await post('/api/roadmap/generate',{sessionId:'test',language:'en',durationMinutes:99,vibes:['bad']})).status,400);
    failing = true;
    const fallback = await (await post('/api/trips/generate', input)).json(); assert.equal(fallback.source, 'local-fallback'); assert.equal(fallback.fallbackReason, 'exhausted'); assert.equal(fallback.trip.days.length, 2);
    const unavailable = await post('/api/audio/speech', { text: 'Привет', language: 'ru' }); assert.equal(unavailable.status, 503); assert.equal((await unavailable.json()).code, 'AUDIO_UNAVAILABLE');
  } finally {
    globalThis.fetch = realFetch;
    server.closeAllConnections(); await new Promise<void>((resolve) => server.close(() => resolve())); await pool.end();
    assert.ok(path.resolve(temp).startsWith(path.resolve(os.tmpdir())+path.sep+'smartguide-routes-'));await rm(temp,{recursive:true,force:true});
  }
});
