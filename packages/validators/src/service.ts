import { z } from "zod";

export const createServiceCategoryInput = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(2000).optional(),
  icon: z.string().max(100).optional(),
});

export const updateServiceCategoryInput = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(2000).optional(),
  icon: z.string().max(100).optional(),
});

export const createServiceInput = z.object({
  categoryId: z.string().cuid(),
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).optional(),
  basePrice: z.number().positive("Price must be positive"),
  unit: z.enum(["SQFT", "HOUR", "FLAT"]).default("FLAT"),
});

export const updateServiceInput = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  basePrice: z.number().positive().optional(),
  unit: z.enum(["SQFT", "HOUR", "FLAT"]).optional(),
  active: z.boolean().optional(),
});

export type CreateServiceCategoryInput = z.infer<typeof createServiceCategoryInput>;
export type UpdateServiceCategoryInput = z.infer<typeof updateServiceCategoryInput>;
export type CreateServiceInput = z.infer<typeof createServiceInput>;
export type UpdateServiceInput = z.infer<typeof updateServiceInput>;
