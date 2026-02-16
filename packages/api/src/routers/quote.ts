import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, customerProcedure, providerProcedure } from "../trpc";
import { requestQuoteInput, respondToQuoteInput, updateQuoteStatusInput } from "@repo/validators";
import { notifyNewQuoteRequest, notifyQuoteReceived, notifyQuoteAccepted } from "../lib/notifications";

export const quoteRouter = router({
  /** Customer: request a quote from a provider */
  request: customerProcedure
    .input(requestQuoteInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.customerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      // Verify the property belongs to this customer
      const property = await ctx.db.property.findUnique({
        where: { id: input.propertyId },
      });

      if (!property || property.customerId !== profile.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });
      }

      const quote = await ctx.db.quote.create({
        data: {
          propertyId: input.propertyId,
          serviceId: input.serviceId,
          providerId: input.providerId,
          customerNotes: input.customerNotes,
          status: "PENDING",
        },
        include: {
          property: true,
          service: { include: { category: true } },
          provider: { include: { user: true } },
        },
      });

      // Notify provider of new quote request
      notifyNewQuoteRequest(
        quote.provider.userId,
        quote.service.name,
        `${quote.property.address}, ${quote.property.city}`
      ).catch(console.error);

      return quote;
    }),

  /** Customer: list their quotes */
  listForCustomer: customerProcedure
    .input(
      z.object({
        status: z.enum(["PENDING", "SENT", "ACCEPTED", "DECLINED", "EXPIRED"]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.customerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      const propertyIds = await ctx.db.property.findMany({
        where: { customerId: profile.id },
        select: { id: true },
      });

      return ctx.db.quote.findMany({
        where: {
          propertyId: { in: propertyIds.map((p) => p.id) },
          ...(input?.status ? { status: input.status } : {}),
        },
        include: {
          property: true,
          service: { include: { category: true } },
          provider: true,
          job: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  /** Customer: accept or decline a quote */
  updateStatus: customerProcedure
    .input(updateQuoteStatusInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.customerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      const quote = await ctx.db.quote.findUnique({
        where: { id: input.quoteId },
        include: { property: true },
      });

      if (!quote || quote.property.customerId !== profile.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Quote not found" });
      }

      if (quote.status !== "SENT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only accept or decline quotes that have been sent",
        });
      }

      const updated = await ctx.db.quote.update({
        where: { id: input.quoteId },
        data: { status: input.status },
        include: {
          property: true,
          service: { include: { category: true } },
          provider: true,
        },
      });

      // If accepted, create a pending job and notify provider
      if (input.status === "ACCEPTED") {
        await ctx.db.job.create({
          data: {
            quoteId: updated.id,
            status: "PENDING",
          },
        });

        notifyQuoteAccepted(
          updated.provider.userId,
          updated.service.name
        ).catch(console.error);
      }

      return updated;
    }),

  /** Provider: list quotes assigned to them */
  listForProvider: providerProcedure
    .input(
      z.object({
        status: z.enum(["PENDING", "SENT", "ACCEPTED", "DECLINED", "EXPIRED"]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.providerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      return ctx.db.quote.findMany({
        where: {
          providerId: profile.id,
          ...(input?.status ? { status: input.status } : {}),
        },
        include: {
          property: true,
          service: { include: { category: true } },
          job: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  /** Provider: respond to a quote with a custom price */
  respond: providerProcedure
    .input(respondToQuoteInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.providerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      const quote = await ctx.db.quote.findUnique({
        where: { id: input.quoteId },
      });

      if (!quote || quote.providerId !== profile.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Quote not found" });
      }

      if (quote.status !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only respond to pending quotes",
        });
      }

      const updated = await ctx.db.quote.update({
        where: { id: input.quoteId },
        data: {
          customPrice: input.customPrice,
          notes: input.notes,
          status: "SENT",
        },
        include: {
          property: { include: { customer: { include: { user: true } } } },
          service: { include: { category: true } },
        },
      });

      // Notify customer that a quote was received
      notifyQuoteReceived(
        updated.property.customer.userId,
        profile.businessName,
        updated.service.name
      ).catch(console.error);

      return updated;
    }),
});
