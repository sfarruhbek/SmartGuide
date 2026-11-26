import { Router } from 'express';
import { z } from 'zod';
import { LANGUAGE_CODES, type SupportedLanguage } from '@smartguide/shared';
import { aiLimit } from '../middleware/ai-limit.js';
import { generateSpeech } from '../ai/providers.js';

const schema = z.object({
  text: z.string().trim().min(1).max(1400),
  language: z.enum(LANGUAGE_CODES as [SupportedLanguage, ...SupportedLanguage[]]).default('en'),
}).strict();
export const audioRouter = Router();
audioRouter.post('/speech', aiLimit, async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'Invalid speech request', details: parsed.error.flatten().fieldErrors }); return; }
  try {
    const result = await generateSpeech(parsed.data.text, parsed.data.language);
    res.json({ ...result.value, modelUsed: result.modelUsed, provider: 'gemini' });
  } catch {
    res.setHeader('Retry-After', '60');
    res.status(503).json({ error: 'Speech temporarily unavailable', code: 'AUDIO_UNAVAILABLE', text: parsed.data.text });
  }
});
