import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { moderateContent } from "@/lib/actions";
import { attachAuthorInfo } from "@/lib/data";
import { CONTENT_TYPES } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { StatCard } from "@/components/stat-card";
import Link from "next/link";

export default async function EditeurDashboard() {
  await requireProfile("admin", "editeur");
  const supabase = await createClient();

  const [{ data: pendingRaw }, { count: publishedCount }] = await Promise.all([
    supabase
      .from("contents")
      .select("*")
      .eq("status", "soumis")
      .order("updated_at", { ascending: false }),
    supabase
      .from("contents")
      .select("*", { count: "exact", head: true })
      .eq("status", "publie"),
  ]);

  const list = await attachAuthorInfo(
    (pendingRaw ?? []) as { author_id: string }[],
  );

  return (
    <div className="space-y-8">
      {/* En-tête éditeur */}
      <div className="rounded-2xl border border-ink/[0.06] bg-white p-6 shadow-sm">
        <span className="badge bg-amber-50 text-amber-800 font-bold border border-amber-200">
          ✍️ Comité Éditorial
        </span>
        <h1 className="font-display mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-ink">
          File de Relecture &amp; Validation
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-ink-muted">
          Examinez la pertinence, la clarté et l&apos;éthique des contenus soumis avant leur mise en vente.
        </p>
      </div>

      {/* Cartes métriques */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          icon="⏳"
          label="En attente de relecture"
          value={String(list.length)}
          accent="bg-amber-500/10 text-amber-800 border-amber-500/20"
        />
        <StatCard
          icon="✅"
          label="Contenus certifiés & publiés"
          value={String(publishedCount ?? 0)}
          accent="bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
        />
      </div>

      {/* Liste de modération */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-ink">
            Demandes de publication ({list.length})
          </h2>
        </div>

        <div className="space-y-3">
          {list.map((item) => {
            const c = item as unknown as {
              id: string;
              title: string;
              description: string | null;
              type: keyof typeof CONTENT_TYPES;
              price: number;
              author_name: string | null;
            };
            return (
              <div
                key={c.id}
                className="card p-6 sm:p-7 bg-white shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="badge bg-brand-50 text-brand-800 border border-brand-200">
                        {CONTENT_TYPES[c.type]}
                      </span>
                      <span className="badge bg-gold-100 text-gold-900 font-bold">
                        {formatPrice(c.price)}
                      </span>
                      <span className="text-xs font-semibold text-ink-muted">
                        • Par {c.author_name ?? "Auteur inconnu"}
                      </span>
                    </div>

                    <h3 className="font-display mt-3 text-lg sm:text-xl font-bold text-ink">
                      {c.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-ink-muted line-clamp-3">
                      {c.description || "Aucune description fournie."}
                    </p>
                  </div>

                  {/* Actions de modération */}
                  <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                    <Link
                      href={`/dashboard/moderation/${c.id}`}
                      className="btn btn-outline !rounded-xl !py-2.5 !px-4 !text-xs !font-bold"
                    >
                      🔍 Analyser &amp; Décider
                    </Link>
                    <form action={moderateContent} className="flex shrink-0 items-center">
                      <input type="hidden" name="id" value={c.id} />
                      <button
                        type="submit"
                        name="status"
                        value="publie"
                        className="btn btn-primary !rounded-xl !py-2.5 !px-5 !text-xs !font-bold shadow-md"
                      >
                        Approuver &amp; Publier ✨
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}

          {list.length === 0 && (
            <div className="card flex flex-col items-center gap-3 px-6 py-20 text-center bg-white">
              <span className="text-4xl">🎉</span>
              <p className="font-display text-lg font-bold text-ink">
                File de modération vide !
              </p>
              <p className="max-w-sm text-xs text-ink-muted">
                Tous les contenus soumis ont été traités. Félicitations pour votre réactivité !
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
