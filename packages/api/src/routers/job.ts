import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, customerProcedure, providerProcedure } from "../trpc";
import { scheduleJobInput, assignCrewInput, updateJobStatusInput, createRecurringScheduleInput } from "@repo/validators";
import { notifyJobScheduled, notifyJobInProgress, notifyJobCompleted } from "../lib/notifications";

export const jobRouter = router({
  /** Customer: list their jobs */
  listForCustomer: customerProcedure
    .input(
      z.object({
        status: z.enum(["PENDING", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.customerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      const propertyIds = await ctx.db.property.findMany({
        where: { customerId: profile.id },
        select: { id: true },
      });

      return ctx.db.job.findMany({
        where: {
          quote: {
            propertyId: { in: propertyIds.map((p) => p.id) },
          },
          ...(input?.status ? { status: input.status } : {}),
        },
        include: {
          quote: {
            include: {
              property: true,
              service: { include: { category: true } },
              provider: true,
            },
          },
          assignments: { include: { crew: true } },
          recurringSchedule: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  /** Provider: list their jobs */
  listForProvider: providerProcedure
    .input(
      z.object({
        status: z.enum(["PENDING", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.providerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      return ctx.db.job.findMany({
        where: {
          quote: { providerId: profile.id },
          ...(input?.status ? { status: input.status } : {}),
        },
        include: {
          quote: {
            include: {
              property: true,
              service: { include: { category: true } },
            },
          },
          assignments: { include: { crew: { include: { members: true } } } },
          recurringSchedule: true,
        },
        orderBy: [{ scheduledDate: "asc" }, { createdAt: "desc" }],
      });
    }),

  /** Provider: schedule a job */
  schedule: providerProcedure
    .input(scheduleJobInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.providerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      const job = await ctx.db.job.findUnique({
        where: { quoteId: input.quoteId },
        include: { quote: true },
      });

      if (!job || job.quote.providerId !== profile.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      const updated = await ctx.db.job.update({
        where: { id: job.id },
        data: {
          scheduledDate: new Date(input.scheduledDate),
          scheduledTime: input.scheduledTime,
          status: "SCHEDULED",
        },
        include: {
          quote: {
            include: {
              property: { include: { customer: { include: { user: true } } } },
              service: true,
            },
          },
          assignments: { include: { crew: true } },
        },
      });

      // Notify customer of scheduled job
      notifyJobScheduled(
        updated.quote.property.customer.userId,
        updated.quote.service.name,
        input.scheduledDate,
        input.scheduledTime
      ).catch(console.error);

      return updated;
    }),

  /** Provider: assign a crew to a job */
  assignCrew: providerProcedure
    .input(assignCrewInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.providerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      // Verify job belongs to provider
      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId },
        include: { quote: true },
      });

      if (!job || job.quote.providerId !== profile.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      // Verify crew belongs to provider
      const crew = await ctx.db.crew.findUnique({
        where: { id: input.crewId },
      });

      if (!crew || crew.providerId !== profile.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Crew not found" });
      }

      return ctx.db.jobAssignment.create({
        data: {
          jobId: input.jobId,
          crewId: input.crewId,
        },
        include: { crew: { include: { members: true } } },
      });
    }),

  /** Provider: update job status */
  updateStatus: providerProcedure
    .input(updateJobStatusInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.providerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId },
        include: { quote: true },
      });

      if (!job || job.quote.providerId !== profile.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      const updated = await ctx.db.job.update({
        where: { id: input.jobId },
        data: {
          status: input.status,
          notes: input.notes,
          ...(input.status === "COMPLETED" ? { completedAt: new Date() } : {}),
        },
        include: {
          quote: {
            include: {
              property: { include: { customer: { include: { user: true } } } },
              service: true,
              provider: true,
            },
          },
          assignments: { include: { crew: true } },
        },
      });

      // Send notifications based on status change
      const customerId = updated.quote.property.customer.userId;
      const serviceName = updated.quote.service.name;

      if (input.status === "IN_PROGRESS") {
        notifyJobInProgress(customerId, serviceName).catch(console.error);
      } else if (input.status === "COMPLETED") {
        notifyJobCompleted(customerId, serviceName).catch(console.error);
      }

      return updated;
    }),

  /** Provider: set up a recurring schedule for a job */
  createRecurring: providerProcedure
    .input(createRecurringScheduleInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.providerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId },
        include: { quote: true },
      });

      if (!job || job.quote.providerId !== profile.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      return ctx.db.recurringSchedule.upsert({
        where: { jobId: input.jobId },
        update: {
          frequency: input.frequency,
          nextDate: new Date(input.nextDate),
          active: true,
        },
        create: {
          jobId: input.jobId,
          frequency: input.frequency,
          nextDate: new Date(input.nextDate),
        },
      });
    }),

  /** Provider: get upcoming jobs (next 7 days) */
  getUpcoming: providerProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.providerProfile.findUnique({
      where: { userId: ctx.user.userId },
    });

    if (!profile) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    }

    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return ctx.db.job.findMany({
      where: {
        quote: { providerId: profile.id },
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
        scheduledDate: { gte: now, lte: nextWeek },
      },
      include: {
        quote: {
          include: { property: true, service: true },
        },
        assignments: { include: { crew: { include: { members: true } } } },
      },
      orderBy: [{ scheduledDate: "asc" }],
    });
  }),
});
