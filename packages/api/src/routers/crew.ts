import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, providerProcedure } from "../trpc";
import { createCrewInput, updateCrewInput, addCrewMemberInput, updateCrewMemberInput } from "@repo/validators";

export const crewRouter = router({
  /** List all crews for the current provider */
  list: providerProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.providerProfile.findUnique({
      where: { userId: ctx.user.userId },
    });

    if (!profile) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    }

    return ctx.db.crew.findMany({
      where: { providerId: profile.id },
      include: { members: true },
      orderBy: { name: "asc" },
    });
  }),

  /** Create a new crew */
  create: providerProcedure
    .input(createCrewInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.providerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      return ctx.db.crew.create({
        data: {
          name: input.name,
          providerId: profile.id,
        },
        include: { members: true },
      });
    }),

  /** Update a crew name */
  update: providerProcedure
    .input(updateCrewInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.providerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      const crew = await ctx.db.crew.findUnique({ where: { id: input.id } });
      if (!crew || crew.providerId !== profile.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Crew not found" });
      }

      return ctx.db.crew.update({
        where: { id: input.id },
        data: { name: input.name },
        include: { members: true },
      });
    }),

  /** Delete a crew */
  delete: providerProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.providerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      const crew = await ctx.db.crew.findUnique({ where: { id: input.id } });
      if (!crew || crew.providerId !== profile.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Crew not found" });
      }

      await ctx.db.crew.delete({ where: { id: input.id } });
      return { success: true };
    }),

  /** Add a member to a crew */
  addMember: providerProcedure
    .input(addCrewMemberInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.providerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      const crew = await ctx.db.crew.findUnique({ where: { id: input.crewId } });
      if (!crew || crew.providerId !== profile.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Crew not found" });
      }

      return ctx.db.crewMember.create({
        data: {
          crewId: input.crewId,
          name: input.name,
          phone: input.phone,
          role: input.role,
        },
      });
    }),

  /** Update a crew member */
  updateMember: providerProcedure
    .input(updateCrewMemberInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.providerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      const member = await ctx.db.crewMember.findUnique({
        where: { id: input.id },
        include: { crew: true },
      });

      if (!member || member.crew.providerId !== profile.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Member not found" });
      }

      const { id, ...data } = input;
      return ctx.db.crewMember.update({ where: { id }, data });
    }),

  /** Remove a crew member */
  removeMember: providerProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.providerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      const member = await ctx.db.crewMember.findUnique({
        where: { id: input.id },
        include: { crew: true },
      });

      if (!member || member.crew.providerId !== profile.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Member not found" });
      }

      await ctx.db.crewMember.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
