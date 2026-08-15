import { NextResponse, type NextRequest } from "next/server";

// En Next.js 16, le "middleware" s'appelle désormais "proxy".
// Vérification optimiste : redirige les visiteurs sans cookie de session
// Supabase hors de l'espace "/dashboard". La vérification réelle du rôle
// est faite côté serveur (voir src/lib/auth.ts).

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasSessionCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.endsWith("-auth-token"));

  if (pathname.startsWith("/dashboard") && !hasSessionCookie) {
    const url = new URL("/connexion", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
