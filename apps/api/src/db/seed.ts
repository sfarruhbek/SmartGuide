import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { count } from 'drizzle-orm';
import { db, ensureSchemaExists, pool } from './index.js';
import { interactions, landmarks, type NewLandmarkRow } from './schema.js';
import { INITIAL_ANALYTICS_SEED } from './seed-data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LANDMARKS_JSON_PATH = path.resolve(__dirname, '../../data/ichan-qala-landmarks.json');

interface RawLandmarkJson {
  slug: string;
  name: string;
  localizedNames: NewLandmarkRow['localizedNames'];
  era: string;
  builtYear: string;
  architect: string;
  locationInSite: string;
  accentColor: string;
  verifiedBy: string;
  archiveCode: string;
  shortDescription: string;
  localizedShortDescriptions: NewLandmarkRow['localizedShortDescriptions'];
  historicalFacts: string[];
  architecturalDetails: string[];
  localLegends: string[];
  visualCues: string[];
  suggestedQuestions: NewLandmarkRow['suggestedQuestions'];
}

export function loadLandmarksFromJson(): RawLandmarkJson[] {
  const raw = fs.readFileSync(LANDMARKS_JSON_PATH, 'utf-8');
  return JSON.parse(raw) as RawLandmarkJson[];
}

export interface ContentSeedResult {
  landmarksInserted: number;
  landmarksUpdated: number;
  landmarksTotal: number;
}

export interface DemoSeedResult {
  landmarksInserted: number;
  interactionsInserted: number;
  skippedReason?: 'already-has-interactions';
}

/**
 * Loads verified Ichan-Qala landmark dossiers into PostgreSQL.
 * By default uses ON CONFLICT DO NOTHING so approved database edits are never overwritten.
 * Never inserts synthetic analytics interactions.
 */
export async function seedContent(options: { overwrite?: boolean } = {}): Promise<ContentSeedResult> {
  await ensureSchemaExists();

  const landmarkRecords = loadLandmarksFromJson();
  const overwrite = options.overwrite === true;
  let landmarksInserted = 0;
  let landmarksUpdated = 0;

  for (const item of landmarkRecords) {
    const baseValues = {
      slug: item.slug,
      name: item.name,
      localizedNames: item.localizedNames,
      era: item.era,
      builtYear: item.builtYear,
      architect: item.architect,
      locationInSite: item.locationInSite,
      accentColor: item.accentColor,
      verifiedBy: item.verifiedBy,
      archiveCode: item.archiveCode,
      shortDescription: item.shortDescription,
      localizedShortDescriptions: item.localizedShortDescriptions,
      historicalFacts: item.historicalFacts,
      architecturalDetails: item.architecturalDetails,
      localLegends: item.localLegends,
      visualCues: item.visualCues,
      suggestedQuestions: item.suggestedQuestions,
      updatedAt: new Date(),
    };

    if (overwrite) {
      await db
        .insert(landmarks)
        .values(baseValues)
        .onConflictDoUpdate({
          target: landmarks.slug,
          set: {
            name: item.name,
            localizedNames: item.localizedNames,
            era: item.era,
            builtYear: item.builtYear,
            architect: item.architect,
            locationInSite: item.locationInSite,
            accentColor: item.accentColor,
            verifiedBy: item.verifiedBy,
            archiveCode: item.archiveCode,
            shortDescription: item.shortDescription,
            localizedShortDescriptions: item.localizedShortDescriptions,
            historicalFacts: item.historicalFacts,
            architecturalDetails: item.architecturalDetails,
            localLegends: item.localLegends,
            visualCues: item.visualCues,
            suggestedQuestions: item.suggestedQuestions,
            updatedAt: new Date(),
          },
        });
      landmarksUpdated++;
    } else {
      const inserted = await db
        .insert(landmarks)
        .values(baseValues)
        .onConflictDoNothing({ target: landmarks.slug })
        .returning({ id: landmarks.id });
      if (inserted.length > 0) {
        landmarksInserted++;
      }
    }
  }

  return {
    landmarksInserted,
    landmarksUpdated,
    landmarksTotal: landmarkRecords.length,
  };
}

/**
 * Explicit opt-in demo analytics seed for isolated demo environments only.
 * Never invoked during server startup or normal content seeding.
 */
export async function seedDemoAnalytics(options: { allowProduction?: boolean } = {}): Promise<DemoSeedResult> {
  if (process.env.NODE_ENV === 'production' && !options.allowProduction) {
    throw new Error(
      'Refusing to seed synthetic demo interactions in NODE_ENV=production without --allow-production.',
    );
  }

  const contentResult = await seedContent({ overwrite: false });
  const existingLandmarks = await db
    .select({ id: landmarks.id, slug: landmarks.slug })
    .from(landmarks);
  const slugToId = new Map(existingLandmarks.map((row) => [row.slug, row.id]));

  const [{ value: existingInteractionsCount }] = await db
    .select({ value: count() })
    .from(interactions);

  if (existingInteractionsCount > 0) {
    return {
      landmarksInserted: contentResult.landmarksInserted,
      interactionsInserted: 0,
      skippedReason: 'already-has-interactions',
    };
  }

  const nowMs = Date.now();
  const rowsToInsert = INITIAL_ANALYTICS_SEED.flatMap((spec) => {
    const landmarkId = slugToId.get(spec.landmarkSlug);
    if (!landmarkId) return [];
    return [
      {
        landmarkId,
        landmarkSlug: spec.landmarkSlug,
        language: spec.language,
        question: spec.question,
        answerPreview: spec.answerPreview,
        hasImage: spec.hasImage,
        identifiedByVision: spec.identifiedByVision,
        sessionId: spec.sessionId,
        sourceMode: 'gemini-rag',
        responseTimeMs: spec.responseTimeMs,
        createdAt: new Date(nowMs - Math.round(spec.hoursAgo * 60 * 60 * 1000)),
      },
    ];
  });

  if (rowsToInsert.length > 0) {
    await db.insert(interactions).values(rowsToInsert);
  }

  return {
    landmarksInserted: contentResult.landmarksInserted,
    interactionsInserted: rowsToInsert.length,
  };
}

/**
 * Backward-compatible helper: ensures schema and inserts missing landmarks only.
 * Synthetic demo analytics are never inserted here.
 */
export async function seedDatabase(options: { overwrite?: boolean } = {}): Promise<{
  landmarksUpserted: number;
  interactionsInserted: number;
}> {
  const result = await seedContent(options);
  return {
    landmarksUpserted: result.landmarksInserted + result.landmarksUpdated,
    interactionsInserted: 0,
  };
}

// Allow direct execution via `npm run db:seed:content` / `npm run db:seed:demo`
const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectRun) {
  const args = process.argv.slice(2);
  const mode = args.find((arg) => !arg.startsWith('--')) ?? 'content';
  const forceOverwrite = args.includes('--force');
  const allowProduction = args.includes('--allow-production');

  const run = async () => {
    if (mode === 'schema') {
      await ensureSchemaExists();
      console.log('[seed] Schema verified (landmarks, interactions).');
      return;
    }
    if (mode === 'demo') {
      const result = await seedDemoAnalytics({ allowProduction });
      if (result.skippedReason === 'already-has-interactions') {
        console.log('[seed:demo] Skipped: interactions table already contains records.');
      } else {
        console.log(
          `[seed:demo] Completed: ${result.landmarksInserted} new landmarks inserted, ${result.interactionsInserted} synthetic demo interactions added.`,
        );
      }
      return;
    }
    if (mode !== 'content') {
      throw new Error(`Unknown seed mode "${mode}". Use "content", "demo", or "schema".`);
    }
    const result = await seedContent({ overwrite: forceOverwrite });
    console.log(
      `[seed:content] Completed: ${result.landmarksInserted} inserted, ${result.landmarksUpdated} updated (${result.landmarksTotal} total in catalog, 0 synthetic interactions touched).`,
    );
  };

  run()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error('[seed] Failed:', error instanceof Error ? error.message : error);
      await pool.end();
      process.exit(1);
    });
}
