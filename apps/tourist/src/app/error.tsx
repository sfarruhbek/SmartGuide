'use client';
import { TouristStatusPage } from '@/components/TouristStatusPage';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <TouristStatusPage kind="error" onRetry={reset} />;
}
