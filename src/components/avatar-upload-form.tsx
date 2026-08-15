"use client";

import { useActionState } from "react";
import { uploadAvatar, type UploadState } from "@/lib/storage-actions";

const INITIAL: UploadState = { error: null, success: null };

export function AvatarUploadForm() {
  const [state, action, pending] = useActionState(uploadAvatar, INITIAL);

  return (
    <form action={action} className="mt-4">
      <input
        type="file"
        name="avatar"
        accept="image/*"
        className="block w-full cursor-pointer text-[11px] text-ink-muted file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand-700 file:px-3 file:py-2 file:text-[11px] file:font-bold file:text-white hover:file:bg-brand-600"
      />
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary mt-2 w-full !rounded-xl !py-2 !text-xs"
      >
        {pending ? "Téléversement…" : "📷 Changer ma photo"}
      </button>

      {state.error && (
        <p className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-medium text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-medium text-emerald-700">
          {state.success}
        </p>
      )}
    </form>
  );
}
