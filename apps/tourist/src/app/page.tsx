import type { LandmarkSummary } from '@smartguide/shared';
import { TouristHomeClient } from '@/components/TouristHomeClient';
import { fetchLandmarks } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface HomePageProps {
  searchParams: Promise<{ lang?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { lang } = await searchParams;
  let landmarks: LandmarkSummary[] = [];
  try {
    landmarks = await fetchLandmarks();
  } catch {
    // TouristHomeClient retries client-side if API was still booting during SSR
    landmarks = [];
  }

  return <TouristHomeClient initialLandmarks={landmarks} initialLang={lang} />;
}
