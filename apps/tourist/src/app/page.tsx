import { TouristHomeClient } from '@/components/TouristHomeClient';

export const dynamic = 'force-dynamic';

interface HomePageProps {
  searchParams: Promise<{ lang?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { lang } = await searchParams;
  return <TouristHomeClient initialLang={lang} />;
}
