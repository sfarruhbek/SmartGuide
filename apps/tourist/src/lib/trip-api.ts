import { requestJson } from './http';
import { getApiBaseUrl } from './api';
import { CITIES, PLACES } from './places';
import { validateTrip, type Trip, type TripInput } from './journey';

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
