import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./config";

/**
 * Retourne le client admin Supabase (service_role) ou null si la clé n'est pas configurée.
 */
export function getAdminClientOrNull() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey || serviceKey === "VOTRE_CLE_SERVICE_ROLE") {
    return null;
  }
  return createSupabaseClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Client avec la clé "service_role" — contourne les RLS.
 * À utiliser UNIQUEMENT côté serveur, jamais dans du code client.
 */
export function createAdminClient() {
  const client = getAdminClientOrNull();
  if (!client) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY manquant. Renseignez-la dans .env.local (côté serveur uniquement).",
    );
  }
  return client;
}

