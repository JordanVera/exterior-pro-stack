import { TRPCError } from "@trpc/server";
import { router, customerProcedure, providerProcedure } from "../trpc";

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
});
