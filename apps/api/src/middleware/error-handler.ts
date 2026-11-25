import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('[api] Unhandled error:', err);

  const statusCode =
    typeof err === 'object' &&
    err !== null &&
    'status' in err &&
    typeof (err as { status?: unknown }).status === 'number'
      ? (err as { status: number }).status
      : 500;

  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Internal server error' : String(err?.message ?? 'Request failed'),
  });
};
