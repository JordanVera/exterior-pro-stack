import { z } from "zod";

export const createPropertyInput = z.object({
  address: z.string().min(1, "Address is required").max(500),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(2, "State is required").max(2),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
  notes: z.string().max(2000).optional(),
});

export const updatePropertyInput = z.object({
  id: z.string().cuid(),
  address: z.string().min(1).max(500).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(2).max(2).optional(),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/).optional(),
  notes: z.string().max(2000).optional(),
});

export type CreatePropertyInput = z.infer<typeof createPropertyInput>;
export type UpdatePropertyInput = z.infer<typeof updatePropertyInput>;
