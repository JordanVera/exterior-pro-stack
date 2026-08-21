import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, customerProcedure, providerProcedure } from '../trpc';
import {
  submitBidInput,
  acceptBidInput,
  declineBidInput,
  withdrawBidInput,
} from '@repo/validators';
import { notifyBidReceived, notifyBidAccepted } from '../lib/notifications';
import { assertProviderPayoutReady } from '../lib/connect';
import { createJobCheckoutSession } from '../lib/payments';
import { toCents } from '../lib/stripe';
import { getProviderRatingStats, withRating } from '../lib/reviews';

export const bidRouter = router({
  submit: providerProcedure
    .input(submitBidInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.providerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        });
      }

      await assertProviderPayoutReady(profile.id);

      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId },
        include: {
          property: { include: { customer: { include: { user: true } } } },
          service: true,
        },
      });

      if (!job) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
      }

      if (job.status !== 'OPEN') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only bid on open jobs',
        });
      }

      const existingBid = await ctx.db.jobBid.findUnique({
        where: {
          jobId_providerId: { jobId: input.jobId, providerId: profile.id },
        },
      });

      if (existingBid) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'You have already submitted a bid for this job',
        });
      }

      const bid = await ctx.db.jobBid.create({
        data: {
          jobId: input.jobId,
          providerId: profile.id,
          price: input.price,
          notes: input.notes,
          status: 'PENDING',
        },
        include: {
          provider: true,
          job: { include: { service: true } },
        },
      });

      notifyBidReceived(
        job.property.customer.userId,
        profile.businessName,
        job.service.name,
      ).catch(console.error);

      return bid;
    }),

  listForJob: customerProcedure
    .input(z.object({ jobId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.customerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        });
      }

      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId },
        include: { property: true },
      });

      if (!job || job.property.customerId !== profile.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
      }

      const bids = await ctx.db.jobBid.findMany({
        where: { jobId: input.jobId },
        include: {
          provider: { include: { user: { select: { phone: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const stats = await getProviderRatingStats(
        ctx.db,
        bids.map((bid) => bid.providerId),
      );

      // Transform to match frontend expectations
      return bids.map((bid) => {
        const { user, ...provider } = bid.provider;
        return {
          id: bid.id,
          jobId: bid.jobId,
          providerId: bid.providerId,
          priceCents: Math.round(Number(bid.price) * 100),
          notes: bid.notes,
          status: bid.status,
          createdAt: bid.createdAt,
          updatedAt: bid.updatedAt,
          provider: {
            ...withRating(provider, stats),
            phone: user.phone,
          },
        };
      });
    }),

  /**
   * Customer: accept a bid.
   * One-time jobs redirect to Stripe Checkout; subscription jobs (already billed) accept immediately.
   */
  accept: customerProcedure
    .input(acceptBidInput)
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

      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId },
        include: {
          property: true,
          service: true,
        },
      });

      if (!job || job.property.customerId !== profile.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
      }

      if (job.status !== 'OPEN') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only accept bids on open jobs',
        });
      }

      const bid = await ctx.db.jobBid.findUnique({
        where: { id: input.bidId },
        include: { provider: { include: { user: true } } },
      });

      if (!bid || bid.jobId !== input.jobId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Bid not found' });
      }

      if (!bid.provider.stripeTransfersEnabled) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'This provider has not finished payout setup yet.',
        });
      }

      if (job.type === 'SUBSCRIPTION') {
        await ctx.db.$transaction([
          ctx.db.jobBid.update({
            where: { id: input.bidId },
            data: { status: 'ACCEPTED' },
          }),
          ctx.db.jobBid.updateMany({
            where: { jobId: input.jobId, id: { not: input.bidId } },
            data: { status: 'DECLINED' },
          }),
          ctx.db.job.update({
            where: { id: input.jobId },
            data: { acceptedBidId: input.bidId, status: 'PENDING' },
          }),
        ]);

        notifyBidAccepted(bid.provider.userId, job.service.name).catch(
          console.error,
        );

        return {
          checkoutUrl: null as string | null,
          jobId: job.id,
        };
      }

      const checkout = await createJobCheckoutSession({
        customerId: profile.id,
        jobId: job.id,
        bidId: bid.id,
        providerId: bid.providerId,
        amountCents: toCents(bid.price),
        description: `${job.service.name} — ${job.property.address}`,
        email: profile.email,
        name: `${profile.firstName} ${profile.lastName}`,
        phone: profile.user.phone,
        stripeCustomerId: profile.stripeCustomerId,
      });

      return { checkoutUrl: checkout.checkoutUrl, jobId: job.id };
    }),

  decline: customerProcedure
    .input(declineBidInput)
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

      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId },
        include: { property: true },
      });

      if (!job || job.property.customerId !== profile.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
      }

      const bid = await ctx.db.jobBid.findUnique({
        where: { id: input.bidId },
      });

      if (!bid || bid.jobId !== input.jobId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Bid not found' });
      }

      return ctx.db.jobBid.update({
        where: { id: input.bidId },
        data: { status: 'DECLINED' },
        include: { provider: true },
      });
    }),

  withdraw: providerProcedure
    .input(withdrawBidInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.providerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        });
      }

      const bid = await ctx.db.jobBid.findUnique({
        where: { id: input.bidId },
      });

      if (!bid || bid.providerId !== profile.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Bid not found' });
      }

      if (bid.status !== 'PENDING') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only withdraw pending bids',
        });
      }

      return ctx.db.jobBid.update({
        where: { id: input.bidId },
        data: { status: 'WITHDRAWN' },
      });
    }),
});
