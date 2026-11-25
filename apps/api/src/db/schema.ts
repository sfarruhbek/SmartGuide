import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import type { LocalizedStringArrayMap, LocalizedTextMap } from '@smartguide/shared';

export const landmarks = pgTable('landmarks', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  localizedNames: jsonb('localized_names').$type<LocalizedTextMap>().notNull(),
  era: text('era').notNull(),
  builtYear: text('built_year').notNull(),
  architect: text('architect').notNull(),
  locationInSite: text('location_in_site').notNull(),
  accentColor: text('accent_color').notNull().default('#D4AF37'),
  verifiedBy: text('verified_by').notNull(),
  archiveCode: text('archive_code').notNull(),
  shortDescription: text('short_description').notNull(),
  localizedShortDescriptions: jsonb('localized_short_descriptions')
    .$type<LocalizedTextMap>()
    .notNull(),
  historicalFacts: jsonb('historical_facts').$type<string[]>().notNull(),
  architecturalDetails: jsonb('architectural_details').$type<string[]>().notNull(),
  localLegends: jsonb('local_legends').$type<string[]>().notNull(),
  visualCues: jsonb('visual_cues').$type<string[]>().notNull(),
  suggestedQuestions: jsonb('suggested_questions')
    .$type<LocalizedStringArrayMap>()
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const interactions = pgTable(
  'interactions',
  {
    id: serial('id').primaryKey(),
    landmarkId: integer('landmark_id')
      .notNull()
      .references(() => landmarks.id, { onDelete: 'cascade' }),
    landmarkSlug: text('landmark_slug').notNull(),
    language: text('language').notNull().default('en'),
    question: text('question').notNull(),
    answerPreview: text('answer_preview').notNull().default(''),
    hasImage: boolean('has_image').notNull().default(false),
    identifiedByVision: boolean('identified_by_vision').notNull().default(false),
    sessionId: text('session_id').notNull(),
    sourceMode: text('source_mode').notNull().default('gemini-rag'),
    responseTimeMs: integer('response_time_ms').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_interactions_landmark_id').on(table.landmarkId),
    index('idx_interactions_language').on(table.language),
    index('idx_interactions_session_id').on(table.sessionId),
    index('idx_interactions_created_at').on(table.createdAt),
  ],
);

export type LandmarkRow = typeof landmarks.$inferSelect;
export type NewLandmarkRow = typeof landmarks.$inferInsert;
export type InteractionRow = typeof interactions.$inferSelect;
export type NewInteractionRow = typeof interactions.$inferInsert;
