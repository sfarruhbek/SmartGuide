import { Camera, Clock, Radio } from 'lucide-react';
import { SUPPORTED_LANGUAGES, type RecentQuestionItem } from '@smartguide/shared';

interface LiveQuestionsFeedProps {
  questions: RecentQuestionItem[];
  highlightedIds: Set<number>;
}

function formatRelativeTime(isoDate: string): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000));
  if (diffSec < 15) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Date(isoDate).toLocaleDateString();
}

export function LiveQuestionsFeed({ questions, highlightedIds }: LiveQuestionsFeedProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
            Live Recent Questions Feed
          </h2>
          <p className="text-xs text-slate-400">
            Real-time stream from PostgreSQL — ask a question in the Tourist PWA and watch it appear
            here automatically
          </p>
        </div>
        <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300">
          Showing latest {questions.length} events
        </span>
      </div>

      <div className="space-y-2.5">
        {questions.map((item) => {
          const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === item.language);
          const isNew = highlightedIds.has(item.id);

          return (
            <div
              key={item.id}
              className={[
                'rounded-xl border p-3.5 transition-all',
                isNew
                  ? 'border-amber-400/80 bg-amber-400/10 shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                  : 'border-slate-800/90 bg-slate-950/65 hover:border-slate-700',
              ].join(' ')}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {isNew && (
                    <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-950">
                      LIVE NEW
                    </span>
                  )}
                  <span className="rounded-full border border-teal-400/35 bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-teal-200">
                    {item.landmarkName}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[11px] text-slate-200">
                    <span aria-hidden="true">{langMeta?.flag ?? '🌐'}</span>
                    <span className="uppercase">{item.language}</span>
                  </span>
                  {item.hasImage && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/35 bg-amber-400/10 px-2 py-0.5 text-[11px] text-amber-200">
                      <Camera className="h-3 w-3" />
                      Snap &amp; Ask
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="font-mono text-slate-500">#{item.sessionId.slice(-8)}</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>
              </div>

              <p className="mt-2 text-sm font-medium text-white">&ldquo;{item.question}&rdquo;</p>
              {item.answerPreview && (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
                  {item.answerPreview}
                </p>
              )}
            </div>
          );
        })}

        {questions.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-700 py-10 text-center text-sm text-slate-400">
            No tourist interactions recorded yet. Scan a QR code to test live telemetry.
          </div>
        )}
      </div>
    </section>
  );
}
