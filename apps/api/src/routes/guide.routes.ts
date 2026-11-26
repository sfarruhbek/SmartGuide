import { Router } from 'express';
import { z } from 'zod';
import {
  LANGUAGE_CODES,
  type GuideAnalyticsStatus,
  type GuideAskResponse,
  type GuideAudioStatus,
  type SupportedLanguage,
} from '@smartguide/shared';
import { env } from '../config/env.js';
import {
  generateVerifiedGuideAnswer,
  identifyLandmarkFromImage,
  synthesizeGuideAudio,
} from '../services/ai.service.js';
import { logTouristInteraction } from '../services/analytics.service.js';
import {
  getLandmarkBySlugWithSource,
  listLandmarkDetails,
} from '../services/landmark.service.js';
import { aiLimit } from '../middleware/ai-limit.js';
import { createRequestAbort } from '../middleware/request-abort.js';

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
 * generates text + optional Gemini TTS within a single bounded deadline,
 * and logs telemetry to PostgreSQL without fabricating IDs.
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

  const budget = createRequestAbort(req, res, env.GUIDE_REQUEST_TIMEOUT_MS);

  try {
    const hasImage = Boolean(imageBase64 && imageBase64.trim().length > 0);
    let targetSlug = requestedSlug;
    let identifiedByVision = false;

    if (hasImage && imageBase64) {
      const allLandmarks = await listLandmarkDetails();
      if (budget.isClientDisconnected()) return;
      const visionTimeoutMs = Math.min(
        12_000,
        Math.max(1_000, budget.remainingMs() - 12_000),
      );
      const visionResult = await identifyLandmarkFromImage(
        imageBase64,
        imageMimeType,
        allLandmarks,
        requestedSlug,
        { signal: budget.signal, timeoutMs: visionTimeoutMs },
      );
      if (budget.isClientDisconnected()) return;
      targetSlug = visionResult.slug;
      identifiedByVision = visionResult.identifiedByVision;
    }

    if (!targetSlug) {
      res.status(hasImage ? 422 : 400).json({
        error: hasImage
          ? 'Could not identify the photo. Please select a landmark.'
          : 'landmarkSlug is required when no landmark photo is uploaded.',
      });
      return;
    }

    const { landmark, landmarkStore } = await getLandmarkBySlugWithSource(targetSlug);
    if (budget.isClientDisconnected()) return;
    if (!landmark) {
      res.status(404).json({
        error: `Landmark "${targetSlug}" does not exist in the verified Ichan-Qala archive.`,
      });
      return;
    }

    // Reserve minimal tail time so response assembly completes before client timeout.
    const ragTimeoutMs = Math.max(
      1_000,
      budget.remainingMs() - (includeAudio ? 2_000 : 500),
    );
    const ragResult = await generateVerifiedGuideAnswer({
      landmark,
      question,
      language,
      imageBase64: hasImage ? imageBase64 : undefined,
      imageMimeType,
      signal: budget.signal,
      timeoutMs: ragTimeoutMs,
    });
    if (budget.isClientDisconnected()) return;

    let ttsResult: { audioBase64: string; audioMimeType: string } | null = null;
    let audioStatus: GuideAudioStatus = 'not-requested';
    if (includeAudio) {
      const ttsRemainingMs = budget.remainingMs();
      if (ttsRemainingMs < env.GUIDE_MIN_TTS_BUDGET_MS) {
        audioStatus = 'skipped-deadline';
      } else {
        ttsResult = await synthesizeGuideAudio(ragResult.answer, language, {
          signal: budget.signal,
          timeoutMs: ttsRemainingMs,
        });
        if (budget.isClientDisconnected()) return;
        audioStatus = ttsResult
          ? 'included'
          : budget.remainingMs() <= 0 || budget.isDeadlineExceeded()
            ? 'skipped-deadline'
            : 'unavailable';
      }
    }

    const responseTimeMs = Date.now() - startedAt;
    const loggedQuestion =
      question.length > 0
        ? question
        : `[Snap & Ask Photo] Tell me about ${landmark.name}`;

    let interactionId = 0;
    let analyticsRecorded = false;
    let analyticsStatus: GuideAnalyticsStatus =
      env.LANDMARK_STORE === 'json' ? 'skipped-json-store' : 'db-unavailable';

    if (env.LANDMARK_STORE === 'postgres' && landmarkStore === 'postgres' && landmark.id > 0) {
      try {
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
        analyticsRecorded = interactionId > 0;
        analyticsStatus = analyticsRecorded ? 'recorded' : 'write-failed';
      } catch (dbErr) {
        analyticsRecorded = false;
        analyticsStatus = 'write-failed';
        console.warn(
          '[guide] Failed to log analytics event to PostgreSQL:',
          dbErr instanceof Error ? dbErr.message : String(dbErr),
        );
      }
    }

    console.info(
      '[guide/ask]',
      JSON.stringify({
        landmarkSlug: landmark.slug,
        language,
        hasImage,
        identifiedByVision,
        sourceMode: ragResult.sourceMode,
        modelUsed: ragResult.modelUsed,
        fallbackReason: ragResult.fallbackReason ?? null,
        audioStatus,
        landmarkStore,
        analyticsRecorded,
        analyticsStatus,
        responseTimeMs,
      }),
    );

    if (res.headersSent || budget.isClientDisconnected()) return;

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
      analyticsRecorded,
      analyticsStatus,
      landmarkStore,
      audioStatus,
    };

    res.json(payload);
  } finally {
    budget.cleanup();
  }
});
