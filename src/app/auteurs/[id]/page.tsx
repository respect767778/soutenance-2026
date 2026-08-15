import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAuthorById, getAuthorStats } from "@/lib/authors";
import { getAuthorPublishedContents } from "@/lib/data";
import { getFavoriteIds } from "@/lib/favorites";
import { ROLES } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { UserAvatar } from "@/components/user-avatar";
import { ContentCard } from "@/components/content-card";
import { Stars } from "@/components/star-rating";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const author = await getAuthorById(id);
  return {
    title: author?.full_name
      ? `Boutique de ${author.full_name}`
      : "Auteur introuvable",
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const author = await getAuthorById(id);
  if (!author) notFound();

  const [stats, contents, favoriteIds] = await Promise.all([
    getAuthorStats(id),
    getAuthorPublishedContents(id),
    getFavoriteIds(),
  ]);

  const roleLabel = ROLES[author.role]?.label ?? author.role;

  return (
    <div className="min-h-screen bg-paper pb-20">
      {/* ===== Bannière profil ===== */}
      <section className="relative overflow-hidden bg-brand-950 text-white">
        <div className="pointer-events-none absolute inset-0 pattern-grid opacity-40" />
        <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 glow-green" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 glow-gold" />

        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <Link
            href="/catalogue"
            className="text-xs font-semibold text-brand-100/70 transition hover:text-white"
          >
            ← Retour au catalogue
          </Link>

          <div className="mt-8 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <UserAvatar
              src={author.avatar_url}
              name={author.full_name}
              className="h-24 w-24 rounded-3xl text-3xl shadow-2xl ring-4 ring-white/10"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge bg-gold-400/15 text-gold-200 border border-gold-300/30">
                  🏪 Boutique officielle
                </span>
                <span className="badge bg-white/10 text-brand-100">
                  {roleLabel}
                </span>
              </div>
              <h1 className="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                {author.full_name ?? "Auteur"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-100/75">
                {author.bio?.trim() ||
                  "Créateur de contenus sur SUNU CONTENU, engagé à transmettre un savoir de qualité, ancré dans les réalités locales."}
              </p>
              <p className="mt-3 text-xs text-brand-100/50">
                Membre depuis {formatDate(author.created_at)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Statistiques ===== */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative -mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Contenus publiés",
              value: String(stats.contentsCount),
              icon: "📦",
            },
            {
              label: "Note moyenne",
              value: stats.reviewCount > 0 ? stats.average.toFixed(1) : "—",
              icon: "⭐",
            },
            {
              label: "Avis reçus",
              value: String(stats.reviewCount),
              icon: "💬",
            },
            {
              label: "Ventes réalisées",
              value: String(stats.salesCount),
              icon: "🛒",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="card flex items-center gap-4 bg-white p-5 shadow-md"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-xl">
                {s.icon}
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  {s.label}
                </p>
                <p className="font-display mt-0.5 text-2xl font-bold text-ink">
                  {s.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Contenus de l'auteur ===== */}
      <section className="mx-auto mt-14 max-w-6xl px-4 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Ses contenus
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              {contents.length} contenu{contents.length > 1 ? "s" : ""} publié
              {contents.length > 1 ? "s" : ""} par cet auteur.
            </p>
          </div>
          {stats.reviewCount > 0 && (
            <div className="hidden items-center gap-2 sm:flex">
              <Stars value={stats.average} size="text-lg" />
            </div>
          )}
        </div>

        {contents.length === 0 ? (
          <div className="card mt-6 flex flex-col items-center gap-3 px-6 py-20 text-center bg-white">
            <span className="text-5xl">🏪</span>
            <p className="font-display text-lg font-bold text-ink">
              Boutique en préparation
            </p>
            <p className="max-w-sm text-sm text-ink-muted">
              Cet auteur n&apos;a pas encore de contenu publié. Revenez bientôt !
            </p>
            <Link href="/catalogue" className="btn btn-primary mt-2 !text-xs">
              Explorer le catalogue
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {contents.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                isFavorite={favoriteIds.has(content.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
