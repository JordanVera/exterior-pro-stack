import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, providerProcedure } from "../trpc";
import { updateProviderProfileInput, setProviderServicesInput } from "@repo/validators";

export const providerRouter = router({
  /** Public: list verified providers, optionally by service */
  list: publicProcedure
    .input(
      z.object({
        serviceId: z.string().cuid().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.providerProfile.findMany({
        where: {
          verified: true,
          ...(input?.search
            ? {
                businessName: { contains: input.search },
              }
            : {}),
          ...(input?.serviceId
            ? {
                services: { some: { serviceId: input.serviceId } },
              }
            : {}),
        },
        include: {
          services: { include: { service: { include: { category: true } } } },
        },
        orderBy: { businessName: "asc" },
      });
    }),

  /** Public: get a provider by ID */
  getById: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.providerProfile.findUnique({
        where: { id: input.id },
        include: {
          services: { include: { service: { include: { category: true } } } },
        },
      });
    }),

  /** Provider: get own profile */
  getProfile: providerProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.providerProfile.findUnique({
      where: { userId: ctx.user.userId },
      include: {
        services: { include: { service: { include: { category: true } } } },
        crews: { include: { members: true } },
      },
    });

    if (!profile) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    }

    return profile;
  }),

  /** Provider: update own profile */
  updateProfile: providerProcedure
    .input(updateProviderProfileInput)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.providerProfile.update({
        where: { userId: ctx.user.userId },
        data: input,
      });
    }),

  /** Provider: set which services they offer (with optional custom prices) */
  setServices: providerProcedure
    .input(setProviderServicesInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.providerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      // Delete existing and recreate
      await ctx.db.providerService.deleteMany({
        where: { providerId: profile.id },
      });

      await ctx.db.providerService.createMany({
        data: input.services.map((s) => ({
          providerId: profile.id,
          serviceId: s.serviceId,
          customPrice: s.customPrice,
        })),
      });

      return ctx.db.providerService.findMany({
        where: { providerId: profile.id },
        include: { service: { include: { category: true } } },
      });
    }),

  /** Provider: dashboard stats */
  getDashboardStats: providerProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.providerProfile.findUnique({
      where: { userId: ctx.user.userId },
    });

    if (!profile) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    }

    const [pendingQuotes, activeJobs, completedJobs, totalCrews] =
      await Promise.all([
        ctx.db.quote.count({
          where: { providerId: profile.id, status: "PENDING" },
        }),
        ctx.db.job.count({
          where: {
            quote: { providerId: profile.id },
            status: { in: ["SCHEDULED", "IN_PROGRESS"] },
          },
        }),
        ctx.db.job.count({
          where: {
            quote: { providerId: profile.id },
            status: "COMPLETED",
          },
        }),
        ctx.db.crew.count({
          where: { providerId: profile.id },
        }),
      ]);

    return { pendingQuotes, activeJobs, completedJobs, totalCrews };
  }),
});
