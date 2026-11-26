import type {
  GuideAskRequest,
  LandmarkDetail,
  LandmarkSummary,
  SupportedLanguage,
} from '@smartguide/shared';
import type {
  FeedbackRating,
  GuideResponse,
  Roadmap,
  TravelVibe,
} from './experience';
import { requestJson } from './http';
import { LANGUAGE_CODES } from '@smartguide/shared';
export { ApiError } from './http';

export function getApiBaseUrl(): string {
  const configured = (
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  ).replace(/\/+$/, '');
  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;
    const isCurrentLocal =
      currentHost === 'localhost' || currentHost === '127.0.0.1';
    if (
      !isCurrentLocal &&
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configured)
    ) {
      if (window.location.protocol === 'https:') return window.location.origin;
      return configured.replace(
        /\/\/(localhost|127\.0\.0\.1)/i,
        `//${currentHost}`,
      );
    }
  }
  return configured;
}

export async function fetchLandmarks(): Promise<LandmarkSummary[]> {
  const data = await requestJson<{ landmarks: LandmarkSummary[] }>(
    `${getApiBaseUrl()}/api/landmarks`,
    {
      cache: 'no-store',
    },
  );
  if (!Array.isArray(data.landmarks)) throw new Error('Invalid landmark list');
  return data.landmarks;
}

export async function fetchLandmarkBySlug(
  slug: string,
): Promise<LandmarkDetail | null> {
  const res = await fetch(
    `${getApiBaseUrl()}/api/landmarks/${encodeURIComponent(slug)}`,
    {
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    },
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to fetch landmark "${slug}" (${res.status})`);
  }
  const data = (await res.json()) as { landmark: LandmarkDetail };
  return data.landmark;
}

export async function askGuide(
  payload: GuideAskRequest & { roadmapId?: number },
  options: { signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<GuideResponse> {
  const data = await requestJson<GuideResponse>(
    `${getApiBaseUrl()}/api/guide/ask`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: options.signal,
    },
    options.timeoutMs ?? 45000,
  );
  if (
    typeof data.answer !== 'string' ||
    !data.answer.trim() ||
    typeof data.landmarkSlug !== 'string' ||
    typeof data.landmarkName !== 'string' ||
    !LANGUAGE_CODES.includes(data.language) ||
    !Number.isFinite(data.interactionId) ||
    typeof data.identifiedByVision !== 'boolean' ||
    (data.audioBase64 !== undefined && typeof data.audioBase64 !== 'string') ||
    (data.audioMimeType !== undefined && typeof data.audioMimeType !== 'string')
  )
    throw new Error('Invalid guide response');
  return data;
}

export async function generateRoadmap(payload: {
  sessionId: string;
  language: SupportedLanguage;
  durationMinutes: 60 | 120 | 240;
  vibes: TravelVibe[];
}): Promise<Roadmap> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 35000);
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/roadmap/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok)
      throw new Error(`Roadmap unavailable (${response.status})`);
    return (await response.json()) as Roadmap;
  } finally {
    clearTimeout(timer);
  }
}

export async function sendGuideFeedback(
  interactionId: number,
  rating: FeedbackRating,
): Promise<void> {
  const result = await requestJson<{ ok?: boolean }>(
    `${getApiBaseUrl()}/api/guide/feedback`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interactionId, rating }),
    },
  );
  if (result.ok !== true) throw new Error('Feedback not saved');
}

/**
 * Fires a lightweight QR scan telemetry event when a tourist opens a monument page.
 * Fails silently so UX is never disrupted if the scan endpoint is offline.
 */
export async function trackLandmarkScan(params: {
  slug: string;
  sessionId: string;
  language: SupportedLanguage;
}): Promise<void> {
  try {
    await fetch(
      `${getApiBaseUrl()}/api/landmarks/${encodeURIComponent(params.slug)}/scan`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: params.sessionId,
          language: params.language,
        }),
      },
    );
  } catch {
    // Silent fail by design (FE-04)
  }
}
