import type {
  GuideAskRequest,
  GuideAskResponse,
  LandmarkDetail,
  LandmarkSummary,
} from '@smartguide/shared';

function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/+$/, '');
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
