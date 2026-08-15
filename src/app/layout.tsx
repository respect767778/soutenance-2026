import type { Metadata } from "next";
import Link from "next/link";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/inter";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { SupabaseBanner } from "@/components/supabase-banner";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: {
    default: "SUNU CONTENU — La Plateforme de Savoirs Numériques au Sénégal",
    template: "%s · SUNU CONTENU",
  },
  description:
    "SUNU CONTENU, la plateforme sénégalaise de vente et d'apprentissage en ligne : ebooks, cours, vidéos, documents et audios créés par les meilleurs talents locaux.",
  keywords: [
    "contenus numériques Sénégal",
    "ebooks Dakar",
    "cours en ligne Sénégal",
    "PayDunya",
    "Orange Money",
    "Wave Sénégal",
    "créateurs africains",
  ],
};

const footerNav = [
  {
    title: "Plateforme",
    links: [
      { label: "Explorer le Catalogue", href: "/catalogue" },
      { label: "Devenir Auteur", href: "/signup?role=auteur" },
      { label: "Espace Éditeur", href: "/connexion/editeur" },
      { label: "Hub de Connexion", href: "/connexion" },
    ],
  },
  {
    title: "Formats & Ressources",
    links: [
      { label: "Ebooks & Guides PDF", href: "/catalogue?type=ebook" },
      { label: "Formations Vidéos", href: "/catalogue?type=cours" },
      { label: "Masterclasses Audios", href: "/catalogue?type=audio" },
      { label: "Documents & Templates", href: "/catalogue?type=document" },
    ],
  },
  {
    title: "Sécurité & Légal",
    links: [
      { label: "Paiements Sécurisés PayDunya", href: "#" },
      { label: "Protection des Droits d'Auteur", href: "#" },
      { label: "Conditions Générales", href: "#" },
      { label: "Support & Contact", href: "#" },
    ],
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="flex min-h-full flex-col bg-paper font-sans text-ink selection:bg-gold-200">
        <Navbar />
        <SupabaseBanner />
        <main className="flex-1">{children}</main>

        {/* ================= FOOTER HAUT DE GAMME ================= */}
        <footer className="relative overflow-hidden border-t border-ink/[0.08] bg-brand-950 text-brand-100">
          <div className="pointer-events-none absolute inset-0 pattern-grid opacity-20" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 glow-gold opacity-30 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 glow-green opacity-30 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
              {/* Identité de marque */}
              <div>
                <Logo dark />
                <p className="mt-4 max-w-xs text-xs sm:text-sm leading-relaxed text-brand-200/80">
                  La première place de marché sénégalaise dédiée à l&apos;économie du savoir. 
                  Partagez vos compétences, développez votre audience et monétisez vos créations.
                </p>

                <div className="mt-6 flex flex-col gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gold-300">
                    Moyens de paiement acceptés :
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white">
                      🌊 Wave
                    </span>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white">
                      🍊 Orange Money
                    </span>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white">
                      💳 PayDunya
                    </span>
                  </div>
                </div>
              </div>

              {/* Colonnes de liens */}
              {footerNav.map((col) => (
                <div key={col.title}>
                  <h4 className="eyebrow text-gold-300/80">{col.title}</h4>
                  <ul className="mt-4 space-y-2.5">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-xs sm:text-sm text-brand-100/75 transition-colors hover:text-gold-300"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Barre de copyright et réassurance */}
            <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-brand-300/70 sm:flex-row">
              <p>
                © {new Date().getFullYear()} SUNU CONTENU — Conçu avec excellence à Dakar, Sénégal 🇸🇳
              </p>
              <div className="flex items-center gap-4">
                <span>⚡ Hébergement ultra-rapide</span>
                <span>•</span>
                <span>🔒 Cryptage SSL 256-bit</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
