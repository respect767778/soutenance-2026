import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createContent } from "@/lib/actions";
import { CONTENT_TYPES, type ContentType } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { StatCard } from "@/components/stat-card";
import {
  AuthorContentItem,
  type AuthorContent,
} from "@/components/author-content-item";

export default async function AuteurDashboard() {
  const profile = await requireProfile("auteur", "admin", "editeur");
  const supabase = await createClient();

  const [{ data: myContents }, { data: categories }] = await Promise.all([
    supabase
      .from("contents")
      .select("*, categories(name)")
      .eq("author_id", profile.id)
      .order("updated_at", { ascending: false }),
    supabase.from("categories").select("*").order("name", { ascending: true }),
  ]);

  const contents = (myContents ?? []) as unknown[];
  const cats = (categories ?? []) as unknown[];

  const myIds = contents.map((c) => (c as { id: string }).id);
  let revenue = 0;
  if (myIds.length > 0) {
    const { data: sales } = await supabase
      .from("purchases")
      .select("amount")
      .in("content_id", myIds);
    revenue = (sales ?? []).reduce(
      (sum, p) => sum + ((p as { amount: number }).amount ?? 0),
      0,
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête de bienvenue */}
      <div className="rounded-2xl border border-ink/[0.06] bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
            🖋️ Studio Créateur
          </span>
          <h1 className="font-display mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Mes Créations &amp; Ventes
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-ink-muted">
            Publiez vos savoirs, soumettez-les au comité et suivez vos gains.
          </p>
        </div>
      </div>

      {/* Cartes de statistiques créateur */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon="📦"
          label="Contenus créés"
          value={String(contents.length)}
          accent="bg-sky-500/10 text-sky-700 border-sky-500/20"
        />
        <StatCard
          icon="✅"
          label="Contenus publiés"
          value={String(
            contents.filter((c) => (c as { status: string }).status === "publie")
              .length,
          )}
          accent="bg-gold-500/10 text-gold-800 border-gold-500/20"
        />
        <StatCard
          icon="💰"
          label="Gains cumulés"
          value={formatPrice(revenue)}
          trend="+15%"
          accent="bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
        />
      </div>

      {/* Formulaire de création moderne (Détails repliables) */}
      <details className="card overflow-hidden bg-white shadow-sm group" open>
        <summary className="flex cursor-pointer list-none items-center justify-between p-6 bg-gradient-to-r from-white to-paper-subtle/50 transition hover:bg-paper-subtle">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-700 text-lg text-white shadow-md">
              ✚
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                Créer un nouveau contenu
              </h2>
              <p className="text-xs text-ink-muted">
                Remplissez les détails essentiels pour créer un brouillon.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-brand-700 underline group-open:no-underline">
            Afficher / Masquer
          </span>
        </summary>

        <form
          action={createContent}
          className="grid gap-5 border-t border-ink/[0.06] p-6 sm:p-8 sm:grid-cols-2 bg-white"
        >
          <div className="sm:col-span-2">
            <label htmlFor="title" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink">
              Titre du contenu *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="Ex. : Guide Ultime du Wolof Professionnel"
              className="input !rounded-xl !py-2.5"
            />
          </div>

          <div>
            <label htmlFor="type" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink">
              Format de contenu *
            </label>
            <select id="type" name="type" className="input !rounded-xl !py-2.5 font-medium">
              {(Object.keys(CONTENT_TYPES) as ContentType[]).map((t) => (
                <option key={t} value={t}>
                  {CONTENT_TYPES[t]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="price" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink">
              Prix de vente (en FCFA) *
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              defaultValue={5000}
              className="input !rounded-xl !py-2.5 font-bold text-brand-800"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="category_id" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink">
              Catégorie thématique
            </label>
            <select id="category_id" name="category_id" className="input !rounded-xl !py-2.5 font-medium">
              <option value="">— Sélectionner une catégorie —</option>
              {cats.map((c) => {
                const cat = c as { id: string; name: string };
                return (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink">
              Description &amp; Bénéfices pour l&apos;acheteur
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Décrivez ce que votre ressource apporte, à qui elle s'adresse et les compétences acquises…"
              className="input !rounded-xl resize-none"
            />
          </div>

          <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-ink/[0.06] pt-5">
            <p className="text-xs text-ink-muted">
              ℹ️ Votre contenu sera enregistré en <strong className="text-ink">Brouillon</strong>. 
              Vous pourrez le soumettre pour validation quand vous serez prêt.
            </p>
            <button type="submit" className="btn btn-primary !rounded-xl !py-3 !px-6 shadow-md">
              Créer mon brouillon ✨
            </button>
          </div>
        </form>
      </details>

      {/* Liste des contenus existants */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-ink">
            Vos ressources ({contents.length})
          </h2>
        </div>

        <div className="space-y-3">
          {contents.map((item) => {
            const c = item as AuthorContent;
            return (
              <AuthorContentItem
                key={c.id}
                content={c}
                categories={
                  cats.map((cat) => {
                    const cc = cat as { id: string; name: string };
                    return { id: cc.id, name: cc.name };
                  }) as { id: string; name: string }[]
                }
              />
            );
          })}

          {contents.length === 0 && (
            <div className="card flex flex-col items-center gap-3 px-6 py-20 text-center bg-white">
              <span className="text-4xl">🖋️</span>
              <p className="font-display text-lg font-bold text-ink">
                Lancez votre première publication
              </p>
              <p className="max-w-sm text-xs text-ink-muted">
                Vous n&apos;avez encore aucun contenu en ligne. Remplissez le formulaire ci-dessus pour démarrer.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
