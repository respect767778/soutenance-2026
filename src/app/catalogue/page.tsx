import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, getPublishedContents } from "@/lib/data";
import { getFavoriteIds } from "@/lib/favorites";
import { CONTENT_TYPES, type ContentType } from "@/lib/types";
import { ContentCard } from "@/components/content-card";

export const metadata: Metadata = {
  title: "Catalogue de Contenus Numériques",
  description:
    "Explorez notre bibliothèque exclusive d'ebooks, formations vidéos, masterclasses audios et guides conçus par des experts sénégalais.",
};

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const { type, q } = await searchParams;
  const [contents, categories, favoriteIds] = await Promise.all([
    getPublishedContents(),
    getCategories(),
    getFavoriteIds(),
  ]);

  const filtered = contents.filter((c) => {
    if (type && type !== "all" && c.type !== type) return false;
    if (q) {
      const needle = q.trim().toLowerCase();
      const hay = `${c.title} ${c.description ?? ""} ${c.author_name ?? ""}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });

  const typeOptions: { value: string; label: string; icon: string }[] = [
    { value: "all", label: "Tous les contenus", icon: "✨" },
    { value: "ebook", label: "Ebooks & Livres", icon: "📖" },
    { value: "cours", label: "Formations Vidéos", icon: "🎓" },
    { value: "video", label: "Vidéos 4K", icon: "🎬" },
    { value: "audio", label: "Masterclasses Audio", icon: "🎙️" },
    { value: "document", label: "Templates & Docs", icon: "📄" },
  ];

  return (
    <div className="min-h-screen bg-paper pb-20">
      {/* ================= EN-TÊTE DU CATALOGUE ================= */}
      <section className="relative overflow-hidden border-b border-ink/[0.07] bg-gradient-to-b from-brand-950 via-brand-950 to-brand-900 text-white">
        <div className="pointer-events-none absolute inset-0 pattern-grid opacity-20" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 glow-gold opacity-30 blur-2xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="badge border border-gold-400/30 bg-gold-400/10 text-gold-200">
            Explorer la Bibliothèque
          </span>

          <h1 className="font-display mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Trésors et savoirs <span className="text-gradient">made in Sénégal</span>
          </h1>

          <p className="mt-3 max-w-xl text-sm sm:text-base text-brand-100/75 leading-relaxed">
            Découvrez des contenus à forte valeur ajoutée, créés par des auteurs,
            formateurs et experts locaux.
          </p>

          {/* Barre de Recherche Moderne */}
          <form className="mt-8 flex w-full max-w-2xl gap-2" action="/catalogue">
            {type && type !== "all" && (
              <input type="hidden" name="type" value={type} />
            )}
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-300">
                🔍
              </span>
              <input
                type="search"
                name="q"
                defaultValue={q ?? ""}
                placeholder="Rechercher par mot-clé, titre, thématique, auteur…"
                className="input !h-12 !rounded-2xl !pl-11 !pr-4 !bg-white/95 !text-ink !shadow-lg placeholder:text-ink-subtle"
              />
            </div>
            <button
              type="submit"
              className="btn btn-gold !h-12 !rounded-2xl !px-6 shadow-lg"
            >
              Rechercher
            </button>
          </form>
        </div>
      </section>

      {/* ================= CONTENU PRINCIPAL & FILTRES ================= */}
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Pilules de formats / Types */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {typeOptions.map((opt) => {
            const active = (type ?? "all") === opt.value;
            return (
              <Link
                key={opt.value}
                href={`/catalogue${opt.value !== "all" ? `?type=${opt.value}${q ? `&q=${encodeURIComponent(q)}` : ""}` : q ? `?q=${encodeURIComponent(q)}` : ""}`}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-brand-800 text-white shadow-md shadow-brand-900/30 ring-1 ring-brand-700"
                    : "border border-ink/[0.08] bg-white text-ink-muted hover:border-brand-300 hover:text-brand-800 hover:bg-brand-50/50"
                }`}
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Catégories thématiques */}
        {categories.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-subtle mr-1">
              Thèmes :
            </span>
            {categories.map((c) => (
              <span
                key={c.id}
                className="rounded-full border border-gold-300/40 bg-gold-50/80 px-3 py-1 text-xs font-medium text-gold-900 shadow-sm"
              >
                {c.name}
              </span>
            ))}
          </div>
        )}

        {/* Compteur de résultats */}
        <div className="mt-8 flex items-center justify-between border-b border-ink/[0.06] pb-4">
          <p className="text-xs sm:text-sm font-medium text-ink-muted">
            <strong className="text-ink">{filtered.length}</strong> contenu
            {filtered.length > 1 ? "s" : ""} disponible{filtered.length > 1 ? "s" : ""}
          </p>
          {q && (
            <Link
              href="/catalogue"
              className="text-xs font-semibold text-brand-700 hover:underline"
            >
              ✕ Réinitialiser la recherche
            </Link>
          )}
        </div>

        {/* Grille de résultats ou État vide */}
        {filtered.length === 0 ? (
          <div className="card mt-10 flex flex-col items-center gap-4 px-6 py-24 text-center bg-white">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-3xl">
              🔍
            </div>
            <h2 className="font-display text-xl font-bold text-ink">
              Aucun contenu trouvé
            </h2>
            <p className="max-w-md text-sm text-ink-muted">
              Nous n&apos;avons trouvé aucun résultat correspondant à vos critères.
              Essayez un autre mot-clé ou réinitialisez vos filtres.
            </p>
            <Link href="/catalogue" className="btn btn-outline mt-2">
              Voir tous les contenus
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                isFavorite={favoriteIds.has(content.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
