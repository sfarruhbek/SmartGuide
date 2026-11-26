import { desc, sql } from 'drizzle-orm';
import {
  SUPPORTED_LANGUAGES,
  type AnalyticsSummary,
  type HourlyActivityPoint,
  type LandmarkVisitMetric,
  type LanguageBreakdownMetric,
  type RecentQuestionItem,
  type SupportedLanguage,
} from '@smartguide/shared';
import { env } from '../config/env.js';
import { db } from '../db/index.js';
import { interactions, landmarks } from '../db/schema.js';

export interface LogInteractionInput {
  landmarkId: number;
  landmarkSlug: string;
  language: SupportedLanguage;
  question: string;
  answerPreview: string;
  hasImage: boolean;
  identifiedByVision: boolean;
  sessionId: string;
  sourceMode: 'groq-rag' | 'gemini-rag' | 'verified-rag-fallback';
  responseTimeMs: number;
}

export async function logTouristInteraction(input: LogInteractionInput): Promise<number> {
  const [inserted] = await db
    .insert(interactions)
    .values({
      landmarkId: input.landmarkId,
      landmarkSlug: input.landmarkSlug,
      language: input.language,
      question: input.question.slice(0, 500),
      answerPreview: input.answerPreview.slice(0, 240),
      hasImage: input.hasImage,
      identifiedByVision: input.identifiedByVision,
      sessionId: input.sessionId.slice(0, 120),
      sourceMode: input.sourceMode,
      responseTimeMs: Math.max(0, Math.round(input.responseTimeMs)),
    })
    .returning({ id: interactions.id });

  return inserted.id;
}

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const [totalsRow] = await db
    .select({
      totalInteractions: sql<number>`count(*)::int`,
      totalTourists: sql<number>`count(distinct ${interactions.sessionId})::int`,
      totalPhotoScans: sql<number>`count(*) filter (where ${interactions.hasImage} = true)::int`,
    })
    .from(interactions);

  const totalInteractions = totalsRow?.totalInteractions ?? 0;
  const totalTourists = totalsRow?.totalTourists ?? 0;
  const totalPhotoScans = totalsRow?.totalPhotoScans ?? 0;

  // Visits grouped by landmark (LEFT JOIN so all 5 monuments appear even with 0 visits)
  const landmarkRows = await db
    .select({
      slug: landmarks.slug,
      name: landmarks.name,
      visits: sql<number>`count(${interactions.id})::int`,
      uniqueTourists: sql<number>`count(distinct ${interactions.sessionId})::int`,
      photoScans: sql<number>`count(${interactions.id}) filter (where ${interactions.hasImage} = true)::int`,
    })
    .from(landmarks)
    .leftJoin(interactions, sql`${interactions.landmarkId} = ${landmarks.id}`)
    .groupBy(landmarks.id, landmarks.slug, landmarks.name)
    .orderBy(sql`count(${interactions.id}) desc`, landmarks.id);

  const visitsByLandmark: LandmarkVisitMetric[] = landmarkRows.map((row) => ({
    slug: row.slug,
    name: row.name,
    visits: row.visits,
    uniqueTourists: row.uniqueTourists,
    photoScans: row.photoScans,
    sharePercent:
      totalInteractions > 0 ? roundToTwo((row.visits / totalInteractions) * 100) : 0,
  }));

  const topRow = visitsByLandmark[0];
  const topLandmark =
    topRow && topRow.visits > 0
      ? {
          slug: topRow.slug,
          name: topRow.name,
          visits: topRow.visits,
          sharePercent: topRow.sharePercent,
        }
      : null;

  // Breakdown by language / tourist origin
  const languageRows = await db
    .select({
      language: interactions.language,
      tourists: sql<number>`count(distinct ${interactions.sessionId})::int`,
      interactionCount: sql<number>`count(*)::int`,
    })
    .from(interactions)
    .groupBy(interactions.language)
    .orderBy(sql`count(distinct ${interactions.sessionId}) desc`);

  const totalLanguageTourists = languageRows.reduce((acc, row) => acc + row.tourists, 0);

  const touristsByLanguage: LanguageBreakdownMetric[] = languageRows.map((row) => {
    const code = (row.language as SupportedLanguage) || 'en';
    const meta = SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
    return {
      code,
      language: meta?.label ?? code.toUpperCase(),
      countryLabel: meta?.countryLabel ?? 'International',
      tourists: row.tourists,
      interactions: row.interactionCount,
      sharePercent:
        totalLanguageTourists > 0
          ? roundToTwo((row.tourists / totalLanguageTourists) * 100)
          : 0,
    };
  });

  // Hourly activity over the last 16 hours
  const hourlyRaw = await db.execute<{
    bucket: string;
    interactions: number;
    tourists: number;
  }>(sql`
    SELECT
      to_char(date_trunc('hour', created_at AT TIME ZONE 'UTC'), 'HH24:00') AS bucket,
      date_trunc('hour', created_at AT TIME ZONE 'UTC') AS bucket_ts,
      count(*)::int AS interactions,
      count(distinct session_id)::int AS tourists
    FROM interactions
    WHERE created_at >= NOW() - INTERVAL '24 hours'
    GROUP BY bucket_ts
    ORDER BY bucket_ts ASC
  `);

  const hourlyActivity: HourlyActivityPoint[] = hourlyRaw.rows.map((row) => ({
    hour: row.bucket,
    interactions: Number(row.interactions),
    tourists: Number(row.tourists),
  }));

  // Live recent questions feed
  const recentRows = await db
    .select({
      id: interactions.id,
      landmarkSlug: interactions.landmarkSlug,
      landmarkName: landmarks.name,
      language: interactions.language,
      question: interactions.question,
      answerPreview: interactions.answerPreview,
      hasImage: interactions.hasImage,
      sessionId: interactions.sessionId,
      createdAt: interactions.createdAt,
    })
    .from(interactions)
    .innerJoin(landmarks, sql`${interactions.landmarkId} = ${landmarks.id}`)
    .orderBy(desc(interactions.createdAt))
    .limit(15);

  const recentQuestions: RecentQuestionItem[] = recentRows.map((row) => ({
    id: row.id,
    landmarkSlug: row.landmarkSlug,
    landmarkName: row.landmarkName,
    language: (row.language as SupportedLanguage) || 'en',
    question: row.question,
    answerPreview: row.answerPreview,
    hasImage: row.hasImage,
    sessionId: row.sessionId,
    createdAt: row.createdAt.toISOString(),
  }));

  // B2B2C Revenue Share & Unit Economics calculations
  const pricePerTouristUsd = env.TICKET_PRICE_USD;
  const museumSharePercent = env.MUSEUM_REVENUE_SHARE_PERCENT;
  const smartGuideSharePercent = 100 - museumSharePercent;
  const grossRevenueUsd = roundToTwo(totalTourists * pricePerTouristUsd);
  const museumShareUsd = roundToTwo(grossRevenueUsd * (museumSharePercent / 100));
  const smartGuideShareUsd = roundToTwo(grossRevenueUsd - museumShareUsd);
  const totalEstimatedApiCostUsd = roundToTwo(
    totalTourists * env.ESTIMATED_API_COST_PER_TOURIST_USD,
  );
  const grossMarginPercent =
    grossRevenueUsd > 0
      ? roundToTwo(((grossRevenueUsd - totalEstimatedApiCostUsd) / grossRevenueUsd) * 100)
      : 0;

  return {
    siteName: 'Ichan-Qala State Museum-Reserve · Khiva',
    totalTourists,
    totalInteractions,
    totalPhotoScans,
    avgQuestionsPerTourist:
      totalTourists > 0 ? roundToTwo(totalInteractions / totalTourists) : 0,
    topLandmark,
    revenue: {
      pricePerTouristUsd,
      grossRevenueUsd,
      museumSharePercent,
      museumShareUsd,
      smartGuideSharePercent,
      smartGuideShareUsd,
      estimatedApiCostPerTouristUsd: env.ESTIMATED_API_COST_PER_TOURIST_USD,
      totalEstimatedApiCostUsd,
      grossMarginPercent,
    },
    visitsByLandmark,
    touristsByLanguage,
    hourlyActivity,
    recentQuestions,
    updatedAt: new Date().toISOString(),
  };
}
