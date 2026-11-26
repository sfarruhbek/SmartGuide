import { Router } from 'express';
import { z } from 'zod';
import { LANGUAGE_CODES, type GuideAskResponse, type SupportedLanguage } from '@smartguide/shared';
import {
  generateVerifiedGuideAnswer,
  identifyLandmarkFromImage,
  synthesizeGuideAudio,
} from '../services/ai.service.js';
import { logTouristInteraction } from '../services/analytics.service.js';
import { getLandmarkBySlug, listLandmarkDetails } from '../services/landmark.service.js';
import { aiLimit } from '../middleware/ai-limit.js';

export const guideRouter = Router();

const askRequestSchema = z
  .object({
    landmarkSlug: z.string().trim().toLowerCase().optional(),
    question: z.string().trim().max(500).optional().default(''),
    language: z.enum(LANGUAGE_CODES as [SupportedLanguage, ...SupportedLanguage[]]).default('en'),
    sessionId: z.string().trim().min(2).max(120).default('guest-session'),
    imageBase64: z.string().max(12_000_000).optional(),
    imageMimeType: z.string().max(64).optional(),
    includeAudio: z.boolean().optional().default(true),
  })
  .refine((data) => data.question.length > 0 || Boolean(data.imageBase64), {
    message: 'Please provide either a question or a landmark photo.',
    path: ['question'],
  });

/**
 * POST /api/guide/ask
 * Identifies landmark if photo provided, injects strict verified RAG dossier,
 * generates text + Gemini TTS audio response, and logs telemetry to PostgreSQL.
 */
guideRouter.post('/ask', aiLimit, async (req, res) => {
  const startedAt = Date.now();
  const parsed = askRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid request payload',
      details: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const {
    landmarkSlug: requestedSlug,
    question,
    language,
    sessionId,
    imageBase64,
    imageMimeType,
    includeAudio,
  } = parsed.data;

  const hasImage = Boolean(imageBase64 && imageBase64.trim().length > 0);
  let targetSlug = requestedSlug;
  let identifiedByVision = false;

  if (hasImage && imageBase64) {
    const allLandmarks = await listLandmarkDetails();
    const visionResult = await identifyLandmarkFromImage(
      imageBase64,
      imageMimeType,
      allLandmarks,
      requestedSlug,
    );
    targetSlug = visionResult.slug;
    identifiedByVision = visionResult.identifiedByVision;
  }

  if (!targetSlug) {
    res.status(hasImage ? 422 : 400).json({
      error: hasImage ? 'Could not identify the photo. Please select a landmark.' : 'landmarkSlug is required when no landmark photo is uploaded.',
    });
    return;
  }

  const landmark = await getLandmarkBySlug(targetSlug);
  if (!landmark) {
    res.status(404).json({
      error: `Landmark "${targetSlug}" does not exist in the verified Ichan-Qala archive.`,
    });
    return;
  }

  const ragResult = await generateVerifiedGuideAnswer({
    landmark,
    question,
    language,
    imageBase64: hasImage ? imageBase64 : undefined,
    imageMimeType,
  });

  const ttsResult = includeAudio
    ? await synthesizeGuideAudio(ragResult.answer, language)
    : null;

  const responseTimeMs = Date.now() - startedAt;
  const loggedQuestion =
    question.length > 0
      ? question
      : `[Snap & Ask Photo] Tell me about ${landmark.name}`;

  let interactionId = 0;
  try {
    if (landmark.id > 0) {
      interactionId = await logTouristInteraction({
        landmarkId: landmark.id,
        landmarkSlug: landmark.slug,
        language,
        question: loggedQuestion,
        answerPreview: ragResult.answer,
        hasImage,
        identifiedByVision,
        sessionId,
        sourceMode: ragResult.sourceMode,
        responseTimeMs,
      });
    }
  } catch (dbErr) {
    console.warn('[guide] Failed to log analytics event to PostgreSQL:', dbErr);
  }

  const payload: GuideAskResponse = {
    interactionId,
    landmarkSlug: landmark.slug,
    landmarkName: landmark.localizedNames[language] || landmark.name,
    language,
    answer: ragResult.answer,
    audioBase64: ttsResult?.audioBase64,
    audioMimeType: ttsResult?.audioMimeType,
    identifiedByVision,
    verifiedBy: landmark.verifiedBy,
    archiveCode: landmark.archiveCode,
    modelUsed: ragResult.modelUsed,
    sourceMode: ragResult.sourceMode,
    responseTimeMs,
  };

  res.json(payload);
});
