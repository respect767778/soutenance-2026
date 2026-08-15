import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CONTENT_TYPES, type ContentType } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { CONTENT_ICONS, CONTENT_GRADIENTS } from "@/lib/display";
import { StatCard } from "@/components/stat-card";
import { downloadContent } from "@/lib/storage-actions";

export default async function ClientDashboard({
  searchParams,
}: {
  searchParams: Promise<{ paiement?: string; erreur?: string }>;
}) {
  const { paiement, erreur } = await searchParams;
  const profile = await requireProfile("client");
  const supabase = await createClient();

  const [{ data: purchases }, { data: favorites }] = await Promise.all([
    supabase.from("purchases").select("*, contents(*)").eq("buyer_id", profile.id),
    supabase.from("favorites").select("*, contents(*)").eq("user_id", profile.id),
  ]);

  const library = (purchases ?? []) as unknown[];
  const favs = (favorites ?? []) as unknown[];

  const PAYMENT_BANNERS: Record<string, { cls: string; text: string }> = {
    success: {
      cls: "border-emerald-200 bg-emerald-50 text-emerald-800",
      text: "✅ Paiement confirmé ! Votre contenu est disponible dans votre bibliothèque.",
    },
    cancelled: {
      cls: "border-amber-200 bg-amber-50 text-amber-800",
      text: "⚠️ Paiement annulé. Vous pouvez réessayer quand vous le souhaitez.",
    },
    failed: {
      cls: "border-red-200 bg-red-50 text-red-700",
      text: "❌ Le paiement a échoué. Vérifiez vos informations et réessayez.",
    },
  };

  const ERROR_MESSAGES: Record<string, string> = {
    non_achete: "⚠️ Vous devez acheter ce contenu pour y accéder.",
    paiement_en_attente:
      "⏳ Paiement en attente de confirmation. Réessayez dans quelques instants, ou relancez l'achat du contenu.",
    paiement_invalide: "❌ Le paiement pour ce contenu a échoué ou a été annulé.",
    fichier_indisponible: "⚠️ Le fichier n'a pas encore été mis en ligne pour ce contenu.",
    fichier_manquant: "⚠️ Le fichier source est introuvable sur le serveur de stockage.",
    identifiant_manquant: "⚠️ Requête de téléchargement invalide.",
  };

  const errorMessage = erreur ? (ERROR_MESSAGES[erreur] ?? `⚠️ Erreur : ${decodeURIComponent(erreur)}`) : null;

  return (
    <div className="space-y-8">
      {paiement && PAYMENT_BANNERS[paiement] && (
        <div
          className={`rounded-2xl border px-5 py-4 text-sm font-semibold ${PAYMENT_BANNERS[paiement].cls}`}
        >
          {PAYMENT_BANNERS[paiement].text}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      {/* En-tête Client */}
      <div className="rounded-2xl border border-ink/[0.06] bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge bg-indigo-50 text-indigo-800 font-bold border border-indigo-200">
            📚 Espace Apprenant
          </span>
          <h1 className="font-display mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Ma Bibliothèque Personnelle
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-ink-muted">
            Accédez à vos ebooks, cours et audios achetés en accès illimité.
          </p>
        </div>
        <Link href="/catalogue" className="btn btn-outline !rounded-xl !py-2.5 !text-xs self-start sm:self-auto">
          Découvrir des nouveautés →
        </Link>
      </div>

      {/* Cartes métriques */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon="📖"
          label="Contenus acquis"
          value={String(library.length)}
          accent="bg-indigo-500/10 text-indigo-700 border-indigo-500/20"
        />
        <StatCard
          icon="❤️"
          label="Coups de cœur"
          value={String(favs.length)}
          accent="bg-rose-500/10 text-rose-700 border-rose-500/20"
        />
        <StatCard
          icon="✨"
          label="Catalogue disponible"
          value="100+"
          accent="bg-gold-500/10 text-gold-800 border-gold-500/20"
        />
      </div>

      {/* Section Contenus Achetés */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-ink">
          Mes Ressources Achetées ({library.length})
        </h2>

        {library.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 px-6 py-20 text-center bg-white shadow-sm">
            <span className="text-5xl">📚</span>
            <p className="font-display text-lg font-bold text-ink">
              Votre bibliothèque est encore vide
            </p>
            <p className="max-w-sm text-xs text-ink-muted">
              Découvrez nos formations et ebooks exclusifs créés par des talents sénégalais.
            </p>
            <Link href="/catalogue" className="btn btn-primary !rounded-xl !py-2.5 !px-5 !text-xs mt-3">
              Explorer le catalogue
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {library.map((item) => {
              const row = item as {
                id: string;
                created_at: string;
                contents: {
                  id: string;
                  title: string;
                  slug: string;
                  type: ContentType;
                  cover_url: string | null;
                  file_url: string | null;
                } | null;
              };
              const c = row.contents;
              if (!c) return null;
              const grad = CONTENT_GRADIENTS[c.type] ?? "from-brand-600 to-brand-900";
              const ic = CONTENT_ICONS[c.type] ?? "📖";

              return (
                <div
                  key={row.id}
                  className="card flex items-center gap-4 p-4 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl">
                    {c.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.cover_url}
                        alt={c.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span
                        className={`grid h-full w-full place-items-center bg-gradient-to-br ${grad} text-2xl text-white shadow-sm`}
                      >
                        {ic}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{c.title}</p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {CONTENT_TYPES[c.type]} • Acquis le{" "}
                      {new Date(row.created_at).toLocaleDateString("fr-FR")}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <Link
                        href={`/catalogue/${c.slug}`}
                        className="text-xs font-bold text-brand-700 hover:text-brand-600"
                      >
                        Voir la fiche →
                      </Link>
                      {c.file_url ? (
                        <>
                          <Link
                            href={`/lecture/${c.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-2.5 py-1 text-xs font-bold text-white transition hover:bg-brand-800"
                          >
                            <span>
                              {c.type === "video"
                                ? "🎬 Visionner"
                                : c.type === "audio"
                                  ? "🎧 Écouter"
                                  : "📖 Lire"}
                            </span>
                          </Link>
                          <a
                            href={`/api/contents/${c.id}/download`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 transition hover:bg-emerald-100"
                            title="Votre nom et numéro de téléphone sont protégés et estampillés sur votre exemplaire"
                          >
                            <span>⬇ Télécharger</span>
                            <span className="text-[10px] bg-emerald-200/60 px-1 py-0.2 rounded text-emerald-900 font-normal">🛡️ Sécurisé</span>
                          </a>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section Favoris */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-ink">
          Ma Liste de Souhaits ({favs.length})
        </h2>

        {favs.length === 0 ? (
          <div className="card p-6 text-center text-xs text-ink-muted bg-white shadow-sm">
            Aucun favori enregistré. Marquez vos contenus préférés en parcourant le catalogue.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {favs.map((item) => {
              const row = item as {
                content_id: string;
                contents: {
                  id: string;
                  title: string;
                  slug: string;
                  type: ContentType;
                  price: number;
                } | null;
              };
              const c = row.contents;
              if (!c) return null;
              const grad = CONTENT_GRADIENTS[c.type] ?? "from-brand-600 to-brand-900";
              const ic = CONTENT_ICONS[c.type] ?? "📖";

              return (
                <Link
                  key={row.content_id}
                  href={`/catalogue/${c.slug}`}
                  className="card flex items-center gap-4 p-4 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <span
                    className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${grad} text-2xl text-white shadow-sm`}
                  >
                    {ic}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{c.title}</p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {CONTENT_TYPES[c.type]} • {formatPrice(c.price)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-brand-700">Voir →</span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
