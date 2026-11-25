import { GoogleGenAI } from '@google/genai';
import {
  SUPPORTED_LANGUAGES,
  type LandmarkDetail,
  type SupportedLanguage,
} from '@smartguide/shared';
import { env } from '../config/env.js';

let textClient: GoogleGenAI | null = null;
let ttsClient: GoogleGenAI | null = null;

function getTextClient(): GoogleGenAI | null {
  if (!env.isGeminiConfigured) return null;
  if (!textClient) {
    textClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
  return textClient;
}

function getTtsClient(): GoogleGenAI | null {
  if (!env.isGeminiConfigured) return null;
  if (!ttsClient) {
    ttsClient = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
      httpOptions: { apiVersion: 'v1beta' },
    });
  }
  return ttsClient;
}

function getLanguageName(code: SupportedLanguage): string {
  return SUPPORTED_LANGUAGES.find((item) => item.code === code)?.label ?? 'English';
}

function normalizeBase64Image(rawBase64: string, explicitMimeType?: string): {
  data: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
} {
  const dataUrlMatch = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(rawBase64.trim());
  const rawMime = (dataUrlMatch ? dataUrlMatch[1] : explicitMimeType ?? 'image/jpeg').toLowerCase();
  const data = (dataUrlMatch ? dataUrlMatch[2] : rawBase64).replace(/\s+/g, '');

  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
  const normalizedMime = rawMime === 'image/jpg' ? 'image/jpeg' : rawMime;
  const mimeType = allowedMimes.includes(normalizedMime as (typeof allowedMimes)[number])
    ? (normalizedMime as (typeof allowedMimes)[number])
    : 'image/jpeg';

  return { data, mimeType };
}

/**
 * Formats the landmark's verified PostgreSQL dossier into a strict RAG context block.
 */
function buildVerifiedRagSystemPrompt(
  landmark: LandmarkDetail,
  language: SupportedLanguage,
): string {
  const targetLanguage = getLanguageName(language);

  return [
    `You are SmartGuide, the official verified AI museum tour guide for Ichan-Qala (Khiva, Uzbekistan).`,
    `CRITICAL GROUNDING RULES (ZERO HALLUCINATIONS):`,
    `1. You MUST answer ONLY using the VERIFIED MUSEUM ARCHIVE DOSSIER provided below. Never invent dates, dimensions, rulers, architects, inscriptions, or legends that are not explicitly present in the dossier.`,
    `2. If the visitor asks for a fact not covered in the dossier, politely state that this specific detail is not in the verified museum archive for ${landmark.name}, and share the closest verified fact from the dossier instead.`,
    `3. Respond ENTIRELY in ${targetLanguage} (language code: "${language}").`,
    `4. Keep your response engaging, warm, and natural for spoken audio playback (3 to 5 clear sentences, plain text without markdown bullet symbols, asterisks, or hashtags).`,
    `5. If the visitor attached a photo, briefly acknowledge what architectural feature is visible only if it aligns with the verified dossier below.`,
    ``,
    `=== VERIFIED MUSEUM ARCHIVE DOSSIER ===`,
    `Archive Code: ${landmark.archiveCode}`,
    `Verified By: ${landmark.verifiedBy}`,
    `Landmark Name: ${landmark.name} (${landmark.localizedNames[language]})`,
    `Historical Era: ${landmark.era}`,
    `Construction Period: ${landmark.builtYear}`,
    `Architect / Craftsmanship: ${landmark.architect}`,
    `Location inside Ichan-Qala: ${landmark.locationInSite}`,
    `Overview: ${landmark.shortDescription}`,
    ``,
    `VERIFIED HISTORICAL FACTS:`,
    ...landmark.historicalFacts.map((fact, idx) => `${idx + 1}. ${fact}`),
    ``,
    `VERIFIED ARCHITECTURAL DETAILS:`,
    ...landmark.architecturalDetails.map((detail, idx) => `${idx + 1}. ${detail}`),
    ``,
    `VERIFIED LOCAL LEGENDS & STORYTELLING:`,
    ...landmark.localLegends.map((legend, idx) => `${idx + 1}. ${legend}`),
    ``,
    `RECOGNIZABLE VISUAL CUES:`,
    ...landmark.visualCues.map((cue, idx) => `${idx + 1}. ${cue}`),
    `=== END VERIFIED DOSSIER ===`,
  ].join('\n');
}

/**
 * Attempts primary Gemini model (`gemini-3.5-flash-lite`) and gracefully falls back
 * to `GEMINI_FALLBACK_MODEL` (`gemini-4-hydrogen`) on transient/model errors.
 */
async function createTextInteractionWithFallback(params: {
  systemInstruction: string;
  input:
    | string
    | Array<
        | { type: 'text'; text: string }
        | { type: 'image'; data: string; mime_type: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' }
      >;
  maxOutputTokens?: number;
}): Promise<{ text: string; modelUsed: string }> {
  const client = getTextClient();
  if (!client) {
    throw new Error('GEMINI_API_KEY_NOT_CONFIGURED');
  }

  const candidateModels = Array.from(
    new Set([env.GEMINI_MODEL, env.GEMINI_FALLBACK_MODEL].filter(Boolean)),
  );

  let lastError: unknown;
  for (const model of candidateModels) {
    try {
      const interaction = await client.interactions.create({
        model,
        system_instruction: params.systemInstruction,
        input: params.input,
        store: false,
        generation_config: {
          max_output_tokens: params.maxOutputTokens ?? 420,
        },
      });

      const output = interaction.output_text?.trim();
      if (output) {
        return { text: output, modelUsed: model };
      }
      throw new Error(`Empty output_text returned by ${model}`);
    } catch (error) {
      lastError = error;
      console.warn(`[ai] Model "${model}" failed, trying fallback if available:`, error);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('All Gemini models failed');
}

/**
 * Uses Gemini multimodal Vision to identify which of the 5 Ichan-Qala landmarks
 * appears in the tourist's uploaded photo.
 */
export async function identifyLandmarkFromImage(
  imageBase64: string,
  imageMimeType: string | undefined,
  allLandmarks: LandmarkDetail[],
  fallbackSlug?: string,
): Promise<{ slug: string; identifiedByVision: boolean }> {
  const defaultSlug = fallbackSlug || allLandmarks[0]?.slug || 'kalta-minor';
  if (!env.isGeminiConfigured) {
    return { slug: defaultSlug, identifiedByVision: false };
  }

  try {
    const normalized = normalizeBase64Image(imageBase64, imageMimeType);
    const catalog = allLandmarks
      .map(
        (lm) =>
          `- slug: "${lm.slug}" | Name: ${lm.name} | Visual cues: ${lm.visualCues.join('; ')}`,
      )
      .join('\n');

    const { text } = await createTextInteractionWithFallback({
      systemInstruction: [
        'You are a visual monument classifier for Ichan-Qala (Khiva, Uzbekistan).',
        'Inspect the visitor photo and match it to EXACTLY ONE slug from the catalog below.',
        'If the photo does not clearly match any monument in the catalog, respond with "unknown".',
        'Respond ONLY with the single lowercase slug string and nothing else.',
        '',
        catalog,
      ].join('\n'),
      input: [
        { type: 'text', text: 'Which Ichan-Qala monument is shown in this photo? Reply with only the slug or "unknown".' },
        {
          type: 'image',
          data: normalized.data,
          mime_type: normalized.mimeType,
        },
      ],
      maxOutputTokens: 32,
    });

    const cleaned = text.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const matched = allLandmarks.find((lm) => lm.slug === cleaned);
    if (matched) {
      return { slug: matched.slug, identifiedByVision: true };
    }
  } catch (error) {
    console.warn('[ai] Landmark visual identification failed; using selected slug:', error);
  }

  return { slug: defaultSlug, identifiedByVision: false };
}

/**
 * Deterministic zero-hallucination fallback synthesizer used ONLY if GEMINI_API_KEY
 * is not configured yet (so local dev & demo testing work seamlessly out of the box).
 */
function buildDeterministicVerifiedFallback(
  landmark: LandmarkDetail,
  question: string,
  language: SupportedLanguage,
): string {
  const q = question.toLowerCase();
  const isLegendQuery =
    /legend|story|myth|afsona|легенд|伝説|전설|leyenda|architect|me'mor|зодч/.test(q);
  const isArchitectureQuery =
    /column|dome|tile|deep|tall|height|room|courtyard|ustun|gumbaz|колонн|купол|柱|기둥|columna|altura/.test(
      q,
    );

  const selectedFact = isLegendQuery
    ? landmark.localLegends[0]
    : isArchitectureQuery
      ? landmark.architecturalDetails[0]
      : landmark.historicalFacts[0];

  const secondaryFact = isLegendQuery
    ? landmark.historicalFacts[0]
    : landmark.architecturalDetails[0];

  const localizedLead = landmark.localizedShortDescriptions[language] || landmark.shortDescription;

  if (language === 'en') {
    return `${localizedLead} ${selectedFact} ${secondaryFact} (Verified Archive ${landmark.archiveCode})`;
  }

  return `${localizedLead} [Verified Archive ${landmark.archiveCode}: ${selectedFact}]`;
}

export interface RagGenerationResult {
  answer: string;
  modelUsed: string;
  sourceMode: 'gemini-rag' | 'verified-rag-fallback';
}

export async function generateVerifiedGuideAnswer(params: {
  landmark: LandmarkDetail;
  question: string;
  language: SupportedLanguage;
  imageBase64?: string;
  imageMimeType?: string;
}): Promise<RagGenerationResult> {
  const { landmark, question, language, imageBase64, imageMimeType } = params;

  if (!env.isGeminiConfigured) {
    return {
      answer: buildDeterministicVerifiedFallback(landmark, question, language),
      modelUsed: 'local-verified-archive',
      sourceMode: 'verified-rag-fallback',
    };
  }

  const systemInstruction = buildVerifiedRagSystemPrompt(landmark, language);
  const promptText =
    question.trim().length > 0
      ? `Tourist question (${getLanguageName(language)}): ${question.trim()}`
      : `Please introduce ${landmark.name} to me and highlight its most fascinating verified fact and local legend in ${getLanguageName(language)}.`;

  const input = imageBase64
    ? (() => {
        const normalized = normalizeBase64Image(imageBase64, imageMimeType);
        return [
          { type: 'text' as const, text: promptText },
          {
            type: 'image' as const,
            data: normalized.data,
            mime_type: normalized.mimeType,
          },
        ];
      })()
    : promptText;

  try {
    const { text, modelUsed } = await createTextInteractionWithFallback({
      systemInstruction,
      input,
      maxOutputTokens: 450,
    });

    return {
      answer: text,
      modelUsed,
      sourceMode: 'gemini-rag',
    };
  } catch (error) {
    console.error('[ai] Gemini RAG request failed, serving verified archive fallback:', error);
    return {
      answer: buildDeterministicVerifiedFallback(landmark, question, language),
      modelUsed: 'local-verified-archive',
      sourceMode: 'verified-rag-fallback',
    };
  }
}

/**
 * Generates playable WAV audio via Gemini 3.8 Flash-Lite TTS (`gemini-3.8-flash-lite-tts`).
 * Returns base64 WAV audio directly (no manual RIFF header assembly needed on unary calls).
 */
export async function synthesizeGuideAudio(
  text: string,
  language: SupportedLanguage,
): Promise<{ audioBase64: string; audioMimeType: string } | null> {
  const client = getTtsClient();
  if (!client || !text.trim()) return null;

  // Strip any stray markdown formatting so TTS reads clean spoken prose
  const cleanTranscript = text
    .replace(/[*_#`~]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1400);

  const voice =
    SUPPORTED_LANGUAGES.find((item) => item.code === language)?.ttsVoiceHint ??
    env.GEMINI_TTS_VOICE;

  try {
    const interaction = await client.interactions.create({
      model: env.GEMINI_TTS_MODEL,
      input: [
        {
          type: 'user_input',
          content: [
            {
              type: 'text',
              text: cleanTranscript,
              annotations: [
                {
                  type: 'speech_metadata',
                  style: 'warm, friendly, knowledgeable cultural tour guide',
                },
              ],
            },
          ],
        },
      ],
      response_format: { type: 'audio' },
      generation_config: {
        speech_config: [{ voice }],
      },
      store: false,
    });

    const audio = interaction.output_audio;
    if (!audio?.data) {
      return null;
    }

    return {
      audioBase64: audio.data,
      audioMimeType: audio.mime_type || 'audio/wav',
    };
  } catch (error) {
    console.warn(`[ai-tts] Gemini TTS (${env.GEMINI_TTS_MODEL}) failed; returning text only:`, error);
    return null;
  }
}
