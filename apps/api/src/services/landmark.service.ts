import { asc, eq } from 'drizzle-orm';
import type { LandmarkDetail, LandmarkStoreMode, LandmarkSummary } from '@smartguide/shared';
import { db } from '../db/index.js';
import { landmarks, type LandmarkRow } from '../db/schema.js';
import { loadLandmarksFromJson } from '../db/seed.js';
import { env } from '../config/env.js';

function localDetails(): LandmarkDetail[] {
  // id=0 means no PostgreSQL identity; never fabricate a database primary key.
  return loadLandmarksFromJson().map((item) => ({ id: 0, ...item }));
}

function formatDbError(error: unknown): string {
  if (error && typeof error === 'object') {
    const code = 'code' in error && typeof error.code === 'string' ? error.code : undefined;
    const message = error instanceof Error ? error.message : String(error);
    return code ? `${code}: ${message}` : message;
  }
  return String(error);
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

export async function listLandmarkSummariesWithSource(): Promise<{
  landmarks: LandmarkSummary[];
  landmarkStore: LandmarkStoreMode;
}> {
  if (env.LANDMARK_STORE === 'json') {
    return { landmarks: localDetails(), landmarkStore: 'json' };
  }
  try {
    const rows = await db.select().from(landmarks).orderBy(asc(landmarks.id));
    if (rows.length > 0) {
      return { landmarks: rows.map(toSummary), landmarkStore: 'postgres' };
    }
    return { landmarks: localDetails(), landmarkStore: 'fallback-json' };
  } catch (error) {
    console.warn('[landmarks] PostgreSQL unavailable for listLandmarkSummaries; degrading to local JSON:', formatDbError(error));
    return { landmarks: localDetails(), landmarkStore: 'fallback-json' };
  }
}

export async function listLandmarkSummaries(): Promise<LandmarkSummary[]> {
  return (await listLandmarkSummariesWithSource()).landmarks;
}

export async function listLandmarkDetailsWithSource(): Promise<{
  landmarks: LandmarkDetail[];
  landmarkStore: LandmarkStoreMode;
}> {
  if (env.LANDMARK_STORE === 'json') {
    return { landmarks: localDetails(), landmarkStore: 'json' };
  }
  try {
    const rows = await db.select().from(landmarks).orderBy(asc(landmarks.id));
    if (rows.length > 0) {
      return { landmarks: rows.map(toDetail), landmarkStore: 'postgres' };
    }
    return { landmarks: localDetails(), landmarkStore: 'fallback-json' };
  } catch (error) {
    console.warn('[landmarks] PostgreSQL unavailable for listLandmarkDetails; degrading to local JSON:', formatDbError(error));
    return { landmarks: localDetails(), landmarkStore: 'fallback-json' };
  }
}

export async function listLandmarkDetails(): Promise<LandmarkDetail[]> {
  return (await listLandmarkDetailsWithSource()).landmarks;
}

export async function getLandmarkBySlugWithSource(slug: string): Promise<{
  landmark: LandmarkDetail | null;
  landmarkStore: LandmarkStoreMode;
}> {
  if (env.LANDMARK_STORE === 'json') {
    return {
      landmark: localDetails().find((item) => item.slug === slug) ?? null,
      landmarkStore: 'json',
    };
  }
  try {
    const [row] = await db
      .select()
      .from(landmarks)
      .where(eq(landmarks.slug, slug))
      .limit(1);

    if (row) {
      return { landmark: toDetail(row), landmarkStore: 'postgres' };
    }

    const fromJson = localDetails().find((item) => item.slug === slug) ?? null;
    return {
      landmark: fromJson,
      landmarkStore: fromJson ? 'fallback-json' : 'postgres',
    };
  } catch (error) {
    console.warn('[landmarks] PostgreSQL unavailable for getLandmarkBySlug; degrading to local JSON:', formatDbError(error));
    return {
      landmark: localDetails().find((item) => item.slug === slug) ?? null,
      landmarkStore: 'fallback-json',
    };
  }
}

export async function getLandmarkBySlug(slug: string): Promise<LandmarkDetail | null> {
  return (await getLandmarkBySlugWithSource(slug)).landmark;
}
