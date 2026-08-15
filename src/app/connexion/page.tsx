import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { ROLES, type Role } from "@/lib/types";
import { ROLE_UI } from "@/lib/role-ui";

export const metadata: Metadata = {
  title: "Portail de Connexion par Rôle",
  description: "Sélectionnez votre espace de connexion sécurisé sur SUNU CONTENU.",
};

export default async function ConnexionHub({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="relative min-h-[calc(100vh-76px)] overflow-hidden bg-gradient-to-b from-brand-950 via-brand-950 to-brand-900 py-16 px-4 sm:px-6 flex flex-col justify-center">
      {/* Lueurs d'ambiance */}
      <div className="pointer-events-none absolute inset-0 pattern-grid opacity-20" />
      <div className="pointer-events-none absolute -left-24 top-0 h-96 w-96 glow-green opacity-40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 glow-gold opacity-40 blur-3xl" />

      <div className="relative mx-auto max-w-5xl w-full">
        {/* En-tête du Hub */}
        <div className="text-center">
          <div className="flex justify-center">
            <Link href="/">
              <Logo dark />
            </Link>
          </div>
          <h1 className="font-display mt-8 text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Portail d&apos;Accès Sécurisé
          </h1>
          <p className="mt-3 text-sm sm:text-base text-brand-100/70 max-w-lg mx-auto">
            Chaque rôle dispose d&apos;une porte d&apos;entrée distincte et sécurisée.
            Sélectionnez votre espace pour continuer.
          </p>
        </div>

        {/* Message d'erreur éventuel */}
        {error === "auth" && (
          <div className="mx-auto mt-6 max-w-md rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-center text-xs font-semibold text-red-200 backdrop-blur-md">
            ⚠️ La confirmation de votre adresse email a échoué ou a expiré.
          </div>
        )}

        {/* Grille des 4 Rôles */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(ROLES) as Role[]).map((role) => {
            const ui = ROLE_UI[role];
            return (
              <Link
                key={role}
                href={ui.loginHref}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-gold-400/50 hover:bg-white/10 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)]"
              >
                <div>
                  <span
                    className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${ui.gradient} text-2xl shadow-lg`}
                  >
                    {ui.icon}
                  </span>

                  <h2 className="font-display mt-5 text-xl font-bold text-white">
                    {ROLES[role].label}
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-brand-100/70">
                    {ui.tagline}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-gold-300 group-hover:text-gold-200">
                    Accéder à l&apos;espace
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-gold-300 transition-transform duration-200 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Informations de gouvernance */}
        <div className="mt-12 mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-5 text-center text-xs leading-relaxed text-brand-100/70 backdrop-blur-md">
          <strong className="text-gold-300">💡 Information importante :</strong> Les accès{" "}
          <strong className="text-white">Administrateur</strong> et{" "}
          <strong className="text-white">Éditeur</strong> sont délivrés par le
          comité de gouvernance. Les espaces <strong className="text-white">Auteur</strong> et{" "}
          <strong className="text-white">Client</strong> sont ouverts à l&apos;auto-inscription.
        </div>

        <p className="mt-8 text-center text-xs text-brand-100/50">
          Pas encore de compte ?{" "}
          <Link
            href="/signup"
            className="font-bold text-gold-300 hover:text-gold-200 underline underline-offset-4"
          >
            Créer un compte créateur ou lecteur
          </Link>
        </p>
      </div>
    </div>
  );
}
