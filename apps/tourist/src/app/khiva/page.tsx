import { KhivaPilotClient } from '@/components/KhivaPilotClient';
import { fetchLandmarks } from '@/lib/api';
export const dynamic = 'force-dynamic';
export default async function KhivaPilot({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const landmarks = await fetchLandmarks().catch(() => []);
  return <KhivaPilotClient initialLandmarks={landmarks} initialLang={lang} />;
}
