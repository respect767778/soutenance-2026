import Link from "next/link";
import type { ContentCard as ContentCardType } from "@/lib/types";
import { CONTENT_TYPES } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { CONTENT_ICONS, CONTENT_GRADIENTS } from "@/lib/display";
import { UserAvatar } from "@/components/user-avatar";
import { FavoriteButton } from "@/components/favorite-button";

export function ContentCard({
  content,
  isFavorite = false,
}: {
  content: ContentCardType;
  isFavorite?: boolean;
}) {
  const gradient = CONTENT_GRADIENTS[content.type] ?? "from-brand-600 to-brand-900";
  const icon = CONTENT_ICONS[content.type] ?? "📚";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[1.5rem] border border-ink/[0.08] bg-white shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-300/80 hover:shadow-[0_24px_48px_-16px_rgba(13,95,66,0.22)]">
      <Link href={`/catalogue/${content.slug}`} className="flex flex-1 flex-col">
        {/* Zone visuelle / Couverture */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-950">
          {content.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={content.cover_url}
              alt={content.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
            />
          ) : (
            <div
              className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient} p-6`}
            >
              <div className="pattern-dots absolute inset-0 text-white/10" />
              <span className="relative text-5xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 drop-shadow-lg">
                {icon}
              </span>
            </div>
          )}

          {/* Voile dégradé cinéma */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-brand-950/20 to-transparent" />

          {/* Badges supérieurs */}
          <div className="absolute left-3 top-3 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-brand-950/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white shadow-sm backdrop-blur-md">
              <span>{icon}</span>
              <span>{CONTENT_TYPES[content.type]}</span>
            </span>
          </div>

          {/* Prix flottant en bas à droite */}
          <div className="absolute bottom-3 right-3">
            <span className="inline-flex items-center rounded-xl border border-white/40 bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 px-3 py-1 text-xs font-extrabold text-brand-950 shadow-lg backdrop-blur-sm">
              {formatPrice(content.price)}
            </span>
          </div>
        </div>

        {/* Détails & Contenu */}
        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            {content.category_name ? (
              <span className="text-[11px] font-bold uppercase tracking-wider text-gold-700">
                {content.category_name}
              </span>
            ) : null}

            <h3 className="font-display mt-1 line-clamp-2 text-base sm:text-lg font-bold leading-snug text-ink transition-colors duration-200 group-hover:text-brand-700">
              {content.title}
            </h3>

            <p className="mt-2 line-clamp-2 text-xs sm:text-sm leading-relaxed text-ink-muted">
              {content.description || "Découvrez ce contenu exclusif créé pour accélérer vos compétences et projets."}
            </p>
          </div>

          {/* Pied de carte : Auteur & Garantie */}
          <div className="mt-4 flex items-center justify-between border-t border-ink/[0.06] pt-3.5">
            <div className="flex items-center gap-2">
              <UserAvatar
                src={content.author_avatar_url}
                name={content.author_name}
                className="h-6 w-6 rounded-full text-[11px] shadow-inner"
              />
              <span className="text-xs font-semibold text-ink-muted group-hover:text-ink">
                {content.author_name ?? "Auteur vérifié"}
              </span>
            </div>

            <span className="flex items-center gap-1 text-[11px] font-medium text-gold-600">
              <span>★</span>
              <span>Certifié</span>
            </span>
          </div>
        </div>
      </Link>

      {/* Bouton favori (élément frère du lien) */}
      <div className="absolute right-3 top-3 z-20">
        <FavoriteButton contentId={content.id} initial={isFavorite} size="sm" />
      </div>
    </div>
  );
}
