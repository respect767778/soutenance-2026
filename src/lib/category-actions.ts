"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "./supabase/server";
import { requireProfile } from "./auth";

export type CategoryState = { error: string | null; success: string | null };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/** Admin / Éditeur : crée une nouvelle catégorie. */
export async function createCategory(
  _prev: CategoryState,
  formData: FormData,
): Promise<CategoryState> {
  await requireProfile("admin", "editeur");
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim() || slugify(name);

  if (!name) return { error: "Le nom de la catégorie est obligatoire.", success: null };
  if (!slug) return { error: "Impossible de générer un slug valide.", success: null };

  const { error } = await supabase
    .from("categories")
    .insert({ name, slug, description: description || null });

  if (error) {
    if (error.message.toLowerCase().includes("duplicate")) {
      return { error: "Ce slug existe déjà. Choisissez-en un autre.", success: null };
    }
    return { error: error.message, success: null };
  }

  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/auteur");
  revalidatePath("/catalogue");
  return { error: null, success: `Catégorie « ${name} » créée ✅` };
}

/** Admin / Éditeur : renomme / met à jour une catégorie. */
export async function updateCategory(
  _prev: CategoryState,
  formData: FormData,
): Promise<CategoryState> {
  await requireProfile("admin", "editeur");
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) return { error: "Le nom est obligatoire.", success: null };

  const { error } = await supabase
    .from("categories")
    .update({ name, slug: slug || undefined, description: description || null })
    .eq("id", id);

  if (error) {
    if (error.message.toLowerCase().includes("duplicate")) {
      return { error: "Ce slug existe déjà.", success: null };
    }
    return { error: error.message, success: null };
  }

  revalidatePath("/dashboard/categories");
  revalidatePath("/catalogue");
  return { error: null, success: "Catégorie mise à jour ✅" };
}

/** Admin / Éditeur : supprime une catégorie (les contenus passent en "sans catégorie"). */
export async function deleteCategory(formData: FormData) {
  await requireProfile("admin", "editeur");
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/categories");
  revalidatePath("/catalogue");
  revalidatePath("/dashboard/auteur");
}
