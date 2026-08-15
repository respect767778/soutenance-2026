"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import type { ContentStatus, ContentType, Role } from "./types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

/** Auteur : crée un nouveau contenu en brouillon. */
export async function createContent(formData: FormData) {
  const profile = await requireProfile("auteur", "admin", "editeur");
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Le titre est obligatoire.");

  const type = String(formData.get("type") ?? "ebook") as ContentType;
  const price = Math.max(0, Number(formData.get("price") ?? 0));
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "") || null;

  const slug = `${slugify(title)}-${Date.now().toString(36)}`;

  const { error } = await supabase.from("contents").insert({
    author_id: profile.id,
    title,
    slug,
    description,
    type,
    price,
    category_id: categoryId,
    status: "brouillon",
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/auteur");
  revalidatePath("/catalogue");
  redirect("/dashboard/auteur");
}

/** État renvoyé par la mise à jour d'un contenu (useActionState). */
export type ContentUpdateState = { error: string | null; success: string | null };

/**
 * Auteur (ou staff) : modifie les métadonnées d'un contenu existant
 * (titre, type, prix, catégorie, description). Le statut reste inchangé.
 */
export async function updateContent(
  _prev: ContentUpdateState,
  formData: FormData,
): Promise<ContentUpdateState> {
  const profile = await requireProfile("auteur", "admin", "editeur");
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "ebook") as ContentType;
  const price = Math.max(0, Number(formData.get("price") ?? 0));
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "") || null;

  if (!title) return { error: "Le titre est obligatoire.", success: null };

  const isStaff = profile.role === "admin" || profile.role === "editeur";

  let query = supabase
    .from("contents")
    .update({ title, type, price, description, category_id: categoryId })
    .eq("id", id);
  if (!isStaff) query = query.eq("author_id", profile.id);

  const { error } = await query;
  if (error) return { error: error.message, success: null };

  revalidatePath("/dashboard/auteur");
  revalidatePath("/dashboard/editeur");
  revalidatePath("/dashboard/admin");
  revalidatePath("/catalogue");
  revalidatePath("/auteurs", "layout");
  return { error: null, success: "Contenu mis à jour ✅" };
}

/** Auteur : soumet un brouillon (ou re-soumet un contenu rejeté). */
export async function submitContent(formData: FormData) {
  const profile = await requireProfile("auteur", "admin", "editeur");
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");

  const { error } = await supabase
    .from("contents")
    .update({ status: "soumis", rejection_reason: null })
    .eq("id", id)
    .eq("author_id", profile.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/auteur");
  redirect("/dashboard/auteur");
}

/** Auteur : supprime un de ses contenus. */
export async function deleteContent(formData: FormData) {
  const profile = await requireProfile("auteur", "admin", "editeur");
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");

  const { error } = await supabase
    .from("contents")
    .delete()
    .eq("id", id)
    .eq("author_id", profile.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/auteur");
  revalidatePath("/catalogue");
  redirect("/dashboard/auteur");
}

/** Éditeur / Admin : publie ou rejette un contenu soumis. */
export async function moderateContent(formData: FormData) {
  await requireProfile("admin", "editeur");
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as ContentStatus;

  if (!["publie", "rejete", "archive"].includes(status)) {
    throw new Error("Statut invalide.");
  }

  const { error } = await supabase
    .from("contents")
    .update({
      status,
      published_at: status === "publie" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/editeur");
  revalidatePath("/dashboard/admin");
  revalidatePath("/catalogue");
}

/** État renvoyé par l'action de rejet (utilisée via useActionState). */
export type RejectState = { error: string | null };

/**
 * Éditeur / Admin : rejette un contenu en indiquant OBLIGATOIREMENT un motif,
 * afin d'informer l'auteur de la raison du refus.
 */
export async function rejectContent(
  _prev: RejectState,
  formData: FormData,
): Promise<RejectState> {
  const profile = await requireProfile("admin", "editeur");
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!reason) {
    return { error: "Veuillez indiquer un motif de rejet avant de confirmer." };
  }

  const { error } = await supabase
    .from("contents")
    .update({
      status: "rejete",
      rejection_reason: reason,
      published_at: null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/editeur");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/auteur");
  revalidatePath("/catalogue");
  redirect(`/dashboard/${profile.role}`);
}

/** Admin : change le rôle d'un utilisateur. */
export async function updateUserRole(formData: FormData) {
  await requireProfile("admin");
  const supabase = await createClient();

  const userId = String(formData.get("user_id") ?? "");
  const role = String(formData.get("role") ?? "") as Role;

  if (!["admin", "editeur", "auteur", "client"].includes(role)) {
    throw new Error("Rôle invalide.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/admin");
}
