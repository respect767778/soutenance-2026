"use client";

import { useActionState } from "react";
import {
  createCategory,
  updateCategory,
  type CategoryState,
} from "@/lib/category-actions";

const INITIAL: CategoryState = { error: null, success: null };

function Feedback({ state }: { state: CategoryState }) {
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

export function CreateCategoryForm() {
  const [state, action, pending] = useActionState(createCategory, INITIAL);

  return (
    <form action={action} className="card space-y-4 bg-white p-6">
      <h3 className="font-display text-lg font-bold text-ink">
        ➕ Nouvelle catégorie
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink">
            Nom *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Ex. : Bien-être"
            className="input !rounded-xl !py-2.5"
          />
        </div>
        <div>
          <label htmlFor="slug" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink">
            Slug (URL)
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            placeholder="bien-etre (auto si vide)"
            className="input !rounded-xl !py-2.5"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          placeholder="Une courte description du thème…"
          className="input !rounded-xl resize-none"
        />
      </div>

      <Feedback state={state} />

      <button type="submit" disabled={pending} className="btn btn-primary !rounded-xl !py-2.5 !px-5 !text-xs">
        {pending ? "Création…" : "Créer la catégorie"}
      </button>
    </form>
  );
}

export function EditCategoryForm({
  category,
}: {
  category: { id: string; name: string; slug: string; description: string | null };
}) {
  const [state, action, pending] = useActionState(updateCategory, INITIAL);

  return (
    <form action={action} className="mt-3 space-y-3 rounded-2xl border border-brand-100 bg-brand-50/50 p-4">
      <input type="hidden" name="id" value={category.id} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="name"
          type="text"
          required
          defaultValue={category.name}
          placeholder="Nom"
          className="input !rounded-xl !py-2 !text-sm"
        />
        <input
          name="slug"
          type="text"
          defaultValue={category.slug}
          placeholder="slug"
          className="input !rounded-xl !py-2 !text-sm"
        />
      </div>
      <textarea
        name="description"
        rows={2}
        defaultValue={category.description ?? ""}
        placeholder="Description"
        className="input !rounded-xl resize-none !text-sm"
      />

      <Feedback state={state} />

      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn btn-primary !rounded-xl !py-2 !px-4 !text-xs">
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
