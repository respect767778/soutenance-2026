import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { deleteCategory } from "@/lib/category-actions";
import { CreateCategoryForm, EditCategoryForm } from "./category-forms";

export default async function CategoriesDashboard() {
  await requireProfile("admin", "editeur");
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  const list = (categories ?? []) as {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  }[];

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="rounded-2xl border border-ink/[0.06] bg-white p-6 shadow-sm">
        <span className="badge bg-gold-100 text-gold-900 border border-gold-300/60 font-bold">
          🗂️ Organisation
        </span>
        <h1 className="font-display mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-ink">
          Gestion des Catégories
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-ink-muted">
          Créez, renommez et organisez les thèmes du catalogue — sans passer par le SQL.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Création */}
        <CreateCategoryForm />

        {/* Liste */}
        <div className="space-y-3">
          <h2 className="font-display text-lg font-bold text-ink">
            Catégories existantes ({list.length})
          </h2>

          {list.length === 0 ? (
            <div className="card flex flex-col items-center gap-2 px-6 py-16 text-center bg-white">
              <span className="text-4xl">🗂️</span>
              <p className="font-display text-lg font-bold text-ink">
                Aucune catégorie
              </p>
              <p className="text-sm text-ink-muted">
                Créez votre première catégorie avec le formulaire ci-contre.
              </p>
            </div>
          ) : (
            list.map((cat) => (
              <details key={cat.id} className="card group overflow-hidden bg-white">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base font-bold text-ink">
                      {cat.name}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      <span className="font-mono text-brand-700">/{cat.slug}</span>
                      {cat.description ? ` — ${cat.description}` : ""}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-brand-700 transition-transform group-open:rotate-45">
                    ✏️ Modifier
                  </span>
                </summary>

                <div className="border-t border-ink/[0.06] p-5">
                  <EditCategoryForm category={cat} />

                  <form action={deleteCategory} className="mt-3">
                    <input type="hidden" name="id" value={cat.id} />
                    <button
                      type="submit"
                      className="text-xs font-semibold text-red-500 transition hover:text-red-600 hover:underline"
                    >
                      🗑 Supprimer cette catégorie
                    </button>
                  </form>
                </div>
              </details>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
