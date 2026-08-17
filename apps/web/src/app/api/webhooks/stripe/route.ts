import { NextRequest, NextResponse } from "next/server";
import { constructStripeEvent, handleStripeEvent } from "@repo/api";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  try {
    const event = await constructStripeEvent(body, sig);
    await handleStripeEvent(event);
    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Stripe webhook failed: ${message}`);
    const status = message.includes("signature") || message.includes("Invalid") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
