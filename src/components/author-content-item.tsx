import type { ContentStatus, ContentType } from "@/lib/types";
import { CONTENT_STATUS, CONTENT_TYPES } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { CONTENT_ICONS, CONTENT_GRADIENTS } from "@/lib/display";
import { deleteContent, submitContent } from "@/lib/actions";
import { downloadContent } from "@/lib/storage-actions";
import { CoverUploadForm, ContentFileUploadForm } from "@/components/upload-forms";
import {
  ContentEditForm,
  type CategoryOption,
} from "@/components/content-edit-form";

export type AuthorContent = {
  id: string;
  title: string;
  type: ContentType;
  price: number;
  status: ContentStatus;
  description: string | null;
  category_id: string | null;
  cover_url: string | null;
  file_url: string | null;
  rejection_reason: string | null;
  categories: { name: string } | null;
};

export function AuthorContentItem({
  content,
  categories,
}: {
  content: AuthorContent;
  categories: CategoryOption[];
}) {
  const gradient = CONTENT_GRADIENTS[content.type];
  const icon = CONTENT_ICONS[content.type];

  return (
    <div className="card overflow-hidden bg-white shadow-sm transition-all hover:shadow-md">
      {/* Ligne principale */}
      <div className="flex flex-wrap items-center gap-4 p-5 sm:p-6">
        {/* Couverture miniature */}
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
          {content.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={content.cover_url}
              alt={content.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className={`grid h-full w-full place-items-center bg-gradient-to-br ${gradient} text-2xl`}
            >
              {icon}
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display truncate text-base font-bold text-ink sm:text-lg">
              {content.title}
            </h3>
            <span className={`badge ${CONTENT_STATUS[content.status].badge}`}>
              {CONTENT_STATUS[content.status].label}
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-muted">
            <strong className="text-brand-800">{formatPrice(content.price)}</strong> •{" "}
            {CONTENT_TYPES[content.type]}
            {content.categories?.name ? ` • Thème : ${content.categories.name}` : ""}
          </p>
          <p className="mt-1 text-[11px] text-ink-subtle">
            {content.file_url ? "📎 Fichier téléversé" : "📎 Fichier manquant"}{" "}
            • {content.cover_url ? "🖼️ Couverture définie" : "🖼️ Couverture manquante"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {(content.status === "brouillon" || content.status === "rejete") && (
            <form action={submitContent}>
              <input type="hidden" name="id" value={content.id} />
              <button
                type="submit"
                className="btn btn-gold !rounded-xl !py-2 !px-4 !text-xs !font-bold shadow-sm"
              >
                {content.status === "rejete" ? "Re-soumettre 🚀" : "Soumettre 🚀"}
              </button>
            </form>
          )}
          <form action={deleteContent}>
            <input type="hidden" name="id" value={content.id} />
            <button
              type="submit"
              className="rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
            >
              Supprimer
            </button>
          </form>
        </div>
      </div>

      {/* Motif de rejet (visible uniquement si rejeté) */}
      {content.status === "rejete" && (
        <div className="mx-5 mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 sm:mx-6">
          <p className="text-xs font-bold uppercase tracking-wider text-red-700">
            ✕ Contenu refusé par le comité
          </p>
          <p className="mt-2 text-sm leading-relaxed text-red-800">
            <strong>Motif :</strong>{" "}
            {content.rejection_reason?.trim() || "Aucun motif renseigné."}
          </p>
          <p className="mt-2 text-[11px] text-red-600/70">
            Corrigez votre contenu puis cliquez sur « Re-soumettre ».
          </p>
        </div>
      )}

      {/* Modifier les informations */}
      <details className="group border-t border-ink/[0.06]">
        <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-muted transition hover:bg-paper-subtle/60 sm:px-6">
          <span className="flex items-center gap-2">
            ✏️ Modifier les informations
          </span>
          <span className="text-brand-700 transition-transform group-open:rotate-45">
            ✚
          </span>
        </summary>

        <div className="border-t border-ink/[0.06] bg-paper/40 p-5 sm:p-6">
          <ContentEditForm content={content} categories={categories} />
        </div>
      </details>

      {/* Médias & fichier */}
      <details className="group border-t border-ink/[0.06]">
        <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-muted transition hover:bg-paper-subtle/60 sm:px-6">
          <span className="flex items-center gap-2">
            📦 Médias &amp; fichier du contenu
          </span>
          <span className="text-brand-700 transition-transform group-open:rotate-45">
            ✚
          </span>
        </summary>

        <div className="grid gap-6 border-t border-ink/[0.06] bg-paper/40 p-5 sm:p-6 md:grid-cols-2">
          {/* Couverture */}
          <div className="rounded-2xl border border-ink/[0.08] bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-ink">
              🖼️ Image de couverture
            </p>
            <p className="mt-1 text-[11px] text-ink-muted">
              JPG, PNG, WebP ou GIF — 5 Mo max. Affichée sur la fiche et le
              catalogue.
            </p>
            <CoverUploadForm contentId={content.id} />
          </div>

          {/* Fichier */}
          <div className="rounded-2xl border border-ink/[0.08] bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-ink">
              📎 Fichier du contenu
            </p>
            <p className="mt-1 text-[11px] text-ink-muted">
              Le fichier vendu (PDF, MP4, MP3, DOCX…) — 50 Mo max. Il reste
              privé et n&apos;est délivré qu&apos;aux acheteurs.
            </p>
            <ContentFileUploadForm contentId={content.id} />
            {content.file_url ? (
              <form action={downloadContent} className="mt-3">
                <input type="hidden" name="content_id" value={content.id} />
                <button
                  type="submit"
                  className="text-xs font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-600"
                >
                  Tester le téléchargement →
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </details>
    </div>
  );
}
