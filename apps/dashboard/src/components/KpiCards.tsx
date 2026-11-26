import {
  Camera,
  DollarSign,
  Landmark,
  MessageSquareText,
  Users,
} from 'lucide-react';
import type { ExperienceAnalytics } from '../lib/experience';

interface KpiCardsProps {
  data: ExperienceAnalytics;
}

export function KpiCards({ data }: KpiCardsProps) {
  const { revenue } = data;
  const ratedVisits = data.visitsByLandmark.filter(
    (item) =>
      typeof item.avgInterestScore === 'number' &&
      Number.isFinite(item.avgInterestScore),
  );
  const ratedCount = ratedVisits.reduce((sum, item) => sum + item.visits, 0);
  const avgInterest =
    typeof data.avgInterestScore === 'number' &&
    Number.isFinite(data.avgInterestScore)
      ? data.avgInterestScore
      : ratedCount > 0
        ? ratedVisits.reduce(
            (sum, item) => sum + (item.avgInterestScore ?? 0) * item.visits,
            0,
          ) / ratedCount
        : null;

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Total Tourists */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
            Total Tourists
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF7F6] text-[#0E7470]">
            <Users className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold tabular-nums tracking-tight text-[#0F172A]">
            {data.totalTourists}
          </span>
          <span className="text-xs font-medium text-[#0E7470]">
            unique sessions
          </span>
        </div>
        <p className="mt-2 text-xs text-[#475569]">
          Avg{' '}
          <span className="font-semibold tabular-nums text-[#0F172A]">
            {data.avgQuestionsPerTourist}
          </span>{' '}
          AI questions per tourist
        </p>
      </div>

      {/* Total AI Interactions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
            Total AI Interactions
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-[#0284C7]">
            <MessageSquareText className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold tabular-nums tracking-tight text-[#0F172A]">
            {data.totalInteractions}
          </span>
          <span className="text-xs font-medium text-[#0284C7]">
            verified answers
          </span>
        </div>
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#475569]">
          <Camera className="h-3.5 w-3.5 text-[#B47B38]" />
          <span>
            <strong className="tabular-nums text-[#0F172A]">
              {data.totalPhotoScans}
            </strong>{' '}
            Snap &amp; Ask photo recognitions
          </span>
        </p>
      </div>

      {/* Top Landmark */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
            Top Landmark
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF6EC] text-[#B47B38]">
            <Landmark className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="truncate font-display text-xl font-bold text-[#0F172A]">
            {data.topLandmark?.name ?? 'No visits yet'}
          </div>
        </div>
        <p className="mt-2 text-xs text-[#475569]">
          {data.topLandmark ? (
            <>
              <strong className="tabular-nums text-[#0F172A]">
                {data.topLandmark.visits}
              </strong>{' '}
              interactions (
              <strong className="tabular-nums text-[#B47B38]">
                {data.topLandmark.sharePercent}%
              </strong>{' '}
              of site traffic)
            </>
          ) : (
            'Waiting for first QR scan'
          )}
        </p>
      </div>

      {/* Est. Revenue Share */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-white via-white to-emerald-50/70 p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#059669]">
            Est. Revenue Share
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-[#059669]">
            <DollarSign className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold tabular-nums tracking-tight text-[#0F172A]">
            ${revenue.grossRevenueUsd.toFixed(2)}
          </span>
          <span className="text-xs tabular-nums text-[#475569]">
            (${revenue.pricePerTouristUsd}/tourist)
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-xs">
          <span className="font-semibold tabular-nums text-[#059669]">
            Museum {revenue.museumSharePercent}%: $
            {revenue.museumShareUsd.toFixed(2)}
          </span>
          <span className="tabular-nums text-[#475569]">
            Margin:{' '}
            <strong className="text-[#0F172A]">
              {revenue.grossMarginPercent}%
            </strong>
          </span>
        </div>
      </div>
      <div className="experience-kpi-strip sm:col-span-2 xl:col-span-4">
        <div>
          <span>Roadmaps generated</span>
          <strong>
            {typeof data.totalRoadmapsGenerated === 'number'
              ? data.totalRoadmapsGenerated.toLocaleString()
              : '—'}
          </strong>
        </div>
        <div>
          <span>Average visitor interest</span>
          <strong>
            {avgInterest === null
              ? '—'
              : `${Math.max(0, Math.min(5, avgInterest)).toFixed(1)} / 5`}
          </strong>
        </div>
        <p>Learn from each visit. Shape the next experience.</p>
      </div>
    </section>
  );
}
