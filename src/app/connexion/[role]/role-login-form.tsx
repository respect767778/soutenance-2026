"use client";

import { useActionState } from "react";
import type { LoginState } from "@/lib/auth-actions";

type LoginAction = (state: LoginState, payload: FormData) => Promise<LoginState>;

export function RoleLoginForm({
  action,
  roleLabel,
}: {
  action: LoginAction;
  roleLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {
    error: null,
  } as LoginState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-ink">
          Adresse email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="vous@exemple.com"
          className="input"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-ink">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="input"
        />
      </div>

      {state.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary w-full !py-3">
        {pending ? "Connexion…" : `Se connecter — ${roleLabel}`}
      </button>
    </form>
  );
}
