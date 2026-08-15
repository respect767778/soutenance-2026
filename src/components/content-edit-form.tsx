"use client";

import { useActionState } from "react";
import { updateContent, type ContentUpdateState } from "@/lib/actions";
import { CONTENT_TYPES, type ContentType } from "@/lib/types";

const INITIAL: ContentUpdateState = { error: null, success: null };

export type CategoryOption = { id: string; name: string };

export type EditableContent = {
  id: string;
  title: string;
  type: ContentType;
  price: number;
  description: string | null;
  category_id: string | null;
};

export function ContentEditForm({
  content,
  categories,
}: {
  content: EditableContent;
  categories: CategoryOption[];
}) {
  const [state, action, pending] = useActionState(updateContent, INITIAL);

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="id" value={content.id} />

      <div className="sm:col-span-2">
        <label htmlFor={`title-${content.id}`} className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink">
          Titre *
        </label>
        <input
          id={`title-${content.id}`}
          name="title"
          type="text"
          required
          defaultValue={content.title}
          className="input !rounded-xl !py-2.5 !text-sm"
        />
      </div>

      <div>
        <label htmlFor={`type-${content.id}`} className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink">
          Format
        </label>
        <select
          id={`type-${content.id}`}
          name="type"
          defaultValue={content.type}
          className="input !rounded-xl !py-2.5 !text-sm"
        >
          {(Object.keys(CONTENT_TYPES) as ContentType[]).map((t) => (
            <option key={t} value={t}>
              {CONTENT_TYPES[t]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`price-${content.id}`} className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink">
          Prix (FCFA)
        </label>
        <input
          id={`price-${content.id}`}
          name="price"
          type="number"
          min={0}
          defaultValue={content.price}
          className="input !rounded-xl !py-2.5 !text-sm"
        />
      </div>

      <div>
        <label htmlFor={`cat-${content.id}`} className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink">
          Catégorie
        </label>
        <select
          id={`cat-${content.id}`}
          name="category_id"
          defaultValue={content.category_id ?? ""}
          className="input !rounded-xl !py-2.5 !text-sm"
        >
          <option value="">— Aucune —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor={`desc-${content.id}`} className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink">
          Description
        </label>
        <textarea
          id={`desc-${content.id}`}
          name="description"
          rows={3}
          defaultValue={content.description ?? ""}
          className="input !rounded-xl resize-none !text-sm"
        />
      </div>

      {state.error && (
        <p className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="sm:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
          {state.success}
        </p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary !rounded-xl !py-2.5 !px-5 !text-xs !font-bold"
        >
          {pending ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  );
}
