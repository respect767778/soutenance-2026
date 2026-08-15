// Lecture centralisée des variables d'environnement Supabase.

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Vrai si Supabase est configuré (URL + clé anon présentes). */
export const isSupabaseConfigured = Boolean(
  supabaseUrl.startsWith("http") && supabaseAnonKey.length > 0,
);
