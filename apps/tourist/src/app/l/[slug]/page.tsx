import { notFound } from 'next/navigation';
import type { LandmarkSummary } from '@smartguide/shared';
import { LandmarkGuideClient } from '@/components/LandmarkGuideClient';
import { fetchLandmarkBySlug, fetchLandmarks } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface LandmarkPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string; roadmapId?: string }>;
}

export default async function LandmarkPage({ params, searchParams }: LandmarkPageProps) {
  const { slug } = await params;
  const { lang, roadmapId } = await searchParams;

  const [landmark, allLandmarks] = await Promise.all([
    fetchLandmarkBySlug(slug),
    fetchLandmarks().catch((): LandmarkSummary[] => []),
  ]);

  if (!landmark) {
    notFound();
  }

  return (
    <LandmarkGuideClient
      key={landmark.slug}
      landmark={landmark}
      allLandmarks={allLandmarks}
      initialLang={lang}
      initialRoadmapId={roadmapId}
    />
  );
}
