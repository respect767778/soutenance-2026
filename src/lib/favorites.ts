import { getUser } from "./auth";
import { createClient } from "./supabase/server";

/** Identifiants des contenus mis en favori par l'utilisateur connecté. */
export async function getFavoriteIds(): Promise<Set<string>> {
  const user = await getUser();
  if (!user) return new Set();

  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select("content_id")
    .eq("user_id", user.id);

  return new Set((data ?? []).map((f) => f.content_id));
}
