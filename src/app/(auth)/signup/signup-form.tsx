"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Role } from "@/lib/types";

const ROLE_CHOICES: { value: Role; icon: string; label: string; hint: string }[] =
  [
    { value: "auteur", icon: "🖋️", label: "Auteur", hint: "Je crée et je vends" },
    { value: "client", icon: "📚", label: "Client", hint: "Je découvre et j'achète" },
  ];

export function SignupForm({ defaultRole = "client" }: { defaultRole?: Role }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isSupabaseConfigured) {
      setError(
        "Supabase n'est pas encore configuré. Renseignez vos clés dans .env.local.",
      );
      return;
    }

    setLoading(true);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const fullName = String(form.get("full_name") ?? "");
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const role = String(form.get("role") ?? "client") as Role;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setSuccess(
        "Compte créé ! Vérifiez votre boîte de réception pour confirmer votre adresse email, puis connectez-vous.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="full_name" className="mb-1.5 block text-sm font-semibold text-ink">
          Nom complet
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          autoComplete="name"
          placeholder="Awa Diop"
          className="input"
        />
      </div>

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
          minLength={8}
          autoComplete="new-password"
          placeholder="8 caractères minimum"
          className="input"
        />
      </div>

      <div>
        <span className="mb-2 block text-sm font-semibold text-ink">
          Je m&apos;inscris en tant que
        </span>
        <div className="grid grid-cols-2 gap-3">
          {ROLE_CHOICES.map((choice) => (
            <label
              key={choice.value}
              className="flex cursor-pointer flex-col gap-1 rounded-2xl border border-ink/12 p-4 transition has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:checked]:shadow-[0_0_0_4px_rgba(32,133,97,0.1)]"
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value={choice.value}
                  defaultChecked={choice.value === defaultRole}
                  className="accent-brand-600"
                />
                <span className="text-sm font-semibold text-ink">
                  {choice.icon} {choice.label}
                </span>
              </span>
              <span className="pl-6 text-xs text-ink/45">{choice.hint}</span>
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink/40">
          Les rôles Éditeur et Administrateur sont attribués par l&apos;équipe de la
          plateforme.
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {success}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn btn-primary w-full !py-3">
        {loading ? "Création…" : "Créer mon compte"}
      </button>

      <p className="text-center text-sm text-ink/50">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="font-semibold text-brand-600 hover:text-brand-700">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
