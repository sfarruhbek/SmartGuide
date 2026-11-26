import { createServer } from 'node:http';
import { once } from 'node:events';
import { readFileSync } from 'node:fs';
import { createApp } from '../src/app.js';
import { pool } from '../src/db/index.js';
import { loadLandmarksFromJson } from '../src/db/seed.js';
import { generateVerifiedGuideAnswer, identifyLandmarkFromImage } from '../src/services/ai.service.js';

// Uses an ephemeral localhost port; does not replace any developer's running API.
const server = createServer(createApp()); server.listen(0, '127.0.0.1'); await once(server, 'listening');
const address = server.address(); if (!address || typeof address === 'string') throw new Error('No test port');
const base = `http://127.0.0.1:${address.port}`;
try {
  const post = (path: string, body: unknown) => fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(35_000) });
  const tripResponse = await post('/api/trips/generate', { cities: ['khiva', 'bukhara'], days: 4, budget: 200, interests: ['local', 'history'], accommodation: true, customCity: '' });
  const trip = await tripResponse.json();
  const speechResponse = await post('/api/audio/speech', { text: 'Здравствуйте, добро пожаловать в Узбекистан.', language: 'ru' });
  const speech = await speechResponse.json();
  const landmarks = loadLandmarksFromJson().map((p) => ({ id: 0, ...p }));
  const answer = await generateVerifiedGuideAnswer({ landmark: landmarks[0], question: 'Почему минарет остался недостроенным? Ответь кратко.', language: 'ru' });
  const image = readFileSync(new URL('../../tourist/public/landmarks/kalta-minor.webp', import.meta.url)).toString('base64');
  const vision = await identifyLandmarkFromImage(image, 'image/webp', landmarks);
  const report = {
    checkedAt: new Date().toISOString(),
    trip: { http: tripResponse.status, source: trip.source, model: trip.modelUsed, days: trip.trip?.days.length, currency: trip.trip?.currency, totalCents: trip.trip?.total, shortfallCents: trip.trip?.shortfall },
    speech: { http: speechResponse.status, model: speech.modelUsed, mime: speech.audioMimeType, bytes: speech.audioBase64 ? Buffer.from(speech.audioBase64, 'base64').length : 0, riff: speech.audioBase64 ? Buffer.from(speech.audioBase64, 'base64').toString('ascii', 0, 4) : null },
    guide: { source: answer.sourceMode, model: answer.modelUsed, answerLength: answer.answer.length }, vision,
  };
  console.log(JSON.stringify(report, null, 2));
  if (trip.source !== 'groq' || !speech.audioBase64 || answer.sourceMode !== 'groq-rag' || !vision.identifiedByVision) process.exitCode = 1;
} finally {
  server.closeAllConnections(); await new Promise<void>((resolve) => server.close(() => resolve())); await pool.end();
}
