import { Router } from 'express';
import { aiLimit } from '../middleware/ai-limit.js';
import { tripInputSchema } from '../planner/catalog.js';
import { planTrip } from '../planner/service.js';

export const tripsRouter = Router();
tripsRouter.post('/generate', aiLimit, async (req, res) => {
  const parsed = tripInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid trip preferences', details: parsed.error.flatten().fieldErrors });
    return;
  }
  res.json(await planTrip(parsed.data));
});
