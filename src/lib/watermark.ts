import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

export interface BuyerWatermarkInfo {
  buyerName: string;
  buyerPhone?: string | null;
  buyerEmail?: string | null;
  purchaseId?: string | null;
  date?: string | null;
  role?: "client" | "auteur" | "editeur" | "admin";
}

/** Vérifie qu'un buffer commence bien par "%PDF" (magic bytes). */
export function looksLikePdf(bytes: Uint8Array | ArrayBuffer): boolean {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (u8.length < 5) return false;
  return (
    u8[0] === 0x25 && u8[1] === 0x50 && u8[2] === 0x44 && u8[3] === 0x46
  ); // "%PDF"
}

/** Nettoie une chaîne de caractères pour les polices standards PDF (WinAnsi / ASCII). */
function sanitizeForPdf(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Enlève les accents qui peuvent corrompre StandardFonts
    .replace(/[^\x20-\x7E]/g, " "); // Garde les caractères ASCII imprimables
}

/**
 * Applique un filigrane clairement VISIBLE (pied de page personnalisé +
 * filigrane diagonal répété + métadonnées) sur chaque page d'un PDF.
 */
export async function stampPdf(
  pdfBuffer: ArrayBuffer | Uint8Array,
  info: BuyerWatermarkInfo,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  const cleanName = sanitizeForPdf(info.buyerName || "Client SUNU CONTENU");
  const cleanPhone = info.buyerPhone ? sanitizeForPdf(info.buyerPhone) : "";
  const cleanEmail = info.buyerEmail ? sanitizeForPdf(info.buyerEmail) : "";
  const cleanDate = info.date
    ? sanitizeForPdf(info.date)
    : new Date().toLocaleDateString("fr-FR");
  const shortId = (info.purchaseId || "SC")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 8)
    .toUpperCase();

  let footerLine1 = "";
  const footerLine2 =
    "Copie strictement personnelle. Toute revente ou diffusion publique (Telegram, WhatsApp...) est illegale.";
  let diagonalText = `SUNU CONTENU - ${cleanName}`;

  if (info.role === "auteur") {
    footerLine1 = `COPIE AUTEUR - ${cleanName} - Exporte le ${cleanDate}`;
    diagonalText = `COPIE AUTEUR - ${cleanName}`;
  } else if (info.role === "admin" || info.role === "editeur") {
    footerLine1 = `REVUE EDITORIALE & MODERATION - ${cleanName} - ${cleanDate}`;
    diagonalText = `REVUE MODERATION - ${cleanName}`;
  } else {
    const phonePart = cleanPhone ? ` | Tel: ${cleanPhone}` : "";
    const emailPart = cleanEmail ? ` | Email: ${cleanEmail}` : "";
    footerLine1 = `Licence exclusive accordee a : ${cleanName}${phonePart}${emailPart} | ID: #${shortId}`;
    diagonalText = cleanPhone
      ? `SUNU CONTENU - ${cleanName} (${cleanPhone})`
      : `SUNU CONTENU - ${cleanName}`;
  }

  footerLine1 = sanitizeForPdf(footerLine1);
  diagonalText = sanitizeForPdf(diagonalText);

  const pages = doc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();

    // ---- 1. Pied de page bien visible ----
    const fontSize = Math.min(8.5, Math.max(7, width / 70));
    const margin = 22;
    const bandHeight = 34;

    // Bandeau opaque (blanc) pour garantir la lisibilité
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: bandHeight,
      color: rgb(0.99, 0.99, 0.99),
      opacity: 0.96,
    });

    // Ligne de séparation
    page.drawLine({
      start: { x: 0, y: bandHeight },
      end: { x: width, y: bandHeight },
      thickness: 0.7,
      color: rgb(0.16, 0.55, 0.4),
      opacity: 0.9,
    });

    // Ligne 1 : informations de licence (en gras, bien visible)
    page.drawText(footerLine1, {
      x: margin,
      y: bandHeight - 13,
      size: fontSize,
      font: boldFont,
      color: rgb(0.04, 0.35, 0.25),
      opacity: 1,
    });

    // Ligne 2 : mention légale
    page.drawText(footerLine2, {
      x: margin,
      y: bandHeight - 23,
      size: Math.max(6, fontSize - 1),
      font,
      color: rgb(0.35, 0.35, 0.4),
      opacity: 1,
    });

    // Mention "SUNU CONTENU" en haut à droite du bandeau
    const brand = "SUNU CONTENU";
    const brandSize = Math.max(8, fontSize);
    const brandWidth = boldFont.widthOfTextAtSize(brand, brandSize);
    page.drawText(brand, {
      x: width - margin - brandWidth,
      y: bandHeight - 13,
      size: brandSize,
      font: boldFont,
      color: rgb(0.79, 0.55, 0.13),
      opacity: 1,
    });

    // ---- 2. Filigrane diagonal central (visible) ----
    const diagFontSize = Math.min(26, Math.max(16, width / 22));
    const drawDiagonal = (yFraction: number, opacity: number) => {
      const textWidth = boldFont.widthOfTextAtSize(diagonalText, diagFontSize);
      const textHeight = boldFont.heightAtSize(diagFontSize);
      const centerX = width / 2;
      const centerY = height * yFraction;
      const rad = (35 * Math.PI) / 180;
      const offsetX =
        (textWidth / 2) * Math.cos(rad) - (textHeight / 2) * Math.sin(rad);
      const offsetY =
        (textWidth / 2) * Math.sin(rad) + (textHeight / 2) * Math.cos(rad);

      page.drawText(diagonalText, {
        x: Math.max(10, centerX - offsetX),
        y: Math.max(bandHeight + 6, centerY - offsetY),
        size: diagFontSize,
        font: boldFont,
        color: rgb(0.1, 0.35, 0.28),
        opacity,
        rotate: degrees(35),
      });
    };

    // Filigrane principal (bien visible) au centre + un second plus léger en bas
    drawDiagonal(0.55, 0.16);
    drawDiagonal(0.22, 0.07);
  }

  // ---- 3. Métadonnées forensiques ----
  doc.setProducer("SUNU CONTENU Anti-Piracy Engine v1.1");
  doc.setSubject(`Licence exclusive accordee a ${cleanName} (${shortId})`);
  doc.setKeywords([
    "SUNU_CONTENU_PROTECTED",
    `BUYER_ID:${info.purchaseId || ""}`,
    `BUYER_NAME:${cleanName}`,
    `BUYER_PHONE:${cleanPhone}`,
  ]);

  return await doc.save();
}
