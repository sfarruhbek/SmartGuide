import type { Request, Response } from 'express';

export interface RequestAbortContext {
  signal: AbortSignal;
  remainingMs: () => number;
  isClientDisconnected: () => boolean;
  isDeadlineExceeded: () => boolean;
  cleanup: () => void;
}

/**
 * Links an AbortController to both client HTTP disconnect (before response ends)
 * and an optional total server-side request deadline.
 */
export function createRequestAbort(
  _req: Request,
  res: Response,
  deadlineMs?: number,
): RequestAbortContext {
  const controller = new AbortController();
  const startedAt = Date.now();
  const deadlineAt = deadlineMs !== undefined ? startedAt + deadlineMs : Number.POSITIVE_INFINITY;
  let clientDisconnected = false;
  let deadlineExceeded = false;

  const onClose = () => {
    if (!res.writableEnded) {
      clientDisconnected = true;
      if (!controller.signal.aborted) {
        controller.abort(new Error('client-disconnected'));
      }
    }
  };

  res.once('close', onClose);

  let timer: ReturnType<typeof setTimeout> | undefined;
  if (deadlineMs !== undefined && Number.isFinite(deadlineMs)) {
    timer = setTimeout(() => {
      deadlineExceeded = true;
      if (!controller.signal.aborted) {
        controller.abort(new Error('request-deadline'));
      }
    }, Math.max(1, deadlineMs));
  }

  return {
    signal: controller.signal,
    remainingMs: () =>
      deadlineMs !== undefined ? Math.max(0, deadlineAt - Date.now()) : Number.POSITIVE_INFINITY,
    isClientDisconnected: () => clientDisconnected,
    isDeadlineExceeded: () => deadlineExceeded || Date.now() >= deadlineAt,
    cleanup: () => {
      res.off('close', onClose);
      if (timer) clearTimeout(timer);
    },
  };
}
