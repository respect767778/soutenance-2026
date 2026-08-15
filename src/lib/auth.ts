import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";
import type { Profile, Role } from "./types";

/** Utilisateur connecté (ou null si déconnecté / non configuré). */
export async function getUser(): Promise<User | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

/** Profil (avec rôle) de l'utilisateur connecté. */
export async function getProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return (data as Profile) ?? null;
  } catch {
    return null;
  }
}

/** Exige un utilisateur connecté, sinon redirige vers la connexion. */
export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) redirect("/connexion");
  return user;
}

/**
 * Exige un profil connecté avec l'un des rôles autorisés.
 * Si connecté avec un rôle non autorisé, redirige vers son espace.
 */
export async function requireProfile(...roles: Role[]): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/connexion");
  if (roles.length > 0 && !roles.includes(profile.role)) {
    redirect(`/dashboard/${profile.role}`);
  }
  return profile;
}
