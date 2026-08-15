// ============================================================
// SUNU CONTENU — Client PayDunya (côté serveur uniquement)
// API HTTP/JSON : https://developers.paydunya.com/doc/FR/http_json
// ============================================================

const MASTER_KEY = process.env.PAYDUNYA_MASTER_KEY ?? "";
const PRIVATE_KEY = process.env.PAYDUNYA_PRIVATE_KEY ?? "";
const TOKEN = process.env.PAYDUNYA_TOKEN ?? "";
const MODE = (process.env.PAYDUNYA_MODE ?? "test").toLowerCase() === "live" ? "live" : "test";

const BASE_URL =
  MODE === "live"
    ? "https://app.paydunya.com/api/v1"
    : "https://app.paydunya.com/sandbox-api/v1";

export function isPaydunyaConfigured(): boolean {
  return Boolean(MASTER_KEY && PRIVATE_KEY && TOKEN);
}

function headers(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "PAYDUNYA-MASTER-KEY": MASTER_KEY,
    "PAYDUNYA-PRIVATE-KEY": PRIVATE_KEY,
    "PAYDUNYA-TOKEN": TOKEN,
  };
}

/** Convertit un statut PayDunya en statut interne (purchases.status). */
export function mapStatus(status: string): string {
  switch (String(status).toLowerCase()) {
    case "completed":
    case "complete":
      return "complete";
    case "cancelled":
    case "canceled":
      return "cancelled";
    case "failed":
    case "fail":
      return "fail";
    default:
      return "pending";
  }
}

export type CreateInvoiceInput = {
  amount: number;
  description: string;
  itemName: string;
  customerName?: string | null;
  customData?: Record<string, unknown>;
  returnUrl: string;
  cancelUrl: string;
  callbackUrl: string;
};

/** Crée une facture de paiement avec redirection (PayDunya). */
export async function createCheckoutInvoice(
  input: CreateInvoiceInput,
): Promise<{ token: string; url: string }> {
  const body: Record<string, unknown> = {
    invoice: {
      items: {
        item_0: {
          name: input.itemName,
          quantity: 1,
          unit_price: input.amount,
          total_price: input.amount,
          description: input.description,
        },
      },
      total_amount: input.amount,
      description: input.description,
    },
    store: {
      name: "SUNU CONTENU",
      tagline: "Votre savoir, votre business",
      website_url:
        process.env.NEXT_PUBLIC_SITE_URL ?? "https://saas-sunu-contenu.vercel.app",
    },
    custom_data: input.customData ?? {},
    actions: {
      cancel_url: input.cancelUrl,
      return_url: input.returnUrl,
      callback_url: input.callbackUrl,
    },
  };

  if (input.customerName) {
    (body.invoice as Record<string, unknown>).customer = {
      name: input.customerName,
    };
  }

  const res = await fetch(`${BASE_URL}/checkout-invoice/create`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));
  if (json.response_code !== "00") {
    throw new Error(
      json.response_text || json.description || "Erreur PayDunya lors de la création de la facture.",
    );
  }

  return { token: json.token, url: json.response_text };
}

/** Vérifie l'état d'une facture PayDunya via son token. */
export async function confirmInvoice(
  token: string,
): Promise<{ status: string; customData: Record<string, unknown> | null }> {
  const res = await fetch(`${BASE_URL}/checkout-invoice/confirm/${token}`, {
    method: "GET",
    headers: headers(),
  });

  const json = await res.json().catch(() => ({}));
  return {
    status: typeof json.status === "string" ? json.status : "pending",
    customData: (json.custom_data as Record<string, unknown>) ?? null,
  };
}
