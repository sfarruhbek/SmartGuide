import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Activity,
  BarChart3,
  Calculator,
  Compass,
  Download,
  QrCode,
  RefreshCw,
  ShieldCheck,
  WifiOff,
} from 'lucide-react';
import type { AnalyticsSummary, LandmarkSummary, RecentQuestionItem } from '@smartguide/shared';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { KpiCards } from './components/KpiCards';
import { LiveArrivalBanner } from './components/LiveArrivalBanner';
import { LiveQuestionsFeed } from './components/LiveQuestionsFeed';
import { QrCodeGenerator } from './components/QrCodeGenerator';
import { RevenueSimulator } from './components/RevenueSimulator';
import { exportAnalyticsCsv, fetchAnalyticsSummary, fetchLandmarksList } from './lib/api';

const POLL_INTERVAL_MS = 5000;

export function App() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'calculator' | 'qr'>('analytics');
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [landmarks, setLandmarks] = useState<LandmarkSummary[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedIds, setHighlightedIds] = useState<Set<number>>(new Set());
  const [liveBannerItem, setLiveBannerItem] = useState<RecentQuestionItem | null>(null);

  const seenQuestionIdsRef = useRef<Set<number>>(new Set());
  const isFirstFetchRef = useRef<boolean>(true);
  const bannerTimeoutRef = useRef<number | null>(null);

  const loadAnalytics = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const nextData = await fetchAnalyticsSummary();
      setSummary(nextData);
      setError(null);

      // Remember initial IDs without firing banner on first render (FE-09)
      if (isFirstFetchRef.current) {
        seenQuestionIdsRef.current = new Set(nextData.recentQuestions.map((q) => q.id));
        isFirstFetchRef.current = false;
      } else {
        const newlyArrivedItems = nextData.recentQuestions.filter(
          (q) => !seenQuestionIdsRef.current.has(q.id),
        );

        if (newlyArrivedItems.length > 0) {
          const newlyArrivedIds = newlyArrivedItems.map((q) => q.id);
          for (const id of newlyArrivedIds) {
            seenQuestionIdsRef.current.add(id);
          }

          setHighlightedIds((prev) => new Set([...prev, ...newlyArrivedIds]));
          setTimeout(() => {
            setHighlightedIds((prev) => {
              const copy = new Set(prev);
              for (const id of newlyArrivedIds) copy.delete(id);
              return copy;
            });
          }, 12_000);

          // Display high-contrast projector arrival banner for 7s
          setLiveBannerItem(newlyArrivedItems[0]);
          if (bannerTimeoutRef.current !== null) {
            window.clearTimeout(bannerTimeoutRef.current);
          }
          bannerTimeoutRef.current = window.setTimeout(() => {
            setLiveBannerItem(null);
          }, 7000);
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

    return () => {
      window.clearInterval(intervalId);
      if (bannerTimeoutRef.current !== null) {
        window.clearTimeout(bannerTimeoutRef.current);
      }
    };
  }, [loadAnalytics]);

  const handleExportCsv = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await exportAnalyticsCsv(summary?.recentQuestions ?? []);
    } finally {
      setIsExporting(false);
    }
  };

  const isReconnecting = Boolean(error && summary);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-14 text-[#0F172A]">
      {/* FE-09: Projector-visible Live Arrival Banner */}
      <LiveArrivalBanner
        item={liveBannerItem}
        onDismiss={() => setLiveBannerItem(null)}
      />

      {/* Clean Light Enterprise Header */}
      <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#0E7470]/25 bg-[#EEF7F6]">
              <Compass className="h-5 w-5 text-[#0E7470]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg font-bold tracking-tight text-[#0F172A]">
                  SmartGuide <span className="text-[#0E7470]">B2B</span>
                </h1>
                <span className="hidden items-center gap-1 rounded-full border border-[#B47B38]/30 bg-[#FDF6EC] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#B47B38] sm:inline-flex">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Museum Admin</span>
                </span>
              </div>
              <p className="text-xs text-[#475569]">
                {summary?.siteName ?? 'Ichan-Qala State Museum-Reserve · Khiva'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* 3 Navigation Tabs */}
            <nav className="flex rounded-xl border border-slate-200 bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={[
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer',
                  activeTab === 'analytics'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#475569] hover:text-[#0F172A]',
                ].join(' ')}
              >
                <BarChart3 className="h-3.5 w-3.5 text-[#0E7470]" />
                <span>Live Analytics</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('calculator')}
                className={[
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer',
                  activeTab === 'calculator'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#475569] hover:text-[#0F172A]',
                ].join(' ')}
              >
                <Calculator className="h-3.5 w-3.5 text-[#059669]" />
                <span>Revenue Calculator</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('qr')}
                className={[
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer',
                  activeTab === 'qr'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#475569] hover:text-[#0F172A]',
                ].join(' ')}
              >
                <QrCode className="h-3.5 w-3.5 text-[#B47B38]" />
                <span>QR Code Generator</span>
              </button>
            </nav>

            {/* Single Clean Live Sync / Reconnecting Badge */}
            {isReconnecting ? (
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
                <WifiOff className="h-3.5 w-3.5" />
                <span>Reconnecting...</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold tracking-wide text-[#059669]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#059669] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#059669]" />
                </span>
                <span>LIVE SYNC</span>
              </div>
            )}

            {/* FE-11: Export CSV Button */}
            <button
              type="button"
              onClick={() => void handleExportCsv()}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] shadow-2xs transition hover:border-[#0E7470]/45 hover:bg-[#EEF7F6] disabled:opacity-50 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-[#0E7470]" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => void loadAnalytics(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#475569] transition hover:border-[#0E7470]/45 hover:text-[#0E7470] cursor-pointer"
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
        {/* Initial API Connection Issue (only before data has loaded; afterwards we preserve charts + show Reconnecting badge) */}
        {error && !summary && (
          <div className="no-print rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <strong>API Connection Issue:</strong> {error}. Make sure <code>apps/api</code> and
            PostgreSQL are running on port 4000.
          </div>
        )}

        {activeTab === 'analytics' &&
          (summary ? (
            <>
              <KpiCards data={summary} />
              <AnalyticsCharts data={summary} />
              <LiveQuestionsFeed
                questions={summary.recentQuestions}
                highlightedIds={highlightedIds}
                landmarks={landmarks}
              />
              <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4 text-xs text-[#475569]">
                <span className="inline-flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-[#0E7470]" />
                  B2B2C Revenue Share Model: 70% SmartGuide / 30% Museum · Verified Local RAG
                </span>
                <span className="tabular-nums">
                  Last synced: {new Date(summary.updatedAt).toLocaleTimeString()}
                </span>
              </footer>
            </>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-[#475569] shadow-xs">
              Loading real-time Ichan-Qala analytics from PostgreSQL...
            </div>
          ))}

        {activeTab === 'calculator' && <RevenueSimulator />}

        {activeTab === 'qr' && <QrCodeGenerator landmarks={landmarks} />}
      </main>
    </div>
  );
}
