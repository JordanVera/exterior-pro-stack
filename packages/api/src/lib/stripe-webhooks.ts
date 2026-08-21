import type Stripe from "stripe";
import { db } from "@repo/db";
import { getInvoiceSubscriptionId, stripe } from "./stripe";
import {
  fulfillJobCheckout,
  fulfillPlanSubscriptionFromStripe,
  fulfillSubscriptionCheckout,
  fulfillTipCheckout,
  reverseTransfersForPayment,
} from "./payments";
import { syncProviderConnectStatus } from "./connect";

function metadataOf(obj: { metadata?: Stripe.Metadata | null }) {
  const meta = obj.metadata ?? {};
  return Object.fromEntries(
    Object.entries(meta).map(([k, v]) => [k, String(v ?? "")])
  );
}

export async function handleStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = metadataOf(session);
      const kind = metadata.kind || (metadata.bidId ? "job" : "subscription");
      const customerId =
        typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id ?? null;

      if (kind === "job") {
        await fulfillJobCheckout({
          sessionId: session.id,
          paymentIntentId,
          customerStripeId: customerId,
          metadata,
        });
      } else if (kind === "tip") {
        await fulfillTipCheckout({
          sessionId: session.id,
          paymentIntentId,
          customerStripeId: customerId,
          metadata,
        });
      } else {
        await fulfillSubscriptionCheckout({
          sessionId: session.id,
          subscriptionId,
          customerStripeId: customerId,
          paymentIntentId,
          metadata,
        });
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const billingReason = (invoice as Stripe.Invoice & { billing_reason?: string })
        .billing_reason;
      const stripeSubId = getInvoiceSubscriptionId(invoice);
      if (!stripeSubId) break;

      if (billingReason === "subscription_create") {
        await fulfillPlanSubscriptionFromStripe(stripeSubId);
        break;
      }

      const subscription = await db.customerSubscription.findFirst({
        where: { stripeSubscriptionId: stripeSubId },
        include: { plan: true, customer: true },
      });
      if (!subscription) break;

      const periodEnd = new Date(subscription.currentPeriodEnd);
      switch (subscription.billingFrequency) {
        case "MONTHLY":
          periodEnd.setMonth(periodEnd.getMonth() + 1);
          break;
        case "QUARTERLY":
          periodEnd.setMonth(periodEnd.getMonth() + 3);
          break;
        case "ANNUALLY":
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
          break;
      }

      await db.customerSubscription.update({
        where: { id: subscription.id },
        data: {
          status: "ACTIVE",
          currentPeriodStart: subscription.currentPeriodEnd,
          currentPeriodEnd: periodEnd,
        },
      });

      const amountCents = invoice.amount_paid ?? 0;
      if (amountCents > 0) {
        await db.payment.create({
          data: {
            kind: "SUBSCRIPTION",
            status: "SUCCEEDED",
            amountCents,
            stripeInvoiceId: invoice.id,
            customerId: subscription.customerId,
            subscriptionId: subscription.id,
          },
        });
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const stripeSubId = getInvoiceSubscriptionId(invoice);
      if (!stripeSubId) break;
      await db.customerSubscription.updateMany({
        where: { stripeSubscriptionId: stripeSubId },
        data: { status: "PAST_DUE" },
      });
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      if (subscription.status === "canceled") {
        await db.customerSubscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: "CANCELLED" },
        });
        break;
      }
      const paused = Boolean(
        (subscription as Stripe.Subscription & { pause_collection?: unknown })
          .pause_collection
      );
      await db.customerSubscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { status: paused ? "PAUSED" : "ACTIVE" },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await db.customerSubscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { status: "CANCELLED" },
      });
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const pi =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;
      if (!pi) break;
      const payment = await db.payment.findFirst({
        where: { stripePaymentIntentId: pi },
      });
      if (!payment) break;
      await db.payment.update({
        where: { id: payment.id },
        data: { status: "REFUNDED" },
      });
      await reverseTransfersForPayment(payment.id);
      break;
    }

    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      await syncProviderConnectStatus(account.id);
      break;
    }

    default:
      break;
  }
}

export async function constructStripeEvent(body: string, signature: string) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  }
  return stripe.webhooks.constructEvent(body, signature, secret);
}
