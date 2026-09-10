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
                include: { plan: true, property: true, provider: true },
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

  listSubscriptions: adminProcedure
    .input(
      z
        .object({
          status: z
            .enum(['ACTIVE', 'PAUSED', 'CANCELLED', 'PAST_DUE'])
            .optional(),
          limit: z.number().min(1).max(100).default(50),
          cursor: z.string().cuid().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 50;
      const items = await ctx.db.customerSubscription.findMany({
        where: {
          ...(input?.status ? { status: input.status } : {}),
        },
        include: {
          plan: { include: { services: true } },
          property: {
            include: {
              customer: { include: { user: { select: { email: true } } } },
            },
          },
          provider: {
            include: { services: true, user: { select: { email: true } } },
          },
          customer: true,
        },
        take: limit + 1,
        ...(input?.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        orderBy: { createdAt: 'desc' },
      });
      return paginate(items, limit);
    }),

  assignSubscriptionProvider: adminProcedure
    .input(
      z.object({
        subscriptionId: z.string().cuid(),
        providerId: z.string().cuid().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { hasContractedRates, providerServesZip } =
        await import('../lib/rate-cards');

      const subscription = await ctx.db.customerSubscription.findUnique({
        where: { id: input.subscriptionId },
        include: {
          plan: { include: { services: true } },
          property: true,
        },
      });
      if (!subscription) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Subscription not found',
        });
      }

      if (!input.providerId) {
        return ctx.db.customerSubscription.update({
          where: { id: input.subscriptionId },
          data: { assignedProviderId: null },
          include: { plan: true, property: true, provider: true },
        });
      }

      const provider = await ctx.db.providerProfile.findUnique({
        where: { id: input.providerId },
        include: { services: true },
      });
      if (!provider) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Provider not found',
        });
      }

      const serviceIds = subscription.plan.services.map((s) => s.serviceId);
      if (!provider.verified || !provider.stripeTransfersEnabled) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Provider must be verified with Connect payouts enabled',
        });
      }
      if (!providerServesZip(provider.serviceAreaZips, subscription.property.zip)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Provider does not serve this property ZIP',
        });
      }
      if (!hasContractedRates(provider.services, serviceIds)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Set contracted customPrice on every plan visit before assigning this crew',
        });
      }

      return ctx.db.customerSubscription.update({
        where: { id: input.subscriptionId },
        data: { assignedProviderId: input.providerId },
        include: { plan: true, property: true, provider: true },
      });
    }),

  setProviderServicePrices: adminProcedure
    .input(
      z.object({
        providerId: z.string().cuid(),
        services: z.array(
          z.object({
            serviceId: z.string().cuid(),
            customPrice: z.number().positive().nullable(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.providerProfile.findUnique({
        where: { id: input.providerId },
      });
      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Provider not found',
        });
      }

      await ctx.db.$transaction(
        input.services.map((item) =>
          ctx.db.providerService.upsert({
            where: {
              providerId_serviceId: {
                providerId: input.providerId,
                serviceId: item.serviceId,
              },
            },
            update: { customPrice: item.customPrice ?? null },
            create: {
              providerId: input.providerId,
              serviceId: item.serviceId,
              customPrice: item.customPrice ?? null,
            },
          }),
        ),
      );

      return ctx.db.providerService.findMany({
        where: { providerId: input.providerId },
        include: { service: { include: { category: true } } },
      });
    }),

  getSupplyCoverage: adminProcedure.query(async ({ ctx }) => {
    const { HOUSTON_ZIP_GROUPS } = await import('@repo/validators');
    const { hasContractedRates, providerServesZip } = await import(
      '../lib/rate-cards'
    );

    const [providers, plans, subscriptions] = await Promise.all([
      ctx.db.providerProfile.findMany({
        include: {
          services: { include: { service: true } },
          user: { select: { email: true } },
        },
        orderBy: { businessName: 'asc' },
      }),
      ctx.db.subscriptionPlan.findMany({
        where: { active: true },
        include: { services: true },
      }),
      ctx.db.customerSubscription.findMany({
        where: { status: { in: ['ACTIVE', 'PAUSED'] } },
        select: { assignedProviderId: true },
      }),
    ]);

    const clusters = HOUSTON_ZIP_GROUPS.map((group) => {
      const zips = group.zips.map((item) => item.zip);
      const covering = providers.filter((provider) =>
        zips.some((zip) => providerServesZip(provider.serviceAreaZips, zip)),
      );
      const verifiedPayoutReady = covering.filter(
        (provider) => provider.verified && provider.stripeTransfersEnabled,
      );
      const withRateCards = covering.filter((provider) =>
        plans.some((plan) =>
          hasContractedRates(
            provider.services,
            plan.services.map((s) => s.serviceId),
          ),
        ),
      );
      return {
        id: group.id,
        name: group.name,
        zipCount: zips.length,
        providerCount: covering.length,
        verifiedPayoutReady: verifiedPayoutReady.length,
        rateCardReady: withRateCards.length,
      };
    });

    return {
      targetProviders: 15,
      verifiedProviders: providers.filter((p) => p.verified).length,
      payoutReady: providers.filter(
        (p) => p.verified && p.stripeTransfersEnabled,
      ).length,
      assignedSubscriptions: subscriptions.filter((s) => s.assignedProviderId)
        .length,
      unassignedSubscriptions: subscriptions.filter((s) => !s.assignedProviderId)
        .length,
      clusters,
      providers: providers.map((provider) => ({
        id: provider.id,
        userId: provider.userId,
        businessName: provider.businessName,
        email: provider.email || provider.user.email,
        verified: provider.verified,
        stripeTransfersEnabled: provider.stripeTransfersEnabled,
        zipCount: provider.serviceAreaZips
          ? provider.serviceAreaZips.split(',').filter(Boolean).length
          : 0,
        rateCards: plans.map((plan) => ({
          planId: plan.id,
          planName: plan.name,
          signed: hasContractedRates(
            provider.services,
            plan.services.map((s) => s.serviceId),
          ),
        })),
      })),
    };
  }),
});
