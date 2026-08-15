import Link from "next/link";
import { getProfile } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { UserAvatar } from "@/components/user-avatar";

export async function Navbar() {
  const profile = await getProfile();

  return (
    <header className="sticky top-0 z-50 border-b border-ink/[0.07] bg-paper/80 backdrop-blur-2xl transition-all duration-200">
      <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" aria-label="SUNU CONTENU — Accueil" className="shrink-0">
          <Logo />
        </Link>

        {/* Navigation centrale */}
        <nav className="hidden items-center gap-1.5 rounded-full border border-ink/[0.08] bg-white/70 px-4 py-1.5 shadow-sm backdrop-blur-md md:flex">
          <Link
            href="/"
            className="rounded-full px-3.5 py-1.5 text-sm font-medium text-ink/75 transition-all hover:bg-brand-50 hover:text-brand-800"
          >
            Accueil
          </Link>
          <Link
            href="/catalogue"
            className="rounded-full px-3.5 py-1.5 text-sm font-medium text-ink/75 transition-all hover:bg-brand-50 hover:text-brand-800"
          >
            Catalogue
          </Link>
          <Link
            href="/#roles"
            className="rounded-full px-3.5 py-1.5 text-sm font-medium text-ink/75 transition-all hover:bg-brand-50 hover:text-brand-800"
          >
            Comment ça marche
          </Link>
          <span className="h-3.5 w-px bg-ink/15 mx-1" />
          <Link
            href="/catalogue?type=ebook"
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-gold-700 hover:bg-gold-50"
          >
            Ebooks
          </Link>
          <Link
            href="/catalogue?type=cours"
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
          >
            Formations
          </Link>
        </nav>

        {/* Actions à droite */}
        <div className="flex items-center gap-3">
          {profile ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="btn btn-outline !h-10 !px-4 !py-0 !text-xs !font-semibold !rounded-xl"
              >
                <span>📊</span>
                <span>Mon Espace ({profile.role})</span>
              </Link>

              <div className="relative group">
                <div className="flex items-center gap-2 rounded-xl border border-ink/[0.08] bg-white/80 p-1.5 pr-2.5 shadow-sm backdrop-blur">
                  <UserAvatar
                    src={profile.avatar_url}
                    name={profile.full_name}
                    className="h-8 w-8 rounded-lg shadow-inner text-xs"
                  />
                  <span className="hidden sm:inline-block max-w-[100px] truncate text-xs font-semibold text-ink">
                    {profile.full_name?.split(" ")[0] ?? "Profil"}
                  </span>
                </div>
              </div>

              <form action="/auth/signout" method="post" className="hidden sm:block">
                <button
                  type="submit"
                  className="rounded-xl border border-ink/[0.08] bg-transparent px-3 py-2 text-xs font-medium text-ink/50 transition-colors hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                >
                  Déconnexion
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/connexion"
                className="btn btn-ghost !h-10 !px-3.5 !py-0 !text-xs !font-semibold !rounded-xl"
              >
                Connexion
              </Link>
              <Link
                href="/signup"
                className="btn btn-primary !h-10 !px-4.5 !py-0 !text-xs !font-semibold !rounded-xl shimmer-effect"
              >
                <span>Rejoindre</span>
                <span aria-hidden="true" className="text-gold-200 font-bold">→</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
