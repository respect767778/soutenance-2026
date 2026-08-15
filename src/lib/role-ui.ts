import type { Role } from "./types";

/** Identité visuelle + URL de connexion de chaque espace. */
export const ROLE_UI: Record<
  Role,
  {
    icon: string;
    gradient: string;
    tagline: string;
    description: string;
    loginHref: string;
  }
> = {
  admin: {
    icon: "🛡️",
    gradient: "from-brand-500 to-brand-800",
    tagline: "Pilotage de la plateforme",
    description:
      "Gérez les utilisateurs, la modération des contenus et les revenus.",
    loginHref: "/connexion/admin",
  },
  editeur: {
    icon: "✍️",
    gradient: "from-gold-500 to-gold-700",
    tagline: "Relecture & publication",
    description:
      "Relisez, validez et publiez les contenus soumis par les auteurs.",
    loginHref: "/connexion/editeur",
  },
  auteur: {
    icon: "🖋️",
    gradient: "from-sky-500 to-sky-700",
    tagline: "Création & vente",
    description:
      "Créez, soumettez et vendez vos contenus numériques.",
    loginHref: "/connexion/auteur",
  },
  client: {
    icon: "📚",
    gradient: "from-violet-500 to-violet-700",
    tagline: "Découverte & achat",
    description:
      "Découvrez et achetez des ebooks, cours, vidéos et plus.",
    loginHref: "/connexion/client",
  },
};
