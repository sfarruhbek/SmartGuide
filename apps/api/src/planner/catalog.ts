import fs from 'node:fs';
import { z } from 'zod';
import type { City, Place } from './trip.js';

const localized = z.object({ en: z.string(), ru: z.string(), uz: z.string() }).catchall(z.string());
const interests = z.enum(['history', 'local', 'food', 'nature', 'sacred']);
const coordinates = { lat: z.number().min(37).max(46), lng: z.number().min(55).max(74) };
const schema = z.object({
  cities: z.array(z.object({ id: z.string(), name: localized, ...coordinates }).passthrough()).min(1),
  places: z.array(z.object({
    id: z.string(), city: z.string(), name: localized, story: localized, ...coordinates,
    interests: z.array(interests), category: z.enum(['landmark', 'discovery']),
    admission: z.number().int().nonnegative(), minutes: z.number().int().min(15).max(180), source: z.string().url(),
  }).passthrough()),
});
const raw = JSON.parse(fs.readFileSync(new URL('../../data/planner-catalog.json', import.meta.url), 'utf8'));
const validated = schema.parse(raw);
if (new Set(validated.cities.map((city) => city.id)).size !== validated.cities.length ||
    new Set(validated.places.map((place) => place.id)).size !== validated.places.length ||
    validated.places.some((place) => !validated.cities.some((city) => city.id === place.city))) {
  throw new Error('Invalid planner catalog identifiers');
}
export const catalog = validated as { cities: City[]; places: Place[] };

export const tripInputSchema = z.object({
  cities: z.array(z.string().refine((id) => catalog.cities.some((city) => city.id === id), 'Unknown city')).max(16),
  days: z.number().int().min(1).max(14),
  budget: z.number().positive().max(1_000_000).refine((n) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-6, 'Use dollars with at most two decimal places'),
  interests: z.array(interests).max(5),
  accommodation: z.boolean(),
  customCity: z.string().trim().max(100).default(''),
}).strict().superRefine((input, ctx) => {
  const count = new Set(input.cities).size + (input.customCity ? 1 : 0);
  if (count < 1 || count > input.days) ctx.addIssue({ code: 'custom', path: ['cities'], message: 'Choose one destination per day at most' });
});
