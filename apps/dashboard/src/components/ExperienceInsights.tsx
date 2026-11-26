import { BookOpen, Heart } from 'lucide-react';
import {
  SENTIMENT_LABELS,
  type ExperienceAnalytics,
  type Sentiment,
} from '../lib/experience';

const SENTIMENTS: Sentiment[] = [
  'awe',
  'fascinated',
  'curious',
  'neutral',
  'bored',
];

export function ExperienceInsights({ data }: { data: ExperienceAnalytics }) {
  const hasSentiment = Boolean(
    data.sentimentBreakdown?.some((item) => item.count > 0),
  );
  return (
    <section className="experience-insights-grid">
      <article className="insight-panel">
        <div className="insight-panel-heading">
          <Heart aria-hidden="true" />
          <h2>How visitors feel</h2>
        </div>
        <p className="insight-description">
          Impressions from guide conversations.
        </p>
        {hasSentiment ? (
          <div className="sentiment-bars">
            {SENTIMENTS.map((sentiment) => {
              const item = data.sentimentBreakdown?.find(
                (item) => item.sentiment === sentiment,
              );
              const percent = Math.max(
                0,
                Math.min(100, item?.sharePercent ?? 0),
              );
              return (
                <div className="sentiment-row" key={sentiment}>
                  <div>
                    <span>{SENTIMENT_LABELS[sentiment]}</span>
                    <span>
                      {item?.count ?? 0}
                      <small> · {percent.toFixed(1)}%</small>
                    </span>
                  </div>
                  <progress
                    max={100}
                    value={percent}
                    aria-label={`${SENTIMENT_LABELS[sentiment]}: ${percent}%`}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <p className="intelligence-empty">
            Visitor impressions will appear after the first analysed
            conversations.
          </p>
        )}
      </article>
      <article className="insight-panel">
        <div className="insight-panel-heading">
          <BookOpen aria-hidden="true" />
          <h2>Questions worth exploring</h2>
        </div>
        <p className="insight-description">
          Curiosity gaps for the museum’s research team.
        </p>
        {data.curiosityGaps?.length ? (
          <ul className="curiosity-gaps">
            {data.curiosityGaps.slice(0, 6).map((gap, index) => (
              <li key={`${gap.landmarkSlug}:${gap.createdAt}:${index}`}>
                <span>
                  {gap.landmarkName}
                  <small>{gap.language.toUpperCase()}</small>
                </span>
                <p>{gap.question}</p>
                <strong>Suggested archive addition</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="intelligence-empty">
            Questions that need more museum research will appear here.
          </p>
        )}
      </article>
    </section>
  );
}
