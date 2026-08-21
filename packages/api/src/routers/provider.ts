import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, providerProcedure } from "../trpc";
import { updateProviderProfileInput, setProviderServicesInput } from "@repo/validators";
import {
  EMPTY_RATING,
  getProviderRatingStats,
  listProviderReviews,
  withRating,
} from "../lib/reviews";

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
      const providers = await ctx.db.providerProfile.findMany({
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

      const stats = await getProviderRatingStats(
        ctx.db,
        providers.map((provider) => provider.id),
      );

      return providers.map((provider) => withRating(provider, stats));
    }),

  /** Public: get a provider by ID */
  getById: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.providerProfile.findUnique({
        where: { id: input.id },
        include: {
          services: { include: { service: { include: { category: true } } } },
        },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Provider not found" });
      }

      const [stats, reviews] = await Promise.all([
        getProviderRatingStats(ctx.db, [profile.id]),
        listProviderReviews(ctx.db, profile.id),
      ]);

      return {
        ...withRating(profile, stats),
        reviews,
      };
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

    const [stats, reviews] = await Promise.all([
      getProviderRatingStats(ctx.db, [profile.id]),
      listProviderReviews(ctx.db, profile.id),
    ]);

    return {
      ...withRating(profile, stats),
      reviews,
    };
  }),

  /** Provider: update own profile */
  updateProfile: providerProcedure
    .input(updateProviderProfileInput)
    .mutation(async ({ ctx, input }) => {
      const data = {
        ...input,
        email: input.email === "" ? null : input.email,
        serviceAreaZips:
          input.serviceAreaZips === undefined
            ? undefined
            : input.serviceAreaZips || null,
      };
      return ctx.db.providerProfile.update({
        where: { userId: ctx.user.userId },
        data,
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

    const [pendingBids, activeJobs, completedJobs, totalCrews, stats] =
      await Promise.all([
        ctx.db.jobBid.count({
          where: { providerId: profile.id, status: "PENDING" },
        }),
        ctx.db.job.count({
          where: {
            acceptedBid: { providerId: profile.id },
            status: { in: ["SCHEDULED", "IN_PROGRESS"] },
          },
        }),
        ctx.db.job.count({
          where: {
            acceptedBid: { providerId: profile.id },
            status: "COMPLETED",
          },
        }),
        ctx.db.crew.count({
          where: { providerId: profile.id },
        }),
        getProviderRatingStats(ctx.db, [profile.id]),
      ]);

    return {
      pendingBids,
      activeJobs,
      completedJobs,
      totalCrews,
      rating: stats.get(profile.id) ?? EMPTY_RATING,
    };
  }),
});
