import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, customerProcedure, providerProcedure } from "../trpc";
import { submitBidInput, acceptBidInput, declineBidInput, withdrawBidInput } from "@repo/validators";
import { notifyBidReceived, notifyBidAccepted } from "../lib/notifications";

export const bidRouter = router({
  /** Provider: submit a bid on an open job */
  submit: providerProcedure
    .input(submitBidInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.providerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId },
        include: {
          property: { include: { customer: { include: { user: true } } } },
          service: true,
        },
      });

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      if (job.status !== "OPEN") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only bid on open jobs",
        });
      }

      // Check provider hasn't already bid
      const existingBid = await ctx.db.jobBid.findUnique({
        where: { jobId_providerId: { jobId: input.jobId, providerId: profile.id } },
      });

      if (existingBid) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already submitted a bid for this job",
        });
      }

      const bid = await ctx.db.jobBid.create({
        data: {
          jobId: input.jobId,
          providerId: profile.id,
          price: input.price,
          notes: input.notes,
          status: "PENDING",
        },
        include: {
          provider: true,
          job: { include: { service: true } },
        },
      });

      // Notify customer of new bid
      notifyBidReceived(
        job.property.customer.userId,
        profile.businessName,
        job.service.name
      ).catch(console.error);

      return bid;
    }),

  /** Customer: list bids for a specific job */
  listForJob: customerProcedure
    .input(z.object({ jobId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.customerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      // Verify the job belongs to this customer (via property)
      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId },
        include: { property: true },
      });

      if (!job || job.property.customerId !== profile.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      return ctx.db.jobBid.findMany({
        where: { jobId: input.jobId },
        include: {
          provider: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  /** Customer: accept a bid */
  accept: customerProcedure
    .input(acceptBidInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.customerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId },
        include: { property: true },
      });

      if (!job || job.property.customerId !== profile.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      if (job.status !== "OPEN") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only accept bids on open jobs",
        });
      }

      const bid = await ctx.db.jobBid.findUnique({
        where: { id: input.bidId },
        include: { provider: { include: { user: true } } },
      });

      if (!bid || bid.jobId !== input.jobId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Bid not found" });
      }

      // Accept this bid and decline all others
      await ctx.db.$transaction([
        ctx.db.jobBid.update({
          where: { id: input.bidId },
          data: { status: "ACCEPTED" },
        }),
        ctx.db.jobBid.updateMany({
          where: { jobId: input.jobId, id: { not: input.bidId } },
          data: { status: "DECLINED" },
        }),
        ctx.db.job.update({
          where: { id: input.jobId },
          data: {
            acceptedBidId: input.bidId,
            status: "PENDING",
          },
        }),
      ]);

      // Notify the winning provider
      notifyBidAccepted(
        bid.provider.userId,
        job.service?.name || "Service"
      ).catch(console.error);

      return ctx.db.job.findUnique({
        where: { id: input.jobId },
        include: {
          property: true,
          service: { include: { category: true } },
          acceptedBid: { include: { provider: true } },
          bids: { include: { provider: true } },
        },
      });
    }),

  /** Customer: decline a bid */
  decline: customerProcedure
    .input(declineBidInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.customerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId },
        include: { property: true },
      });

      if (!job || job.property.customerId !== profile.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      const bid = await ctx.db.jobBid.findUnique({
        where: { id: input.bidId },
      });

      if (!bid || bid.jobId !== input.jobId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Bid not found" });
      }

      return ctx.db.jobBid.update({
        where: { id: input.bidId },
        data: { status: "DECLINED" },
        include: { provider: true },
      });
    }),

  /** Provider: withdraw their bid */
  withdraw: providerProcedure
    .input(withdrawBidInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.providerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      const bid = await ctx.db.jobBid.findUnique({
        where: { id: input.bidId },
      });

      if (!bid || bid.providerId !== profile.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Bid not found" });
      }

      if (bid.status !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only withdraw pending bids",
        });
      }

      return ctx.db.jobBid.update({
        where: { id: input.bidId },
        data: { status: "WITHDRAWN" },
      });
    }),
});
