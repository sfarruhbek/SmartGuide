import { Camera, X } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@smartguide/shared';
import {
  FEEDBACK_LABELS,
  SENTIMENT_EMOJI,
  SENTIMENT_LABELS,
  type ExperienceQuestion,
} from '../lib/experience';

interface LiveArrivalBannerProps {
  item: ExperienceQuestion | null;
  onDismiss: () => void;
}

export function LiveArrivalBanner({ item, onDismiss }: LiveArrivalBannerProps) {
  if (!item) return null;

  const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === item.language);
  const flag = langMeta?.flag ?? '🌐';
  const sentiment = item.sentiment ?? item.insight?.sentiment;
  const topic =
    item.detectedTopicLabel ??
    item.insight?.detectedTopicLabel ??
    item.detectedTopic;

  return (
    <div
      role="status"
      aria-live="polite"
      className="no-print fixed right-4 top-20 z-50 w-[min(calc(100vw-2rem),32rem)] animate-banner-slide rounded-2xl border border-slate-700 border-l-4 border-l-[#10B981] bg-[#0F172A] p-4 text-white shadow-2xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold tracking-wide text-emerald-300">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#10B981] animate-pulse" />
            <span>
              Live visitor · {flag} {item.language.toUpperCase()} ·{' '}
              {item.landmarkName}
            </span>
          </div>

          <p className="mt-2 text-base font-semibold leading-snug text-white">
            &ldquo;{item.question}&rdquo;
          </p>
          {(topic || sentiment || item.userFeedback) && (
            <p className="mt-2 text-sm text-emerald-200">
              {topic}
              {sentiment &&
                ` · ${SENTIMENT_EMOJI[sentiment]} ${SENTIMENT_LABELS[sentiment] ?? sentiment}`}
              {item.userFeedback &&
                ` · ${FEEDBACK_LABELS[item.userFeedback] ?? item.userFeedback}`}
            </p>
          )}

          {item.hasImage && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-200">
              <Camera className="h-3 w-3" />
              <span>Snap &amp; Ask Photo Recognition</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
