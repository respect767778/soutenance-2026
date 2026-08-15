import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminClientOrNull } from "@/lib/supabase/admin";
import { confirmInvoice, mapStatus } from "@/lib/paydunya";
import { stampPdf, looksLikePdf } from "@/lib/watermark";

function isStaff(role?: string | null): boolean {
  return role === "admin" || role === "editeur";
}

function sanitizeFilename(title: string, ext = "pdf"): string {
  const clean = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${clean || "document"}-securise.${ext}`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const inline = requestUrl.searchParams.get("inline") === "1";

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.redirect(new URL("/dashboard/client?erreur=identifiant_manquant", origin));
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/connexion", origin));
    }

    // Récupérer le profil utilisateur
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, phone, role")
      .eq("id", user.id)
      .maybeSingle();

    const userRole = profile?.role ?? "client";

    // Récupérer les informations du contenu
    const { data: content } = await supabase
      .from("contents")
      .select("id, author_id, title, file_url, type")
      .eq("id", id)
      .maybeSingle();

    if (!content || !content.file_url) {
      return NextResponse.redirect(
        new URL("/dashboard/client?erreur=fichier_indisponible", origin),
      );
    }

    const isOwner = content.author_id === user.id;
    const staff = isStaff(userRole);

    let purchaseInfo: { id: string; created_at: string } | null = null;

    if (!isOwner && !staff) {
      const { data: purchase } = await supabase
        .from("purchases")
        .select("id, status, paydunya_token, created_at")
        .eq("buyer_id", user.id)
        .eq("content_id", id)
        .maybeSingle();

      if (!purchase) {
        return NextResponse.redirect(
          new URL("/dashboard/client?erreur=non_achete", origin),
        );
      }

      // Auto-guérison : Si l'achat est en pending avec un token PayDunya, on vérifie directement avec PayDunya
      if (purchase.status === "pending" && purchase.paydunya_token) {
        try {
          const res = await confirmInvoice(purchase.paydunya_token);
          const mapped = mapStatus(res.status);
          if (mapped === "complete") {
            purchase.status = "complete";
            const adminForHeal = getAdminClientOrNull();
            if (adminForHeal) {
              await adminForHeal
                .from("purchases")
                .update({ status: "complete" })
                .eq("id", purchase.id);
            }
          }
        } catch (e) {
          console.warn("[Download Route] PayDunya auto-confirm error:", e);
        }
      }

      if (purchase.status === "fail" || purchase.status === "cancelled") {
        return NextResponse.redirect(
          new URL("/dashboard/client?erreur=paiement_invalide", origin),
        );
      }

      purchaseInfo = {
        id: purchase.id,
        created_at: purchase.created_at,
      };
    }

    const isPdf =
      content.file_url.toLowerCase().endsWith(".pdf") ||
      content.type === "ebook" ||
      content.type === "document";

    // 1. Si ce n'est PAS un PDF (ex: MP4, MP3, ZIP), redirection sécurisée vers URL signée temporaire (60s)
    if (!isPdf) {
      const { data: signedData, error: signErr } = await supabase.storage
        .from("contents")
        .createSignedUrl(content.file_url, 60, { download: true });

      if (!signErr && signedData?.signedUrl) {
        return NextResponse.redirect(signedData.signedUrl);
      }

      // Essai de repli avec le client admin si disponible
      const adminSupabase = getAdminClientOrNull();
      if (adminSupabase) {
        try {
          const { data: adminSigned } = await adminSupabase.storage
            .from("contents")
            .createSignedUrl(content.file_url, 60, { download: true });
          if (adminSigned?.signedUrl) {
            return NextResponse.redirect(adminSigned.signedUrl);
          }
        } catch {
          // Ignorer
        }
      }

      return NextResponse.redirect(
        new URL("/dashboard/client?erreur=lien_indisponible", origin),
      );
    }

    // 2. Si c'est un PDF : Téléchargement + Marquage dynamique indélébile (Watermarking)
    let originalBlob: Blob | null = null;

    const { data: blob, error: dlErr } = await supabase.storage
      .from("contents")
      .download(content.file_url);

    if (dlErr || !blob) {
      // Repli avec client admin si configuré
      const adminSupabase = getAdminClientOrNull();
      if (adminSupabase) {
        try {
          const { data: adminBlob } = await adminSupabase.storage
            .from("contents")
            .download(content.file_url);
          originalBlob = adminBlob;
        } catch (err) {
          console.error("[Download] Admin fallback download error:", err);
        }
      }
    } else {
      originalBlob = blob;
    }

    if (!originalBlob) {
      return NextResponse.redirect(
        new URL("/dashboard/client?erreur=fichier_manquant", origin),
      );
    }

    const arrayBuffer = await originalBlob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Si le fichier n'est PAS un vrai PDF (ex : image, Word, texte renommé),
    // on le livre tel quel via un lien signé (le filigrane PDF ne s'applique
    // qu'aux vrais PDF).
    if (!looksLikePdf(bytes)) {
      const { data: signedData } = await supabase.storage
        .from("contents")
        .createSignedUrl(content.file_url, 60, { download: true });
      if (signedData?.signedUrl) {
        return NextResponse.redirect(signedData.signedUrl);
      }
      return NextResponse.redirect(
        new URL("/dashboard/client?erreur=lien_indisponible", origin),
      );
    }

    // Appliquer le watermarking et le stamping de sécurité
    const buyerName =
      profile?.full_name?.trim() ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Client SUNU CONTENU";

    const buyerPhone =
      profile?.phone?.trim() ||
      user.phone ||
      user.user_metadata?.phone ||
      null;

    const buyerEmail = user.email ?? null;

    const stampedPdfBytes = await stampPdf(arrayBuffer, {
      buyerName,
      buyerPhone,
      buyerEmail,
      purchaseId: purchaseInfo?.id ?? (isOwner ? "OWNER" : "STAFF"),
      date: purchaseInfo?.created_at
        ? new Date(purchaseInfo.created_at).toLocaleDateString("fr-FR")
        : new Date().toLocaleDateString("fr-FR"),
      role: isOwner ? "auteur" : staff ? (userRole as "admin" | "editeur") : "client",
    });

    const filename = sanitizeFilename(content.title, "pdf");

    // Retourne le PDF filigrané :
    //  - inline=1  → affiché dans le lecteur (mais TOUJOURS filigrané,
    //                donc un "Enregistrer sous" sauvegarde la copie marquée)
    //  - sinon     → téléchargement direct
    return new Response(Buffer.from(stampedPdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${filename}"`,
        "Content-Length": String(stampedPdfBytes.length),
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erreur interne";
    console.error("[Download Route] Erreur:", msg);
    return NextResponse.redirect(
      new URL(`/dashboard/client?erreur=${encodeURIComponent(msg)}`, origin),
    );
  }
}
