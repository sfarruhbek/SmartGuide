import { TouristHomeClient } from '@/components/TouristHomeClient';

export const dynamic = 'force-dynamic';

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const key of ['view', 'city', 'place', 'collection', 'day'])
    if (typeof params[key] === 'string') query.set(key, params[key]);
  return (
    <TouristHomeClient
      initialLang={typeof params.lang === 'string' ? params.lang : undefined}
      initialQuery={query.toString()}
    />
  );
}
