import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import { WebSocket } from 'ws';
import { generateSpeech } from '../src/ai/providers.js';

const base = (process.argv.slice(2).find(arg => !arg.startsWith('--')) ?? 'http://127.0.0.1:4001').replace(/\/$/, '');
const useAudio = process.argv.includes('--audio');
const origin = 'http://localhost:3000';
const cookies = new Map<string, string>();
const preferences = { cities: ['bukhara'], days: 2, budget: 100, interests: ['history', 'local'], accommodation: true, customCity: '' };

type Result = {
  source: string; modelUsed: string; revision: number; excludedIds: string[];
  trip: { summary: string; input: typeof preferences; days: { slots: { placeId?: string }[] }[]; places: { id: string; name: { ru?: string; en: string } }[]; total: number };
};

async function request(path: string, body?: unknown) {
  const headers = new Headers({ Origin: origin });
  if (body !== undefined) headers.set('Content-Type', 'application/json');
  if (cookies.size) headers.set('Cookie', [...cookies].map(([key, value]) => key + '=' + value).join('; '));
  const response = await fetch(base + path, {
    method: body === undefined ? 'GET' : 'POST', headers, body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(12000),
  });
  for (const cookie of response.headers.getSetCookie()) {
    const pair = cookie.split(';')[0];
    const index = pair.indexOf('=');
    if (index > 0) cookies.set(pair.slice(0, index), pair.slice(index + 1));
  }
  assert.equal(response.status, 200, 'API request failed');
  return response.json();
}

async function speechPcm(command: string) {
  const wav = Buffer.from((await generateSpeech(command, 'ru')).value.audioBase64, 'base64');
  const rate = wav.readUInt32LE(24);
  for (let offset = 12; offset + 8 <= wav.length;) {
    const size = wav.readUInt32LE(offset + 4);
    if (wav.toString('ascii', offset, offset + 4) === 'data') {
      assert.ok(offset + 8 + size <= wav.length);
      const samples = Math.floor(size / 2 * 16000 / rate);
      const pcm = Buffer.alloc(samples * 2);
      for (let i = 0; i < samples; i++) {
        pcm.writeInt16LE(wav.readInt16LE(offset + 8 + Math.floor(i * rate / 16000) * 2), i * 2);
      }
      return pcm;
    }
    offset += 8 + size + size % 2;
  }
  throw new Error('WAV data cannot be read');
}

async function runTurn(purpose: 'plan' | 'revise', command: string) {
  const pcm = useAudio ? await speechPcm(command) : null;
  const grant = await request('/api/explore/live/session', { cityId: 'bukhara', language: 'ru', locationSource: 'map', purpose, tripPreferences: preferences });
  assert.match(grant.token, /^[a-f0-9]{64}$/);
  const url = new URL(base);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = '/api/explore/live';
  const socket = new WebSocket(url, ['smartguide-live', grant.token], { origin, handshakeTimeout: 15000 });
  let model = '', audioBytes = 0, userTranscriptChars = 0, sent = false;
  let result: Result | undefined;
  const sendCommand = async () => {
    if (!pcm) {
      socket.send(JSON.stringify({ type: 'text', text: command }));
      return;
    }
    // Continue with silence so the voice activity detector sees the end of the utterance.
    const framed = Buffer.concat([pcm, Buffer.alloc(3200 * 16)]);
    for (let offset = 0; offset < framed.length; offset += 3200) {
      if (socket.readyState !== WebSocket.OPEN) return;
      socket.send(JSON.stringify({ type: 'audio', data: framed.subarray(offset, offset + 3200).toString('base64') }));
      await delay(100);
    }
  };
  try {
    await new Promise<void>((resolve, reject) => {
      const finish = (error?: Error) => { clearTimeout(timeout); if (error) reject(error); else resolve(); };
      const timeout = setTimeout(() => finish(new Error('Live turn timed out')), 65000);
      socket.on('error', () => finish(new Error('WebSocket unavailable')));
      socket.on('close', () => finish(new Error('Live ended before the itinerary update')));
      socket.on('message', raw => {
        try {
          const data = JSON.parse(raw.toString());
          if (data.type === 'error' || data.type === 'registrationRequired') throw new Error('Live operation unavailable');
          if (data.type === 'ready') model = data.model;
          if (data.type === 'audio') audioBytes += Buffer.from(data.data, 'base64').length;
          if (data.type === 'transcript' && data.role === 'user') userTranscriptChars += String(data.text).length;
          if (data.type === 'tripUpdated') result = data.result;
          if (data.type === 'turnComplete' && !sent) {
            sent = true;
            void sendCommand().catch(() => finish(new Error('Command delivery failed')));
          } else if (data.type === 'turnComplete' && result) {
            finish();
          }
        } catch (error) {
          finish(error instanceof Error ? error : new Error('Live reply failed'));
        }
      });
    });
    assert.ok(result && model && audioBytes > 1000);
    assert.equal(result.source, 'groq');
    assert.deepEqual(result.trip.input.cities, ['bukhara']);
    assert.equal(result.trip.input.days, 2);
    if (pcm) assert.ok(userTranscriptChars > 20, 'Live did not transcribe the speech');
    return { result, model, audioBytes, userTranscriptChars, inputAudioBytes: pcm?.length ?? 0 };
  } catch (error) {
    console.error(JSON.stringify({ purpose, model, audioBytes, userTranscriptChars, revision: result?.revision }));
    throw error;
  } finally {
    socket.close();
    const timeout = setTimeout(() => socket.terminate(), 1000);
    timeout.unref();
  }
}

try {
  const initial = await request('/api/trips/current');
  assert.equal(initial.workspace, null);
  assert.equal(initial.access.registered, false);
  const created = await runTurn('plan', 'Создай и сохрани маршрут по Бухаре на два дня. Бюджет сто долларов, с проживанием. Интересы: история и местная культура.');
  const removedId = created.result.trip.days.flatMap(day => day.slots).find(slot => slot.placeId)?.placeId;
  const place = created.result.trip.places.find(item => item.id === removedId);
  assert.ok(place && removedId);
  const revised = await runTurn('revise', `Убери из моего маршрута «${place.name.ru ?? place.name.en}». Исключи это место, сохрани остальные пожелания и обнови план.`);
  assert.equal(revised.result.revision, created.result.revision + 1);
  assert.ok(revised.result.excludedIds.includes(removedId));
  const saved = await request('/api/trips/current');
  assert.equal(saved.revision, revised.result.revision);
  assert.ok(!saved.workspace.trip.days.some((day: Result['trip']['days'][number]) => day.slots.some(slot => slot.placeId === removedId)));
  assert.equal(saved.access.remaining.plans, 0);
  const report = {
    checkedAt: new Date().toISOString(), input: useAudio ? 'synthetic PCM speech' : 'text',
    models: [created.model, revised.model], groqModels: [created.result.modelUsed, revised.result.modelUsed],
    revisions: [created.result.revision, revised.result.revision], removedPlaceId: removedId,
    audioBytes: [created.audioBytes, revised.audioBytes], inputAudioBytes: [created.inputAudioBytes, revised.inputAudioBytes],
    userTranscriptChars: [created.userTranscriptChars, revised.userTranscriptChars],
    guestPlansRemaining: saved.access.remaining.plans, guestVoiceSecondsRemaining: saved.access.remaining.voiceSeconds,
    scope: 'Two real Gemini Live sessions create and revise one Groq itinerary. The check uses generated speech or text over WebSocket.',
  };
  if (process.argv.includes('--report')) writeFileSync(new URL('../../../documentation/LIVE_PLANNING_CHECK_2026-11-26.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Live planning check failed');
  process.exitCode = 1;
}
