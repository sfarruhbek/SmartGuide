import type { AnalyticsSummary, LandmarkSummary } from '@smartguide/shared';

export function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/+$/, '');
}

export function getDefaultTouristAppUrl(): string {
  return (import.meta.env.VITE_TOURIST_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
}

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  const res = await fetch(`${getApiBaseUrl()}/api/analytics/summary`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Analytics API returned HTTP ${res.status}`);
  }
  return (await res.json()) as AnalyticsSummary;
}

export async function fetchLandmarksList(): Promise<LandmarkSummary[]> {
  const res = await fetch(`${getApiBaseUrl()}/api/landmarks`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Landmarks API returned HTTP ${res.status}`);
  }
  const data = (await res.json()) as { landmarks: LandmarkSummary[] };
  return data.landmarks;
}
