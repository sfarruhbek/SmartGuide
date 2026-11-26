import { MessageSquare, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react';
import type { ExperienceAnalytics, TopicSignal } from '../lib/experience';

const CATEGORY: Record<string, string> = {
  legend: 'Legend',
  legends: 'Legends',
  history: 'History',
  architecture: 'Architecture',
  photography: 'Photography',
  royalty: 'Royal history',
  spiritual: 'Spirituality',
};

function TopicList({
  topics,
  low = false,
}: {
  topics: TopicSignal[];
  low?: boolean;
}) {
  if (topics.length === 0)
    return (
      <p className="intelligence-empty">
        {low
          ? 'Stories with low engagement will appear here as visitor reactions arrive.'
          : 'The first visitor conversations will reveal which stories resonate.'}
      </p>
    );
  return (
    <ol className="signal-topics">
      {topics.slice(0, 5).map((topic) => {
        const score = Number.isFinite(topic.signalScore)
          ? Math.max(0, Math.min(100, topic.signalScore))
          : 0;
        return (
          <li key={`${topic.landmarkSlug}:${topic.topicKey}`}>
            <div className="signal-topic-heading">
              <span>{topic.landmarkName}</span>
              <span>{CATEGORY[topic.category] ?? topic.category}</span>
            </div>
            <h4>{topic.topicLabel}</h4>
            <div className="signal-score">
              <progress
                max={100}
                value={score}
                aria-label={`${topic.topicLabel}: signal score ${score} out of 100`}
              />
              <span>
                {Math.round(score)}
                <small> / 100</small>
              </span>
            </div>
            <div className="signal-reactions">
              <span>
                <MessageSquare aria-hidden="true" />
                {topic.askCount} questions
              </span>
              <span>
                <ThumbsUp aria-hidden="true" />
                {topic.positiveReactions}
              </span>
              <span>
                <ThumbsDown aria-hidden="true" />
                {topic.negativeReactions}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function SignalNoisePanel({ data }: { data: ExperienceAnalytics }) {
  return (
    <section className="intelligence-section" aria-labelledby="signals-title">
      <div className="intelligence-title">
        <div>
          <p className="intelligence-eyebrow">VISITOR EXPERIENCE</p>
          <h2 id="signals-title">What visitors remember</h2>
          <p>
            Use real questions and reactions to understand which stories deserve
            the spotlight.
          </p>
        </div>
        <Sparkles aria-hidden="true" />
      </div>
      <div className="signal-columns">
        <article className="signal-column signal-high">
          <div className="signal-column-heading">
            <span>TOP SIGNAL</span>
            <h3>Stories that connect</h3>
            <p>Prioritise these topics in new walks and first introductions.</p>
          </div>
          <TopicList topics={data.signalVsNoise?.topHighSignalTopics ?? []} />
        </article>
        <article className="signal-column signal-low">
          <div className="signal-column-heading">
            <span>LOW SIGNAL / NOISE</span>
            <h3>Stories to reconsider</h3>
            <p>Review these topics or reserve them for visitors who ask.</p>
          </div>
          <TopicList
            topics={data.signalVsNoise?.lowInterestNoiseTopics ?? []}
            low
          />
        </article>
      </div>
    </section>
  );
}
