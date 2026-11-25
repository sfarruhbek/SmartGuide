import { Router } from 'express';
import { getAnalyticsSummary } from '../services/analytics.service.js';

export const analyticsRouter = Router();

/**
 * GET /api/analytics/summary
 * Returns real-time B2B museum metrics from PostgreSQL for the executive dashboard.
 */
analyticsRouter.get('/summary', async (_req, res) => {
  const summary = await getAnalyticsSummary();
  res.json(summary);
});
