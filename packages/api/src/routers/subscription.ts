import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, customerProcedure } from '../trpc';
import {
  createSubscriptionInput,
  cancelSubscriptionInput,
  pauseSubscriptionInput,
  resumeSubscriptionInput,
} from '@repo/validators';
import {
  createBillingPortalSession,
  createPlanCheckoutSession,
} from '../lib/payments';
import { requireStripe } from '../lib/stripe';

function asStripeError(err: unknown): never {
  const message = err instanceof Error ? err.message : 'Payments unavailable';
  throw new TRPCError({
    code: message.includes('STRIPE_SECRET_KEY')
      ? 'PRECONDITION_FAILED'
      : 'BAD_REQUEST',
    message,
  });
}

export const subscriptionRouter = router({
  listPlans: publicProcedure.query(async ({ ctx }) => {
    const plans = await ctx.db.subscriptionPlan.findMany({
      where: { active: true },
      include: {
        services: {
          include: {
            service: { include: { category: true } },
          },
        },
      },
      orderBy: { monthlyPrice: 'asc' },
    });

    // Transform to match frontend expectations
    return plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      monthlyPriceCents: Math.round(Number(plan.monthlyPrice) * 100),
      quarterlyPriceCents: plan.quarterlyPrice
        ? Math.round(Number(plan.quarterlyPrice) * 100)
        : 0,
      annualPriceCents: plan.annualPrice
        ? Math.round(Number(plan.annualPrice) * 100)
        : 0,
      active: plan.active,
      stripeProductId: plan.stripeProductId,
      stripePriceIdMonthly: plan.stripePriceIdMonthly,
      stripePriceIdQuarterly: plan.stripePriceIdQuarterly,
      stripePriceIdAnnually: plan.stripePriceIdAnnually,
      services: plan.services.map((ps) => ({
        id: ps.id,
        frequency: ps.frequency,
        service: {
          id: ps.service.id,
          name: ps.service.name,
          categoryId: ps.service.categoryId,
          category: ps.service.category,
        },
      })),
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    }));
  }),

  getPlan: publicProcedure
    .input(z.object({ planId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const plan = await ctx.db.subscriptionPlan.findUnique({
        where: { id: input.planId },
        include: {
          services: {
            include: {
              service: { include: { category: true } },
            },
          },
        },
      });

      if (!plan) return null;

      // Transform to match frontend expectations
      return {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        monthlyPriceCents: Math.round(Number(plan.monthlyPrice) * 100),
        quarterlyPriceCents: plan.quarterlyPrice
          ? Math.round(Number(plan.quarterlyPrice) * 100)
          : 0,
        annualPriceCents: plan.annualPrice
          ? Math.round(Number(plan.annualPrice) * 100)
          : 0,
        active: plan.active,
        stripeProductId: plan.stripeProductId,
        stripePriceIdMonthly: plan.stripePriceIdMonthly,
        stripePriceIdQuarterly: plan.stripePriceIdQuarterly,
        stripePriceIdAnnually: plan.stripePriceIdAnnually,
        services: plan.services.map((ps) => ({
          id: ps.id,
          frequency: ps.frequency,
          service: {
            id: ps.service.id,
            name: ps.service.name,
            categoryId: ps.service.categoryId,
            category: ps.service.category,
          },
        })),
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      };
    }),

  /** Customer: start Stripe Checkout for a plan (does not create a DB subscription). */
  subscribe: customerProcedure
    .input(createSubscriptionInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.customerProfile.findUnique({
        where: { userId: ctx.user.userId },
        include: { user: true },
      });

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        });
      }

      const property = await ctx.db.property.findUnique({
        where: { id: input.propertyId },
      });

      if (!property || property.customerId !== profile.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Property not found',
        });
      }

      const plan = await ctx.db.subscriptionPlan.findUnique({
        where: { id: input.planId },
      });

      if (!plan || !plan.active) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Plan not found' });
      }

      const existing = await ctx.db.customerSubscription.findFirst({
        where: {
          customerId: profile.id,
          propertyId: input.propertyId,
          status: { in: ['ACTIVE', 'PAUSED'] },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Property already has an active subscription',
        });
      }

      try {
        return await createPlanCheckoutSession({
          customerId: profile.id,
          planId: input.planId,
          propertyId: input.propertyId,
          billingFrequency: input.billingFrequency,
          email: profile.email,
          name: `${profile.firstName} ${profile.lastName}`,
          phone: profile.user.phone,
          stripeCustomerId: profile.stripeCustomerId,
        });
      } catch (err) {
        asStripeError(err);
      }
    }),

  createBillingPortalSession: customerProcedure.mutation(async ({ ctx }) => {
    const profile = await ctx.db.customerProfile.findUnique({
      where: { userId: ctx.user.userId },
    });
    if (!profile?.stripeCustomerId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'No billing account yet. Subscribe to a plan first.',
      });
    }
    try {
      return await createBillingPortalSession(profile.stripeCustomerId);
    } catch (err) {
      asStripeError(err);
    }
  }),

  listForCustomer: customerProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.customerProfile.findUnique({
      where: { userId: ctx.user.userId },
    });

    if (!profile) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' });
    }

    return ctx.db.customerSubscription.findMany({
      where: { customerId: profile.id },
      include: {
        plan: { include: { services: { include: { service: true } } } },
        property: true,
        provider: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }),

  cancel: customerProcedure
    .input(cancelSubscriptionInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.customerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        });
      }

      const subscription = await ctx.db.customerSubscription.findUnique({
        where: { id: input.subscriptionId },
      });

      if (!subscription || subscription.customerId !== profile.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Subscription not found',
        });
      }

      if (subscription.status === 'CANCELLED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Subscription is already cancelled',
        });
      }

      if (subscription.stripeSubscriptionId) {
        try {
          await requireStripe().subscriptions.cancel(
            subscription.stripeSubscriptionId,
          );
        } catch (err) {
          asStripeError(err);
        }
      }

      return ctx.db.customerSubscription.update({
        where: { id: input.subscriptionId },
        data: { status: 'CANCELLED' },
        include: { plan: true, property: true },
      });
    }),

  pause: customerProcedure
    .input(pauseSubscriptionInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.customerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        });
      }

      const subscription = await ctx.db.customerSubscription.findUnique({
        where: { id: input.subscriptionId },
      });

      if (!subscription || subscription.customerId !== profile.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Subscription not found',
        });
      }

      if (subscription.status !== 'ACTIVE') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only pause active subscriptions',
        });
      }

      if (subscription.stripeSubscriptionId) {
        try {
          await requireStripe().subscriptions.update(
            subscription.stripeSubscriptionId,
            {
              pause_collection: { behavior: 'void' },
            },
          );
        } catch (err) {
          asStripeError(err);
        }
      }

      return ctx.db.customerSubscription.update({
        where: { id: input.subscriptionId },
        data: { status: 'PAUSED' },
        include: { plan: true, property: true },
      });
    }),

  resume: customerProcedure
    .input(resumeSubscriptionInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.customerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        });
      }

      const subscription = await ctx.db.customerSubscription.findUnique({
        where: { id: input.subscriptionId },
      });

      if (!subscription || subscription.customerId !== profile.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Subscription not found',
        });
      }

      if (subscription.status !== 'PAUSED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only resume paused subscriptions',
        });
      }

      if (subscription.stripeSubscriptionId) {
        try {
          await requireStripe().subscriptions.update(
            subscription.stripeSubscriptionId,
            {
              pause_collection: '',
            } as never,
          );
        } catch (err) {
          asStripeError(err);
        }
      }

      return ctx.db.customerSubscription.update({
        where: { id: input.subscriptionId },
        data: { status: 'ACTIVE' },
        include: { plan: true, property: true },
      });
    }),
});
