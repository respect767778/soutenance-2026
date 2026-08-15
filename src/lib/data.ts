import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";
import { demoCategories, demoContents } from "./demo";
import type { Category, ContentCard } from "./types";

/**
 * Enrichit des lignes de contenus avec le nom + l'avatar de leur auteur.
 *
 * IMPORTANT : on évite volontairement la jointure embedded
 * `profiles(full_name)` (fragile selon l'état des clés étrangères).
 * On récupère les profils séparément puis on assemble en mémoire.
 */
export async function attachAuthorInfo<T extends { author_id: string }>(
  rows: T[],
): Promise<(T & { author_name: string | null; author_avatar_url: string | null })[]> {
  if (rows.length === 0) {
    return rows as (T & { author_name: string | null; author_avatar_url: string | null })[];
  }

  const supabase = await createClient();
  const ids = [...new Set(rows.map((r) => r.author_id))];

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", ids);

  const byId = new Map<
    string,
    { full_name: string | null; avatar_url: string | null }
  >(
    ((data ?? []) as {
      id: string;
      full_name: string | null;
      avatar_url: string | null;
    }[]).map((p) => [p.id, { full_name: p.full_name, avatar_url: p.avatar_url }]),
  );

  return rows.map((r) => {
    const info = byId.get(r.author_id);
    return {
      ...r,
      author_name: info?.full_name ?? null,
      author_avatar_url: info?.avatar_url ?? null,
    };
  });
}

/** Catégories (démo si Supabase non configuré). */
export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) return demoCategories;
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });
  return (data as Category[]) ?? [];
}

/** Contenus publiés, enrichis auteur + catégorie (démo si non configuré). */
export async function getPublishedContents(
  limit = 50,
): Promise<ContentCard[]> {
  if (!isSupabaseConfigured) return demoContents.slice(0, limit);

  const supabase = await createClient();
  const { data } = await supabase
    .from("contents")
    .select("*, categories(name)")
    .eq("status", "publie")
    .order("published_at", { ascending: false })
    .limit(limit);

  const enriched = await attachAuthorInfo(
    (data ?? []) as unknown as { author_id: string }[],
  );

  return enriched.map((row) => {
    const r = row as unknown as Record<string, unknown>;
    const category = r.categories as { name?: string } | null;
    return {
      ...(r as unknown as ContentCard),
      author_name: row.author_name,
      author_avatar_url: row.author_avatar_url,
      category_name: category?.name ?? null,
    };
  });
}

/** Contenus publiés d'un auteur, enrichis (catégorie + infos auteur). */
export async function getAuthorPublishedContents(
  authorId: string,
  limit = 50,
): Promise<ContentCard[]> {
  if (!isSupabaseConfigured) {
    return demoContents
      .filter((c) => c.author_id === authorId)
      .slice(0, limit);
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("contents")
    .select("*, categories(name)")
    .eq("author_id", authorId)
    .eq("status", "publie")
    .order("published_at", { ascending: false })
    .limit(limit);

  const enriched = await attachAuthorInfo(
    (data ?? []) as unknown as { author_id: string }[],
  );

  return enriched.map((row) => {
    const r = row as unknown as Record<string, unknown>;
    const category = r.categories as { name?: string } | null;
    return {
      ...(r as unknown as ContentCard),
      author_name: row.author_name,
      author_avatar_url: row.author_avatar_url,
      category_name: category?.name ?? null,
    };
  });
}

/** Détail d'un contenu publié par slug. */
export async function getContentBySlug(
  slug: string,
): Promise<ContentCard | null> {
  if (!isSupabaseConfigured) {
    return demoContents.find((c) => c.slug === slug) ?? null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("contents")
    .select("*, categories(name)")
    .eq("slug", slug)
    .eq("status", "publie")
    .maybeSingle();

  if (!data) return null;

  const [row] = await attachAuthorInfo([
    data as unknown as { author_id: string },
  ]);
  const r = row as unknown as Record<string, unknown>;
  const category = r.categories as { name?: string } | null;

  return {
    ...(r as unknown as ContentCard),
    author_name: row.author_name,
    author_avatar_url: row.author_avatar_url,
    category_name: category?.name ?? null,
  };
}
