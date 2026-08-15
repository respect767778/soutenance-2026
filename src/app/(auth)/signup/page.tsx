import type { Metadata } from "next";
import { SignupForm } from "./signup-form";
import { AuthShell } from "@/components/auth-shell";
import type { Role } from "@/lib/types";

export const metadata: Metadata = { title: "Créer un compte" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const defaultRole: Role = role === "auteur" ? "auteur" : "client";

  return (
    <AuthShell
      title="Rejoignez l'aventure"
      subtitle="Inscrivez-vous en tant qu'auteur ou client."
    >
      <SignupForm defaultRole={defaultRole} />
    </AuthShell>
  );
}
