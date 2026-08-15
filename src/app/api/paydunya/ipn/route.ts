import { NextResponse } from "next/server";
import { getAdminClientOrNull } from "@/lib/supabase/admin";
import { mapStatus } from "@/lib/paydunya";

// ============================================================
// PayDunya IPN (Instant Payment Notification)
// PayDunya POSTE ici (format application/x-www-form-urlencoded,
// données imbriquées sous "data[...]") dès qu'un paiement est
// confirmé, annulé ou échoué. On met à jour l'achat correspondant.
// ============================================================

/** Construit un objet imbriqué à partir d'une clé type "data[invoice][token]". */
function setNested(
  obj: Record<string, unknown>,
  key: string,
  value: string,
): void {
  const path = key.replace(/\[(\w+)\]/g, ".$1").split(".").filter(Boolean);
  let cur: Record<string, unknown> = obj;
  path.forEach((part, i) => {
    if (i === path.length - 1) {
      cur[part] = value;
    } else {
      cur[part] = (cur[part] as Record<string, unknown>) ?? {};
      cur = cur[part] as Record<string, unknown>;
    }
  });
}

async function parseBody(request: Request): Promise<Record<string, unknown> | null> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("json")) {
    try {
      return (await request.json()) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  // application/x-www-form-urlencoded
  const text = await request.text();
  const params = new URLSearchParams(text);
  const nested: Record<string, unknown> = {};
  params.forEach((value, key) => setNested(nested, key, value));
  return nested;
}

export async function POST(request: Request) {
  const body = await parseBody(request);
  if (!body) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const data = (body.data ?? body) as Record<string, unknown>;
  const invoice = data.invoice as Record<string, unknown> | undefined;
  const token = String(data.token ?? invoice?.token ?? "");
  const status = mapStatus(String(data.status ?? "pending"));

  if (!token) {
    return NextResponse.json({ ok: false, error: "missing_token" }, { status: 400 });
  }

  try {
    const supabase = getAdminClientOrNull();
    if (!supabase) {
      console.warn("[IPN] SUPABASE_SERVICE_ROLE_KEY is not configured.");
      return NextResponse.json({ ok: false, error: "service_role_missing" }, { status: 500 });
    }
    const { error } = await supabase
      .from("purchases")
      .update({ status, paydunya_token: token })
      .eq("paydunya_token", token);

    if (error) {
      console.error("[IPN] update error:", error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, status, token });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[IPN] error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "PayDunya IPN endpoint" });
}
