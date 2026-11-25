import { notFound } from 'next/navigation';
import { LandmarkGuideClient } from '@/components/LandmarkGuideClient';
import { fetchLandmarkBySlug } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface LandmarkPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export default async function LandmarkPage({ params, searchParams }: LandmarkPageProps) {
  const { slug } = await params;
  const { lang } = await searchParams;

  const landmark = await fetchLandmarkBySlug(slug);
  if (!landmark) {
    notFound();
  }

  return <LandmarkGuideClient landmark={landmark} initialLang={lang} />;
}
