import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { checkDatabaseHealth } from './db/index.js';
import { errorHandler } from './middleware/error-handler.js';
import { analyticsRouter } from './routes/analytics.routes.js';
import { guideRouter } from './routes/guide.routes.js';
import { landmarksRouter } from './routes/landmarks.routes.js';
import { tripsRouter } from './routes/trips.routes.js';
import { audioRouter } from './routes/audio.routes.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow server-to-server, curl, mobile QR browsers, wildcard, or configured origins
        if (
          !origin ||
          env.corsOrigins.includes('*') ||
          env.corsOrigins.includes(origin) ||
          env.NODE_ENV !== 'production'
        ) {
          callback(null, true);
          return;
        }
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: false,
    }),
  );

  // Support base64 mobile photo uploads for Snap & Ask
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', async (_req, res) => {
    const dbOk = await checkDatabaseHealth();
    res.status(dbOk ? 200 : 503).json({
      status: dbOk ? 'ok' : 'degraded',
      service: 'smartguide-api',
      database: dbOk ? 'connected' : 'disconnected',
      aiConfigured: env.isGroqConfigured && env.isGeminiConfigured,
      providers: { groq: env.isGroqConfigured, geminiSpeech: env.isGeminiConfigured },
      models: {
        planner: env.groqModels,
        ragVision: env.GROQ_VISION_MODEL,
        tts: env.GEMINI_TTS_MODEL,
      },
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/landmarks', landmarksRouter);
  app.use('/api/guide', guideRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/trips', tripsRouter);
  app.use('/api/audio', audioRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: 'API route not found.' });
  });

  app.use(errorHandler);
  return app;
}
