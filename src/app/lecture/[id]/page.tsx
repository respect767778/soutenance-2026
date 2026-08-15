import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getAdminClientOrNull } from "@/lib/supabase/admin";
import { confirmInvoice, mapStatus } from "@/lib/paydunya";
import { CONTENT_TYPES, type ContentType } from "@/lib/types";
import { CONTENT_ICONS, CONTENT_GRADIENTS } from "@/lib/display";

export const metadata: Metadata = {
  title: "Lecture sécurisée",
  robots: { index: false, follow: false },
};

function isStaff(role?: string | null): boolean {
  return role === "admin" || role === "editeur";
}

const VIDEO_EXTS = ["mp4", "webm", "mov", "mkv", "avi", "m4v", "ogv"];
const AUDIO_EXTS = ["mp3", "wav", "m4a", "ogg", "aac", "flac", "opus"];

function extOf(url: string): string {
  return url.split("?")[0].split("#")[0].split(".").pop()?.toLowerCase() ?? "";
}

function classify(
  type: ContentType,
  fileUrl: string,
): "pdf" | "video" | "audio" | "other" {
  const ext = extOf(fileUrl);
  if (type === "video" || VIDEO_EXTS.includes(ext)) return "video";
  if (type === "audio" || AUDIO_EXTS.includes(ext)) return "audio";
  if (type === "ebook" || type === "document" || ext === "pdf") return "pdf";
  return "other";
}

const ACTION_LABEL: Record<string, string> = {
  pdf: "📖 Lire",
  video: "🎬 Visionner",
  audio: "🎧 Écouter",
  other: "📦 Consulter",
};

export default async function LecturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await getProfile();
  const supabase = await createClient();
  const { id } = await params;

  if (!profile) redirect(`/connexion?next=/lecture/${id}`);

  const { data: contentRaw } = await supabase
    .from("contents")
    .select("id, author_id, title, file_url, type")
    .eq("id", id)
    .maybeSingle();

  const content = contentRaw as {
    id: string;
    author_id: string;
    title: string;
    file_url: string;
    type: ContentType;
  } | null;

  if (!content || !content.file_url) {
    redirect("/dashboard/client?erreur=fichier_indisponible");
  }

  const isOwner = content.author_id === profile.id;
  const staff = isStaff(profile.role);

  // Vérification de l'accès (acheteur, auteur ou personnel)
  if (!isOwner && !staff) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id, status, paydunya_token")
      .eq("buyer_id", profile.id)
      .eq("content_id", id)
      .maybeSingle();

    if (!purchase) redirect("/dashboard/client?erreur=non_achete");

    // Auto-guérison : si l'achat est en attente avec un token PayDunya
    if (purchase.status === "pending" && purchase.paydunya_token) {
      try {
        const res = await confirmInvoice(purchase.paydunya_token);
        const mapped = mapStatus(res.status);
        if (mapped === "complete") {
          purchase.status = "complete";
          const admin = getAdminClientOrNull();
          if (admin) {
            await admin
              .from("purchases")
              .update({ status: "complete" })
              .eq("id", purchase.id);
          }
        }
      } catch (e) {
        console.warn("[Lecture] auto-confirm error:", e);
      }
    }

    if (purchase.status === "pending") {
      redirect("/dashboard/client?erreur=paiement_en_attente");
    }
    if (purchase.status !== "complete") {
      redirect("/dashboard/client?erreur=paiement_invalide");
    }
  }

  const kind = classify(content.type, content.file_url);

  // Lien signé temporaire (60 s) : ne limite pas la durée de lecture,
  // seulement le délai pour OUVRIR le fichier. Régénéré à chaque ouverture.
  // NB : le PDF n'utilise PAS de lien signé — il est servi filigrané par
  // /api/contents/[id]/download?inline=1 (un "Enregistrer sous" sauvegarde
  // alors la copie marquée, pas l'original).
  let signedUrl: string | null = null;

  if (kind !== "pdf") {
    const { data } = await supabase.storage
      .from("contents")
      .createSignedUrl(
        content.file_url,
        60,
        kind === "other" ? { download: true } : undefined,
      );
    signedUrl = data?.signedUrl ?? null;

    if (!signedUrl) {
      const admin = getAdminClientOrNull();
      if (admin) {
        try {
          const { data: adminSigned } = await admin.storage
            .from("contents")
            .createSignedUrl(
              content.file_url,
              60,
              kind === "other" ? { download: true } : undefined,
            );
          signedUrl = adminSigned?.signedUrl ?? null;
        } catch (e) {
          console.error("[Lecture] admin signed url fallback:", e);
        }
      }
    }

    if (!signedUrl) {
      redirect("/dashboard/client?erreur=lien_indisponible");
    }
  }

  const gradient = CONTENT_GRADIENTS[content.type] ?? "from-brand-600 to-brand-900";
  const icon = CONTENT_ICONS[content.type] ?? "📄";

  return (
    <div className="flex min-h-[calc(100vh-76px)] flex-col bg-paper">
      {/* Barre supérieure du lecteur */}
      <header className="sticky top-0 z-30 border-b border-ink/[0.08] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/dashboard/client"
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-ink/[0.08] bg-white px-3 py-2 text-xs font-bold text-ink-muted transition hover:text-brand-700"
            >
              <span aria-hidden>←</span> Retour
            </Link>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">{content.title}</p>
              <p className="text-[11px] text-ink-muted">
                {CONTENT_TYPES[content.type]} · Lecture sécurisée
              </p>
            </div>
          </div>
          <span className="badge hidden bg-emerald-50 text-emerald-800 border border-emerald-200 sm:inline-flex">
            🛡️ Accès vérifié
          </span>
        </div>
      </header>

      {/* Zone de lecture */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        {kind === "pdf" && (
          <div className="flex h-full flex-col">
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-gold-200 bg-gold-50/70 px-4 py-2.5 text-xs text-gold-800">
              <span aria-hidden>🛡️</span>
              <span>
                Lecture sécurisée : cet aperçu est <strong>filigrané à votre nom</strong>.
                Toute copie enregistrée depuis cette page porte votre identification.
              </span>
            </div>
            <iframe
              src={`/api/contents/${content.id}/download?inline=1#toolbar=0&navpanes=0`}
              title={`Lecture de ${content.title}`}
              className="h-[calc(100vh-260px)] min-h-[520px] w-full rounded-2xl border border-ink/[0.08] bg-white shadow-sm"
            />
          </div>
        )}

        {kind === "video" && (
          <div className="flex h-full flex-col items-center">
            <video
              controls
              playsInline
              preload="metadata"
              controlsList="nodownload noremoteplayback"
              disablePictureInPicture
              src={signedUrl ?? undefined}
              className="max-h-[calc(100vh-220px)] w-full rounded-2xl bg-black shadow-2xl"
            >
              Votre navigateur ne supporte pas la lecture vidéo.
            </video>
            <p className="mt-4 text-xs text-ink-muted">
              🛡️ Lecture en ligne sécurisée — le fichier n&apos;est pas téléchargeable ici.
            </p>
          </div>
        )}

        {kind === "audio" && (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="card w-full max-w-2xl p-8 text-center">
              <span
                className={`mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br ${gradient} text-5xl shadow-lg`}
              >
                {icon}
              </span>
              <h1 className="font-display mt-5 text-xl font-bold text-ink">
                {content.title}
              </h1>
              <p className="mt-1 text-xs text-ink-muted">
                {CONTENT_TYPES[content.type]} · Écoute en ligne
              </p>
              <audio
                controls
                controlsList="nodownload"
                src={signedUrl ?? undefined}
                className="mt-6 w-full"
              >
                Votre navigateur ne supporte pas la lecture audio.
              </audio>
            </div>
          </div>
        )}

        {kind === "other" && (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="card w-full max-w-md p-8 text-center">
              <span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-brand-50 text-4xl">
                📦
              </span>
              <h1 className="font-display mt-5 text-xl font-bold text-ink">
                {content.title}
              </h1>
              <p className="mt-2 text-sm text-ink-muted">
                Ce format n&apos;a pas d&apos;aperçu en ligne. Téléchargez le fichier
                ci-dessous.
              </p>
              <a
                href={signedUrl ?? undefined}
                className="btn btn-primary mt-6 !rounded-xl !py-3 !px-6 !text-sm"
              >
                ⬇ Télécharger le fichier
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
