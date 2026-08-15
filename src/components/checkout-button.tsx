"use client";

import { useState } from "react";
import Link from "next/link";
import { checkoutContent } from "@/lib/paydunya-actions";

export function CheckoutButton({
  contentId,
  slug,
  loggedIn,
  purchased,
  configured,
}: {
  contentId: string;
  slug: string;
  loggedIn: boolean;
  purchased: boolean;
  configured: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (purchased) {
    return (
      <span className="btn !rounded-xl !py-3.5 !px-8 !text-base border border-emerald-200 bg-emerald-50 !text-emerald-700 shadow-sm">
        <span>✓ Vous possédez ce contenu</span>
      </span>
    );
  }

  if (!configured) {
    return (
      <button
        disabled
        className="btn btn-gold !py-3.5 !px-8 !text-base shadow-lg opacity-60"
      >
        <span>Paiement bientôt disponible</span>
      </button>
    );
  }

  if (!loggedIn) {
    return (
      <Link
        href={`/connexion?next=/catalogue/${slug}`}
        className="btn btn-gold !py-3.5 !px-8 !text-base shadow-lg"
      >
        <span>Se connecter pour acheter</span>
      </Link>
    );
  }

  async function handleClick() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const { redirect } = await checkoutContent(contentId);
      window.location.href = redirect;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={busy}
        className="btn btn-gold !py-3.5 !px-8 !text-base shadow-lg"
      >
        <span>{busy ? "Redirection…" : "Acheter ce contenu"}</span>
        <span aria-hidden>💳</span>
      </button>
      {error && (
        <p className="mt-2 max-w-xs rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
