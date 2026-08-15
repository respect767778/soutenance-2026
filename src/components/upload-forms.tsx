"use client";

import { useActionState } from "react";
import {
  uploadCover,
  uploadContentFile,
  type UploadState,
} from "@/lib/storage-actions";

const INITIAL: UploadState = { error: null, success: null };

function Feedback({ state }: { state: UploadState }) {
  if (!state.error && !state.success) return null;
  return (
    <p
      className={`mt-2 rounded-xl border px-3 py-2 text-xs font-medium ${
        state.error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {state.error ?? state.success}
    </p>
  );
}

export function CoverUploadForm({ contentId }: { contentId: string }) {
  const [state, action, pending] = useActionState(uploadCover, INITIAL);

  return (
    <form action={action} className="mt-3">
      <input type="hidden" name="content_id" value={contentId} />
      <div className="flex flex-col gap-2">
        <input
          type="file"
          name="cover"
          accept="image/*"
          className="block w-full text-xs text-ink-muted file:mr-3 file:rounded-xl file:border-0 file:bg-brand-700 file:px-4 file:py-2.5 file:text-xs file:font-bold file:text-white hover:file:bg-brand-600"
        />
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary !rounded-xl !py-2 !px-4 !text-xs"
        >
          {pending ? "Téléversement…" : "Téléverser la couverture"}
        </button>
      </div>
      <Feedback state={state} />
    </form>
  );
}

export function ContentFileUploadForm({ contentId }: { contentId: string }) {
  const [state, action, pending] = useActionState(uploadContentFile, INITIAL);

  return (
    <form action={action} className="mt-3">
      <input type="hidden" name="content_id" value={contentId} />
      <div className="flex flex-col gap-2">
        <input
          type="file"
          name="file"
          className="block w-full text-xs text-ink-muted file:mr-3 file:rounded-xl file:border-0 file:bg-gold-500 file:px-4 file:py-2.5 file:text-xs file:font-bold file:text-brand-950 hover:file:bg-gold-400"
        />
        <button
          type="submit"
          disabled={pending}
          className="btn btn-gold !rounded-xl !py-2 !px-4 !text-xs"
        >
          {pending ? "Téléversement…" : "Téléverser le fichier"}
        </button>
      </div>
      <Feedback state={state} />
    </form>
  );
}
