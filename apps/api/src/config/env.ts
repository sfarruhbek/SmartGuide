import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load root .env first (monorepo root), then allow apps/api/.env overrides
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
  GEMINI_MODEL: z.string().default('gemini-3.5-flash-lite'),
  GEMINI_FALLBACK_MODEL: z.string().default('gemini-4-hydrogen'),
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

export const env = {
  ...raw,
  GEMINI_API_KEY: isGeminiConfigured ? trimmedKey : '',
  isGeminiConfigured,
  corsOrigins: raw.CORS_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};
