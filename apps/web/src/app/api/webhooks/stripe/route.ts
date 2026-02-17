import { NextRequest, NextResponse } from "next/server";
import { stripe, Stripe } from "@repo/api";
import { db } from "@repo/db";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;
        const metadata = session.metadata;

        if (metadata?.planId && metadata?.propertyId && metadata?.customerId) {
          // Look up the plan to determine period
          const plan = await db.subscriptionPlan.findUnique({
            where: { id: metadata.planId },
          });

          if (plan) {
            const now = new Date();
            const periodEnd = new Date(now);
            const billingFrequency = (metadata.billingFrequency || "MONTHLY") as "MONTHLY" | "QUARTERLY" | "ANNUALLY";

            switch (billingFrequency) {
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

            await db.customerSubscription.create({
              data: {
                customerId: metadata.customerId,
                planId: metadata.planId,
                propertyId: metadata.propertyId,
                status: "ACTIVE",
                billingFrequency,
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
                stripeSubscriptionId: subscriptionId,
              },
            });

            // Update customer's Stripe customer ID
            await db.customerProfile.update({
              where: { id: metadata.customerId },
              data: { stripeCustomerId: customerId },
            });
          }
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const stripeSubId = invoice.subscription as string;

        if (stripeSubId) {
          const subscription = await db.customerSubscription.findFirst({
            where: { stripeSubscriptionId: stripeSubId },
          });

          if (subscription) {
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
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const stripeSubId = invoice.subscription as string;

        if (stripeSubId) {
          await db.customerSubscription.updateMany({
            where: { stripeSubscriptionId: stripeSubId },
            data: { status: "PAST_DUE" },
          });
        }
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

      default:
        // Unhandled event type
        break;
    }
  } catch (err) {
    console.error(`Error processing webhook event ${event.type}:`, err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
