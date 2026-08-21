import { TRPCError } from '@trpc/server';
import { db } from '@repo/db';
import type { BillingFrequency } from '@repo/db';
import {
  billingInterval,
  getAppUrl,
  getInvoicePaymentClientSecret,
  getInvoicePaymentIntentId,
  getReceiptUrl,
  getStripePublishableKey,
  priceIdForFrequency,
  randomSuffix,
  requireStripe,
  splitCharge,
  STRIPE_MOBILE_API_VERSION,
  stripe,
  toCents,
} from './stripe';
import { sendJobConfirmationEmail, sendPaymentReceiptEmail } from './email';
import {
  notifyBidAccepted,
  notifyDirectBook,
  notifySubscriptionCreated,
  notifyTipReceived,
} from './notifications';

export async function getOrCreateStripeCustomer(opts: {
  customerId: string;
  email?: string | null;
  name: string;
  phone?: string | null;
  existingStripeCustomerId?: string | null;
}) {
  const client = requireStripe();
  if (opts.existingStripeCustomerId) {
    return opts.existingStripeCustomerId;
  }

  const customer = await client.customers.create({
    email: opts.email || undefined,
    name: opts.name,
    phone: opts.phone || undefined,
    metadata: { customerId: opts.customerId },
  });

  await db.customerProfile.update({
    where: { id: opts.customerId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export async function ensurePlanStripePrices(planId: string) {
  const client = requireStripe();
  const plan = await db.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Plan not found' });
  }

  let productId = plan.stripeProductId;
  if (!productId) {
    const product = await client.products.create({
      name: plan.name,
      description: plan.description || undefined,
      metadata: { planId: plan.id },
    });
    productId = product.id;
  }

  const data: {
    stripeProductId: string;
    stripePriceIdMonthly?: string;
    stripePriceIdQuarterly?: string;
    stripePriceIdAnnually?: string;
  } = { stripeProductId: productId };

  async function createPrice(
    amount: { toNumber?: () => number } | number | string | null,
    frequency: BillingFrequency,
  ) {
    if (!amount) return undefined;
    const cents = toCents(amount);
    if (cents <= 0) return undefined;
    const { interval, interval_count } = billingInterval(frequency);
    const price = await client.prices.create({
      product: productId!,
      currency: 'usd',
      unit_amount: cents,
      recurring: { interval, interval_count },
      metadata: { planId, billingFrequency: frequency },
    });
    return price.id;
  }

  if (!plan.stripePriceIdMonthly) {
    data.stripePriceIdMonthly = await createPrice(plan.monthlyPrice, 'MONTHLY');
  }
  if (!plan.stripePriceIdQuarterly && plan.quarterlyPrice) {
    data.stripePriceIdQuarterly = await createPrice(
      plan.quarterlyPrice,
      'QUARTERLY',
    );
  }
  if (!plan.stripePriceIdAnnually && plan.annualPrice) {
    data.stripePriceIdAnnually = await createPrice(
      plan.annualPrice,
      'ANNUALLY',
    );
  }

  return db.subscriptionPlan.update({
    where: { id: plan.id },
    data,
  });
}

export async function syncAllPlanStripePrices() {
  const plans = await db.subscriptionPlan.findMany();
  const results = [];
  for (const plan of plans) {
    results.push(await ensurePlanStripePrices(plan.id));
  }
  return results;
}

export async function createPlanCheckoutSession(opts: {
  customerId: string;
  planId: string;
  propertyId: string;
  billingFrequency: BillingFrequency;
  email?: string | null;
  name: string;
  phone?: string | null;
  stripeCustomerId?: string | null;
  successUrl?: string;
  cancelUrl?: string;
}) {
  const client = requireStripe();
  const plan = await ensurePlanStripePrices(opts.planId);
  const priceId = priceIdForFrequency(plan, opts.billingFrequency);
  if (!priceId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'This billing frequency is not available for the selected plan',
    });
  }

  const stripeCustomerId = await getOrCreateStripeCustomer({
    customerId: opts.customerId,
    email: opts.email,
    name: opts.name,
    phone: opts.phone,
    existingStripeCustomerId: opts.stripeCustomerId,
  });

  const appUrl = getAppUrl();
  const session = await client.checkout.sessions.create({
    mode: 'subscription',
    customer: stripeCustomerId,
    client_reference_id: opts.customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url:
      opts.successUrl || `${appUrl}/customer/subscriptions?checkout=success`,
    cancel_url: opts.cancelUrl || `${appUrl}/customer/plans?checkout=canceled`,
    metadata: {
      kind: 'subscription',
      planId: opts.planId,
      propertyId: opts.propertyId,
      customerId: opts.customerId,
      billingFrequency: opts.billingFrequency,
    },
    subscription_data: {
      metadata: {
        kind: 'subscription',
        planId: opts.planId,
        propertyId: opts.propertyId,
        customerId: opts.customerId,
        billingFrequency: opts.billingFrequency,
      },
    },
    integration_identifier: `plan_sub_${randomSuffix()}`,
  });

  if (!session.url) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to create checkout session',
    });
  }

  return { checkoutUrl: session.url, sessionId: session.id };
}

function planPaymentMetadata(opts: {
  planId: string;
  propertyId: string;
  customerId: string;
  billingFrequency: BillingFrequency;
}) {
  return {
    kind: 'subscription',
    planId: opts.planId,
    propertyId: opts.propertyId,
    customerId: opts.customerId,
    billingFrequency: opts.billingFrequency,
  };
}

export async function createPlanPaymentSheet(opts: {
  customerId: string;
  planId: string;
  propertyId: string;
  billingFrequency: BillingFrequency;
  email?: string | null;
  name: string;
  phone?: string | null;
  stripeCustomerId?: string | null;
}): Promise<{
  publishableKey: string;
  customerId: string;
  ephemeralKeySecret: string;
  paymentIntentClientSecret: string;
  stripeSubscriptionId: string;
}> {
  const client = requireStripe();
  const publishableKey = getStripePublishableKey();
  if (!publishableKey) {
    throw new TRPCError({
      code: 'PRECONDITION_FAILED',
      message:
        'Payments are not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.',
    });
  }

  const plan = await ensurePlanStripePrices(opts.planId);
  const priceId = priceIdForFrequency(plan, opts.billingFrequency);
  if (!priceId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'This billing frequency is not available for the selected plan',
    });
  }

  const stripeCustomerId = await getOrCreateStripeCustomer({
    customerId: opts.customerId,
    email: opts.email,
    name: opts.name,
    phone: opts.phone,
    existingStripeCustomerId: opts.stripeCustomerId,
  });

  const metadata = planPaymentMetadata(opts);

  const ephemeralKey = await client.ephemeralKeys.create(
    { customer: stripeCustomerId },
    { apiVersion: STRIPE_MOBILE_API_VERSION },
  );

  const subscription = await client.subscriptions.create({
    customer: stripeCustomerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    metadata,
    expand: [
      'latest_invoice.confirmation_secret',
      'latest_invoice.payment_intent',
    ],
  });

  const invoice = subscription.latest_invoice;
  if (!invoice || typeof invoice === 'string') {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to start in-app checkout',
    });
  }

  let clientSecret = getInvoicePaymentClientSecret(invoice);
  if (!clientSecret) {
    const paymentIntentId = getInvoicePaymentIntentId(invoice);
    if (paymentIntentId) {
      const intent = await client.paymentIntents.retrieve(paymentIntentId);
      clientSecret = intent.client_secret;
    }
  }

  if (!clientSecret || !ephemeralKey.secret) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to start in-app checkout',
    });
  }

  return {
    publishableKey,
    customerId: stripeCustomerId,
    ephemeralKeySecret: ephemeralKey.secret,
    paymentIntentClientSecret: clientSecret,
    stripeSubscriptionId: subscription.id,
  };
}

export async function fulfillPlanSubscriptionFromStripe(
  stripeSubscriptionId: string,
): Promise<{ fulfilled: boolean; status: string }> {
  const client = requireStripe();
  const subscription = await client.subscriptions.retrieve(
    stripeSubscriptionId,
    { expand: ['latest_invoice'] },
  );

  if (subscription.status !== 'active' && subscription.status !== 'trialing') {
    return { fulfilled: false, status: subscription.status };
  }

  const invoice =
    subscription.latest_invoice &&
    typeof subscription.latest_invoice !== 'string'
      ? subscription.latest_invoice
      : null;

  await fulfillSubscriptionCheckout({
    sessionId: null,
    subscriptionId: subscription.id,
    customerStripeId:
      typeof subscription.customer === 'string'
        ? subscription.customer
        : (subscription.customer?.id ?? null),
    paymentIntentId: invoice ? getInvoicePaymentIntentId(invoice) : null,
    metadata: Object.fromEntries(
      Object.entries(subscription.metadata ?? {}).map(([k, v]) => [
        k,
        String(v ?? ''),
      ]),
    ),
  });

  return { fulfilled: true, status: subscription.status };
}

export async function cancelIncompletePlanSubscription(opts: {
  stripeSubscriptionId: string;
  customerId: string;
}): Promise<{ canceled: boolean }> {
  const client = requireStripe();
  const subscription = await client.subscriptions.retrieve(
    opts.stripeSubscriptionId,
  );
  if (subscription.metadata?.customerId !== opts.customerId) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Subscription not found',
    });
  }
  if (
    subscription.status !== 'incomplete' &&
    subscription.status !== 'incomplete_expired'
  ) {
    return { canceled: false };
  }
  await client.subscriptions.cancel(opts.stripeSubscriptionId);
  return { canceled: true };
}

export async function createJobCheckoutSession(opts: {
  customerId: string;
  jobId: string;
  bidId: string;
  providerId: string;
  amountCents: number;
  description: string;
  email?: string | null;
  name: string;
  phone?: string | null;
  stripeCustomerId?: string | null;
  successUrl?: string;
  cancelUrl?: string;
  extraMetadata?: Record<string, string>;
}) {
  const client = requireStripe();
  const stripeCustomerId = await getOrCreateStripeCustomer({
    customerId: opts.customerId,
    email: opts.email,
    name: opts.name,
    phone: opts.phone,
    existingStripeCustomerId: opts.stripeCustomerId,
  });

  const { stripeFeeCents, platformFeeCents, transferAmountCents } = splitCharge(
    opts.amountCents,
  );
  const appUrl = getAppUrl();

  const session = await client.checkout.sessions.create({
    mode: 'payment',
    customer: stripeCustomerId,
    client_reference_id: opts.customerId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: opts.amountCents,
          product_data: { name: opts.description },
        },
      },
    ],
    success_url:
      opts.successUrl || `${appUrl}/customer/jobs?checkout=success`,
    cancel_url:
      opts.cancelUrl || `${appUrl}/customer/jobs?checkout=canceled`,
    metadata: {
      kind: 'job',
      jobId: opts.jobId,
      bidId: opts.bidId,
      customerId: opts.customerId,
      providerId: opts.providerId,
      platformFeeCents: String(platformFeeCents),
      stripeFeeCents: String(stripeFeeCents),
      transferAmountCents: String(transferAmountCents),
      ...opts.extraMetadata,
    },
    integration_identifier: `job_pay_${randomSuffix()}`,
  });

  if (!session.url) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to create checkout session',
    });
  }

  await db.payment.create({
    data: {
      kind: 'JOB',
      status: 'PENDING',
      amountCents: opts.amountCents,
      platformFeeCents,
      stripeFeeCents,
      transferAmountCents,
      stripeCheckoutSessionId: session.id,
      customerId: opts.customerId,
      jobId: opts.jobId,
    },
  });

  return { checkoutUrl: session.url, sessionId: session.id };
}

export async function createBillingPortalSession(stripeCustomerId: string) {
  const client = requireStripe();
  const session = await client.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${getAppUrl()}/customer/subscriptions`,
  });
  return { url: session.url };
}

export async function fulfillJobCheckout(opts: {
  sessionId: string;
  paymentIntentId: string | null;
  customerStripeId: string | null;
  metadata: Record<string, string>;
}) {
  const { jobId, bidId, customerId } = opts.metadata;
  if (!jobId || !bidId || !customerId) return;

  const existing = await db.payment.findUnique({
    where: { stripeCheckoutSessionId: opts.sessionId },
  });

  const job = await db.job.findUnique({
    where: { id: jobId },
    include: {
      property: { include: { customer: { include: { user: true } } } },
      service: true,
    },
  });
  if (!job) return;

  const bid = await db.jobBid.findUnique({
    where: { id: bidId },
    include: { provider: { include: { user: true } } },
  });
  if (!bid || bid.jobId !== jobId) return;

  const receiptUrl = await getReceiptUrl(opts.paymentIntentId);

  if (job.status === 'OPEN') {
    await db.$transaction([
      db.jobBid.update({
        where: { id: bidId },
        data: { status: 'ACCEPTED' },
      }),
      db.jobBid.updateMany({
        where: { jobId, id: { not: bidId } },
        data: { status: 'DECLINED' },
      }),
      db.job.update({
        where: { id: jobId },
        data: { acceptedBidId: bidId, status: 'PENDING' },
      }),
    ]);

    const notify =
      opts.metadata.rebook === 'true' ? notifyDirectBook : notifyBidAccepted;
    notify(bid.provider.userId, job.service.name).catch(console.error);

    const customer = job.property.customer;
    if (customer.email) {
      sendJobConfirmationEmail({
        to: customer.email,
        name: customer.firstName,
        serviceName: job.service.name,
        address: `${job.property.address}, ${job.property.city}`,
      }).catch(console.error);
    }
  }

  const amountCents = toCents(bid.price);
  const split = splitCharge(amountCents);

  if (existing) {
    await db.payment.update({
      where: { id: existing.id },
      data: {
        status: 'SUCCEEDED',
        stripePaymentIntentId: opts.paymentIntentId,
        receiptUrl,
        amountCents,
        ...split,
      },
    });
  } else {
    await db.payment.create({
      data: {
        kind: 'JOB',
        status: 'SUCCEEDED',
        amountCents,
        ...split,
        stripeCheckoutSessionId: opts.sessionId,
        stripePaymentIntentId: opts.paymentIntentId,
        receiptUrl,
        customerId,
        jobId,
      },
    });
  }

  if (opts.customerStripeId) {
    await db.customerProfile.update({
      where: { id: customerId },
      data: { stripeCustomerId: opts.customerStripeId },
    });
  }

  const customer = job.property.customer;
  if (customer.email) {
    sendPaymentReceiptEmail({
      to: customer.email,
      name: customer.firstName,
      description: job.service.name,
      amountCents,
      receiptUrl,
    }).catch(console.error);
  }
}

export async function fulfillSubscriptionCheckout(opts: {
  sessionId?: string | null;
  subscriptionId: string | null;
  customerStripeId: string | null;
  paymentIntentId?: string | null;
  metadata: Record<string, string>;
}) {
  const { planId, propertyId, customerId, billingFrequency } = opts.metadata;
  if (!planId || !propertyId || !customerId) return;

  const plan = await db.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan) return;

  const existing = await db.customerSubscription.findFirst({
    where: {
      customerId,
      propertyId,
      status: { in: ['ACTIVE', 'PAUSED'] },
    },
  });
  if (existing) {
    if (opts.subscriptionId && !existing.stripeSubscriptionId) {
      await db.customerSubscription.update({
        where: { id: existing.id },
        data: { stripeSubscriptionId: opts.subscriptionId },
      });
    }
    return;
  }

  const now = new Date();
  const periodEnd = new Date(now);
  const freq = (billingFrequency || 'MONTHLY') as BillingFrequency;
  switch (freq) {
    case 'MONTHLY':
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      break;
    case 'QUARTERLY':
      periodEnd.setMonth(periodEnd.getMonth() + 3);
      break;
    case 'ANNUALLY':
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      break;
  }

  const subscription = await db.customerSubscription.create({
    data: {
      customerId,
      planId,
      propertyId,
      status: 'ACTIVE',
      billingFrequency: freq,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      stripeSubscriptionId: opts.subscriptionId,
    },
    include: {
      customer: { include: { user: true } },
    },
  });

  if (opts.customerStripeId) {
    await db.customerProfile.update({
      where: { id: customerId },
      data: { stripeCustomerId: opts.customerStripeId },
    });
  }

  const amountCents =
    freq === 'ANNUALLY'
      ? toCents(plan.annualPrice ?? plan.monthlyPrice)
      : freq === 'QUARTERLY'
        ? toCents(plan.quarterlyPrice ?? plan.monthlyPrice)
        : toCents(plan.monthlyPrice);

  const receiptUrl = await getReceiptUrl(opts.paymentIntentId ?? undefined);

  await db.payment.create({
    data: {
      kind: 'SUBSCRIPTION',
      status: 'SUCCEEDED',
      amountCents,
      stripeCheckoutSessionId: opts.sessionId || undefined,
      stripePaymentIntentId: opts.paymentIntentId,
      receiptUrl,
      customerId,
      subscriptionId: subscription.id,
    },
  });

  notifySubscriptionCreated(subscription.customer.userId, plan.name).catch(
    console.error,
  );

  if (subscription.customer.email) {
    sendPaymentReceiptEmail({
      to: subscription.customer.email,
      name: subscription.customer.firstName,
      description: `${plan.name} subscription`,
      amountCents,
      receiptUrl,
    }).catch(console.error);
  }
}

export async function payoutForCompletedJob(jobId: string) {
  const job = await db.job.findUnique({
    where: { id: jobId },
    include: {
      acceptedBid: { include: { provider: true } },
      payments: {
        where: { status: 'SUCCEEDED' },
        include: { transfers: true },
      },
      service: true,
      subscription: true,
    },
  });

  if (!job || !job.acceptedBid) return null;
  const provider = job.acceptedBid.provider;
  if (!provider.stripeAccountId || !provider.stripeTransfersEnabled) {
    console.warn(
      `Skipping payout for job ${jobId}: provider is not payout-ready`,
    );
    return null;
  }

  let payment = job.payments.find(
    (p) =>
      p.status === 'SUCCEEDED' &&
      (p.kind === 'JOB' || p.kind === 'SUBSCRIPTION'),
  );

  if (!payment && job.type === 'SUBSCRIPTION') {
    const amountCents = toCents(job.acceptedBid.price);
    const split = splitCharge(amountCents);
    payment = await db.payment.create({
      data: {
        kind: 'SUBSCRIPTION',
        status: 'SUCCEEDED',
        amountCents,
        ...split,
        customerId: (await db.property.findUnique({
          where: { id: job.propertyId },
          select: { customerId: true },
        }))!.customerId,
        jobId: job.id,
        subscriptionId: job.subscriptionId,
      },
      include: { transfers: true },
    });
  }

  if (!payment) return null;
  if (payment.transfers.some((t) => t.status === 'PAID'))
    return payment.transfers[0];

  const amountCents =
    payment.transferAmountCents > 0
      ? payment.transferAmountCents
      : splitCharge(payment.amountCents).transferAmountCents;

  if (amountCents <= 0) return null;

  const record = await db.transfer.create({
    data: {
      paymentId: payment.id,
      providerId: provider.id,
      amountCents,
      status: 'PENDING',
    },
  });

  try {
    const transfer = await stripe.transfers.create({
      amount: amountCents,
      currency: 'usd',
      destination: provider.stripeAccountId,
      transfer_group: job.id,
      metadata: {
        jobId: job.id,
        paymentId: payment.id,
        providerId: provider.id,
      },
    });

    return db.transfer.update({
      where: { id: record.id },
      data: { status: 'PAID', stripeTransferId: transfer.id },
    });
  } catch (err) {
    console.error(`Transfer failed for job ${jobId}:`, err);
    await db.transfer.update({
      where: { id: record.id },
      data: { status: 'FAILED' },
    });
    throw err;
  }
}

export async function createTipCheckoutSession(opts: {
  customerId: string;
  jobId: string;
  providerId: string;
  amountCents: number;
  description: string;
  email?: string | null;
  name: string;
  phone?: string | null;
  stripeCustomerId?: string | null;
}) {
  const client = requireStripe();
  const stripeCustomerId = await getOrCreateStripeCustomer({
    customerId: opts.customerId,
    email: opts.email,
    name: opts.name,
    phone: opts.phone,
    existingStripeCustomerId: opts.stripeCustomerId,
  });

  const split = splitCharge(opts.amountCents, 0);
  const appUrl = getAppUrl();

  const session = await client.checkout.sessions.create({
    mode: 'payment',
    customer: stripeCustomerId,
    client_reference_id: opts.customerId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: opts.amountCents,
          product_data: { name: opts.description },
        },
      },
    ],
    success_url: `${appUrl}/customer/jobs/${opts.jobId}?tip=success`,
    cancel_url: `${appUrl}/customer/jobs/${opts.jobId}?tip=canceled`,
    metadata: {
      kind: 'tip',
      jobId: opts.jobId,
      customerId: opts.customerId,
      providerId: opts.providerId,
      amountCents: String(opts.amountCents),
      platformFeeCents: String(split.platformFeeCents),
      stripeFeeCents: String(split.stripeFeeCents),
      transferAmountCents: String(split.transferAmountCents),
    },
    integration_identifier: `job_tip_${randomSuffix()}`,
  });

  if (!session.url) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to create checkout session',
    });
  }

  await db.payment.create({
    data: {
      kind: 'TIP',
      status: 'PENDING',
      amountCents: opts.amountCents,
      ...split,
      stripeCheckoutSessionId: session.id,
      customerId: opts.customerId,
      jobId: opts.jobId,
    },
  });

  return { checkoutUrl: session.url, sessionId: session.id };
}

export async function fulfillTipCheckout(opts: {
  sessionId: string;
  paymentIntentId: string | null;
  customerStripeId: string | null;
  metadata: Record<string, string>;
}) {
  const { jobId, customerId, providerId } = opts.metadata;
  if (!jobId || !customerId || !providerId) return;

  const existingTip = await db.payment.findFirst({
    where: {
      jobId,
      kind: 'TIP',
      status: 'SUCCEEDED',
    },
  });
  if (existingTip && existingTip.stripeCheckoutSessionId !== opts.sessionId) {
    return;
  }

  const job = await db.job.findUnique({
    where: { id: jobId },
    include: {
      property: { include: { customer: { include: { user: true } } } },
      service: true,
      acceptedBid: { include: { provider: { include: { user: true } } } },
    },
  });
  if (!job) return;

  const existing = await db.payment.findUnique({
    where: { stripeCheckoutSessionId: opts.sessionId },
  });

  const resolvedAmount =
    existing?.amountCents || Number(opts.metadata.amountCents) || 0;
  if (resolvedAmount <= 0) return;

  const resolvedSplit = splitCharge(resolvedAmount, 0);
  const receiptUrl = await getReceiptUrl(opts.paymentIntentId);

  const payment = existing
    ? await db.payment.update({
        where: { id: existing.id },
        data: {
          status: 'SUCCEEDED',
          stripePaymentIntentId: opts.paymentIntentId,
          receiptUrl,
          amountCents: resolvedAmount,
          ...resolvedSplit,
        },
      })
    : await db.payment.create({
        data: {
          kind: 'TIP',
          status: 'SUCCEEDED',
          amountCents: resolvedAmount,
          ...resolvedSplit,
          stripeCheckoutSessionId: opts.sessionId,
          stripePaymentIntentId: opts.paymentIntentId,
          receiptUrl,
          customerId,
          jobId,
        },
      });

  if (opts.customerStripeId) {
    await db.customerProfile.update({
      where: { id: customerId },
      data: { stripeCustomerId: opts.customerStripeId },
    });
  }

  const customer = job.property.customer;
  if (customer.email) {
    sendPaymentReceiptEmail({
      to: customer.email,
      name: customer.firstName,
      description: `Tip for ${job.service.name}`,
      amountCents: resolvedAmount,
      receiptUrl,
    }).catch(console.error);
  }

  const provider = job.acceptedBid?.provider;
  if (provider) {
    notifyTipReceived(provider.userId, job.service.name, resolvedAmount).catch(
      console.error,
    );
  }

  await payoutTip(payment.id, job.id, providerId);
}

export async function payoutTip(
  paymentId: string,
  jobId: string,
  providerId: string,
) {
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    include: { transfers: true },
  });
  if (!payment || payment.kind !== 'TIP' || payment.status !== 'SUCCEEDED') {
    return null;
  }
  if (payment.transfers.some((t) => t.status === 'PAID')) {
    return payment.transfers[0];
  }

  const provider = await db.providerProfile.findUnique({
    where: { id: providerId },
  });
  if (!provider?.stripeAccountId || !provider.stripeTransfersEnabled) {
    console.warn(
      `Skipping tip payout for job ${jobId}: provider is not payout-ready`,
    );
    return null;
  }

  const amountCents =
    payment.transferAmountCents > 0
      ? payment.transferAmountCents
      : splitCharge(payment.amountCents, 0).transferAmountCents;
  if (amountCents <= 0) return null;

  const record = await db.transfer.create({
    data: {
      paymentId: payment.id,
      providerId: provider.id,
      amountCents,
      status: 'PENDING',
    },
  });

  try {
    const transfer = await stripe.transfers.create({
      amount: amountCents,
      currency: 'usd',
      destination: provider.stripeAccountId,
      transfer_group: jobId,
      metadata: {
        jobId,
        paymentId: payment.id,
        providerId: provider.id,
        kind: 'tip',
      },
    });

    return db.transfer.update({
      where: { id: record.id },
      data: { status: 'PAID', stripeTransferId: transfer.id },
    });
  } catch (err) {
    console.error(`Tip transfer failed for job ${jobId}:`, err);
    await db.transfer.update({
      where: { id: record.id },
      data: { status: 'FAILED' },
    });
    throw err;
  }
}

export async function reverseTransfersForPayment(paymentId: string) {
  const transfers = await db.transfer.findMany({
    where: { paymentId, status: 'PAID', stripeTransferId: { not: null } },
  });

  for (const transfer of transfers) {
    try {
      await stripe.transfers.createReversal(transfer.stripeTransferId!, {
        metadata: { paymentId, originalTransferId: transfer.stripeTransferId! },
      });
      await db.transfer.update({
        where: { id: transfer.id },
        data: { status: 'REVERSED' },
      });
    } catch (err) {
      console.error(`Failed to reverse transfer ${transfer.id}:`, err);
    }
  }
}
