import { z } from "zod";

export const submitJobReviewInput = z.object({
  jobId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export type SubmitJobReviewInput = z.infer<typeof submitJobReviewInput>;
