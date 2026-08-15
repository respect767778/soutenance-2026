import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { updateUserRole, moderateContent } from "@/lib/actions";
import { attachAuthorInfo } from "@/lib/data";
import { UserAvatar } from "@/components/user-avatar";
import { CONTENT_STATUS, CONTENT_TYPES, ROLES, type Role } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { StatCard } from "@/components/stat-card";
import Link from "next/link";

export default async function AdminDashboard() {
  await requireProfile("admin");
  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: totalContents },
    { count: publishedCount },
    { data: sales },
    { data: users },
    { data: contentsRaw },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("contents").select("*", { count: "exact", head: true }),
    supabase
      .from("contents")
      .select("*", { count: "exact", head: true })
      .eq("status", "publie"),
    supabase.from("purchases").select("amount"),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase
      .from("contents")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const contents = await attachAuthorInfo(
    (contentsRaw ?? []) as { author_id: string }[],
  );

  const revenue = (sales ?? []).reduce(
    (sum, p) => sum + ((p as { amount: number }).amount ?? 0),
    0,
  );

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="rounded-2xl border border-ink/[0.06] bg-white p-6 shadow-sm">
        <span className="badge bg-brand-50 text-brand-700 font-bold border border-brand-200">
          🛡️ Espace Super-Admin
        </span>
        <h1 className="font-display mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-ink">
          Tour de Contrôle &amp; Métriques
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-ink-muted">
          Supervisez l&apos;ensemble des comptes, contenus et volumes financiers en temps réel.
        </p>
      </div>

      {/* Cartes statistiques */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon="👥"
          label="Utilisateurs"
          value={String(totalUsers ?? 0)}
          trend="+12%"
          accent="bg-brand-500/10 text-brand-700 border-brand-500/20"
        />
        <StatCard
          icon="📦"
          label="Contenus"
          value={String(totalContents ?? 0)}
          trend="+8%"
          accent="bg-sky-500/10 text-sky-700 border-sky-500/20"
        />
        <StatCard
          icon="✅"
          label="Publiés"
          value={String(publishedCount ?? 0)}
          trend="+5%"
          accent="bg-gold-500/10 text-gold-800 border-gold-500/20"
        />
        <StatCard
          icon="💰"
          label="Volume Total"
          value={formatPrice(revenue)}
          trend="+18%"
          accent="bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
        />
      </div>

      {/* Gestion des Utilisateurs */}
      <section className="card p-6 sm:p-8 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink/[0.06] pb-5">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">
              Gestion des Utilisateurs &amp; Privilèges
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-ink-muted">
              Attribuez ou révoquez les rôles d&apos;administration et d&apos;édition.
            </p>
          </div>
          <span className="badge bg-brand-50 text-brand-800 border border-brand-200 self-start sm:self-auto">
            {users?.length ?? 0} comptes inscrits
          </span>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/[0.08] text-xs font-bold uppercase tracking-wider text-ink-subtle">
                <th className="py-3 pr-4">Utilisateur</th>
                <th className="py-3 pr-4">Rôle Système</th>
                <th className="py-3 pr-4">Date d&apos;inscription</th>
                <th className="py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.04]">
              {(users ?? []).map((u) => {
                const user = u as {
                  id: string;
                  full_name: string | null;
                  email?: string;
                  avatar_url: string | null;
                  role: Role;
                  created_at: string;
                };
                return (
                  <tr key={user.id} className="transition-colors hover:bg-brand-50/40">
                    <td className="py-3.5 pr-4 font-semibold text-ink">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar
                          src={user.avatar_url}
                          name={user.full_name}
                          className="h-8 w-8 rounded-lg text-xs"
                        />
                        <div>
                          <p className="text-sm font-bold text-ink">
                            {user.full_name ?? "Sans nom"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 pr-4">
                      <form action={updateUserRole} className="flex items-center gap-2">
                        <input type="hidden" name="user_id" value={user.id} />
                        <select
                          name="role"
                          defaultValue={user.role}
                          className="input !w-auto !py-1.5 !px-3 !text-xs !font-semibold !rounded-xl"
                        >
                          {(Object.keys(ROLES) as Role[]).map((r) => (
                            <option key={r} value={r}>
                              {ROLES[r].label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="rounded-xl bg-brand-800 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-brand-900 shadow-sm"
                        >
                          Mettre à jour
                        </button>
                      </form>
                    </td>

                    <td className="py-3.5 pr-4 text-xs font-medium text-ink-muted">
                      {new Date(user.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-3.5 text-right">
                      <span className="badge bg-emerald-50 text-emerald-800 text-[10px]">
                        Vérifié
                      </span>
                    </td>
                  </tr>
                );
              })}

              {!users?.length && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-xs text-ink-muted">
                    Aucun compte enregistré pour l&apos;instant.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Surveillance des Contenus */}
      <section className="card p-6 sm:p-8 bg-white shadow-sm">
        <div className="border-b border-ink/[0.06] pb-4">
          <h2 className="font-display text-xl font-bold text-ink">
            Derniers Contenus Déposés
          </h2>
          <p className="mt-1 text-xs text-ink-muted">
            Flux chronologique des dépôts sur la plateforme.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {(contents ?? []).map((c) => {
            const content = c as unknown as {
              id: string;
              title: string;
              type: keyof typeof CONTENT_TYPES;
              status: keyof typeof CONTENT_STATUS;
              price: number;
              author_name: string | null;
            };
            return (
              <div
                key={content.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/[0.06] bg-paper-subtle/50 p-4 transition hover:bg-paper-subtle"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink">
                    {content.title}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {CONTENT_TYPES[content.type]} • Prix : {formatPrice(content.price)}
                    {content.author_name ? ` • Par ${content.author_name}` : ""}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <span className={`badge ${CONTENT_STATUS[content.status].badge}`}>
                    {CONTENT_STATUS[content.status].label}
                  </span>

                  <Link
                    href={`/dashboard/moderation/${content.id}`}
                    className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-[11px] font-bold text-ink-muted transition hover:bg-ink/5"
                  >
                    🔍 Analyser
                  </Link>

                  {content.status === "soumis" ? (
                    <form action={moderateContent}>
                      <input type="hidden" name="id" value={content.id} />
                      <button
                        type="submit"
                        name="status"
                        value="publie"
                        className="rounded-lg bg-brand-700 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition hover:bg-brand-800"
                      >
                        Publier ✓
                      </button>
                    </form>
                  ) : null}

                  {content.status === "publie" ? (
                    <form action={moderateContent}>
                      <input type="hidden" name="id" value={content.id} />
                      <button
                        type="submit"
                        name="status"
                        value="archive"
                        className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-[11px] font-bold text-ink-muted transition hover:bg-ink/5"
                      >
                        Archiver
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            );
          })}

          {!contents?.length && (
            <p className="py-8 text-center text-xs text-ink-muted">
              Aucun contenu déposé pour le moment.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
