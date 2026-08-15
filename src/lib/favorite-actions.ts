"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "./supabase/server";
import { requireProfile } from "./auth";

export type FavoriteResult = { isFavorite: boolean; error?: string };

/** Ajoute ou retire un contenu des favoris de l'utilisateur connecté. */
export async function toggleFavorite(
  contentId: string,
): Promise<FavoriteResult> {
  try {
    const profile = await requireProfile("client", "auteur", "admin", "editeur");
    const supabase = await createClient();

    const { data: existing } = await supabase
      .from("favorites")
      .select("content_id")
      .eq("user_id", profile.id)
      .eq("content_id", contentId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", profile.id)
        .eq("content_id", contentId);
      if (error) return { isFavorite: true, error: error.message };
      revalidatePath("/dashboard/client");
      revalidatePath("/catalogue", "layout");
      return { isFavorite: false };
    }

    const { error } = await supabase
      .from("favorites")
      .insert({ user_id: profile.id, content_id: contentId });
    if (error) return { isFavorite: false, error: error.message };
    revalidatePath("/dashboard/client");
    revalidatePath("/catalogue", "layout");
    return { isFavorite: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("NEXT_REDIRECT")) throw err;
    return { isFavorite: false, error: msg };
  }
}
