import Link from "next/link";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { moderateContent } from "@/lib/actions";
import { downloadContent } from "@/lib/storage-actions";
import { attachAuthorInfo } from "@/lib/data";
import { UserAvatar } from "@/components/user-avatar";
import { RejectForm } from "./reject-form";
import {
  CONTENT_STATUS,
  CONTENT_TYPES,
  type ContentStatus,
  type ContentType,
} from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/format";
import { CONTENT_ICONS, CONTENT_GRADIENTS } from "@/lib/display";

export default async function ModerationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireProfile("admin", "editeur");
  const supabase = await createClient();
  const { id } = await params;

  const { data } = await supabase
    .from("contents")
    .select("*, categories(name)")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  const [row] = await attachAuthorInfo([data as { author_id: string }]);

  const content = row as unknown as {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    type: ContentType;
    price: number;
    status: ContentStatus;
    cover_url: string | null;
    file_url: string | null;
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
    published_at: string | null;
    author_name: string | null;
    author_avatar_url: string | null;
    categories: { name: string } | null;
  };

  const gradient = CONTENT_GRADIENTS[content.type];
  const icon = CONTENT_ICONS[content.type];

  return (
    <div className="space-y-6">
      {/* Fil d'ariane */}
      <div>
        <Link
          href={`/dashboard/${profile.role}`}
          className="text-sm font-semibold text-ink-muted transition hover:text-brand-700"
        >
          ← Retour à la file de relecture
        </Link>
        <p className="eyebrow mt-4 text-brand-600">Analyse du contenu</p>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-ink">
          {content.title}
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        {/* Colonne gauche : couverture + méta */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-3xl shadow-[0_32px_64px_-32px_rgba(11,89,64,0.55)] ring-1 ring-ink/10">
            {content.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={content.cover_url}
                alt={content.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient} text-8xl`}
              >
                {icon}
              </div>
            )}
          </div>

          <div className="card space-y-3 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Informations clés
            </p>
            {[
              ["Format", CONTENT_TYPES[content.type]],
              ["Catégorie", content.categories?.name ?? "—"],
              ["Prix", formatPrice(content.price)],
              ["Déposé le", formatDate(content.created_at)],
              ["Statut", CONTENT_STATUS[content.status].label],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between gap-3 border-b border-ink/[0.06] pb-2 last:border-0 last:pb-0"
              >
                <span className="text-xs text-ink-muted">{k}</span>
                <span className="text-sm font-semibold text-ink">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne droite : description + fichier + décision */}
        <div className="space-y-5">
          {/* Auteur */}
          <div className="card flex items-center gap-3 p-5">
            <UserAvatar
              src={content.author_avatar_url}
              name={content.author_name}
              className="h-11 w-11 rounded-2xl text-sm"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Auteur
              </p>
              <p className="text-sm font-bold text-ink">
                {content.author_name ?? "Auteur inconnu"}
              </p>
            </div>
          </div>

          {/* Description complète */}
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink">
              Description du contenu
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/70">
              {content.description?.trim() || "Aucune description fournie par l'auteur."}
            </p>
          </div>

          {/* Fichier à analyser */}
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink">
              📎 Fichier du contenu
            </h2>
            {content.file_url ? (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/[0.08] bg-paper-subtle/50 p-4">
                <p className="text-xs text-ink-muted">
                  Un fichier a été téléversé par l&apos;auteur. Téléchargez-le pour
                  vérifier son contenu avant de prendre votre décision.
                </p>
                <form action={downloadContent}>
                  <input type="hidden" name="content_id" value={content.id} />
                  <button
                    type="submit"
                    className="btn btn-outline !rounded-xl !py-2 !px-4 !text-xs !font-bold"
                  >
                    ⬇ Télécharger pour analyse
                  </button>
                </form>
              </div>
            ) : (
              <p className="mt-3 rounded-2xl border border-dashed border-ink/15 p-4 text-sm text-ink-muted">
                ⚠️ Aucun fichier téléversé pour l&apos;instant. L&apos;auteur pourra
                l&apos;ajouter depuis son espace.
              </p>
            )}
          </div>

          {/* Décision éditoriale */}
          <div className="card border-gold-300/50 bg-gold-50/40 p-6">
            <h2 className="font-display text-lg font-bold text-ink">
              Décision éditoriale
            </h2>
            <p className="mt-1 text-xs text-ink-muted">
              Après analyse, validez la publication ou rejetez le contenu avec
              un motif clair pour l&apos;auteur.
            </p>

            {content.status === "soumis" ? (
              <div className="mt-5 space-y-5">
                {/* Approbation */}
                <form action={moderateContent}>
                  <input type="hidden" name="id" value={content.id} />
                  <button
                    type="submit"
                    name="status"
                    value="publie"
                    className="btn btn-primary !rounded-xl !py-3 !px-6 !text-xs !font-bold"
                  >
                    ✓ Approuver &amp; Publier
                  </button>
                </form>

                {/* Rejet avec motif */}
                <div className="rounded-2xl border border-red-200 bg-white p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-red-600">
                    Refuser ce contenu
                  </p>
                  <p className="mt-1 text-[11px] text-ink-muted">
                    Le motif sera transmis à l&apos;auteur pour qu&apos;il puisse
                    corriger et re-soumettre.
                  </p>
                  <RejectForm contentId={content.id} />
                </div>
              </div>
            ) : content.status === "rejete" ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-red-700">
                    ✕ Contenu rejeté
                  </p>
                  <p className="mt-2 text-sm text-red-800">
                    Motif :{" "}
                    {content.rejection_reason?.trim() || "Aucun motif renseigné."}
                  </p>
                </div>
                <p className="text-xs text-ink-muted">
                  En attente que l&apos;auteur corrige son contenu et le re-soumette.
                </p>
              </div>
            ) : content.status === "publie" ? (
              <form action={moderateContent} className="mt-4">
                <input type="hidden" name="id" value={content.id} />
                <button
                  type="submit"
                  name="status"
                  value="archive"
                  className="btn !rounded-xl border border-ink/10 !bg-white !py-2.5 !px-5 !text-xs !font-bold !text-ink-muted hover:!bg-ink/5"
                >
                  Archiver ce contenu
                </button>
              </form>
            ) : (
              <p className="mt-4 rounded-xl bg-white/60 p-3 text-xs font-medium text-ink-muted">
                Ce contenu est « {CONTENT_STATUS[content.status].label} ». Aucune
                action de publication n&apos;est requise actuellement.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
