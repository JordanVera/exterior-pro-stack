import { z } from "zod";

export const listJobMessagesInput = z.object({
  jobId: z.string().cuid(),
});

export const sendJobMessageInput = z.object({
  jobId: z.string().cuid(),
  body: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(2000, "Message is too long"),
});

export const jobMessageUnreadInput = z.object({
  jobId: z.string().cuid(),
});

export type ListJobMessagesInput = z.infer<typeof listJobMessagesInput>;
export type SendJobMessageInput = z.infer<typeof sendJobMessageInput>;
export type JobMessageUnreadInput = z.infer<typeof jobMessageUnreadInput>;
