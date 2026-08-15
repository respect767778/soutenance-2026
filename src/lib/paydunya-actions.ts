"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "./supabase/server";
import { getAdminClientOrNull } from "./supabase/admin";
import { requireProfile } from "./auth";
import { isPaydunyaConfigured, createCheckoutInvoice } from "./paydunya";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://saas-sunu-contenu.vercel.app";

/**
 * Lance le paiement d'un contenu :
 *  - vérifie que l'utilisateur est connecté,
 *  - vérifie que le contenu est publié et pas déjà acheté,
 *  - crée (ou réinitialise) la ligne d'achat en attente,
 *  - crée la facture PayDunya,
 *  - renvoie l'URL de redirection vers la page de paiement.
 */
export async function checkoutContent(
  contentId: string,
): Promise<{ redirect: string }> {
  if (!isPaydunyaConfigured()) {
    throw new Error(
      "PayDunya n'est pas configuré. Ajoutez les clés PAYDUNYA_* dans les variables d'environnement.",
    );
  }

  const profile = await requireProfile("client", "auteur", "admin", "editeur");
  const supabase = await createClient();

  const { data: content } = await supabase
    .from("contents")
    .select("id, title, slug, price, status")
    .eq("id", contentId)
    .single();

  if (!content) throw new Error("Contenu introuvable.");
  if (content.status !== "publie") {
    throw new Error("Ce contenu n'est pas encore disponible à l'achat.");
  }

  // Déjà acheté ?
  const { data: owned } = await supabase
    .from("purchases")
    .select("id, status")
    .eq("buyer_id", profile.id)
    .eq("content_id", contentId)
    .maybeSingle();

  if (owned && owned.status === "complete") {
    return { redirect: "/dashboard/client" };
  }

  // Contenu gratuit → accès immédiat (via le client admin si disponible,
  // car le statut "complete" est réservé au serveur).
  if (content.price <= 0) {
    const admin = getAdminClientOrNull();
    const db = admin ?? supabase;
    const { error } = await db
      .from("purchases")
      .upsert(
        {
          buyer_id: profile.id,
          content_id: contentId,
          amount: 0,
          status: "complete",
        },
        { onConflict: "buyer_id,content_id" },
      );
    if (error) {
      // Sans clé service_role, un ré-accès peut échouer sur la mise à jour
      // (le client possède déjà le contenu) → non bloquant.
      console.warn("[checkout gratuit]", error.message);
    }
    revalidatePath("/dashboard/client");
    revalidatePath(`/catalogue/${content.slug}`);
    return { redirect: "/dashboard/client" };
  }

  // Crée / réinitialise la ligne d'achat en attente.
  const { data: purchase, error: purchaseErr } = await supabase
    .from("purchases")
    .upsert(
      {
        buyer_id: profile.id,
        content_id: contentId,
        amount: content.price,
        status: "pending",
        paydunya_token: null,
      },
      { onConflict: "buyer_id,content_id" },
    )
    .select("id")
    .single();

  if (purchaseErr) {
    throw new Error(
      "Impossible de préparer l'achat (RLS ?). Exécutez supabase/fix-purchases-rls.sql : " +
        purchaseErr.message,
    );
  }

  const { token, url } = await createCheckoutInvoice({
    amount: content.price,
    description: `Achat : ${content.title}`,
    itemName: content.title,
    customerName: profile.full_name,
    customData: { content_id: contentId, purchase_id: purchase.id },
    returnUrl: `${SITE}/api/paydunya/return`,
    cancelUrl: `${SITE}/catalogue/${content.slug}`,
    callbackUrl: `${SITE}/api/paydunya/ipn`,
  });

  // Sauvegarde du token PayDunya — indispensable pour que le retour/IPN
  // retrouve l'achat et le passe en "complete".
  const { error: tokenErr } = await supabase
    .from("purchases")
    .update({ paydunya_token: token })
    .eq("id", purchase.id);

  if (tokenErr) {
    throw new Error(
      "Impossible d'enregistrer le token PayDunya (RLS ?). Exécutez supabase/fix-purchases-rls.sql : " +
        tokenErr.message,
    );
  }

  return { redirect: url };
}
