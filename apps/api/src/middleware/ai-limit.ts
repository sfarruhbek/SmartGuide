import type { RequestHandler } from 'express';
import { env } from '../config/env.js';

const requests = new Map<string, { count: number; reset: number }>();
let active = 0;
/** Single-instance demo limits. Use a shared store and authenticated quotas when deployed at scale. */
export const aiLimit: RequestHandler = (req, res, next) => {
  const now = Date.now();
  for (const [key, value] of requests) if (value.reset <= now) requests.delete(key);
  const id = req.ip ?? 'unknown';
  const bucket = requests.get(id) ?? { count: 0, reset: now + 60_000 };
  if (bucket.count >= env.AI_REQUESTS_PER_MINUTE || (!requests.has(id) && requests.size >= 10_000)) {
    res.setHeader('Retry-After', Math.max(1, Math.ceil((bucket.reset - now) / 1000)));
    res.status(429).json({ error: 'Too many AI requests. Please try again shortly.' });
    return;
  }
  if (active >= env.AI_MAX_CONCURRENT) {
    res.setHeader('Retry-After', '5');
    res.status(503).json({ error: 'AI service is busy. Please try again shortly.' });
    return;
  }
  bucket.count++; requests.set(id, bucket); active++;
  let released = false;
  const release = () => { if (!released) { released = true; active--; } };
  res.once('finish', release); res.once('close', release);
  next();
};
