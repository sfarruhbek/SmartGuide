import { Router } from 'express';
import { z } from 'zod';
import { LANGUAGE_CODES, type SupportedLanguage } from '@smartguide/shared';
import { env } from '../config/env.js';
import { aiLimit } from '../middleware/ai-limit.js';
import { createRequestAbort } from '../middleware/request-abort.js';
import { generateSpeech } from '../ai/providers.js';

const schema = z.object({
  text: z.string().trim().min(1).max(1400),
  language: z.enum(LANGUAGE_CODES as [SupportedLanguage, ...SupportedLanguage[]]).default('en'),
}).strict();
export const audioRouter = Router();
audioRouter.post('/speech', aiLimit, async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'Invalid speech request', details: parsed.error.flatten().fieldErrors }); return; }
  const budget = createRequestAbort(req, res, env.AI_REQUEST_TIMEOUT_MS);
  try {
    const result = await generateSpeech(parsed.data.text, parsed.data.language, {
      signal: budget.signal,
      timeoutMs: budget.remainingMs(),
    });
    if (budget.isClientDisconnected() || res.headersSent) return;
    res.json({ ...result.value, modelUsed: result.modelUsed, provider: 'gemini' });
  } catch {
    if (budget.isClientDisconnected() || res.headersSent) return;
    res.setHeader('Retry-After', '60');
    res.status(503).json({ error: 'Speech temporarily unavailable', code: 'AUDIO_UNAVAILABLE', text: parsed.data.text });
  } finally {
    budget.cleanup();
  }
});
