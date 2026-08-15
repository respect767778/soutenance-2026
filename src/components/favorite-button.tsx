"use client";

import { useState } from "react";
import { toggleFavorite } from "@/lib/favorite-actions";

export function FavoriteButton({
  contentId,
  initial,
  size = "md",
}: {
  contentId: string;
  initial: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [fav, setFav] = useState(initial);
  const [busy, setBusy] = useState(false);

  const dims =
    size === "lg"
      ? "h-11 w-11 text-xl"
      : size === "sm"
        ? "h-8 w-8 text-sm"
        : "h-10 w-10 text-lg";

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    const result = await toggleFavorite(contentId);
    if (!result.error) setFav(result.isFavorite);
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-pressed={fav}
      aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
      title={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={`grid place-items-center rounded-full border bg-white/90 shadow-lg backdrop-blur transition-all duration-200 hover:scale-110 ${dims} ${
        fav
          ? "border-rose-200 text-rose-500"
          : "border-ink/10 text-ink/40 hover:text-rose-500"
      } ${busy ? "opacity-50" : ""}`}
    >
      <span aria-hidden>{fav ? "♥" : "♡"}</span>
    </button>
  );
}
