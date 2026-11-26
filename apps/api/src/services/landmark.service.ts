import { asc, eq } from 'drizzle-orm';
import type { LandmarkDetail, LandmarkSummary } from '@smartguide/shared';
import { db } from '../db/index.js';
import { landmarks, type LandmarkRow } from '../db/schema.js';
import { loadLandmarksFromJson } from '../db/seed.js';
import { env } from '../config/env.js';

function localDetails(): LandmarkDetail[] {
  // id=0 means no PostgreSQL identity; never fabricate a saved analytics interaction.
  return loadLandmarksFromJson().map((item) => ({ id: 0, ...item }));
}

function toSummary(row: LandmarkRow): LandmarkSummary {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    localizedNames: row.localizedNames,
    era: row.era,
    builtYear: row.builtYear,
    architect: row.architect,
    locationInSite: row.locationInSite,
    shortDescription: row.shortDescription,
    localizedShortDescriptions: row.localizedShortDescriptions,
    accentColor: row.accentColor,
    suggestedQuestions: row.suggestedQuestions,
  };
}

function toDetail(row: LandmarkRow): LandmarkDetail {
  return {
    ...toSummary(row),
    historicalFacts: row.historicalFacts,
    architecturalDetails: row.architecturalDetails,
    localLegends: row.localLegends,
    visualCues: row.visualCues,
    verifiedBy: row.verifiedBy,
    archiveCode: row.archiveCode,
  };
}

export async function listLandmarkSummaries(): Promise<LandmarkSummary[]> {
  if (env.LANDMARK_STORE === 'json') return localDetails();
  const rows = await db.select().from(landmarks).orderBy(asc(landmarks.id));
  if (rows.length > 0) {
    return rows.map(toSummary);
  }

  // Fallback to verified local JSON if DB has not been seeded yet
  return loadLandmarksFromJson().map((item, idx) => ({
    id: idx + 1,
    slug: item.slug,
    name: item.name,
    localizedNames: item.localizedNames,
    era: item.era,
    builtYear: item.builtYear,
    architect: item.architect,
    locationInSite: item.locationInSite,
    shortDescription: item.shortDescription,
    localizedShortDescriptions: item.localizedShortDescriptions,
    accentColor: item.accentColor,
    suggestedQuestions: item.suggestedQuestions,
  }));
}

export async function listLandmarkDetails(): Promise<LandmarkDetail[]> {
  if (env.LANDMARK_STORE === 'json') return localDetails();
  const rows = await db.select().from(landmarks).orderBy(asc(landmarks.id));
  if (rows.length > 0) {
    return rows.map(toDetail);
  }

  return loadLandmarksFromJson().map((item, idx) => ({
    id: idx + 1,
    ...item,
  }));
}

export async function getLandmarkBySlug(slug: string): Promise<LandmarkDetail | null> {
  if (env.LANDMARK_STORE === 'json') return localDetails().find((item) => item.slug === slug) ?? null;
  const [row] = await db
    .select()
    .from(landmarks)
    .where(eq(landmarks.slug, slug))
    .limit(1);

  if (row) {
    return toDetail(row);
  }

  const fromJson = loadLandmarksFromJson().find((item) => item.slug === slug);
  if (!fromJson) return null;

  return {
    id: 0,
    ...fromJson,
  };
}
