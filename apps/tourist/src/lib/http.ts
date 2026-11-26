export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
export async function requestJson<T>(
  url: string,
  init: RequestInit = {},
  timeoutMs = 10000,
): Promise<T> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (init.signal?.aborted) abort();
  else init.signal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(abort, timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok)
      throw new ApiError(
        typeof (data as { error?: unknown })?.error === 'string'
          ? (data as { error: string }).error
          : `Request failed (${response.status})`,
        response.status,
      );
    if (data === null) throw new Error('Invalid API response');
    return data as T;
  } finally {
    clearTimeout(timer);
    init.signal?.removeEventListener('abort', abort);
  }
}
