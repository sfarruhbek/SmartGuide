import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Activity,
  BarChart3,
  Compass,
  QrCode,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import type { AnalyticsSummary, LandmarkSummary } from '@smartguide/shared';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { KpiCards } from './components/KpiCards';
import { LiveQuestionsFeed } from './components/LiveQuestionsFeed';
import { QrCodeGenerator } from './components/QrCodeGenerator';
import { fetchAnalyticsSummary, fetchLandmarksList } from './lib/api';

const POLL_INTERVAL_MS = 5000;

export function App() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'qr'>('analytics');
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [landmarks, setLandmarks] = useState<LandmarkSummary[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedIds, setHighlightedIds] = useState<Set<number>>(new Set());

  const seenQuestionIdsRef = useRef<Set<number>>(new Set());
  const isFirstFetchRef = useRef<boolean>(true);

  const loadAnalytics = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const nextData = await fetchAnalyticsSummary();
      setSummary(nextData);
      setError(null);

      // Highlight newly arriving interactions during live demo polling
      if (isFirstFetchRef.current) {
        seenQuestionIdsRef.current = new Set(nextData.recentQuestions.map((q) => q.id));
        isFirstFetchRef.current = false;
      } else {
        const newlyArrived = nextData.recentQuestions
          .map((q) => q.id)
          .filter((id) => !seenQuestionIdsRef.current.has(id));

        if (newlyArrived.length > 0) {
          for (const id of newlyArrived) {
            seenQuestionIdsRef.current.add(id);
          }
          setHighlightedIds((prev) => new Set([...prev, ...newlyArrived]));
          setTimeout(() => {
            setHighlightedIds((prev) => {
              const copy = new Set(prev);
              for (const id of newlyArrived) copy.delete(id);
              return copy;
            });
          }, 12_000);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach SmartGuide API');
    } finally {
      if (showSpinner) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadAnalytics(true);
    fetchLandmarksList()
      .then(setLandmarks)
      .catch(() => {});

    const intervalId = window.setInterval(() => {
      void loadAnalytics(false);
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [loadAnalytics]);

  return (
    <div className="min-h-screen pb-14">
      {/* Executive Header */}
      <header className="no-print sticky top-0 z-30 border-b border-slate-800/90 bg-[#080C15]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/40 bg-gradient-to-br from-amber-400/20 to-teal-500/20">
              <Compass className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg font-bold tracking-wide text-white">
                  SmartGuide <span className="text-amber-300">B2B</span>
                </h1>
                <span className="hidden rounded-full border border-teal-400/35 bg-teal-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-teal-200 sm:inline-flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Museum Admin Portal
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {summary?.siteName ?? 'Ichan-Qala State Museum-Reserve · Khiva'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Navigation Tabs */}
            <nav className="flex rounded-xl border border-slate-800 bg-slate-950 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={[
                  'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer',
                  activeTab === 'analytics'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'text-slate-300 hover:text-white',
                ].join(' ')}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Live Analytics
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('qr')}
                className={[
                  'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer',
                  activeTab === 'qr'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'text-slate-300 hover:text-white',
                ].join(' ')}
              >
                <QrCode className="h-3.5 w-3.5" />
                QR Code Generator
              </button>
            </nav>

            {/* Live 5s Polling Pill */}
            <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span>LIVE · 5s</span>
            </div>

            <button
              type="button"
              onClick={() => void loadAnalytics(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:border-amber-400/50 hover:text-amber-200 transition cursor-pointer"
              title="Refresh now"
              aria-label="Refresh analytics"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl space-y-6 px-4 pt-6 sm:px-6">
        {error && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-950/50 p-4 text-sm text-rose-200">
            <strong>API Connection Issue:</strong> {error}. Make sure <code>apps/api</code> and
            PostgreSQL are running on port 4000.
          </div>
        )}

        {activeTab === 'analytics' ? (
          summary ? (
            <>
              <KpiCards data={summary} />
              <AnalyticsCharts data={summary} />
              <LiveQuestionsFeed
                questions={summary.recentQuestions}
                highlightedIds={highlightedIds}
              />
              <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-teal-400" />
                  B2B2C Revenue Share Model: 70% SmartGuide / 30% Museum · Verified Local RAG
                </span>
                <span>
                  Last synced: {new Date(summary.updatedAt).toLocaleTimeString()}
                </span>
              </footer>
            </>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 text-sm text-slate-400">
              Loading real-time Ichan-Qala analytics from PostgreSQL...
            </div>
          )
        ) : (
          <QrCodeGenerator landmarks={landmarks} />
        )}
      </main>
    </div>
  );
}
