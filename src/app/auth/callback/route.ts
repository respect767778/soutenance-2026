import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Callback de confirmation d'email (Supabase redirige ici après le clic).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return an error page
  return NextResponse.redirect(`${origin}/connexion?error=auth`);
}
