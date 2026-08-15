"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

const COVERS_BUCKET = "covers";
const CONTENTS_BUCKET = "contents";
const AVATARS_BUCKET = "avatars";

const MAX_COVER_BYTES = 5 * 1024 * 1024; // 5 Mo
const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 Mo (limite free tier Supabase)

export type UploadState = { error: string | null; success: string | null };

/** Photo de profil : téléverse l'avatar de l'utilisateur connecté. */
export async function uploadAvatar(
  prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  try {
    const profile = await requireProfile("admin", "editeur", "auteur", "client");
    const supabase = await createClient();

    const file = formData.get("avatar") as File | null;
    if (!file || file.size === 0) {
      return { error: "Aucune image sélectionnée.", success: null };
    }
    if (!file.type.startsWith("image/")) {
      return { error: "Le fichier doit être une image (JPG, PNG, WebP, GIF).", success: null };
    }
    if (file.size > MAX_COVER_BYTES) {
      return { error: "L'image ne doit pas dépasser 5 Mo.", success: null };
    }

    const path = `${profile.id}/avatar.${safeExt(file.name, "jpg")}`;

    const { error } = await supabase.storage
      .from(AVATARS_BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      if (error.message.toLowerCase().includes("row-level security")) {
        return {
          error:
            "Règle de stockage manquante : exécutez supabase/fix-avatars.sql (en entier) dans le SQL Editor de Supabase, puis réessayez.",
          success: null,
        };
      }
      return { error: error.message, success: null };
    }

    const { data: url } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);

    const { error: updErr } = await supabase
      .from("profiles")
      .update({ avatar_url: url.publicUrl })
      .eq("id", profile.id);
    if (updErr) return { error: updErr.message, success: null };

    revalidatePath("/dashboard", "layout");
    revalidatePath("/catalogue", "layout");
    return { error: null, success: "Photo de profil mise à jour ✅" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("NEXT_REDIRECT")) throw err;
    return { error: msg, success: null };
  }
}

function isStaff(role: string): boolean {
  return role === "admin" || role === "editeur";
}

function safeExt(name: string, fallback: string): string {
  return (name.split(".").pop() || fallback).toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Vérifie que l'utilisateur possède le contenu (auteur ou staff). */
async function ownsContent(supabase: Awaited<ReturnType<typeof createClient>>, contentId: string, userId: string, role: string) {
  const { data } = await supabase
    .from("contents")
    .select("id, author_id")
    .eq("id", contentId)
    .single();
  if (!data) return false;
  return data.author_id === userId || isStaff(role);
}

/** Auteur : téléverse l'image de couverture d'un contenu. */
export async function uploadCover(
  prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  try {
    const profile = await requireProfile("auteur", "admin", "editeur");
    const supabase = await createClient();

    const contentId = String(formData.get("content_id") ?? "");
    const file = formData.get("cover") as File | null;

    if (!file || file.size === 0) {
      return { error: "Aucun fichier sélectionné.", success: null };
    }
    if (!file.type.startsWith("image/")) {
      return { error: "Le fichier doit être une image (JPG, PNG, WebP, GIF).", success: null };
    }
    if (file.size > MAX_COVER_BYTES) {
      return { error: "L'image ne doit pas dépasser 5 Mo.", success: null };
    }
    if (!(await ownsContent(supabase, contentId, profile.id, profile.role))) {
      return { error: "Contenu introuvable ou non autorisé.", success: null };
    }

    const path = `${contentId}/cover.${safeExt(file.name, "jpg")}`;

    const { error } = await supabase.storage
      .from(COVERS_BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) return { error: error.message, success: null };

    const { data: url } = supabase.storage.from(COVERS_BUCKET).getPublicUrl(path);

    const { error: updErr } = await supabase
      .from("contents")
      .update({ cover_url: url.publicUrl })
      .eq("id", contentId);
    if (updErr) return { error: updErr.message, success: null };

    revalidatePath("/dashboard/auteur");
    revalidatePath("/catalogue");
    return { error: null, success: "Couverture mise à jour ✅" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("NEXT_REDIRECT")) throw err;
    return { error: msg, success: null };
  }
}

/** Auteur : téléverse le fichier (ebook, vidéo, audio…) d'un contenu. */
export async function uploadContentFile(
  prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  try {
    const profile = await requireProfile("auteur", "admin", "editeur");
    const supabase = await createClient();

    const contentId = String(formData.get("content_id") ?? "");
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return { error: "Aucun fichier sélectionné.", success: null };
    }
    if (file.size > MAX_FILE_BYTES) {
      return { error: "Le fichier ne doit pas dépasser 50 Mo.", success: null };
    }
    if (!(await ownsContent(supabase, contentId, profile.id, profile.role))) {
      return { error: "Contenu introuvable ou non autorisé.", success: null };
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${contentId}/${safeName}`;

    const { error } = await supabase.storage
      .from(CONTENTS_BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) return { error: error.message, success: null };

    const { error: updErr } = await supabase
      .from("contents")
      .update({ file_url: path })
      .eq("id", contentId);
    if (updErr) return { error: updErr.message, success: null };

    revalidatePath("/dashboard/auteur");
    return { error: null, success: "Fichier téléversé ✅" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("NEXT_REDIRECT")) throw err;
    return { error: msg, success: null };
  }
}

/**
 * Téléchargement d'un contenu : redirige vers le flux sécurisé
 * avec vérification des droits et Watermarking dynamique (Nom, Tél, Licence).
 */
export async function downloadContent(formData: FormData) {
  await requireProfile("client", "auteur", "admin", "editeur");
  const contentId = String(formData.get("content_id") ?? "");

  if (!contentId) {
    throw new Error("Identifiant de contenu manquant.");
  }

  redirect(`/api/contents/${contentId}/download`);
}
