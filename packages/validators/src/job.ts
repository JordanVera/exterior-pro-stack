import { z } from "zod";

export const scheduleJobInput = z.object({
  quoteId: z.string().cuid(),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM"),
});

export const assignCrewInput = z.object({
  jobId: z.string().cuid(),
  crewId: z.string().cuid(),
});

export const updateJobStatusInput = z.object({
  jobId: z.string().cuid(),
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  notes: z.string().max(2000).optional(),
});

export const createRecurringScheduleInput = z.object({
  jobId: z.string().cuid(),
  frequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY"]),
  nextDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
});

export type ScheduleJobInput = z.infer<typeof scheduleJobInput>;
export type AssignCrewInput = z.infer<typeof assignCrewInput>;
export type UpdateJobStatusInput = z.infer<typeof updateJobStatusInput>;
export type CreateRecurringScheduleInput = z.infer<typeof createRecurringScheduleInput>;
