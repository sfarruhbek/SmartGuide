import { createApp } from './app.js';
import { env } from './config/env.js';
import { pool } from './db/index.js';
import { seedDatabase } from './db/seed.js';
import { attachLiveVoice } from './explore/live.js';

async function bootstrap() {
  if (env.AUTO_SEED) {
    try {
      const result = await seedDatabase();
      console.log(
        `[startup] PostgreSQL ready — ${result.landmarksUpserted} landmarks verified, ${result.interactionsInserted} initial analytics records added.`,
      );
    } catch (error) {
      console.error(
        '[startup] PostgreSQL auto-seed failed (is Postgres running?):',
        error instanceof Error ? error.message : error,
      );
    }
  }

  const app = createApp();
  const server = app.listen(env.API_PORT, '0.0.0.0', () => {
    console.log(`[smartguide-api] Listening on http://0.0.0.0:${env.API_PORT}`);
    console.log(
      `[smartguide-api] Groq text/planner: ${env.isGroqConfigured ? 'CONFIGURED' : 'LOCAL FALLBACK'}; Gemini speech: ${env.isGeminiConfigured ? 'CONFIGURED' : 'TEXT ONLY'}. Configuration is not a live provider health check.`,
    );
  });
  const liveVoice=attachLiveVoice(server);

  const shutdown = async (signal: string) => {
    liveVoice.close();
    console.log(`[smartguide-api] Received ${signal}, shutting down gracefully...`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

void bootstrap();
