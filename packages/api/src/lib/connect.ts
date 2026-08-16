import { TRPCError } from "@trpc/server";
import { db } from "@repo/db";
import { requireStripe, stripe } from "./stripe";

type V2Account = {
  id: string;
  configuration?: {
    recipient?: {
      capabilities?: {
        stripe_balance?: {
          stripe_transfers?: { status?: string };
        };
      };
    };
  };
};

function transfersEnabled(account: V2Account) {
  return (
    account.configuration?.recipient?.capabilities?.stripe_balance
      ?.stripe_transfers?.status === "active"
  );
}

export async function retrieveConnectAccount(accountId: string) {
  const client = requireStripe();
  return (await client.v2.core.accounts.retrieve(accountId)) as V2Account;
}

export async function syncProviderConnectStatus(accountId: string) {
  try {
    const account = await retrieveConnectAccount(accountId);
    const enabled = transfersEnabled(account);
    await db.providerProfile.updateMany({
      where: { stripeAccountId: accountId },
      data: { stripeTransfersEnabled: enabled },
    });
    return enabled;
  } catch (err) {
    console.error("Failed to sync Connect account status:", err);
    return false;
  }
}

export async function createProviderConnectAccount(opts: {
  providerId: string;
  businessName: string;
  email: string;
}) {
  const client = requireStripe();
  const account = (await client.v2.core.accounts.create({
    display_name: opts.businessName,
    contact_email: opts.email,
    dashboard: "express",
    identity: { country: "us" },
    defaults: {
      responsibilities: {
        fees_collector: "application",
        losses_collector: "application",
      },
    },
    configuration: {
      recipient: {
        capabilities: {
          stripe_balance: {
            stripe_transfers: { requested: true },
          },
        },
      },
    },
    metadata: { providerId: opts.providerId },
  } as never)) as V2Account;

  await db.providerProfile.update({
    where: { id: opts.providerId },
    data: {
      stripeAccountId: account.id,
      stripeTransfersEnabled: transfersEnabled(account),
    },
  });

  return account.id;
}

export async function createConnectAccountSession(accountId: string) {
  const client = requireStripe();
  const session = await client.accountSessions.create({
    account: accountId,
    components: {
      account_onboarding: { enabled: true },
      notification_banner: { enabled: true },
      account_management: { enabled: true },
      payments: { enabled: true },
      payouts: { enabled: true },
    },
  });
  return session.client_secret;
}

export async function assertProviderPayoutReady(providerId: string) {
  const profile = await db.providerProfile.findUnique({
    where: { id: providerId },
  });
  if (!profile) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
  }
  if (profile.stripeAccountId) {
    await syncProviderConnectStatus(profile.stripeAccountId);
  }
  const fresh = await db.providerProfile.findUnique({
    where: { id: providerId },
  });
  if (!fresh?.stripeTransfersEnabled) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message:
        "Complete payout onboarding before bidding on jobs. Open Payouts in your provider dashboard.",
    });
  }
  return fresh;
}

export { stripe };
