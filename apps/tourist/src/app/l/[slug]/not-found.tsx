import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function LandmarkNotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center bg-[#FAF8F5] px-6 text-center text-[#14181F]">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#EAE6DF] bg-white shadow-sm">
        <Compass className="h-7 w-7 text-[#0E7470]" />
      </div>
      <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-[#14181F]">
        Landmark Not Found
      </h1>
      <p className="mt-2.5 text-sm leading-relaxed text-[#5C6370]">
        This QR plaque does not match one of the 5 verified Ichan-Qala monuments in our museum archive.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0E7470] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0A5C59]"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Explore All 5 Khiva Landmarks</span>
      </Link>
    </main>
  );
}
