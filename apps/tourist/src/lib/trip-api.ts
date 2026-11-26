import { requestJson } from './http';
import { getApiBaseUrl } from './api';
import { CITIES, PLACES } from './places';
import { validateTrip, type Trip, type TripInput } from './journey';
import type { SupportedLanguage } from '@smartguide/shared';
import { parseAccessState, type AccessState } from './access-api';

export function parseTripResponse(raw: unknown, requested: TripInput): Trip {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid plan response');
  const data = raw as { trip: unknown; source: unknown; modelUsed: unknown; fallbackReason: unknown };
  if ((data.source !== 'groq' && data.source !== 'local-fallback') || typeof data.modelUsed !== 'string' ||
      data.modelUsed.length > 150 || !(data.fallbackReason === null || typeof data.fallbackReason === 'string')) throw new Error('Invalid plan metadata');
  const trip = validateTrip(data.trip, CITIES, PLACES);
  const normalize = (input: TripInput) => JSON.stringify([[...new Set(input.cities)], input.days, input.budget, input.interests, input.accommodation, input.customCity.trim()]);
  if (normalize(trip.input) !== normalize(requested)) throw new Error('Plan preferences do not match');
  return { ...trip, generation: { source: data.source as 'groq' | 'local-fallback', modelUsed: data.modelUsed, fallbackReason: data.fallbackReason } };
}

export async function requestTrip(input: TripInput, signal?: AbortSignal): Promise<Trip> {
  const data = await requestJson<unknown>(`${getApiBaseUrl()}/api/trips/generate`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal,
  }, 35_000);
  return parseTripResponse(data, input);
}

export interface ComposeOptions {
  language:SupportedLanguage;
  instruction?:string;
  action?:'create'|'revise';
  excludePlaceId?:string;
}

/** Compose can change preferences through AI, so validate the returned plan rather than force the original input. */
export function parseComposedTrip(raw:unknown):Trip {
  if (!raw || typeof raw!=='object') throw new Error('Invalid composed plan');
  const data=raw as {trip:unknown;source:unknown;modelUsed:unknown;fallbackReason:unknown;revision?:unknown};
  if (data.source!=='groq' || typeof data.modelUsed!=='string' || !data.modelUsed.trim() || data.modelUsed.length>150 || data.fallbackReason!==null ||
      (data.revision!==undefined&&(!Number.isSafeInteger(data.revision)||Number(data.revision)<0))) throw new Error('Invalid composed metadata');
  const trip=validateTrip(data.trip,CITIES,PLACES);
  if (!trip.places || !trip.summary) throw new Error('Composed plan is missing its source records or summary');
  return {...trip,...(typeof data.revision==='number'?{revision:data.revision}:{}),generation:{source:'groq',modelUsed:data.modelUsed,fallbackReason:null}};
}

export async function composeTrip(input:TripInput,options:ComposeOptions,signal?:AbortSignal):Promise<Trip> {
  return parseComposedTrip(await requestJson('/api/trips/compose',{
    method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},signal,
    body:JSON.stringify({preferences:input,language:options.language,instruction:options.instruction??'',action:options.action??'create',...(options.excludePlaceId?{excludePlaceId:options.excludePlaceId}:{})}),
  },65000));
}

export async function currentTrip(signal?:AbortSignal):Promise<{trip:Trip|null;access:AccessState;revision:number}> {
  const raw=await requestJson<unknown>('/api/trips/current',{credentials:'include',cache:'no-store',signal});
  if (!raw || typeof raw!=='object') throw new Error('Invalid current trip');
  const data=raw as {workspace:unknown;access:unknown;revision:unknown};
  if (!Number.isSafeInteger(data.revision)||Number(data.revision)<0) throw new Error('Invalid current revision');
  const revision=Number(data.revision);
  return {trip:data.workspace===null?null:parseComposedTrip({...data.workspace as object,revision}),access:parseAccessState(data.access),revision};
}
