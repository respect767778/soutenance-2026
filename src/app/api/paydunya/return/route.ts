import { NextRequest, NextResponse } from "next/server";
import { getAdminClientOrNull } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { confirmInvoice, mapStatus } from "@/lib/paydunya";

// ============================================================
// PayDunya RETURN : PayDunya redirige ici après paiement en
// ajoutant ?token=invoice_token. On confirme la transaction,
// on met à jour l'achat, puis on renvoie vers la bibliothèque.
// ============================================================

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const origin = request.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(new URL("/dashboard/client", origin));
  }

  let status = "pending";
  let customData: Record<string, unknown> | null = null;
  try {
    const res = await confirmInvoice(token);
    status = mapStatus(res.status);
    customData = res.customData;
  } catch (err) {
    console.error("[PayDunya return] confirm error:", err);
  }

  try {
    const adminSupabase = getAdminClientOrNull();
    if (adminSupabase) {
      const { error } = await adminSupabase
        .from("purchases")
        .update({ status })
        .eq("paydunya_token", token);
      if (error) console.error("[PayDunya return] admin update error:", error.message);
    } else {
      // Repli avec le client utilisateur connecté
      const userSupabase = await createClient();
      const purchaseId = customData?.purchase_id as string | undefined;
      if (purchaseId) {
        await userSupabase
          .from("purchases")
          .update({ status, paydunya_token: token })
          .eq("id", purchaseId);
      } else {
        await userSupabase
          .from("purchases")
          .update({ status })
          .eq("paydunya_token", token);
      }
    }
  } catch (err) {
    console.error("[PayDunya return] supabase update error:", err);
  }

  const param =
    status === "complete"
      ? "success"
      : status === "cancelled"
        ? "cancelled"
        : "failed";

  return NextResponse.redirect(
    new URL(`/dashboard/client?paiement=${param}`, origin),
  );
}

