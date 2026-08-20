import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, adminProcedure } from "../trpc";

function paginate<T extends { id: string }>(items: T[], limit: number) {
  let nextCursor: string | undefined;
  if (items.length > limit) {
    const nextItem = items.pop()!;
    nextCursor = nextItem.id;
  }
  return { items, nextCursor };
}

export const adminRouter = router({
  /** List all users with pagination */
  listUsers: adminProcedure
    .input(
      z
        .object({
          role: z.enum(["CUSTOMER", "PROVIDER", "ADMIN", "CREW"]).optional(),
          search: z.string().optional(),
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().cuid().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const search = input?.search?.trim();
      const items = await ctx.db.user.findMany({
        where: {
          ...(input?.role ? { role: input.role } : {}),
          ...(search
            ? {
                OR: [
                  { email: { contains: search } },
                  { phone: { contains: search } },
                ],
              }
            : {}),
        },
        include: { customerProfile: true, providerProfile: true },
        take: limit + 1,
        ...(input?.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        orderBy: { createdAt: "desc" },
      });

      return paginate(items, limit);
    }),

  getUser: adminProcedure
    .input(z.object({ userId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
        include: {
          customerProfile: {
            include: {
              properties: { orderBy: { createdAt: "desc" }, take: 20 },
              subscriptions: {
                include: { plan: true, property: true },
                orderBy: { createdAt: "desc" },
                take: 10,
              },
              payments: { orderBy: { createdAt: "desc" }, take: 10 },
            },
          },
          providerProfile: true,
          crewMemberships: { include: { crew: true } },
        },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const jobs = user.customerProfile
        ? await ctx.db.job.findMany({
            where: { property: { customerId: user.customerProfile.id } },
            include: { service: true, property: true },
            orderBy: { createdAt: "desc" },
            take: 10,
          })
        : [];

      return { ...user, jobs };
    }),

  /** Verify / approve a provider */
  verifyProvider: adminProcedure
    .input(z.object({ providerId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.providerProfile.findUnique({
        where: { id: input.providerId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Provider not found" });
      }

      return ctx.db.providerProfile.update({
        where: { id: input.providerId },
        data: { verified: true },
        include: { user: true },
      });
    }),

  setProviderVerified: adminProcedure
    .input(
      z.object({
        providerId: z.string().cuid(),
        verified: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.providerProfile.findUnique({
        where: { id: input.providerId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Provider not found" });
      }

      return ctx.db.providerProfile.update({
        where: { id: input.providerId },
        data: { verified: input.verified },
        include: { user: true },
      });
    }),

  getProvider: adminProcedure
    .input(z.object({ userId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.providerProfile.findUnique({
        where: { userId: input.userId },
        include: {
          user: true,
          services: {
            include: { service: { include: { category: true } } },
          },
          crews: { include: { members: true } },
          transfers: {
            include: {
              payment: {
                include: { job: { include: { service: true } } },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 20,
          },
        },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Provider not found" });
      }

      const jobs = await ctx.db.job.findMany({
        where: { acceptedBid: { providerId: profile.id } },
        include: { service: true, property: true, acceptedBid: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      const [paidAgg, pendingAgg] = await Promise.all([
        ctx.db.transfer.aggregate({
          _sum: { amountCents: true },
          where: { providerId: profile.id, status: "PAID" },
        }),
        ctx.db.transfer.aggregate({
          _sum: { amountCents: true },
          where: { providerId: profile.id, status: "PENDING" },
        }),
      ]);

      return {
        ...profile,
        jobs,
        paidOutCents: paidAgg._sum.amountCents ?? 0,
        pendingPayoutCents: pendingAgg._sum.amountCents ?? 0,
      };
    }),

  /** Suspend / unsuspend a user */
  toggleUserVerification: adminProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
        verified: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: input.userId },
        data: { verified: input.verified },
      });
    }),

  /** Get platform-wide stats */
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [
      totalUsers,
      totalCustomers,
      totalProviders,
      totalCrew,
      verifiedProviders,
      unverifiedProviders,
      totalJobs,
      openJobs,
      activeJobs,
      completedJobs,
      totalBids,
      pendingBids,
      totalSubscriptions,
      failedPayments,
      pendingPayouts,
      paymentsAgg,
      transfersAgg,
      pendingPayoutsAgg,
    ] = await Promise.all([
      ctx.db.user.count(),
      ctx.db.user.count({ where: { role: "CUSTOMER" } }),
      ctx.db.user.count({ where: { role: "PROVIDER" } }),
      ctx.db.user.count({ where: { role: "CREW" } }),
      ctx.db.providerProfile.count({ where: { verified: true } }),
      ctx.db.providerProfile.count({ where: { verified: false } }),
      ctx.db.job.count(),
      ctx.db.job.count({ where: { status: "OPEN" } }),
      ctx.db.job.count({ where: { status: { in: ["SCHEDULED", "IN_PROGRESS"] } } }),
      ctx.db.job.count({ where: { status: "COMPLETED" } }),
      ctx.db.jobBid.count(),
      ctx.db.jobBid.count({ where: { status: "PENDING" } }),
      ctx.db.customerSubscription.count({ where: { status: "ACTIVE" } }),
      ctx.db.payment.count({ where: { status: "FAILED" } }),
      ctx.db.transfer.count({ where: { status: "PENDING" } }),
      ctx.db.payment.aggregate({
        _sum: { amountCents: true },
        where: { status: "SUCCEEDED" },
      }),
      ctx.db.transfer.aggregate({
        _sum: { amountCents: true },
        where: { status: "PAID" },
      }),
      ctx.db.transfer.aggregate({
        _sum: { amountCents: true },
        where: { status: "PENDING" },
      }),
    ]);

    return {
      totalUsers,
      totalCustomers,
      totalProviders,
      totalCrew,
      verifiedProviders,
      unverifiedProviders,
      totalJobs,
      openJobs,
      activeJobs,
      completedJobs,
      totalBids,
      pendingBids,
      totalSubscriptions,
      failedPayments,
      pendingPayouts,
      gmvCents: paymentsAgg._sum.amountCents ?? 0,
      payoutsCents: transfersAgg._sum.amountCents ?? 0,
      pendingPayoutsCents: pendingPayoutsAgg._sum.amountCents ?? 0,
    };
  }),

  syncStripePlans: adminProcedure.mutation(async () => {
    const { syncAllPlanStripePrices } = await import("../lib/payments");
    return syncAllPlanStripePrices();
  }),

  /** List all jobs with filtering */
  listJobs: adminProcedure
    .input(
      z
        .object({
          status: z
            .enum([
              "OPEN",
              "PENDING",
              "SCHEDULED",
              "IN_PROGRESS",
              "COMPLETED",
              "CANCELLED",
            ])
            .optional(),
          providerId: z.string().cuid().optional(),
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().cuid().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const items = await ctx.db.job.findMany({
        where: {
          ...(input?.status ? { status: input.status } : {}),
          ...(input?.providerId
            ? { acceptedBid: { providerId: input.providerId } }
            : {}),
        },
        include: {
          property: true,
          service: { include: { category: true } },
          acceptedBid: { include: { provider: { include: { user: true } } } },
          bids: { include: { provider: true } },
          assignments: { include: { crew: true } },
        },
        take: limit + 1,
        ...(input?.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        orderBy: { createdAt: "desc" },
      });

      return paginate(items, limit);
    }),

  listPayments: adminProcedure
    .input(
      z
        .object({
          status: z
            .enum(["PENDING", "SUCCEEDED", "FAILED", "REFUNDED", "CANCELED"])
            .optional(),
          kind: z.enum(["SUBSCRIPTION", "JOB"]).optional(),
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().cuid().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const items = await ctx.db.payment.findMany({
        where: {
          ...(input?.status ? { status: input.status } : {}),
          ...(input?.kind ? { kind: input.kind } : {}),
        },
        include: {
          customer: { include: { user: true } },
          job: { include: { service: true, property: true } },
          subscription: { include: { plan: true } },
          transfers: { include: { provider: true } },
        },
        take: limit + 1,
        ...(input?.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        orderBy: { createdAt: "desc" },
      });

      return paginate(items, limit);
    }),

  listTransfers: adminProcedure
    .input(
      z
        .object({
          status: z.enum(["PENDING", "PAID", "FAILED", "REVERSED"]).optional(),
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().cuid().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const items = await ctx.db.transfer.findMany({
        where: {
          ...(input?.status ? { status: input.status } : {}),
        },
        include: {
          provider: { include: { user: true } },
          payment: {
            include: {
              customer: true,
              job: { include: { service: true } },
            },
          },
        },
        take: limit + 1,
        ...(input?.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        orderBy: { createdAt: "desc" },
      });

      return paginate(items, limit);
    }),
});
