/**
 * Affichage d'une note sur 5 étoiles (support des demi-étoiles).
 * Composant "serveur-safe" : pas d'état, utilisable partout.
 */
export function Stars({
  value,
  size = "text-lg",
}: {
  value: number;
  size?: string;
}) {
  const clamped = Math.max(0, Math.min(5, value));

  return (
    <span
      className={`relative inline-flex leading-none ${size}`}
      aria-label={`${value.toFixed(1)} sur 5`}
    >
      {/* Étoiles de fond (grises) */}
      <span className="flex text-ink/15" aria-hidden>
        ★★★★★
      </span>
      {/* Étoiles remplies (dorées), rognées selon la note */}
      <span
        className="absolute inset-0 flex overflow-hidden text-gold-500"
        style={{ width: `${(clamped / 5) * 100}%` }}
        aria-hidden
      >
        <span className="flex">★★★★★</span>
      </span>
    </span>
  );
}
