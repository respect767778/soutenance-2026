import { createClient } from "./supabase/server";
import { attachAuthorInfo } from "./data";
import type { Review } from "./types";

export type ReviewWithAuthor = Review & {
  author_name: string | null;
  author_avatar_url: string | null;
};

/** Récupère les avis d'un contenu, enrichis du nom + avatar de l'auteur. */
export async function getContentReviews(
  contentId: string,
): Promise<ReviewWithAuthor[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("content_id", contentId)
    .order("created_at", { ascending: false });

  const enriched = await attachAuthorInfo(
    (data ?? []) as { author_id: string }[],
  );

  return enriched as unknown as ReviewWithAuthor[];
}

/** Calcule la note moyenne (0–5) et le nombre d'avis. */
export function computeRating(reviews: { rating: number }[]): {
  average: number;
  count: number;
} {
  if (reviews.length === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  return { average: sum / reviews.length, count: reviews.length };
}
