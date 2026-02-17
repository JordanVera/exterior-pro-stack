import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, customerProcedure } from "../trpc";
import {
  createSubscriptionInput,
  cancelSubscriptionInput,
  pauseSubscriptionInput,
  resumeSubscriptionInput,
} from "@repo/validators";
import { notifySubscriptionCreated } from "../lib/notifications";

export const subscriptionRouter = router({
  /** Public: list available subscription plans */
  listPlans: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.subscriptionPlan.findMany({
      where: { active: true },
      include: {
        services: {
          include: {
            service: { include: { category: true } },
          },
        },
      },
      orderBy: { monthlyPrice: "asc" },
    });
  }),

  /** Public: get a single plan by ID */
  getPlan: publicProcedure
    .input(z.object({ planId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.subscriptionPlan.findUnique({
        where: { id: input.planId },
        include: {
          services: {
            include: {
              service: { include: { category: true } },
            },
          },
        },
      });
    }),

  /** Customer: subscribe to a plan */
  subscribe: customerProcedure
    .input(createSubscriptionInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.customerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      // Verify property belongs to customer
      const property = await ctx.db.property.findUnique({
        where: { id: input.propertyId },
      });

      if (!property || property.customerId !== profile.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });
      }

      // Verify plan exists
      const plan = await ctx.db.subscriptionPlan.findUnique({
        where: { id: input.planId },
      });

      if (!plan || !plan.active) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Plan not found" });
      }

      // Check for existing active subscription on this property
      const existing = await ctx.db.customerSubscription.findFirst({
        where: {
          customerId: profile.id,
          propertyId: input.propertyId,
          status: { in: ["ACTIVE", "PAUSED"] },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Property already has an active subscription",
        });
      }

      const now = new Date();
      const periodEnd = new Date(now);

      switch (input.billingFrequency) {
        case "MONTHLY":
          periodEnd.setMonth(periodEnd.getMonth() + 1);
          break;
        case "QUARTERLY":
          periodEnd.setMonth(periodEnd.getMonth() + 3);
          break;
        case "ANNUALLY":
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
          break;
      }

      const subscription = await ctx.db.customerSubscription.create({
        data: {
          customerId: profile.id,
          planId: input.planId,
          propertyId: input.propertyId,
          status: "ACTIVE",
          billingFrequency: input.billingFrequency,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
        include: {
          plan: { include: { services: { include: { service: true } } } },
          property: true,
        },
      });

      // Notify customer
      notifySubscriptionCreated(
        ctx.user.userId,
        plan.name
      ).catch(console.error);

      return subscription;
    }),

  /** Customer: list their subscriptions */
  listForCustomer: customerProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.customerProfile.findUnique({
      where: { userId: ctx.user.userId },
    });

    if (!profile) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    }

    return ctx.db.customerSubscription.findMany({
      where: { customerId: profile.id },
      include: {
        plan: { include: { services: { include: { service: true } } } },
        property: true,
        provider: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  /** Customer: cancel a subscription */
  cancel: customerProcedure
    .input(cancelSubscriptionInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.customerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      const subscription = await ctx.db.customerSubscription.findUnique({
        where: { id: input.subscriptionId },
      });

      if (!subscription || subscription.customerId !== profile.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" });
      }

      if (subscription.status === "CANCELLED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Subscription is already cancelled",
        });
      }

      return ctx.db.customerSubscription.update({
        where: { id: input.subscriptionId },
        data: { status: "CANCELLED" },
        include: {
          plan: true,
          property: true,
        },
      });
    }),

  /** Customer: pause a subscription */
  pause: customerProcedure
    .input(pauseSubscriptionInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.customerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      const subscription = await ctx.db.customerSubscription.findUnique({
        where: { id: input.subscriptionId },
      });

      if (!subscription || subscription.customerId !== profile.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" });
      }

      if (subscription.status !== "ACTIVE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only pause active subscriptions",
        });
      }

      return ctx.db.customerSubscription.update({
        where: { id: input.subscriptionId },
        data: { status: "PAUSED" },
        include: {
          plan: true,
          property: true,
        },
      });
    }),

  /** Customer: resume a paused subscription */
  resume: customerProcedure
    .input(resumeSubscriptionInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.customerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      const subscription = await ctx.db.customerSubscription.findUnique({
        where: { id: input.subscriptionId },
      });

      if (!subscription || subscription.customerId !== profile.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" });
      }

      if (subscription.status !== "PAUSED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only resume paused subscriptions",
        });
      }

      return ctx.db.customerSubscription.update({
        where: { id: input.subscriptionId },
        data: { status: "ACTIVE" },
        include: {
          plan: true,
          property: true,
        },
      });
    }),
});
