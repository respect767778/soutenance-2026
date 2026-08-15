import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { ROLES, type Role } from "@/lib/types";
import { ROLE_UI } from "@/lib/role-ui";
import { RoleLoginForm } from "./role-login-form";
import {
  signInAsAdmin,
  signInAsEditeur,
  signInAsAuteur,
  signInAsClient,
  type LoginState,
} from "@/lib/auth-actions";

const VALID_ROLES: Role[] = ["admin", "editeur", "auteur", "client"];

const ACTIONS: Record<Role, (state: LoginState, fd: FormData) => Promise<LoginState>> = {
  admin: signInAsAdmin,
  editeur: signInAsEditeur,
  auteur: signInAsAuteur,
  client: signInAsClient,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ role: string }>;
}): Promise<Metadata> {
  const { role } = await params;
  if (!VALID_ROLES.includes(role as Role)) return { title: "Connexion" };
  return { title: `Connexion ${ROLES[role as Role].label}` };
}

export default async function RoleLoginPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  if (!VALID_ROLES.includes(role as Role)) notFound();

  const r = role as Role;
  const ui = ROLE_UI[r];
  const action = ACTIONS[r];

  const badge = (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${ui.gradient} px-3.5 py-1.5 text-sm font-semibold text-white shadow-lg`}
    >
      <span>{ui.icon}</span> Espace {ROLES[r].label}
    </span>
  );

  return (
    <AuthShell
      title={`Espace ${ROLES[r].label}`}
      subtitle={ui.description}
      badge={badge}
    >
      {r === "admin" || r === "editeur" ? (
        <div className="mb-4 rounded-xl border border-gold-200 bg-gold-100/50 p-3 text-sm text-gold-800">
          Ce compte est attribué par l&apos;équipe de la plateforme. Si vous y avez
          accès, connectez-vous ci-dessous.
        </div>
      ) : null}

      <RoleLoginForm action={action} roleLabel={ROLES[r].label} />

      <div className="mt-4 space-y-2 text-center text-sm text-ink/50">
        <p>
          Ce n&apos;est pas votre espace ?{" "}
          <Link href="/connexion" className="font-semibold text-brand-600 hover:text-brand-700">
            Choisir un autre espace
          </Link>
        </p>
        {r === "auteur" || r === "client" ? (
          <p>
            Pas encore de compte ?{" "}
            <Link
              href={`/signup?role=${r}`}
              className="font-semibold text-brand-600 hover:text-brand-700"
            >
              Créer un compte {ROLES[r].label}
            </Link>
          </p>
        ) : null}
      </div>
    </AuthShell>
  );
}
