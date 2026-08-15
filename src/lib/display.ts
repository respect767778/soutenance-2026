import type { ContentType } from "./types";

export const CONTENT_ICONS: Record<ContentType, string> = {
  ebook: "📘",
  cours: "🎓",
  video: "🎬",
  document: "📄",
  audio: "🎧",
};

/** Dégradés de repli (utilisés quand un contenu n'a pas de couverture). */
export const CONTENT_GRADIENTS: Record<ContentType, string> = {
  ebook: "from-brand-700 via-brand-800 to-emerald-950",
  cours: "from-gold-500 via-gold-600 to-amber-900",
  video: "from-rose-500 via-rose-700 to-red-950",
  document: "from-sky-500 via-sky-700 to-blue-950",
  audio: "from-violet-500 via-violet-700 to-purple-950",
};
