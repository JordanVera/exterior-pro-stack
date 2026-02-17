import { z } from "zod";

export const createSubscriptionInput = z.object({
  planId: z.string().cuid(),
  propertyId: z.string().cuid(),
  billingFrequency: z.enum(["MONTHLY", "QUARTERLY", "ANNUALLY"]),
});

export const cancelSubscriptionInput = z.object({
  subscriptionId: z.string().cuid(),
});

export const pauseSubscriptionInput = z.object({
  subscriptionId: z.string().cuid(),
});

export const resumeSubscriptionInput = z.object({
  subscriptionId: z.string().cuid(),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionInput>;
export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionInput>;
export type PauseSubscriptionInput = z.infer<typeof pauseSubscriptionInput>;
export type ResumeSubscriptionInput = z.infer<typeof resumeSubscriptionInput>;
