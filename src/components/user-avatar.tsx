export function initialsOf(name: string | null | undefined): string {
  return (name ?? "U")
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Avatar d'utilisateur : affiche la photo de profil si disponible,
 * sinon les initiales sur fond dégradé.
 */
export function UserAvatar({
  src,
  name,
  className = "",
}: {
  src?: string | null;
  name?: string | null;
  className?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name ?? "Avatar"}
        className={`shrink-0 object-cover ${className}`}
      />
    );
  }

  return (
    <span
      className={`grid shrink-0 place-items-center bg-gradient-to-br from-brand-600 to-brand-900 font-bold text-white ${className}`}
    >
      {initialsOf(name)}
    </span>
  );
}
