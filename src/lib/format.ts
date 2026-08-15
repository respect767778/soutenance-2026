export function formatPrice(fcfa: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(fcfa)} FCFA`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
