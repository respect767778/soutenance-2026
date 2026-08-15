"use client";

import { useActionState } from "react";
import { rejectContent, type RejectState } from "@/lib/actions";

const INITIAL: RejectState = { error: null };

export function RejectForm({ contentId }: { contentId: string }) {
  const [state, action, pending] = useActionState(rejectContent, INITIAL);

  return (
    <form action={action} className="mt-4">
      <input type="hidden" name="id" value={contentId} />

      <label
        htmlFor="reason"
        className="block text-xs font-bold uppercase tracking-wider text-ink"
      >
        Motif du rejet *
      </label>
      <textarea
        id="reason"
        name="reason"
        rows={3}
        required
        placeholder="Expliquez à l'auteur ce qu'il doit corriger (qualité, contenu, prix, format…)"
        className="input mt-2 resize-none"
      />

      {state.error && (
        <p className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn mt-3 !rounded-xl border border-red-200 !bg-white !py-2.5 !px-5 !text-xs !font-bold !text-red-600 hover:!bg-red-50"
      >
        {pending ? "Rejet en cours…" : "✕ Confirmer le rejet"}
      </button>
    </form>
  );
}
