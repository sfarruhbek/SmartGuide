import type {
  GuideAskRequest,
  GuideAskResponse,
  LandmarkDetail,
  LandmarkSummary,
  SupportedLanguage,
} from '@smartguide/shared';

function getApiBaseUrl(): string {
  const configured = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/+$/, '');
  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;
    const isCurrentLocal = currentHost === 'localhost' || currentHost === '127.0.0.1';
    if (!isCurrentLocal && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configured)) {
      return configured.replace(/\/\/(localhost|127\.0\.0\.1)/i, `//${currentHost}`);
    }
  }
  return configured;
}

export async function fetchLandmarks(): Promise<LandmarkSummary[]> {
  const res = await fetch(`${getApiBaseUrl()}/api/landmarks`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch landmarks (${res.status})`);
  }
  const data = (await res.json()) as { landmarks: LandmarkSummary[] };
  return data.landmarks;
}

export async function fetchLandmarkBySlug(slug: string): Promise<LandmarkDetail | null> {
  const res = await fetch(`${getApiBaseUrl()}/api/landmarks/${encodeURIComponent(slug)}`, {
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to fetch landmark "${slug}" (${res.status})`);
  }
  const data = (await res.json()) as { landmark: LandmarkDetail };
  return data.landmark;
}

export async function askGuide(payload: GuideAskRequest): Promise<GuideAskResponse> {
  const res = await fetch(`${getApiBaseUrl()}/api/guide/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errBody = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(errBody?.error || `Guide request failed (${res.status})`);
  }

  return (await res.json()) as GuideAskResponse;
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
    await fetch(`${getApiBaseUrl()}/api/landmarks/${encodeURIComponent(params.slug)}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: params.sessionId,
        language: params.language,
      }),
    });
  } catch {
    // Silent fail by design (FE-04)
  }
}
