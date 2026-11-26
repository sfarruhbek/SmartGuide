import { Router } from 'express';
import { getAnalyticsSummary } from '../services/analytics.service.js';
import { env } from '../config/env.js';

export const analyticsRouter = Router();

/**
 * GET /api/analytics/summary
 * Returns real-time B2B museum metrics from PostgreSQL for the executive dashboard.
 */
analyticsRouter.get('/summary', async (_req, res) => {
  if (env.LANDMARK_STORE === 'json') {
    res.status(503).json({ error:'Analytics requires PostgreSQL.', code:'ANALYTICS_UNAVAILABLE' });
    return;
  }
  const summary = await getAnalyticsSummary();
  res.json(summary);
});
