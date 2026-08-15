import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { ROLES, type Role } from "@/lib/types";
import { UserAvatar } from "@/components/user-avatar";
import { AvatarUploadForm } from "@/components/avatar-upload-form";

const ROLE_LINKS: Record<Role, { href: string; label: string; icon: string }> = {
  admin: { href: "/dashboard/admin", label: "Vue d'ensemble", icon: "📊" },
  editeur: { href: "/dashboard/editeur", label: "Files de relecture", icon: "✍️" },
  auteur: { href: "/dashboard/auteur", label: "Mes contenus & Ventes", icon: "📚" },
  client: { href: "/dashboard/client", label: "Ma bibliothèque", icon: "📖" },
};

const ROLE_ACCENT: Record<Role, string> = {
  admin: "from-brand-600 to-brand-950",
  editeur: "from-amber-600 to-brand-950",
  auteur: "from-emerald-600 to-brand-950",
  client: "from-indigo-600 to-brand-950",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/connexion");

  const role = profile.role;
  const current = ROLE_LINKS[role] ?? ROLE_LINKS.client;

  return (
    <div className="relative min-h-[calc(100vh-76px)] bg-paper pb-20">
      {/* Halo de fond supérieur */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-brand-100/60 to-transparent" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row">
        {/* ================= BARRE LATÉRALE PROFIL & NAVIGATION ================= */}
        <aside className="w-full shrink-0 lg:w-72">
          {/* Carte Identité */}
          <div className="card overflow-hidden bg-white shadow-sm">
            <div className={`h-20 bg-gradient-to-br ${ROLE_ACCENT[role]} relative`}>
              <div className="pattern-grid absolute inset-0 opacity-20" />
            </div>

            <div className="-mt-10 px-6 pb-6">
              <div className="flex items-end justify-between">
                <UserAvatar
                  src={profile.avatar_url}
                  name={profile.full_name}
                  className="h-18 w-18 rounded-2xl text-2xl shadow-xl ring-4 ring-white"
                />
                <span className="badge bg-brand-50 text-brand-800 border border-brand-200">
                  ● Actif
                </span>
              </div>

              <h2 className="font-display mt-4 truncate text-xl font-bold text-ink">
                {profile.full_name ?? "Utilisateur"}
              </h2>
              <p className="text-xs text-ink-muted">
                {profile.phone ? `Tél : ${profile.phone}` : "Membre vérifié"}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <span className="badge bg-gold-100 text-gold-900 border border-gold-300/60 font-bold">
                  {ROLES[role]?.label ?? role}
                </span>
              </div>

              <AvatarUploadForm />
            </div>
          </div>

          {/* Liens de Navigation */}
          <nav className="mt-5 flex flex-col gap-2">
            <Link
              href={current.href}
              className="flex items-center justify-between rounded-2xl bg-brand-800 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-950/20"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{current.icon}</span>
                <span>{current.label}</span>
              </div>
              <span className="text-gold-300">●</span>
            </Link>

            {(role === "admin" || role === "editeur") && (
              <Link
                href="/dashboard/categories"
                className="flex items-center gap-3 rounded-2xl border border-ink/[0.06] bg-white px-5 py-3.5 text-sm font-semibold text-ink-muted transition-all hover:bg-brand-50/70 hover:text-brand-800 hover:border-brand-200"
              >
                <span className="text-base">🗂️</span>
                <span>Gestion des catégories</span>
              </Link>
            )}

            <Link
              href="/catalogue"
              className="flex items-center gap-3 rounded-2xl border border-ink/[0.06] bg-white px-5 py-3.5 text-sm font-semibold text-ink-muted transition-all hover:bg-brand-50/70 hover:text-brand-800 hover:border-brand-200"
            >
              <span className="text-base">🌐</span>
              <span>Explorer le catalogue</span>
            </Link>
          </nav>

          {/* Encart Passerelle PayDunya / Mobile Money */}
          <div className="mt-5 rounded-2xl border border-gold-300/70 bg-gradient-to-br from-gold-50 via-white to-gold-100/40 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-gold-900">
              <span className="text-base">🌊</span>
              <span>Passerelle PayDunya</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-gold-950/80">
              Les reversements automatiques vers vos comptes <strong>Wave</strong> &amp;{" "}
              <strong>Orange Money</strong> seront activés dès la phase finale.
            </p>
          </div>
        </aside>

        {/* ================= CONTENU PRINCIPAL DU DASHBOARD ================= */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
