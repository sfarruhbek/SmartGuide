import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Deployment environment wins. Local AI secrets are server-only and ignored by Git.
dotenv.config({ path: path.resolve(__dirname, '../../../../.env.ai.local') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z
    .string()
    .min(1)
    .default('postgresql://smartguide:smartguide_secret@localhost:5432/smartguide'),
  CORS_ORIGIN: z.string().default('http://localhost:3000,http://localhost:5173'),
  GEMINI_API_KEY: z.string().optional().default(''),
  GROQ_API_KEYS: z.string().default(''),
  GROQ_API_KEY: z.string().default(''),
  GROQ_MODELS: z.string().default('openai/gpt-oss-120b,openai/gpt-oss-20b,qwen/qwen3.8-27b'),
  GROQ_VISION_MODEL: z.string().default('qwen/qwen3.8-27b'),
  GEMINI_TTS_FALLBACK_MODELS: z.string().default('gemini-3.8-flash-tts,gemini-3.1-flash-tts-preview,gemini-2.5-flash-preview-tts'),
  AI_REQUEST_TIMEOUT_MS: z.coerce.number().int().min(1000).max(60000).default(25000),
  AI_MAX_CONCURRENT: z.coerce.number().int().min(1).max(32).default(4),
  AI_REQUESTS_PER_MINUTE: z.coerce.number().int().min(1).max(1000).default(20),
  GEMINI_TTS_MODEL: z.string().default('gemini-3.8-flash-lite-tts'),
  GEMINI_TTS_VOICE: z.string().default('Sulafat'),
  TICKET_PRICE_USD: z.coerce.number().positive().default(4),
  MUSEUM_REVENUE_SHARE_PERCENT: z.coerce.number().min(0).max(100).default(30),
  ESTIMATED_API_COST_PER_TOURIST_USD: z.coerce.number().min(0).default(0.15),
  AUTO_SEED: z
    .string()
    .optional()
    .default('true')
    .transform((val) => val.toLowerCase() !== 'false'),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('[env] Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const raw = parsed.data;
const trimmedKey = raw.GEMINI_API_KEY.trim();
const isGeminiConfigured =
  trimmedKey.length > 0 && trimmedKey !== 'your_gemini_api_key_here';
const split = (value: string) => [...new Set(value.split(',').map((part) => part.trim()).filter(Boolean))];
const groqKeys = split([raw.GROQ_API_KEYS, raw.GROQ_API_KEY].join(',')).filter((key) => key !== 'your_groq_api_key_here');

export const env = {
  ...raw,
  GEMINI_API_KEY: isGeminiConfigured ? trimmedKey : '',
  isGeminiConfigured,
  groqKeys,
  isGroqConfigured: groqKeys.length > 0,
  groqModels: split(raw.GROQ_MODELS),
  ttsModels: split([raw.GEMINI_TTS_MODEL, raw.GEMINI_TTS_FALLBACK_MODELS].join(',')),
  corsOrigins: raw.CORS_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};
