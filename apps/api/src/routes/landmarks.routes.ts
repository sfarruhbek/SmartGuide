import { Router } from 'express';
import {
  getLandmarkBySlugWithSource,
  listLandmarkSummariesWithSource,
} from '../services/landmark.service.js';

export const landmarksRouter = Router();

/**
 * GET /api/landmarks
 * Lists all 5 verified Ichan-Qala landmarks with QR slugs and localized summaries.
 */
landmarksRouter.get('/', async (_req, res) => {
  const { landmarks, landmarkStore } = await listLandmarkSummariesWithSource();
  res.json({
    site: 'Ichan-Qala, Khiva',
    count: landmarks.length,
    landmarkStore,
    landmarks,
  });
});

/**
 * GET /api/landmarks/:slug
 * Returns full verified museum dossier for a specific landmark.
 */
landmarksRouter.get('/:slug', async (req, res) => {
  const slug = String(req.params.slug ?? '').trim().toLowerCase();
  if (!slug) {
    res.status(400).json({ error: 'Landmark slug is required.' });
    return;
  }

  const { landmark, landmarkStore } = await getLandmarkBySlugWithSource(slug);
  if (!landmark) {
    res.status(404).json({
      error: `Landmark "${slug}" was not found in the verified Ichan-Qala archive.`,
    });
    return;
  }

  res.json({ landmark, landmarkStore });
});
