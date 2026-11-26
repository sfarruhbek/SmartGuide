import type { LandmarkSummary } from '@smartguide/shared';
import type { ExperienceAnalytics, ExperienceQuestion } from './experience';

function resolveLocalHostUrl(configured: string): string {
  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;
    const isCurrentLocal =
      currentHost === 'localhost' || currentHost === '127.0.0.1';
    if (
      !isCurrentLocal &&
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configured)
    ) {
      return configured.replace(
        /\/\/(localhost|127\.0\.0\.1)/i,
        `//${currentHost}`,
      );
    }
  }
  return configured;
}

export function getApiBaseUrl(): string {
  const configured = (
    import.meta.env.VITE_API_URL || 'http://localhost:4000'
  ).replace(/\/+$/, '');
  return resolveLocalHostUrl(configured);
}

export function getDefaultTouristAppUrl(): string {
  const configured = (
    import.meta.env.VITE_TOURIST_APP_URL || 'http://localhost:3000'
  ).replace(/\/+$/, '');
  return resolveLocalHostUrl(configured);
}

export async function fetchAnalyticsSummary(): Promise<ExperienceAnalytics> {
  const res = await fetch(`${getApiBaseUrl()}/api/analytics/summary`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Analytics API returned HTTP ${res.status}`);
  }
  return (await res.json()) as ExperienceAnalytics;
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

function escapeCsvCell(value: string | number | boolean): string {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function triggerFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Downloads analytics CSV from backend GET /api/analytics/export,
 * falling back to UTF-8 BOM client-side CSV generation from recentQuestions.
 */
export async function exportAnalyticsCsv(
  fallbackQuestions: ExperienceQuestion[],
): Promise<void> {
  const filename = 'smartguide-ichan-qala-analytics.csv';

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/analytics/export`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (
        contentType.includes('text/csv') ||
        contentType.includes('text/plain')
      ) {
        const text = await res.text();
        const withBom = text.startsWith('\uFEFF') ? text : `\uFEFF${text}`;
        const blob = new Blob([withBom], { type: 'text/csv;charset=utf-8;' });
        triggerFileDownload(blob, filename);
        return;
      }
    }
  } catch {
    // Fall back to client-side CSV generation if backend endpoint is unavailable
  }

  const headers = [
    'ID',
    'Timestamp_UTC',
    'Landmark_Slug',
    'Landmark_Name',
    'Language',
    'Session_ID',
    'Snap_And_Ask',
    'Question',
    'Answer_Preview',
    'Detected_Topic',
    'Sentiment',
    'Interest_Score',
    'User_Feedback',
  ];

  const rows = fallbackQuestions.map((item) =>
    [
      escapeCsvCell(item.id),
      escapeCsvCell(item.createdAt),
      escapeCsvCell(item.landmarkSlug),
      escapeCsvCell(item.landmarkName),
      escapeCsvCell(item.language),
      escapeCsvCell(item.sessionId),
      escapeCsvCell(item.hasImage ? 'Yes' : 'No'),
      escapeCsvCell(item.question),
      escapeCsvCell(item.answerPreview),
      escapeCsvCell(
        item.detectedTopicLabel ??
          item.insight?.detectedTopicLabel ??
          item.detectedTopic ??
          '',
      ),
      escapeCsvCell(item.sentiment ?? item.insight?.sentiment ?? ''),
      escapeCsvCell(item.interestScore ?? item.insight?.interestScore ?? ''),
      escapeCsvCell(item.userFeedback ?? ''),
    ].join(','),
  );

  const csvBody = `\uFEFF${headers.join(',')}\r\n${rows.join('\r\n')}`;
  const blob = new Blob([csvBody], { type: 'text/csv;charset=utf-8;' });
  triggerFileDownload(blob, filename);
}
