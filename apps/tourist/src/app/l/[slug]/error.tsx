'use client';

import Link from 'next/link';
import { ArrowLeft, Compass, RefreshCw } from 'lucide-react';

export default function LandmarkError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center bg-[#FAF8F5] px-6 text-center text-[#14181F]">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#EAE6DF] bg-white shadow-sm">
        <Compass className="h-7 w-7 text-[#0E7470]" />
      </div>
      <h1 className="mt-5 font-display text-2xl font-semibold text-[#14181F]">
        Archive Temporarily Unavailable
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-[#5C6370]">
        We could not reach the SmartGuide museum archive right now. Please try reconnecting in a
        moment.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0E7470] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0A5C59] cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry</span>
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-[#EAE6DF] bg-white px-5 py-2.5 text-sm font-semibold text-[#14181F] shadow-xs transition hover:border-[#0E7470]/45"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>All Monuments</span>
        </Link>
      </div>
    </main>
  );
}
