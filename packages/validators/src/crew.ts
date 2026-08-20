import { z } from "zod";
import { emailSchema, phoneSchema } from "./auth";

export const createCrewInput = z.object({
  name: z.string().min(1, "Crew name is required").max(100),
});

export const updateCrewInput = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(100),
});

export const addCrewMemberInput = z.object({
  crewId: z.string().cuid(),
  name: z.string().min(1, "Name is required").max(100),
  email: emailSchema,
  phone: phoneSchema.optional(),
  role: z.string().max(50).optional(),
});

export const updateCrewMemberInput = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(100).optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional().nullable(),
  role: z.string().max(50).optional(),
});

export type CreateCrewInput = z.infer<typeof createCrewInput>;
export type UpdateCrewInput = z.infer<typeof updateCrewInput>;
export type AddCrewMemberInput = z.infer<typeof addCrewMemberInput>;
export type UpdateCrewMemberInput = z.infer<typeof updateCrewMemberInput>;
