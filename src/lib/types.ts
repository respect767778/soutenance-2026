// ============================================================
// SUNU CONTENU — types métier partagés
// ============================================================

/** Les 4 rôles de la plateforme. */
export type Role = "admin" | "editeur" | "auteur" | "client";

/** Types de contenus numériques vendus sur la plateforme. */
export type ContentType = "ebook" | "cours" | "video" | "document" | "audio";

/** Cycle de vie éditorial d'un contenu. */
export type ContentStatus = "brouillon" | "soumis" | "publie" | "rejete" | "archive";

export const ROLES: Record<Role, { label: string; description: string }> = {
  admin: {
    label: "Administrateur",
    description:
      "Gère la plateforme : utilisateurs, catégories, modération et transactions.",
  },
  editeur: {
    label: "Éditeur",
    description:
      "Relit, valide et publie les contenus soumis par les auteurs.",
  },
  auteur: {
    label: "Auteur",
    description: "Crée, publie et vend ses contenus numériques.",
  },
  client: {
    label: "Client",
    description: "Découvre, achète et consulte les contenus.",
  },
};

export const CONTENT_TYPES: Record<ContentType, string> = {
  ebook: "E-book",
  cours: "Cours",
  video: "Vidéo",
  document: "Document",
  audio: "Audio",
};

export const CONTENT_STATUS: Record<
  ContentStatus,
  { label: string; badge: string }
> = {
  brouillon: { label: "Brouillon", badge: "bg-ink/5 text-ink/55" },
  soumis: { label: "En révision", badge: "bg-gold-100 text-gold-800" },
  publie: { label: "Publié", badge: "bg-emerald-100 text-emerald-700" },
  rejete: { label: "Rejeté", badge: "bg-red-100 text-red-700" },
  archive: { label: "Archivé", badge: "bg-ink/10 text-ink/50" },
};

export interface Profile {
  id: string;
  full_name: string | null;
  role: Role;
  bio: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface Content {
  id: string;
  author_id: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  type: ContentType;
  price: number; // en FCFA
  cover_url: string | null;
  file_url: string | null;
  status: ContentStatus;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

/** Contenu enrichi pour l'affichage (auteur + catégorie). */
export type ContentCard = Content & {
  author_name?: string | null;
  author_avatar_url?: string | null;
  category_name?: string | null;
};

export interface Purchase {
  id: string;
  buyer_id: string;
  content_id: string;
  amount: number;
  status: string;
  paydunya_token: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  content_id: string;
  author_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}
