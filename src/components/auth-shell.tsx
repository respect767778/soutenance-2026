import Link from "next/link";
import { Logo } from "@/components/logo";

export function AuthShell({
  title,
  subtitle,
  children,
  badge,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[calc(100vh-76px)] overflow-hidden bg-gradient-to-b from-brand-950 via-brand-950 to-brand-900 flex flex-col justify-center py-12 px-4 sm:px-6">
      {/* Motifs géométriques & lueurs de sécurité */}
      <div className="pointer-events-none absolute inset-0 pattern-grid opacity-20" />
      <div className="pointer-events-none absolute -left-20 top-1/4 h-80 w-80 glow-green opacity-40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-1/4 h-80 w-80 glow-gold opacity-40 blur-3xl" />

      <div className="relative mx-auto w-full max-w-md">
        {/* Logo centré */}
        <div className="mb-8 flex justify-center">
          <Link href="/" className="transition-transform duration-200 hover:scale-105">
            <Logo dark />
          </Link>
        </div>

        {/* Boîte d'authentification en verre */}
        <div className="rounded-[2rem] border border-white/15 bg-white/95 p-7 sm:p-10 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
          {badge ? <div className="mb-4">{badge}</div> : null}

          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            {title}
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-ink-muted">
            {subtitle}
          </p>

          <div className="mt-6">{children}</div>
        </div>

        {/* Message de réassurance sous la carte */}
        <p className="mt-6 text-center text-xs font-medium text-brand-200/60">
          🔒 Authentification chiffrée SSL · Vos accès sont protégés
        </p>
      </div>
    </div>
  );
}
