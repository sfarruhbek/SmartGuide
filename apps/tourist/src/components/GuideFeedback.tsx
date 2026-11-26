'use client';

import { useRef, useState } from 'react';
import type { SupportedLanguage } from '@smartguide/shared';
import type { FeedbackRating } from '@/lib/experience';
import { EXPERIENCE_COPY } from '@/lib/experience-copy';
import { sendGuideFeedback } from '@/lib/api';

const RATINGS = ['fascinating', 'surprising', 'not_relevant'] as const;
const EMOJI = ['🔥', '🤯', '😐'];

export function GuideFeedback({
  interactionId,
  language,
}: {
  interactionId: number;
  language: SupportedLanguage;
}) {
  const [selected, setSelected] = useState<FeedbackRating | null>(null);
  const [pending, setPending] = useState<FeedbackRating | null>(null);
  const [failed, setFailed] = useState<FeedbackRating | null>(null);
  const busyRef = useRef(false);
  const copy = EXPERIENCE_COPY[language];
  const submit = async (rating: FeedbackRating) => {
    if (busyRef.current || selected) return;
    busyRef.current = true;
    setPending(rating);
    setFailed(null);
    try {
      await sendGuideFeedback(interactionId, rating);
      setSelected(rating);
    } catch {
      setFailed(rating);
    } finally {
      busyRef.current = false;
      setPending(null);
    }
  };
  if (interactionId <= 0) return null;
  return (
    <div className="guide-feedback">
      <p>{copy.feedback}</p>
      <div className="feedback-options">
        {RATINGS.map((rating, index) => (
          <button
            key={rating}
            type="button"
            aria-pressed={selected === rating}
            disabled={Boolean(pending || selected)}
            onClick={() => void submit(rating)}
          >
            <span aria-hidden="true">{EMOJI[index]}</span>
            {copy.ratings[index]}
          </button>
        ))}
      </div>
      <div aria-live="polite">
        {selected && <p className="feedback-thanks">{copy.thanks}</p>}
        {failed && (
          <p className="feedback-save-error">
            {copy.feedbackError}{' '}
            <button
              className="text-action"
              type="button"
              onClick={() => void submit(failed)}
            >
              {copy.retry}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
