import { z } from "zod";

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
  phone: z.string().max(20).optional(),
  role: z.string().max(50).optional(),
});

export const updateCrewMemberInput = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  role: z.string().max(50).optional(),
});

export type CreateCrewInput = z.infer<typeof createCrewInput>;
export type UpdateCrewInput = z.infer<typeof updateCrewInput>;
export type AddCrewMemberInput = z.infer<typeof addCrewMemberInput>;
export type UpdateCrewMemberInput = z.infer<typeof updateCrewMemberInput>;
