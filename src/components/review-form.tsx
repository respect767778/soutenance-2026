"use client";

import { useActionState, useState } from "react";
import { addReview, type ReviewState } from "@/lib/review-actions";

const INITIAL: ReviewState = { error: null, success: null };

export function ReviewForm({
  contentId,
  defaultRating = 5,
  defaultComment = "",
  isUpdate = false,
}: {
  contentId: string;
  defaultRating?: number;
  defaultComment?: string;
  isUpdate?: boolean;
}) {
  const [state, action, pending] = useActionState(addReview, INITIAL);
  const [rating, setRating] = useState(defaultRating);
  const [hover, setHover] = useState(0);

  const shown = hover || rating;

  return (
    <form
      action={action}
      className="rounded-2xl border border-ink/[0.08] bg-white p-5 shadow-sm"
    >
      <input type="hidden" name="content_id" value={contentId} />
      <input type="hidden" name="rating" value={rating} />

      <div className="flex items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
          Votre note
        </span>
        <div className="flex gap-1 text-2xl">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              aria-label={`${i} étoile${i > 1 ? "s" : ""}`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(i)}
              className={`transition-transform hover:scale-125 ${
                i <= shown ? "text-gold-500" : "text-ink/15"
              }`}
            >
              ★
            </button>
          ))}
        </div>
        <span className="text-sm font-bold text-ink">{shown}/5</span>
      </div>

      <textarea
        name="comment"
        rows={3}
        defaultValue={defaultComment}
        placeholder="Partagez votre expérience avec ce contenu…"
        className="input mt-4 resize-none"
      />

      {state.error && (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary mt-4 !rounded-xl !py-2.5 !px-5 !text-xs !font-bold"
      >
        {pending
          ? "Envoi…"
          : isUpdate
            ? "Mettre à jour mon avis"
            : "Publier mon avis"}
      </button>
    </form>
  );
}
