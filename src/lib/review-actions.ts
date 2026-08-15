"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "./supabase/server";
import { requireProfile } from "./auth";

export type ReviewState = { error: string | null; success: string | null };

/**
 * Dépose (ou met à jour) l'avis de l'utilisateur connecté sur un contenu.
 * Réservé aux clients ayant acheté le contenu (ou au personnel / à l'auteur).
 */
export async function addReview(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const profile = await requireProfile("client", "auteur", "admin", "editeur");
  const supabase = await createClient();

  const contentId = String(formData.get("content_id") ?? "");
  const rating = Number(formData.get("rating") ?? 0);
  const comment = String(formData.get("comment") ?? "").trim();

  if (!rating || rating < 1 || rating > 5) {
    return {
      error: "Veuillez sélectionner une note de 1 à 5 étoiles.",
      success: null,
    };
  }

  const { data: content } = await supabase
    .from("contents")
    .select("id, author_id, slug")
    .eq("id", contentId)
    .single();
  if (!content) return { error: "Contenu introuvable.", success: null };

  const isOwner = content.author_id === profile.id;
  const isStaff = profile.role === "admin" || profile.role === "editeur";

  if (!isOwner && !isStaff) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("buyer_id", profile.id)
      .eq("content_id", contentId)
      .maybeSingle();
    if (!purchase) {
      return {
        error: "Vous devez acheter ce contenu avant de laisser un avis.",
        success: null,
      };
    }
  }

  const { error } = await supabase.from("reviews").upsert(
    {
      content_id: contentId,
      author_id: profile.id,
      rating,
      comment: comment || null,
    },
    { onConflict: "content_id,author_id" },
  );
  if (error) return { error: error.message, success: null };

  revalidatePath(`/catalogue/${content.slug}`);
  return { error: null, success: "Merci ! Votre avis a bien été enregistré." };
}

/** Supprime son propre avis. */
export async function deleteReview(formData: FormData) {
  const profile = await requireProfile("client", "auteur", "admin", "editeur");
  const supabase = await createClient();

  const contentId = String(formData.get("content_id") ?? "");
  const reviewId = String(formData.get("review_id") ?? "");

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("author_id", profile.id);
  if (error) throw new Error(error.message);

  const { data: content } = await supabase
    .from("contents")
    .select("slug")
    .eq("id", contentId)
    .single();

  revalidatePath(`/catalogue/${content?.slug ?? ""}`);
}
