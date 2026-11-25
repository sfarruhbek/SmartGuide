import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function LandmarkNotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-400/10">
        <Compass className="h-7 w-7 text-amber-300" />
      </div>
      <h1 className="mt-4 font-display text-2xl font-bold text-white">Landmark Not Found</h1>
      <p className="mt-2 text-sm text-slate-400">
        This QR code does not match one of the 5 verified Ichan-Qala monuments yet.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-950 hover:brightness-110 transition"
      >
        Explore All 5 Khiva Landmarks
      </Link>
    </main>
  );
}
