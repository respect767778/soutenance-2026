import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContentBySlug } from "@/lib/data";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getContentReviews, computeRating } from "@/lib/reviews";
import { deleteReview } from "@/lib/review-actions";
import { CONTENT_TYPES } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/format";
import { CONTENT_ICONS, CONTENT_GRADIENTS } from "@/lib/display";
import { UserAvatar } from "@/components/user-avatar";
import { Stars } from "@/components/star-rating";
import { ReviewForm } from "@/components/review-form";
import { FavoriteButton } from "@/components/favorite-button";
import { CheckoutButton } from "@/components/checkout-button";
import { isPaydunyaConfigured } from "@/lib/paydunya";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContentBySlug(slug);
  return {
    title: content?.title ?? "Contenu introuvable",
    description: content?.description ?? undefined,
  };
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getContentBySlug(slug);

  if (!content) notFound();

  const profile = await getProfile();
  const supabase = await createClient();

  const reviews = await getContentReviews(content.id);
  const { average, count } = computeRating(reviews);

  const isStaff = Boolean(
    profile && (profile.role === "admin" || profile.role === "editeur"),
  );
  const isOwner = Boolean(profile && content.author_id === profile.id);

  let owned = false;
  if (profile) {
    const { data: p } = await supabase
      .from("purchases")
      .select("id, status")
      .eq("buyer_id", profile.id)
      .eq("content_id", content.id)
      .maybeSingle();
    owned = Boolean(p && (p as { status: string }).status === "complete");
  }

  const purchased = Boolean(profile) && (isOwner || isStaff || owned);
  const canReview = purchased;
  const myReview = profile
    ? reviews.find((r) => r.author_id === profile.id) ?? null
    : null;

  let isFavorite = false;
  if (profile) {
    const { data: fav } = await supabase
      .from("favorites")
      .select("content_id")
      .eq("user_id", profile.id)
      .eq("content_id", content.id)
      .maybeSingle();
    isFavorite = Boolean(fav);
  }

  const gradient = CONTENT_GRADIENTS[content.type] ?? "from-brand-600 to-brand-900";
  const icon = CONTENT_ICONS[content.type] ?? "📚";

  return (
    <div className="min-h-screen bg-paper py-10 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Fil d'Ariane */}
        <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
          <Link
            href="/catalogue"
            className="flex items-center gap-1 transition hover:text-brand-700"
          >
            <span>←</span>
            <span>Retour au catalogue</span>
          </Link>
          <span>/</span>
          <span className="text-ink truncate max-w-xs">{content.title}</span>
        </div>

        <div className="mt-8 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 items-start">
          {/* Colonne Gauche : Couverture & Visuel Prestige */}
          <div className="relative">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-ink/[0.08] bg-brand-950 shadow-[0_30px_70px_-20px_rgba(13,95,66,0.35)]">
              {content.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={content.cover_url}
                  alt={content.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient} p-8`}
                >
                  <div className="pattern-dots absolute inset-0 text-white/10" />
                  <span className="text-8xl drop-shadow-2xl">{icon}</span>
                </div>
              )}
            </div>

            {/* Badge flottant certifié */}
            <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-2xl border border-ink/[0.08] bg-white px-5 py-3 shadow-xl backdrop-blur-xl">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-gold-100 text-xs font-bold text-gold-700">
                ★
              </span>
              <span className="text-xs font-bold text-ink">Contenu certifié</span>
              <span className="text-[11px] text-ink-muted">• Contrôle éditorial</span>
            </div>
          </div>

          {/* Colonne Droite : Fiche descriptive & Achat */}
          <div className="flex flex-col">
            {/* Badges d'en-tête */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge bg-brand-100/70 text-brand-800 border border-brand-200">
                <span>{icon}</span>
                <span>{CONTENT_TYPES[content.type]}</span>
              </span>
              {content.category_name && (
                <span className="badge bg-gold-100 text-gold-900 border border-gold-200">
                  {content.category_name}
                </span>
              )}
              <span className="badge bg-emerald-50 text-emerald-800 border border-emerald-200">
                Disponible immédiatement
              </span>
            </div>

            <h1 className="font-display mt-5 text-3xl sm:text-5xl font-bold leading-tight tracking-tight text-ink">
              {content.title}
            </h1>

            {/* Profil auteur & date */}
            <div className="mt-5 flex items-center gap-3 border-b border-ink/[0.08] pb-6">
              <UserAvatar
                src={content.author_avatar_url}
                name={content.author_name}
                className="h-10 w-10 rounded-xl text-sm shadow-sm"
              />
              <div>
                <p className="text-sm font-bold text-ink">
                  {content.author_name ?? "Auteur vérifié"}
                </p>
                <p className="text-xs text-ink-muted">
                  Publié le {formatDate(content.published_at)} • Revue par le comité
                </p>
              </div>
            </div>

            {/* Description complète */}
            <div className="mt-6">
              <h2 className="eyebrow text-ink-subtle">Présentation du contenu</h2>
              <p className="mt-3 text-base sm:text-lg leading-relaxed text-ink/80">
                {content.description || "Aucune description détaillée fournie."}
              </p>
            </div>

            {/* Avantages & Clés */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-ink/[0.08] bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle">
                  Format
                </p>
                <p className="mt-1 text-sm font-bold text-ink">
                  {CONTENT_TYPES[content.type]}
                </p>
              </div>
              <div className="rounded-2xl border border-ink/[0.08] bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle">
                  Accès
                </p>
                <p className="mt-1 text-sm font-bold text-ink">À vie & Illimité</p>
              </div>
              <div className="col-span-2 sm:col-span-1 rounded-2xl border border-ink/[0.08] bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle">
                  Paiement
                </p>
                <p className="mt-1 text-sm font-bold text-emerald-700">Wave / OM / CB</p>
              </div>
            </div>

            {/* Bloc d'achat & Prix */}
            <div className="mt-10 rounded-2xl border border-ink/[0.08] bg-white p-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-ink-muted">
                    Prix unique d&apos;acquisition
                  </span>
                  <p className="font-display mt-0.5 text-3xl sm:text-4xl font-extrabold text-brand-700">
                    {formatPrice(content.price)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <CheckoutButton
                    contentId={content.id}
                    slug={content.slug}
                    loggedIn={Boolean(profile)}
                    purchased={owned}
                    configured={isPaydunyaConfigured()}
                  />
                  <FavoriteButton
                    contentId={content.id}
                    initial={isFavorite}
                    size="lg"
                  />
                </div>
              </div>

              {/* Message de réassurance PayDunya */}
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-gold-50/80 p-3 text-xs text-gold-900 border border-gold-200/60">
                <span>💳</span>
                <span>
                  <strong>Paiement sécurisé :</strong> Orange Money, Wave, carte
                  bancaire et plus via PayDunya. Le contenu est débloqué
                  instantanément après confirmation.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Auteur */}
        <section className="mt-20 border-t border-ink/[0.08] pt-12">
          <div className="card flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center bg-white">
            <UserAvatar
              src={content.author_avatar_url}
              name={content.author_name}
              className="h-16 w-16 rounded-2xl text-2xl shadow-md"
            />
            <div className="min-w-0 flex-1">
              <span className="badge bg-brand-50 text-brand-700">Créateur Vérifié</span>
              <h2 className="font-display mt-1 text-xl font-bold text-ink">
                {content.author_name ?? "Auteur"}
              </h2>
              <p className="mt-1 max-w-2xl text-xs sm:text-sm leading-relaxed text-ink-muted">
                Spécialiste et contributeur actif sur SUNU CONTENU. Les contenus publiés
                par cet auteur respectent la charte pédagogique et éditoriale.
              </p>
            </div>
            <Link
              href={`/auteurs/${content.author_id}`}
              className="btn btn-outline shrink-0 !rounded-xl !py-2.5 !px-4 !text-xs !font-bold"
            >
              Voir sa boutique →
            </Link>
          </div>
        </section>

        {/* Section Avis & Notes */}
        <section className="mt-16 border-t border-ink/[0.08] pt-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">
                Avis &amp; Notes
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                Ce que pensent les lecteurs de ce contenu.
              </p>
            </div>
            <div className="sm:text-right">
              <Stars value={average} size="text-2xl" />
              <p className="mt-1 text-sm font-semibold text-ink">
                {average.toFixed(1)} / 5{" "}
                <span className="font-normal text-ink-muted">
                  ({count} avis{count > 1 ? "s" : ""})
                </span>
              </p>
            </div>
          </div>

          {/* Formulaire d'avis */}
          <div className="mt-6">
            {profile ? (
              canReview ? (
                <ReviewForm
                  contentId={content.id}
                  defaultRating={myReview?.rating ?? 5}
                  defaultComment={myReview?.comment ?? ""}
                  isUpdate={Boolean(myReview)}
                />
              ) : (
                <div className="rounded-2xl border border-ink/[0.08] bg-white p-5 text-sm text-ink-muted">
                  🔒 Seuls les clients ayant acheté ce contenu peuvent laisser un
                  avis. Le paiement PayDunya sera bientôt disponible.
                </div>
              )
            ) : (
              <div className="rounded-2xl border border-ink/[0.08] bg-white p-5 text-sm text-ink-muted">
                💬 <Link href="/connexion" className="font-semibold text-brand-700 hover:underline">Connectez-vous</Link>{" "}
                pour laisser un avis après votre achat.
              </div>
            )}
          </div>

          {/* Liste des avis */}
          <div className="mt-8 space-y-4">
            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-ink/15 bg-white/50 p-8 text-center text-sm text-ink-muted">
                Aucun avis pour le moment. Soyez le premier à partager votre
                expérience !
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="card p-5 bg-white">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      src={review.author_avatar_url}
                      name={review.author_name}
                      className="h-10 w-10 rounded-xl text-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink">
                        {review.author_name ?? "Client"}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <Stars value={review.rating} size="text-sm" />
                        <span className="text-xs text-ink-muted">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                    </div>

                    {profile?.id === review.author_id && (
                      <form action={deleteReview}>
                        <input type="hidden" name="content_id" value={content.id} />
                        <input type="hidden" name="review_id" value={review.id} />
                        <button
                          type="submit"
                          className="text-xs font-semibold text-red-500 transition hover:text-red-600 hover:underline"
                        >
                          Supprimer
                        </button>
                      </form>
                    )}
                  </div>

                  {review.comment && (
                    <p className="mt-3 text-sm leading-relaxed text-ink/80">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
