import { Router } from 'express';
import { getLandmarkBySlug, listLandmarkSummaries } from '../services/landmark.service.js';

export const landmarksRouter = Router();

/**
 * GET /api/landmarks
 * Lists all 5 verified Ichan-Qala landmarks with QR slugs and localized summaries.
 */
landmarksRouter.get('/', async (_req, res) => {
  const landmarks = await listLandmarkSummaries();
  res.json({
    site: 'Ichan-Qala, Khiva',
    count: landmarks.length,
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

  const landmark = await getLandmarkBySlug(slug);
  if (!landmark) {
    res.status(404).json({
      error: `Landmark "${slug}" was not found in the verified Ichan-Qala archive.`,
    });
    return;
  }

  res.json({ landmark });
});
