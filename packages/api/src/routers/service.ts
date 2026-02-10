import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../trpc";
import { createServiceCategoryInput, updateServiceCategoryInput, createServiceInput, updateServiceInput } from "@repo/validators";

export const serviceRouter = router({
  /** List all service categories with their services */
  listCategories: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.serviceCategory.findMany({
      include: {
        services: {
          where: { active: true },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });
  }),

  /** Get a single category by ID */
  getCategoryById: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.serviceCategory.findUnique({
        where: { id: input.id },
        include: {
          services: {
            where: { active: true },
            orderBy: { name: "asc" },
          },
        },
      });
    }),

  /** Get a single service by ID */
  getById: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.service.findUnique({
        where: { id: input.id },
        include: { category: true },
      });
    }),

  /** List all active services, optionally by category */
  list: publicProcedure
    .input(
      z.object({
        categoryId: z.string().cuid().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.service.findMany({
        where: {
          active: true,
          ...(input?.categoryId ? { categoryId: input.categoryId } : {}),
        },
        include: { category: true },
        orderBy: { name: "asc" },
      });
    }),

  // ─── Admin operations ──────────────────────────────────────────────────

  /** Admin: create a service category */
  createCategory: adminProcedure
    .input(createServiceCategoryInput)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.serviceCategory.create({ data: input });
    }),

  /** Admin: update a service category */
  updateCategory: adminProcedure
    .input(updateServiceCategoryInput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.serviceCategory.update({ where: { id }, data });
    }),

  /** Admin: create a service */
  createService: adminProcedure
    .input(createServiceInput)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.service.create({ data: input });
    }),

  /** Admin: update a service */
  updateService: adminProcedure
    .input(updateServiceInput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.service.update({ where: { id }, data });
    }),
});
