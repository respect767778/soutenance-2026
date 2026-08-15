import Link from "next/link";
import { getPublishedContents } from "@/lib/data";
import { getFavoriteIds } from "@/lib/favorites";
import { ROLES, type Role } from "@/lib/types";
import { ContentCard } from "@/components/content-card";

const ROLE_META: Record<
  Role,
  {
    icon: string;
    accent: string;
    borderAccent: string;
    tag: string;
    actionLabel: string;
    description: string;
  }
> = {
  admin: {
    icon: "🛡️",
    accent: "from-brand-600 to-brand-900 text-white",
    borderAccent: "border-brand-500/30 group-hover:border-brand-400",
    tag: "Supervision & Finance",
    actionLabel: "Accéder à l'administration",
    description:
      "Gérez les utilisateurs, supervisez les flux financiers et analysez les métriques globales de la plateforme.",
  },
  editeur: {
    icon: "✍️",
    accent: "from-amber-600 to-amber-900 text-white",
    borderAccent: "border-amber-500/30 group-hover:border-amber-400",
    tag: "Modération & Label",
    actionLabel: "Espace Édition",
    description:
      "Assurez la conformité pédagogique et éditoriale des contenus avant leur publication au catalogue.",
  },
  auteur: {
    icon: "🖋️",
    accent: "from-emerald-600 to-teal-900 text-white",
    borderAccent: "border-emerald-500/30 group-hover:border-emerald-400",
    tag: "Création & Revenus",
    actionLabel: "Espace Créateur",
    description:
      "Publiez vos ebooks, masterclasses et guides. Encaissez vos gains directement via mobile money.",
  },
  client: {
    icon: "📚",
    accent: "from-indigo-600 to-slate-900 text-white",
    borderAccent: "border-indigo-500/30 group-hover:border-indigo-400",
    tag: "Apprentissage & Savoir",
    actionLabel: "Ma Bibliothèque",
    description:
      "Accédez instantanément à vos achats, téléchargez vos ressources et suivez votre montée en compétences.",
  },
};

const BENTO_FEATURES = [
  {
    icon: "⚡",
    badge: "Encaissement Instantané",
    title: "Monétisez vos connaissances en FCFA",
    desc: "Vendez sans barrières techniques grâce aux paiements locaux préférés des Sénégalais : Wave, Orange Money et Cartes Bancaires via PayDunya.",
    gradient: "from-gold-500/10 via-brand-500/5 to-transparent",
  },
  {
    icon: "🛡️",
    badge: "Sécurité & RLS",
    title: "Protection stricte des contenus",
    desc: "Vos fichiers et cours sont protégés par des politiques d'accès de niveau bancaire. Seuls vos acheteurs vérifiés y ont accès.",
    gradient: "from-brand-500/10 via-emerald-500/5 to-transparent",
  },
  {
    icon: "💎",
    badge: "Label Qualité",
    title: "Relecture éditoriale certifiée",
    desc: "Chaque ressource soumise bénéficie d'un contrôle qualité pour offrir aux apprenants une expérience d'apprentissage irréprochable.",
    gradient: "from-amber-500/10 via-gold-500/5 to-transparent",
  },
  {
    icon: "📊",
    badge: "Analytics Auteur",
    title: "Tableaux de bord prédictifs",
    desc: "Suivez vos ventes en temps réel, comprenez vos taux de conversion et pilotez la croissance de votre communauté de lecteurs.",
    gradient: "from-teal-500/10 via-brand-500/5 to-transparent",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "SUNU CONTENU m'a permis de vendre mon premier ebook de programmation à plus de 450 étudiants sénégalais en 3 semaines.",
    author: "Moussa Diop",
    role: "Auteur & Développeur Senior",
    badge: "450+ ventes",
    avatar: "M",
  },
  {
    quote:
      "La qualité des contenus est incroyable. J'ai acheté deux masterclasses en marketing et finance adaptées au contexte local de Dakar.",
    author: "Aïssatou Ba",
    role: "Consultante en Stratégie",
    badge: "Lectrice vérifiée",
    avatar: "A",
  },
  {
    quote:
      "Le workflow éditeur est fluide : on relit, on annote et on publie en quelques clics. C'est l'outil qui manquait au Sénégal.",
    author: "Cheikh Tidiane",
    role: "Éditeur Pédagogique",
    badge: "Équipe SUNU",
    avatar: "C",
  },
];

const MARQUEE_ITEMS = [
  "Ebooks & Guides Pratiques",
  "Formations Vidéo 4K",
  "Masterclasses Audio",
  "Paiement Mobile Wave",
  "Orange Money Sénégal",
  "PayDunya Merchant Gateway",
  "Contenus 100% Africains 🇸🇳",
  "Protection Numérique RLS",
];

export default async function Home() {
  const featured = await getPublishedContents(6);
  const favoriteIds = await getFavoriteIds();

  return (
    <div className="flex flex-col gap-24 sm:gap-32 pb-24 overflow-hidden">
      {/* ================= 1. HERO SECTION MAJESTUEUSE ================= */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-b from-brand-950 via-brand-950 to-brand-900 text-white">
        {/* Fonds décoratifs & Grille */}
        <div className="pointer-events-none absolute inset-0 pattern-grid opacity-30" />
        <div className="pointer-events-none absolute -left-32 top-10 h-[520px] w-[520px] glow-green opacity-70 blur-2xl" />
        <div className="pointer-events-none absolute -right-24 bottom-10 h-[520px] w-[520px] glow-gold opacity-60 blur-2xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-28 sm:px-6">
          {/* Colonne Gauche : Pitch & Appel à l'action */}
          <div className="animate-fade-up z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-3.5 py-1.5 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-gold-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-wide text-gold-200">
                🇸🇳 La Place de Marché Digitale de Référence au Sénégal
              </span>
            </div>

            <h1 className="font-display mt-7 text-4xl sm:text-6xl lg:text-[4.2rem] font-bold leading-[1.06] tracking-tight">
              Transformez votre savoir en{" "}
              <span className="text-gradient italic block sm:inline">
                empire numérique.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-brand-100/80">
              SUNU CONTENU est la plateforme tout-en-un qui propulse les créateurs
              africains. Publiez, protégez et vendez vos ebooks, formations et
              audios avec encaissement instantané par mobile money.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/catalogue"
                className="btn btn-gold !py-3.5 !px-7 !text-base shimmer-effect"
              >
                <span>Explorer le catalogue</span>
                <span aria-hidden="true" className="ml-1 text-base">→</span>
              </Link>
              <Link
                href="/signup"
                className="btn border border-white/20 bg-white/5 !py-3.5 !px-6 !text-base text-white backdrop-blur-md hover:bg-white/10 hover:border-white/30"
              >
                <span>Devenir créateur</span>
                <span className="text-gold-300 ml-1">✨</span>
              </Link>
            </div>

            {/* Preuves sociales / Métriques */}
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
              <div>
                <p className="font-display text-2xl sm:text-3xl font-bold text-gold-300">
                  5 000+
                </p>
                <p className="mt-1 text-xs text-brand-200/70 font-medium">
                  Lecteurs & apprenants
                </p>
              </div>
              <div>
                <p className="font-display text-2xl sm:text-3xl font-bold text-white">
                  100%
                </p>
                <p className="mt-1 text-xs text-brand-200/70 font-medium">
                  Savoir local certifié
                </p>
              </div>
              <div>
                <p className="font-display text-2xl sm:text-3xl font-bold text-gold-300">
                  Instant
                </p>
                <p className="mt-1 text-xs text-brand-200/70 font-medium">
                  Paiements Wave & OM
                </p>
              </div>
            </div>
          </div>

          {/* Colonne Droite : Vitrine 3D Flottante */}
          <div className="relative mx-auto hidden h-[520px] w-full max-w-md lg:block">
            {/* Carte Flottante 1 (Gauche) */}
            <div className="absolute left-2 top-10 w-56 -rotate-6 animate-float-slow overflow-hidden rounded-2xl border border-white/15 bg-brand-900/90 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur-md">
              <img
                src="/covers/cover-wolof.jpg"
                alt="Wolof Facile"
                className="h-44 w-full object-cover"
              />
              <div className="p-3 bg-brand-950/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400">
                  Ebook Populaire
                </span>
                <p className="font-display text-xs font-semibold text-white truncate">
                  Apprendre le Wolof Pro
                </p>
              </div>
            </div>

            {/* Carte Flottante 2 (Droite) */}
            <div className="absolute right-0 top-0 z-10 w-60 rotate-6 animate-float-reverse overflow-hidden rounded-2xl border border-white/15 bg-brand-900/90 shadow-[0_35px_70px_-15px_rgba(0,0,0,0.7)] backdrop-blur-md">
              <img
                src="/covers/cover-business.jpg"
                alt="Business Sénégal"
                className="h-48 w-full object-cover"
              />
              <div className="p-3.5 bg-brand-950/80">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Masterclass
                  </span>
                  <span className="text-xs font-bold text-gold-300">
                    15 000 FCFA
                  </span>
                </div>
                <p className="font-display mt-0.5 text-xs font-semibold text-white truncate">
                  Lancer son business au Sénégal
                </p>
              </div>
            </div>

            {/* Carte Flottante 3 (Centrale) */}
            <div className="absolute bottom-4 left-1/2 z-20 w-64 -translate-x-1/2 -rotate-1 animate-float-slow overflow-hidden rounded-2xl border border-gold-400/40 bg-brand-950 shadow-[0_45px_90px_-20px_rgba(0,0,0,0.85)]">
              <img
                src="/covers/cover-nextjs.jpg"
                alt="Next.js & SaaS"
                className="h-48 w-full object-cover"
              />
              <div className="p-4 bg-gradient-to-t from-brand-950 to-brand-900">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-gold-400/20 px-2 py-0.5 text-[10px] font-bold text-gold-200">
                    N°1 Meilleure Vente
                  </span>
                  <span className="text-xs font-bold text-white">4.9 ★</span>
                </div>
                <p className="font-display mt-1 text-sm font-bold text-white">
                  Développeur Web Moderne
                </p>
              </div>
            </div>

            {/* Notification flottante (Vente en direct) */}
            <div className="absolute -left-6 bottom-24 z-30 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/95 p-3.5 shadow-2xl backdrop-blur-xl">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-lg">
                💰
              </span>
              <div>
                <p className="text-xs font-bold text-ink">
                  + 25 000 FCFA reçus
                </p>
                <p className="text-[10px] text-ink-muted">
                  Vente via Wave · Il y a 2 min
                </p>
              </div>
            </div>

            {/* Badge Avis */}
            <div className="absolute -right-4 top-44 z-30 flex items-center gap-2 rounded-2xl border border-gold-400/30 bg-gradient-to-r from-gold-500 to-gold-600 px-4 py-2.5 text-brand-950 shadow-xl">
              <span className="text-lg">⭐</span>
              <div>
                <p className="text-xs font-black">4.9 / 5</p>
                <p className="text-[10px] font-bold opacity-80">
                  Note satisfaction
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. RUBAN DÉFILANT INFINI (PARTENAIRES & FORMATS) ================= */}
      <section className="-mt-16 sm:-mt-24 relative z-20 mx-auto max-w-6xl px-4">
        <div className="glass-card rounded-2xl border border-ink/10 bg-white/90 p-4 shadow-xl backdrop-blur-xl">
          <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
            <div className="flex shrink-0 animate-marquee items-center gap-12 pr-12">
              {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 whitespace-nowrap text-xs font-bold uppercase tracking-wider text-ink-muted"
                >
                  <span className="h-2 w-2 rounded-full bg-gold-500 shadow-sm" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. BENTO GRID : ÉCOSYSTÈME & VALEUR AJOUTÉE ================= */}
      <section id="roles" className="mx-auto max-w-6xl px-4 scroll-mt-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Pourquoi SUNU CONTENU</p>
          <h2 className="font-display mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-ink">
            Une architecture pensée pour le{" "}
            <span className="text-gradient-emerald">succès des créateurs</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-ink-muted">
            De la création du manuscrit au virement sur votre compte mobile money,
            nous fluidifions chaque étape.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {BENTO_FEATURES.map((feat, idx) => (
            <div
              key={idx}
              className={`card card-hover relative overflow-hidden p-8 sm:p-10 bg-gradient-to-br ${feat.gradient} border border-ink/[0.08]`}
            >
              <div className="flex items-center justify-between">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-md text-2xl border border-ink/[0.06]">
                  {feat.icon}
                </span>
                <span className="badge bg-white/90 text-brand-800 border border-brand-200/50 shadow-sm">
                  {feat.badge}
                </span>
              </div>

              <h3 className="font-display mt-6 text-2xl font-bold text-ink">
                {feat.title}
              </h3>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-ink-muted">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 4. SHOWCASE DES 4 RÔLES ================= */}
      <section className="relative overflow-hidden bg-brand-950 py-24 text-white">
        <div className="pointer-events-none absolute inset-0 pattern-grid opacity-20" />
        <div className="pointer-events-none absolute -right-24 top-0 h-96 w-96 glow-gold opacity-40 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow text-gold-300">Organisation de la plateforme</p>
              <h2 className="font-display mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Quatre espaces dédiés, une synergie totale
              </h2>
            </div>
            <p className="max-w-md text-sm text-brand-100/70 leading-relaxed">
              Chaque utilisateur accède à un tableau de bord taillé sur mesure
              pour ses responsabilités et objectifs.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(ROLES) as Role[]).map((key) => {
              const meta = ROLE_META[key];
              return (
                <div
                  key={key}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-[1.6rem] border ${meta.borderAccent} bg-white/5 p-6 backdrop-blur-lg transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 hover:shadow-2xl`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${meta.accent} text-xl shadow-lg`}
                      >
                        {meta.icon}
                      </span>
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-200">
                        {meta.tag}
                      </span>
                    </div>

                    <h3 className="font-display mt-5 text-xl font-bold text-white">
                      {ROLES[key].label}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-brand-100/70">
                      {meta.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10">
                    <Link
                      href={`/connexion/${key}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-300 transition-colors group-hover:text-gold-200"
                    >
                      <span>{meta.actionLabel}</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 5. CONTENUS POPULAIRES À LA UNE ================= */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Sélection d&apos;Élite</p>
            <h2 className="font-display mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-ink">
              Contenus populaires du moment
            </h2>
            <p className="mt-2 text-sm sm:text-base text-ink-muted">
              Découvrez les ressources les plus consultées et validées par notre communauté.
            </p>
          </div>
          <Link href="/catalogue" className="btn btn-outline">
            <span>Explorer tout le catalogue</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((content) => (
            <ContentCard
              key={content.id}
              content={content}
              isFavorite={favoriteIds.has(content.id)}
            />
          ))}
        </div>
      </section>

      {/* ================= 6. TÉMOIGNAGES & PREUVE SOCIALE ================= */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-[2.5rem] border border-ink/[0.08] bg-gradient-to-br from-paper-subtle/70 via-white to-gold-50/40 p-8 sm:p-14 shadow-sm">
          <div className="mx-auto max-w-xl text-center">
            <p className="eyebrow">Témoignages</p>
            <h2 className="font-display mt-2 text-2xl sm:text-3xl font-bold text-ink">
              La parole à notre communauté
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="card flex flex-col justify-between p-6 bg-white/80 backdrop-blur-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-gold-500 text-sm">★★★★★</span>
                    <span className="badge bg-gold-100 text-gold-800 text-[10px]">
                      {t.badge}
                    </span>
                  </div>
                  <p className="mt-4 text-xs sm:text-sm italic leading-relaxed text-ink/80">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-3 border-t border-ink/[0.06] pt-4">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-700 text-xs font-bold text-white">
                    {t.avatar}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-ink">{t.author}</p>
                    <p className="text-[11px] text-ink-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 7. BANNIÈRE D'APPEL À L'ACTION FINALE ================= */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 p-8 sm:p-16 text-center text-white shadow-2xl">
          {/* Lueurs */}
          <div className="pointer-events-none absolute inset-0 pattern-grid opacity-25" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 glow-gold opacity-50 blur-2xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 glow-green opacity-50 blur-2xl" />

          <div className="relative z-10 mx-auto max-w-2xl">
            <span className="badge border border-gold-400/40 bg-gold-400/10 text-gold-200">
              Prêt à franchir le pas ?
            </span>
            <h2 className="font-display mt-5 text-3xl sm:text-5xl font-bold leading-tight">
              Rejoignez l&apos;élite des créateurs de contenus sénégalais.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-brand-100/80 leading-relaxed">
              Inscription sans frais. Publiez votre premier contenu dès aujourd&apos;hui
              et touchez des milliers d&apos;apprenants à travers l&apos;Afrique.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="btn btn-gold !py-3.5 !px-8 !text-base shimmer-effect"
              >
                Créer un compte créateur gratuit
              </Link>
              <Link
                href="/catalogue"
                className="btn border border-white/20 bg-white/10 !py-3.5 !px-6 !text-base text-white backdrop-blur hover:bg-white/20"
              >
                Parcourir le catalogue
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
