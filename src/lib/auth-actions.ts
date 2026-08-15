"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "./supabase/config";
import { ROLES, type Role } from "./types";

export type LoginState = { error: string | null };

function frAuthError(message: string): string {
  if (message.includes("Invalid login credentials") || message.includes("invalid_grant")) {
    return "Email ou mot de passe incorrect.";
  }
  if (message.includes("Email not confirmed")) {
    return "Votre email n'est pas encore confirmé. Vérifiez votre boîte de réception.";
  }
  if (message.includes("Database error querying schema") || message.includes("User not found")) {
    return "Identifiants incorrects ou compte non existant dans Supabase Auth. Veuillez créer le compte d'abord via /signup ou le dashboard Supabase.";
  }
  return message;
}

/**
 * Authentifie un utilisateur ET vérifie que son rôle correspond bien
 * à l'espace depuis lequel il se connecte. En cas d'incompatibilité,
 * la session est fermée et un message clair est renvoyé.
 */
async function authenticate(
  role: Role,
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!isSupabaseConfigured) {
    return {
      error:
        "Supabase n'est pas configuré. Créez un fichier .env.local à la racine du projet avec NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error: frAuthError(error.message) };
    if (!data.user) return { error: "Une erreur est survenue. Réessayez." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    const userRole = (profile as { role: Role } | null)?.role;

    if (!userRole) {
      await supabase.auth.signOut();
      return {
        error:
          "Ce compte n'a pas de profil associé. Contactez un administrateur.",
      };
    }

    if (userRole !== role) {
      await supabase.auth.signOut();
      return {
        error: `Ce compte est un compte « ${ROLES[userRole].label} », pas « ${ROLES[role].label} ». Connectez-vous depuis l'espace ${ROLES[userRole].label}.`,
      };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("NEXT_REDIRECT")) throw err;
    return { error: `Erreur de communication avec Supabase : ${msg}` };
  }

  redirect(`/dashboard/${role}`);
}

export async function signInAsAdmin(prev: LoginState, formData: FormData) {
  return authenticate("admin", prev, formData);
}
export async function signInAsEditeur(prev: LoginState, formData: FormData) {
  return authenticate("editeur", prev, formData);
}
export async function signInAsAuteur(prev: LoginState, formData: FormData) {
  return authenticate("auteur", prev, formData);
}
export async function signInAsClient(prev: LoginState, formData: FormData) {
  return authenticate("client", prev, formData);
}
