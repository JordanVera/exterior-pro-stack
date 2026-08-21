import { TRPCError } from "@trpc/server";
import { createJobTipInput } from "@repo/validators";
import { router, customerProcedure, providerProcedure } from "../trpc";
import { createTipCheckoutSession } from "../lib/payments";

export const paymentRouter = router({
  listForCustomer: customerProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.customerProfile.findUnique({
      where: { userId: ctx.user.userId },
    });
    if (!profile) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    }

    return ctx.db.payment.findMany({
      where: { customerId: profile.id },
      include: {
        job: { include: { service: true, property: true } },
        subscription: { include: { plan: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  listForProvider: providerProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.providerProfile.findUnique({
      where: { userId: ctx.user.userId },
    });
    if (!profile) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    }

    return ctx.db.transfer.findMany({
      where: { providerId: profile.id },
      include: {
        payment: {
          include: {
            job: { include: { service: true, property: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  /** Customer: tip the assigned provider after a completed job */
  createTipCheckout: customerProcedure
    .input(createJobTipInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.customerProfile.findUnique({
        where: { userId: ctx.user.userId },
        include: { user: true },
      });
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId },
        include: {
          property: true,
          service: true,
          acceptedBid: { include: { provider: true } },
        },
      });

      if (!job || job.property.customerId !== profile.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      if (job.status !== "COMPLETED" || !job.acceptedBid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can only tip after a job is completed",
        });
      }

      const alreadyTipped = await ctx.db.payment.findFirst({
        where: {
          jobId: job.id,
          kind: "TIP",
          status: "SUCCEEDED",
        },
      });
      if (alreadyTipped) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You already sent a tip for this job",
        });
      }

      if (!job.acceptedBid.provider.stripeTransfersEnabled) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "This provider cannot receive tips yet.",
        });
      }

      const checkout = await createTipCheckoutSession({
        customerId: profile.id,
        jobId: job.id,
        providerId: job.acceptedBid.providerId,
        amountCents: input.amountCents,
        description: `Tip for ${job.service.name} — ${job.acceptedBid.provider.businessName}`,
        email: profile.email,
        name: `${profile.firstName} ${profile.lastName}`,
        phone: profile.user.phone,
        stripeCustomerId: profile.stripeCustomerId,
      });

      return {
        checkoutUrl: checkout.checkoutUrl,
        amountCents: input.amountCents,
      };
    }),
});
