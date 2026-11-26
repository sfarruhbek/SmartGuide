import fs from 'node:fs';
import { z } from 'zod';

const importedMonumentSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name_uz: z.string().min(1), name_en: z.string().min(1),
  historical_facts: z.object({
    built_year: z.string(), commissioned_by: z.string(),
    dimensions: z.record(z.union([z.string(), z.number()])), unique_feature: z.string(),
  }),
  audio_guide_story: z.string().min(1).max(20_000),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })),
  coordinates: z.object({ latitude: z.number().min(37).max(46), longitude: z.number().min(55).max(74) }),
  images: z.array(z.string().url()), official_sources: z.array(z.string().url()),
});
export const contentImportSchema = z.object({
  project: z.string(), source_badge: z.string(), unesco_reference: z.string().url(),
  monuments: z.array(importedMonumentSchema).min(1),
}).superRefine((value, ctx) => {
  if (new Set(value.monuments.map((p) => p.id)).size !== value.monuments.length) ctx.addIssue({ code: 'custom', message: 'Duplicate monument IDs' });
});

/** Staging data only. Never auto-seeded or passed to production RAG as verified facts. */
export function loadContentImport() {
  return contentImportSchema.parse(JSON.parse(fs.readFileSync(new URL('../../data/imports/ichan_qala_5_obida.json', import.meta.url), 'utf8')));
}

export const legacySlugAliases: Readonly<Record<string, string>> = { 'tosh-hovli-palace': 'tosh-hovli' };
export function summarizeContentImport() {
  const data = loadContentImport();
  return {
    status: 'needs-historical-review', count: data.monuments.length,
    monuments: data.monuments.map((p) => ({ id: p.id, legacySlug: legacySlugAliases[p.id] ?? p.id, name: p.name_en, faqCount: p.faq.length })),
    conflicts: [
      'Kalta Minor: imported 1852–1855 vs existing 1851–1855.',
      'Juma Mosque: imported 212 columns vs existing 213.',
      'Islam Khoja is new; Pahlavon Mahmud is absent and must not be deleted.',
      'Audio stories mix claims and legends. Attribute oral traditions; review historical claims per source.',
      'The source badge and a general UNESCO link do not independently verify each claim.',
      'Wikimedia File page URLs are attribution pages, not direct image assets.',
    ],
  };
}
