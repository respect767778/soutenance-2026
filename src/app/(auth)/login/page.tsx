import { redirect } from "next/navigation";

// L'ancienne URL /login redirige désormais vers le hub de connexion
// qui propose une porte d'entrée par rôle.
export default function LoginPage() {
  redirect("/connexion");
}
