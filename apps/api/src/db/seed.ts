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

export async function seedDatabase(): Promise<{
  landmarksUpserted: number;
  interactionsInserted: number;
}> {
  await ensureSchemaExists();

  const landmarkRecords = loadLandmarksFromJson();
  const slugToId = new Map<string, number>();

  for (const item of landmarkRecords) {
    const [row] = await db
      .insert(landmarks)
      .values({
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
      })
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
      })
      .returning({ id: landmarks.id, slug: landmarks.slug });

    slugToId.set(row.slug, row.id);
  }

  // Ensure slug map has IDs even if driver omitted returning on any edge case
  if (slugToId.size < landmarkRecords.length) {
    const existing = await db.select({ id: landmarks.id, slug: landmarks.slug }).from(landmarks);
    for (const row of existing) {
      slugToId.set(row.slug, row.id);
    }
  }

  const [{ value: existingInteractionsCount }] = await db
    .select({ value: count() })
    .from(interactions);

  let interactionsInserted = 0;

  if (existingInteractionsCount === 0) {
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
      interactionsInserted = rowsToInsert.length;
    }
  }

  return {
    landmarksUpserted: landmarkRecords.length,
    interactionsInserted,
  };
}

// Allow direct execution via `npm run db:seed` / `tsx src/db/seed.ts`
const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectRun) {
  seedDatabase()
    .then(async (result) => {
      console.log(
        `[seed] Completed: ${result.landmarksUpserted} Ichan-Qala landmarks upserted, ${result.interactionsInserted} initial analytics interactions seeded.`,
      );
      await pool.end();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error('[seed] Failed to seed PostgreSQL database:', error);
      await pool.end();
      process.exit(1);
    });
}
