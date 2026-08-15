import { isSupabaseConfigured } from "@/lib/supabase/config";

export function SupabaseBanner() {
  if (isSupabaseConfigured) return null;

  return (
    <aside aria-label="Mode démonstration" className="border-b border-gold-400/20 bg-gradient-to-r from-gold-50 via-gold-100/60 to-gold-50 px-4 py-2 text-center text-xs font-semibold text-gold-950">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2">
        <span className="inline-block animate-pulse text-sm">✨</span>
        <span>
          <strong>Mode Démonstration &amp; Design Système Actif</strong> — Données de présentation locales.
        </span>
      </div>
    </aside>
  );
}
