import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";
import type { Profile } from "./types";

/** Profil public d'un auteur (tous rôles, lecture publique via RLS). */
export async function getAuthorById(id: string): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();
  return (data as Profile) ?? null;
}

/** Statistiques publiques d'un auteur (contenus, note moyenne, ventes). */
export async function getAuthorStats(authorId: string): Promise<{
  contentsCount: number;
  average: number;
  reviewCount: number;
  salesCount: number;
}> {
  const supabase = await createClient();

  const { data: contents } = await supabase
    .from("contents")
    .select("id")
    .eq("author_id", authorId)
    .eq("status", "publie");

  const ids = (contents ?? []).map((c) => c.id);

  let reviewCount = 0;
  let average = 0;
  let salesCount = 0;

  if (ids.length > 0) {
    const { data: reviews } = await supabase
      .from("reviews")
      .select("rating")
      .in("content_id", ids);
    reviewCount = reviews?.length ?? 0;
    if (reviewCount > 0) {
      average =
        (reviews ?? []).reduce((s, r) => s + r.rating, 0) / reviewCount;
    }

    const { count } = await supabase
      .from("purchases")
      .select("*", { count: "exact", head: true })
      .in("content_id", ids);
    salesCount = count ?? 0;
  }

  return { contentsCount: ids.length, average, reviewCount, salesCount };
}
