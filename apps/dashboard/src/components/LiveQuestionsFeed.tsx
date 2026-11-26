import { useMemo, useState } from 'react';
import { Camera, Clock, Filter, Radio, RotateCcw, Search } from 'lucide-react';
import {
  SUPPORTED_LANGUAGES,
  type LandmarkSummary,
  type RecentQuestionItem,
} from '@smartguide/shared';

interface LiveQuestionsFeedProps {
  questions: RecentQuestionItem[];
  highlightedIds: Set<number>;
  landmarks: LandmarkSummary[];
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

export function LiveQuestionsFeed({
  questions,
  highlightedIds,
  landmarks,
}: LiveQuestionsFeedProps) {
  const [selectedLandmark, setSelectedLandmark] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [onlySnapAndAsk, setOnlySnapAndAsk] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const landmarkOptions = useMemo(() => {
    if (landmarks.length > 0) {
      return landmarks.map((lm) => ({ slug: lm.slug, name: lm.name }));
    }
    const seen = new Map<string, string>();
    for (const q of questions) {
      if (!seen.has(q.landmarkSlug)) {
        seen.set(q.landmarkSlug, q.landmarkName);
      }
    }
    return Array.from(seen.entries()).map(([slug, name]) => ({ slug, name }));
  }, [landmarks, questions]);

  const filteredQuestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return questions.filter((item) => {
      if (selectedLandmark !== 'all' && item.landmarkSlug !== selectedLandmark) return false;
      if (selectedLanguage !== 'all' && item.language !== selectedLanguage) return false;
      if (onlySnapAndAsk && !item.hasImage) return false;
      if (
        q &&
        !item.question.toLowerCase().includes(q) &&
        !item.landmarkName.toLowerCase().includes(q) &&
        !item.answerPreview.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [questions, selectedLandmark, selectedLanguage, onlySnapAndAsk, searchQuery]);

  const hasActiveFilter =
    selectedLandmark !== 'all' ||
    selectedLanguage !== 'all' ||
    onlySnapAndAsk ||
    searchQuery.trim().length > 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
            <Radio className="h-4 w-4 text-[#059669] animate-pulse" />
            <span>Live Recent Questions Feed</span>
          </h2>
          <p className="text-xs text-[#475569]">
            Real-time stream from PostgreSQL — ask a question in the Tourist PWA and watch it appear
            here automatically
          </p>
        </div>

        <span className="rounded-full border border-slate-200 bg-[#F8FAFC] px-3 py-1 text-xs font-medium tabular-nums text-[#475569]">
          Showing {filteredQuestions.length} of {questions.length} events
        </span>
      </div>

      {/* FE-11: Filter Bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-xl border border-slate-200 bg-[#F8FAFC] p-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#475569]">
          <Filter className="h-3.5 w-3.5 text-[#0E7470]" />
          <span>Filter:</span>
        </div>

        <select
          value={selectedLandmark}
          onChange={(e) => setSelectedLandmark(e.target.value)}
          aria-label="Filter by landmark"
          className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-[#0F172A] focus:border-[#0E7470] focus:outline-none cursor-pointer"
        >
          <option value="all">All Landmarks</option>
          {landmarkOptions.map((lm) => (
            <option key={lm.slug} value={lm.slug}>
              {lm.name}
            </option>
          ))}
        </select>

        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          aria-label="Filter by language"
          className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-[#0F172A] focus:border-[#0E7470] focus:outline-none cursor-pointer"
        >
          <option value="all">All Languages</option>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.label} ({lang.code.toUpperCase()})
            </option>
          ))}
        </select>

        <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-[#0F172A] cursor-pointer">
          <input
            type="checkbox"
            checked={onlySnapAndAsk}
            onChange={(e) => setOnlySnapAndAsk(e.target.checked)}
            className="h-3.5 w-3.5 rounded accent-[#0E7470]"
          />
          <Camera className="h-3.5 w-3.5 text-[#B47B38]" />
          <span>Snap &amp; Ask only</span>
        </label>

        <label className="relative min-w-[180px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#475569]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            aria-label="Search questions"
            className="h-8 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-[#0F172A] placeholder-slate-400 focus:border-[#0E7470] focus:outline-none"
          />
        </label>

        {hasActiveFilter && (
          <button
            type="button"
            onClick={() => {
              setSelectedLandmark('all');
              setSelectedLanguage('all');
              setOnlySnapAndAsk(false);
              setSearchQuery('');
            }}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#0E7470] hover:bg-[#EEF7F6] transition cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {filteredQuestions.map((item) => {
          const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === item.language);
          const isNew = highlightedIds.has(item.id);

          return (
            <div
              key={item.id}
              className={[
                'rounded-xl border p-3.5 transition-all',
                isNew
                  ? 'border-emerald-400 bg-emerald-50/70 shadow-xs'
                  : 'border-slate-200 bg-[#F8FAFC]/60 hover:border-slate-300',
              ].join(' ')}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {isNew && (
                    <span className="rounded-full bg-[#059669] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      LIVE NEW
                    </span>
                  )}
                  <span className="rounded-full border border-[#0E7470]/25 bg-[#EEF7F6] px-2.5 py-0.5 text-[11px] font-semibold text-[#0E7470]">
                    {item.landmarkName}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-[#0F172A]">
                    <span aria-hidden="true">{langMeta?.flag ?? '🌐'}</span>
                    <span className="uppercase">{item.language}</span>
                  </span>
                  {item.hasImage && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#B47B38]/25 bg-[#FDF6EC] px-2 py-0.5 text-[11px] font-semibold text-[#B47B38]">
                      <Camera className="h-3 w-3" />
                      <span>Snap &amp; Ask</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[11px] tabular-nums text-[#475569]">
                  <span className="font-mono text-[#475569]">#{item.sessionId.slice(-8)}</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatRelativeTime(item.createdAt)}</span>
                  </span>
                </div>
              </div>

              <p className="mt-2 text-sm font-semibold text-[#0F172A]">
                &ldquo;{item.question}&rdquo;
              </p>
              {item.answerPreview && (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#475569]">
                  {item.answerPreview}
                </p>
              )}
            </div>
          );
        })}

        {filteredQuestions.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-[#475569]">
            {questions.length === 0
              ? 'No tourist interactions recorded yet. Scan a QR code to test live telemetry.'
              : 'No events match the selected filters.'}
          </div>
        )}
      </div>
    </section>
  );
}
