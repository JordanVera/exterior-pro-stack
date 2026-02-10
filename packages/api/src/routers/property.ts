import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, customerProcedure } from "../trpc";
import { createPropertyInput, updatePropertyInput } from "@repo/validators";

export const propertyRouter = router({
  /** List all properties for the current customer */
  list: customerProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.customerProfile.findUnique({
      where: { userId: ctx.user.userId },
    });

    if (!profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Customer profile not found. Complete onboarding first.",
      });
    }

    return ctx.db.property.findMany({
      where: { customerId: profile.id },
      orderBy: { createdAt: "desc" },
    });
  }),

  /** Get a single property by ID */
  getById: customerProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.customerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      const property = await ctx.db.property.findUnique({
        where: { id: input.id },
      });

      if (!property || property.customerId !== profile.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });
      }

      return property;
    }),

  /** Create a new property */
  create: customerProcedure
    .input(createPropertyInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.customerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer profile not found. Complete onboarding first.",
        });
      }

      return ctx.db.property.create({
        data: {
          ...input,
          customerId: profile.id,
        },
      });
    }),

  /** Update a property */
  update: customerProcedure
    .input(updatePropertyInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.customerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      const property = await ctx.db.property.findUnique({
        where: { id: input.id },
      });

      if (!property || property.customerId !== profile.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });
      }

      const { id, ...data } = input;
      return ctx.db.property.update({ where: { id }, data });
    }),

  /** Delete a property */
  delete: customerProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.customerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      const property = await ctx.db.property.findUnique({
        where: { id: input.id },
      });

      if (!property || property.customerId !== profile.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });
      }

      await ctx.db.property.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
