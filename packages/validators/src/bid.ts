import { z } from "zod";

export const submitBidInput = z.object({
  jobId: z.string().cuid(),
  price: z.number().positive("Price must be positive"),
  notes: z.string().max(2000).optional(),
});

export const acceptBidInput = z.object({
  bidId: z.string().cuid(),
  jobId: z.string().cuid(),
});

export const declineBidInput = z.object({
  bidId: z.string().cuid(),
  jobId: z.string().cuid(),
});

export const withdrawBidInput = z.object({
  bidId: z.string().cuid(),
});

export type SubmitBidInput = z.infer<typeof submitBidInput>;
export type AcceptBidInput = z.infer<typeof acceptBidInput>;
export type DeclineBidInput = z.infer<typeof declineBidInput>;
export type WithdrawBidInput = z.infer<typeof withdrawBidInput>;
