import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from '../config/env.js';
import * as schema from './schema.js';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 15,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

export const db = drizzle(pool, { schema });

/**
 * Ensures required tables exist on cold startup (e.g., freshly created PostgreSQL database)
 * in addition to supporting standard `drizzle-kit push` migrations.
 */
export async function ensureSchemaExists(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS landmarks (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      localized_names JSONB NOT NULL,
      era TEXT NOT NULL,
      built_year TEXT NOT NULL,
      architect TEXT NOT NULL,
      location_in_site TEXT NOT NULL,
      accent_color TEXT NOT NULL DEFAULT '#D4AF37',
      verified_by TEXT NOT NULL,
      archive_code TEXT NOT NULL,
      short_description TEXT NOT NULL,
      localized_short_descriptions JSONB NOT NULL,
      historical_facts JSONB NOT NULL,
      architectural_details JSONB NOT NULL,
      local_legends JSONB NOT NULL,
      visual_cues JSONB NOT NULL,
      suggested_questions JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS interactions (
      id SERIAL PRIMARY KEY,
      landmark_id INTEGER NOT NULL REFERENCES landmarks(id) ON DELETE CASCADE,
      landmark_slug TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'en',
      question TEXT NOT NULL,
      answer_preview TEXT NOT NULL DEFAULT '',
      has_image BOOLEAN NOT NULL DEFAULT FALSE,
      identified_by_vision BOOLEAN NOT NULL DEFAULT FALSE,
      session_id TEXT NOT NULL,
      source_mode TEXT NOT NULL DEFAULT 'gemini-rag',
      response_time_ms INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_interactions_landmark_id ON interactions (landmark_id);
    CREATE INDEX IF NOT EXISTS idx_interactions_language ON interactions (language);
    CREATE INDEX IF NOT EXISTS idx_interactions_session_id ON interactions (session_id);
    CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON interactions (created_at);
  `);
}

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
