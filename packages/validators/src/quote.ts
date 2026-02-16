import { z } from "zod";

export const requestQuoteInput = z.object({
  propertyId: z.string().cuid(),
  serviceId: z.string().cuid(),
  providerId: z.string().cuid(),
  customerNotes: z.string().max(2000).optional(),
});

export const respondToQuoteInput = z.object({
  quoteId: z.string().cuid(),
  customPrice: z.number().positive("Price must be positive"),
  notes: z.string().max(2000).optional(),
});

export const updateQuoteStatusInput = z.object({
  quoteId: z.string().cuid(),
  status: z.enum(["ACCEPTED", "DECLINED"]),
});

export type RequestQuoteInput = z.infer<typeof requestQuoteInput>;
export type RespondToQuoteInput = z.infer<typeof respondToQuoteInput>;
export type UpdateQuoteStatusInput = z.infer<typeof updateQuoteStatusInput>;
