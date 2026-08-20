import Stripe from "stripe";

export { Stripe };

function createStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.warn("STRIPE_SECRET_KEY is not set. Stripe functionality will be unavailable.");
    return null;
  }
  return new Stripe(secretKey, { typescript: true });
}

let client: Stripe | null | undefined;

function getStripeClient(): Stripe | null {
  if (client === undefined) {
    client = createStripeClient();
  }
  return client;
}

export function requireStripe() {
  const stripeClient = getStripeClient();
  if (!stripeClient) {
    throw new Error(
      "Payments are not configured. Set STRIPE_SECRET_KEY to enable checkout."
    );
  }
  return stripeClient;
}

export function getStripePublishableKey() {
  return (
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    process.env.STRIPE_PUBLIC_KEY ||
    ""
  );
}

/**
 * API version the React Native SDK uses for ephemeral keys.
 * Must match @stripe/stripe-react-native, not the server Stripe SDK.
 */
export const STRIPE_MOBILE_API_VERSION = "2025-03-31.basil";

/**
 * Lazy Stripe client so Next.js can collect page data at build time
 * without requiring STRIPE_SECRET_KEY during import.
 */
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const instance = requireStripe();
    const value = Reflect.get(instance, prop, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export const PLATFORM_FEE_BPS = Number(process.env.PLATFORM_FEE_BPS ?? "1800");

export function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:3000"
  );
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

export function getInvoicePaymentIntentId(invoice: Stripe.Invoice): string | null {
  const legacy = (
    invoice as Stripe.Invoice & { payment_intent?: string | { id: string } }
  ).payment_intent;
  if (typeof legacy === "string") return legacy;
  if (legacy && typeof legacy === "object" && "id" in legacy) return legacy.id;

  const payments = (
    invoice as Stripe.Invoice & {
      payments?: {
        data?: Array<{
          payment?: { payment_intent?: string | { id: string } };
        }>;
      };
    }
  ).payments?.data;
  for (const item of payments ?? []) {
    const pi = item.payment?.payment_intent;
    if (typeof pi === "string") return pi;
    if (pi && typeof pi === "object" && "id" in pi) return pi.id;
  }
  return null;
}

export function getInvoicePaymentClientSecret(invoice: Stripe.Invoice): string | null {
  const confirmation = (
    invoice as Stripe.Invoice & {
      confirmation_secret?: { client_secret?: string | null } | null;
    }
  ).confirmation_secret?.client_secret;
  if (confirmation) return confirmation;

  const pi = (
    invoice as Stripe.Invoice & {
      payment_intent?: string | { client_secret?: string | null };
    }
  ).payment_intent;
  if (pi && typeof pi === "object" && pi.client_secret) return pi.client_secret;
  return null;
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
