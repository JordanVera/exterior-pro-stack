import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, adminProcedure } from "../trpc";

export const adminRouter = router({
  /** List all users with pagination */
  listUsers: adminProcedure
    .input(
      z.object({
        role: z.enum(["CUSTOMER", "PROVIDER", "ADMIN"]).optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().cuid().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const items = await ctx.db.user.findMany({
        where: {
          ...(input?.role ? { role: input.role } : {}),
          ...(input?.search ? { phone: { contains: input.search } } : {}),
        },
        include: { customerProfile: true, providerProfile: true },
        take: limit + 1,
        ...(input?.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: string | undefined;
      if (items.length > limit) {
        const nextItem = items.pop()!;
        nextCursor = nextItem.id;
      }

      return { items, nextCursor };
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
      verifiedProviders,
      totalJobs,
      activeJobs,
      completedJobs,
      totalQuotes,
      pendingQuotes,
    ] = await Promise.all([
      ctx.db.user.count(),
      ctx.db.user.count({ where: { role: "CUSTOMER" } }),
      ctx.db.user.count({ where: { role: "PROVIDER" } }),
      ctx.db.providerProfile.count({ where: { verified: true } }),
      ctx.db.job.count(),
      ctx.db.job.count({ where: { status: { in: ["SCHEDULED", "IN_PROGRESS"] } } }),
      ctx.db.job.count({ where: { status: "COMPLETED" } }),
      ctx.db.quote.count(),
      ctx.db.quote.count({ where: { status: "PENDING" } }),
    ]);

    return {
      totalUsers,
      totalCustomers,
      totalProviders,
      verifiedProviders,
      totalJobs,
      activeJobs,
      completedJobs,
      totalQuotes,
      pendingQuotes,
    };
  }),

  /** List all jobs with filtering */
  listJobs: adminProcedure
    .input(
      z.object({
        status: z.enum(["PENDING", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
        providerId: z.string().cuid().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().cuid().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const items = await ctx.db.job.findMany({
        where: {
          ...(input?.status ? { status: input.status } : {}),
          ...(input?.providerId
            ? { quote: { providerId: input.providerId } }
            : {}),
        },
        include: {
          quote: {
            include: {
              property: true,
              service: { include: { category: true } },
              provider: { include: { user: true } },
            },
          },
          assignments: { include: { crew: true } },
        },
        take: limit + 1,
        ...(input?.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: string | undefined;
      if (items.length > limit) {
        const nextItem = items.pop()!;
        nextCursor = nextItem.id;
      }

      return { items, nextCursor };
    }),
});
