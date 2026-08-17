import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY ?? "";

if (!secretKey) {
  console.warn("STRIPE_SECRET_KEY is not set. Stripe functionality will be unavailable.");
}

/**
 * Stripe SDK client instance. Always call methods on this object —
 * never set a module-level API key.
 */
export const stripe = new Stripe(secretKey, {
  typescript: true,
});

export { Stripe };

export const PLATFORM_FEE_BPS = Number(process.env.PLATFORM_FEE_BPS ?? "1800");

export function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:3000"
  );
}

export function requireStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      "Payments are not configured. Set STRIPE_SECRET_KEY to enable checkout."
    );
  }
  return stripe;
}

export function toCents(amount: number | string | { toNumber?: () => number }) {
  const value =
    typeof amount === "object" && amount && typeof amount.toNumber === "function"
      ? amount.toNumber()
      : Number(amount);
  return Math.round(value * 100);
}

export function randomSuffix(length = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

/** Platform fee + estimated Stripe processing (2.9% + 30¢). */
export function splitCharge(amountCents: number, feeBps = PLATFORM_FEE_BPS) {
  const stripeFeeCents = Math.round(amountCents * 0.029) + 30;
  const platformFeeCents = Math.round((amountCents * feeBps) / 10_000);
  const transferAmountCents = Math.max(
    0,
    amountCents - platformFeeCents - stripeFeeCents
  );
  return { stripeFeeCents, platformFeeCents, transferAmountCents };
}

export function billingInterval(frequency: "MONTHLY" | "QUARTERLY" | "ANNUALLY") {
  switch (frequency) {
    case "QUARTERLY":
      return { interval: "month" as const, interval_count: 3 };
    case "ANNUALLY":
      return { interval: "year" as const, interval_count: 1 };
    default:
      return { interval: "month" as const, interval_count: 1 };
  }
}

export function priceIdForFrequency(
  plan: {
    stripePriceIdMonthly: string | null;
    stripePriceIdQuarterly: string | null;
    stripePriceIdAnnually: string | null;
  },
  frequency: "MONTHLY" | "QUARTERLY" | "ANNUALLY"
) {
  switch (frequency) {
    case "QUARTERLY":
      return plan.stripePriceIdQuarterly;
    case "ANNUALLY":
      return plan.stripePriceIdAnnually;
    default:
      return plan.stripePriceIdMonthly;
  }
}

export function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const legacy = (invoice as Stripe.Invoice & { subscription?: string | { id: string } })
    .subscription;
  if (typeof legacy === "string") return legacy;
  if (legacy && typeof legacy === "object" && "id" in legacy) return legacy.id;

  const parent = (
    invoice as Stripe.Invoice & {
      parent?: { subscription_details?: { subscription?: string | { id: string } } };
    }
  ).parent;
  const sub = parent?.subscription_details?.subscription;
  if (typeof sub === "string") return sub;
  if (sub && typeof sub === "object" && "id" in sub) return sub.id;
  return null;
}

export async function getReceiptUrl(paymentIntentId: string | null | undefined) {
  if (!paymentIntentId) return null;
  try {
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["latest_charge"],
    });
    const charge = pi.latest_charge;
    if (charge && typeof charge !== "string") {
      return charge.receipt_url ?? null;
    }
  } catch (err) {
    console.error("Failed to load receipt URL:", err);
  }
  return null;
}
