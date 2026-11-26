import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { requestTrip, parseTripResponse } from '../src/lib/trip-api';
import { askGuide, generateRoadmap } from '../src/lib/api';
import { readTrip, TRIP_KEY, type TripInput } from '../src/lib/journey';
import { CITIES, PLACES } from '../src/lib/places';

async function main() {
  const api = process.argv[2] ?? 'http://127.0.0.1:4000';
  const web = process.argv[3] ?? 'http://127.0.0.1:3000';
  process.env.NEXT_PUBLIC_API_URL = api;
  const health = await (await fetch(`${api}/api/health`)).json();
  assert.equal(health.service, 'smartguide-api'); assert.equal(health.aiConfigured,true);
  const input: TripInput = {cities:['khiva','bukhara'],days:4,budget:200,interests:['local','history'],accommodation:true,customCity:''};
  const trip = await requestTrip(input);
  assert.equal(trip.generation?.source,'groq');
  Object.defineProperty(globalThis,'localStorage',{value:{getItem:(key:string) => key === TRIP_KEY ? JSON.stringify(trip) : null},configurable:true});
  assert.deepEqual(readTrip(CITIES,PLACES),trip);
  const proxyResponse = await fetch(`${web}/api/trips/generate`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input),signal:AbortSignal.timeout(35000)});
  assert.equal(proxyResponse.status,200);
  const proxied = parseTripResponse(await proxyResponse.json(),input); assert.equal(proxied.generation?.source,'groq');
  const guide = await askGuide({landmarkSlug:'kalta-minor',question:'Почему минарет остался недостроенным?',language:'ru',sessionId:'live-frontend-check',includeAudio:true});
  assert.equal(guide.sourceMode,'groq-rag'); assert.ok(guide.audioBase64);
  assert.equal(Buffer.from(guide.audioBase64!,'base64').toString('ascii',0,4),'RIFF');
  const photo = readFileSync(resolve('apps/tourist/public/landmarks/kalta-minor.webp')).toString('base64');
  const vision = await askGuide({question:'',language:'ru',sessionId:'live-frontend-check',imageBase64:photo,imageMimeType:'image/webp',includeAudio:false});
  assert.equal(vision.identifiedByVision,true); assert.equal(vision.landmarkSlug,'kalta-minor'); assert.equal(vision.sourceMode,'groq-rag');
  const walk = await generateRoadmap({sessionId:'live-frontend-check',language:'ru',durationMinutes:60,vibes:['architecture','legends']});
  assert.equal(walk.stops.length,2); assert.equal(walk.totalMinutes,60);
  const page = await fetch(`${web}/?lang=ru`); assert.equal(page.status,200);
  const report = {checkedAt:new Date().toISOString(),apiService:health.service,landmarkStore:health.landmarkStore,database:health.database,
    trip:{source:trip.generation?.source,model:trip.generation?.modelUsed,days:trip.days.length,totalCents:trip.total,restoredExactly:true},
    sameOriginProxy:{http:proxyResponse.status,source:proxied.generation?.source},
    guide:{source:guide.sourceMode,model:guide.modelUsed,audioBytes:Buffer.from(guide.audioBase64!,'base64').length,interactionId:guide.interactionId},
    photo:{identified:vision.identifiedByVision,slug:vision.landmarkSlug,source:vision.sourceMode},
    walk:{stops:walk.stops.length,totalMinutes:walk.totalMinutes},frontendHttp:page.status,
    limitation:'HTTP and frontend adapter checks; automated browser button testing was unavailable. JSON dossier mode does not persist analytics.'};
  if (process.argv.includes('--report')) writeFileSync(resolve('documentation/LIVE_API_CHECK_2026-11-26.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
}
main().catch(() => { console.error('Live frontend/API check failed. Inspect the service configuration and rerun.'); process.exitCode=1; });
