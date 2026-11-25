import { Camera, DollarSign, Landmark, MessageSquareText, Users } from 'lucide-react';
import type { AnalyticsSummary } from '@smartguide/shared';

interface KpiCardsProps {
  data: AnalyticsSummary;
}

export function KpiCards({ data }: KpiCardsProps) {
  const { revenue } = data;

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Total Tourists */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Tourists
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/15 text-teal-300">
            <Users className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold tabular-nums text-white">{data.totalTourists}</span>
          <span className="text-xs font-medium text-teal-300">unique sessions</span>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Avg <span className="font-semibold text-slate-200">{data.avgQuestionsPerTourist}</span>{' '}
          AI questions per tourist
        </p>
      </div>

      {/* Total AI Interactions */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total AI Interactions
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
            <MessageSquareText className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold tabular-nums text-white">
            {data.totalInteractions}
          </span>
          <span className="text-xs font-medium text-sky-300">verified answers</span>
        </div>
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-400">
          <Camera className="h-3.5 w-3.5 text-amber-300" />
          <span>
            <strong className="text-slate-200">{data.totalPhotoScans}</strong> Snap &amp; Ask photo
            recognitions
          </span>
        </p>
      </div>

      {/* Top Landmark */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Top Landmark
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300">
            <Landmark className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="truncate font-display text-xl font-bold text-amber-200">
            {data.topLandmark?.name ?? 'No visits yet'}
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          {data.topLandmark ? (
            <>
              <strong className="text-slate-200">{data.topLandmark.visits}</strong> interactions (
              <strong className="text-amber-300">{data.topLandmark.sharePercent}%</strong> of site
              traffic)
            </>
          ) : (
            'Waiting for first QR scan'
          )}
        </p>
      </div>

      {/* Estimated Revenue Share */}
      <div className="rounded-2xl border border-amber-400/35 bg-gradient-to-br from-slate-900/95 via-slate-900 to-amber-950/30 p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
            Est. Revenue Share
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300">
            <DollarSign className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold tabular-nums text-white">
            ${revenue.grossRevenueUsd.toFixed(2)}
          </span>
          <span className="text-xs text-slate-400">(${revenue.pricePerTouristUsd}/tourist)</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-xs">
          <span className="text-emerald-300 font-semibold">
            Museum {revenue.museumSharePercent}%: ${revenue.museumShareUsd.toFixed(2)}
          </span>
          <span className="text-slate-400">
            Margin: <strong className="text-amber-200">{revenue.grossMarginPercent}%</strong>
          </span>
        </div>
      </div>
    </section>
  );
}
