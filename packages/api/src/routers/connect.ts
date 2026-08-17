import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, providerProcedure } from "../trpc";
import {
  createConnectAccountSession,
  createProviderConnectAccount,
  syncProviderConnectStatus,
} from "../lib/connect";

export const connectRouter = router({
  getStatus: providerProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.providerProfile.findUnique({
      where: { userId: ctx.user.userId },
    });
    if (!profile) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    }

    if (profile.stripeAccountId) {
      await syncProviderConnectStatus(profile.stripeAccountId);
    }

    const fresh = await ctx.db.providerProfile.findUnique({
      where: { userId: ctx.user.userId },
    });

    return {
      stripeAccountId: fresh?.stripeAccountId ?? null,
      payoutsEnabled: fresh?.stripeTransfersEnabled ?? false,
      email: fresh?.email ?? null,
      contractorAgreedAt: fresh?.contractorAgreedAt ?? null,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
    };
  }),

  startOnboarding: providerProcedure
    .input(
      z.object({
        email: z.string().email(),
        agreeToContractorTerms: z.literal(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.providerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      await ctx.db.providerProfile.update({
        where: { id: profile.id },
        data: {
          email: input.email,
          contractorAgreedAt: new Date(),
        },
      });

      let accountId = profile.stripeAccountId;
      if (!accountId) {
        accountId = await createProviderConnectAccount({
          providerId: profile.id,
          businessName: profile.businessName,
          email: input.email,
        });
      }

      const clientSecret = await createConnectAccountSession(accountId);
      return { clientSecret, accountId };
    }),

  createAccountSession: providerProcedure.mutation(async ({ ctx }) => {
    const profile = await ctx.db.providerProfile.findUnique({
      where: { userId: ctx.user.userId },
    });
    if (!profile?.stripeAccountId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Start payout onboarding first",
      });
    }
    const clientSecret = await createConnectAccountSession(profile.stripeAccountId);
    return { clientSecret };
  }),
});
