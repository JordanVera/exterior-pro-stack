import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, adminProcedure } from '../trpc';
import {
  createServiceCategoryInput,
  updateServiceCategoryInput,
  createServiceInput,
  updateServiceInput,
  deleteByIdInput,
} from '@repo/validators';

function blankToNull<T extends Record<string, unknown>>(data: T): T {
  const next = { ...data };
  for (const key of Object.keys(next) as (keyof T)[]) {
    if (next[key] === '') {
      (next as Record<string, unknown>)[key as string] = null;
    }
  }
  return next;
}

export const serviceRouter = router({
  /** List all service categories with their services */
  listCategories: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.serviceCategory.findMany({
      include: {
        services: {
          where: { active: true },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
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
            orderBy: { name: 'asc' },
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
      z
        .object({
          categoryId: z.string().cuid().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.service.findMany({
        where: {
          active: true,
          ...(input?.categoryId ? { categoryId: input.categoryId } : {}),
        },
        include: { category: true },
        orderBy: { name: 'asc' },
      });
    }),

  // ─── Admin operations ──────────────────────────────────────────────────

  /** Admin: list categories including inactive services */
  listCategoriesAdmin: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.serviceCategory.findMany({
      include: {
        services: { orderBy: { name: 'asc' } },
        _count: { select: { services: true } },
      },
      orderBy: { name: 'asc' },
    });
  }),

  /** Admin: create a service category */
  createCategory: adminProcedure
    .input(createServiceCategoryInput)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.serviceCategory.create({ data: blankToNull(input) });
    }),

  /** Admin: update a service category */
  updateCategory: adminProcedure
    .input(updateServiceCategoryInput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.serviceCategory.update({
        where: { id },
        data: blankToNull(data),
      });
    }),

  /** Admin: delete a category that has no services */
  deleteCategory: adminProcedure
    .input(deleteByIdInput)
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.db.serviceCategory.findUnique({
        where: { id: input.id },
        include: { _count: { select: { services: true } } },
      });

      if (!category) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found',
        });
      }

      if (category._count.services > 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message:
            'Cannot delete a category that still has services. Move or delete them first.',
        });
      }

      return ctx.db.serviceCategory.delete({ where: { id: input.id } });
    }),

  /** Admin: create a service */
  createService: adminProcedure
    .input(createServiceInput)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.service.create({ data: blankToNull(input) });
    }),

  /** Admin: update a service */
  updateService: adminProcedure
    .input(updateServiceInput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.service.update({
        where: { id },
        data: blankToNull(data),
      });
    }),

  /** Admin: hard-delete a service that is not in use */
  deleteService: adminProcedure
    .input(deleteByIdInput)
    .mutation(async ({ ctx, input }) => {
      const service = await ctx.db.service.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              jobs: true,
              planServices: true,
              providerServices: true,
            },
          },
        },
      });

      if (!service) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Service not found',
        });
      }

      const reasons: string[] = [];
      if (service._count.jobs > 0)
        reasons.push(`${service._count.jobs} job(s)`);
      if (service._count.planServices > 0) {
        reasons.push(`${service._count.planServices} plan(s)`);
      }
      if (service._count.providerServices > 0) {
        reasons.push(`${service._count.providerServices} provider listing(s)`);
      }

      if (reasons.length > 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `Cannot delete this service because it is used by ${reasons.join(', ')}. Deactivate it instead.`,
        });
      }

      return ctx.db.service.delete({ where: { id: input.id } });
    }),
});
