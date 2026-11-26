import { Router } from 'express';
import { z } from 'zod';
import { LANGUAGE_CODES, type SupportedLanguage } from '@smartguide/shared';
import { env } from '../config/env.js';
import { generateGroq } from '../ai/providers.js';
import { aiLimit } from '../middleware/ai-limit.js';
import { createRequestAbort } from '../middleware/request-abort.js';
import { listLandmarkDetails } from '../services/landmark.service.js';

export const roadmapRouter = Router();
const requestSchema = z.object({
  sessionId: z.string().min(2).max(120),
  language: z.enum(LANGUAGE_CODES as [SupportedLanguage, ...SupportedLanguage[]]),
  durationMinutes: z.union([z.literal(60), z.literal(120), z.literal(240)]),
  vibes: z.array(z.enum(['legends','architecture','photography','royalty','spiritual'])).min(1).max(3),
}).strict();
const outputSchema = z.object({
  headline: z.string().min(1).max(180),
  stops: z.array(z.object({ slug: z.string(), whyVisit: z.string().min(1).max(500), emotionalPayoff: z.string().min(1).max(300) }).strict()).min(1).max(5),
}).strict();
roadmapRouter.post('/generate', aiLimit, async (req, res) => {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'Invalid walk preferences' }); return; }
  const input = parsed.data;
  const budget = createRequestAbort(req, res, env.AI_REQUEST_TIMEOUT_MS);
  try {
    const places = await listLandmarkDetails();
    if (budget.isClientDisconnected()) return;
    const count = input.durationMinutes === 60 ? 2 : input.durationMinutes === 120 ? 3 : 5;
    const result = await generateGroq({
      system: 'Create a short self-guided walk in Ichan-Qala using ONLY the supplied dossier and exact catalog slugs. Match the interests. Label legends as legends. No invented historical claims, ratings or visitor statistics. Write in the requested language. Return JSON {"headline":"...","stops":[{"slug":"...","whyVisit":"...","emotionalPayoff":"..."}]}.',
      prompt: JSON.stringify({ ...input, requiredStops: Math.min(count, places.length), places: places.map((p) => ({ slug:p.slug, name:p.name, description:p.shortDescription, facts:p.historicalFacts, legends:p.localLegends })) }),
      json:true, maxTokens: 3000,
      signal: budget.signal,
      timeoutMs: budget.remainingMs(),
      parse: (text) => {
        const value = outputSchema.parse(JSON.parse(text));
        if (value.stops.length !== Math.min(count, places.length) || new Set(value.stops.map((p) => p.slug)).size !== value.stops.length || value.stops.some((p) => !places.some((place) => place.slug === p.slug))) throw new Error('Invalid walk stops');
        return value;
      },
    });
    if (budget.isClientDisconnected() || res.headersSent) return;
    res.json({ ...result.value, roadmapId:null, sessionId:input.sessionId, language:input.language,
      totalMinutes:input.durationMinutes, createdAt:new Date().toISOString(), source:'groq', modelUsed:result.modelUsed,
      stops:result.value.stops.map((stop,index) => ({ ...stop, order:index+1, name:places.find((p) => p.slug === stop.slug)!.localizedNames[input.language], estimatedMinutes:Math.floor(input.durationMinutes/result.value.stops.length) + (index < input.durationMinutes % result.value.stops.length ? 1 : 0) })),
    });
  } catch {
    if (budget.isClientDisconnected() || res.headersSent) return;
    res.status(503).json({ error:'AI walk temporarily unavailable' });
  } finally {
    budget.cleanup();
  }
});
