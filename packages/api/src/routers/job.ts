import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import type { Prisma } from '@repo/db';
import {
  router,
  customerProcedure,
  providerProcedure,
  fieldProcedure,
} from '../trpc';
import {
  createJobInput,
  scheduleJobInput,
  assignCrewInput,
  unassignCrewInput,
  updateJobStatusInput,
  createRecurringScheduleInput,
  cancelJobInput,
  listMineInput,
  getJobByIdInput,
  deleteJobPhotoInput,
  submitJobReviewInput,
  rebookJobInput,
} from '@repo/validators';
import {
  notifyNewJobAvailable,
  notifyJobScheduled,
  notifyJobInProgress,
  notifyJobCompleted,
  notifyJobCancelled,
  notifyReviewReceived,
} from '../lib/notifications';
import { decorateCustomerJobs } from '../lib/reviews';
import { createJobCheckoutSession } from '../lib/payments';
import { getAppUrl, toCents } from '../lib/stripe';
import {
  fieldJobInclude,
  getFieldAccess,
  jobWhereForAccess,
  todayRange,
  assertJobAccess,
  assertCompletePhotos,
} from '../lib/field-access';
import { deleteJobPhotoBlob } from '../lib/job-photos';

export const jobRouter = router({
  /** Customer: create a new job request (broadcasts to local providers) */
  create: customerProcedure
    .input(createJobInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.customerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        });
      }

      // Verify the property belongs to this customer
      const property = await ctx.db.property.findUnique({
        where: { id: input.propertyId },
      });

      if (!property || property.customerId !== profile.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Property not found',
        });
      }

      const job = await ctx.db.job.create({
        data: {
          propertyId: input.propertyId,
          serviceId: input.serviceId,
          customerNotes: input.customerNotes,
          type: 'ONE_TIME',
          status: 'OPEN',
        },
        include: {
          property: true,
          service: { include: { category: true } },
        },
      });

      // Find local providers who offer this service and serve this zip code
      const matchingProviders = await ctx.db.providerProfile.findMany({
        where: {
          verified: true,
          services: { some: { serviceId: input.serviceId } },
          OR: [
            { serviceAreaZips: { contains: property.zip } },
            { serviceAreaZips: null },
          ],
        },
        include: { user: true },
      });

      // Notify all matching providers
      for (const provider of matchingProviders) {
        notifyNewJobAvailable(
          provider.userId,
          job.service.name,
          `${property.address}, ${property.city}`,
        ).catch(console.error);
      }

      return job;
    }),

  /** Customer: list their jobs */
  listForCustomer: customerProcedure
    .input(
      z
        .object({
          status: z
            .enum([
              'OPEN',
              'PENDING',
              'SCHEDULED',
              'IN_PROGRESS',
              'COMPLETED',
              'CANCELLED',
            ])
            .optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.customerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        });
      }

      const propertyIds = await ctx.db.property.findMany({
        where: { customerId: profile.id },
        select: { id: true },
      });

      const jobs = await ctx.db.job.findMany({
        where: {
          propertyId: { in: propertyIds.map((p) => p.id) },
          ...(input?.status ? { status: input.status } : {}),
        },
        include: {
          property: true,
          service: { include: { category: true } },
          acceptedBid: { include: { provider: true } },
          bids: { include: { provider: true } },
          assignments: { include: { crew: true } },
          recurringSchedule: true,
          payments: true,
          review: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Transform bids to include priceCents
      return decorateCustomerJobs(
        ctx.db,
        jobs.map((job) => ({
          ...job,
          bids: job.bids.map((bid) => ({
            ...bid,
            priceCents: Math.round(Number(bid.price) * 100),
          })),
          acceptedBid: job.acceptedBid
            ? {
                ...job.acceptedBid,
                priceCents: Math.round(Number(job.acceptedBid.price) * 100),
              }
            : null,
        })),
      );
    }),

  /** Customer: get a single job they own */
  getForCustomer: customerProcedure
    .input(z.object({ jobId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.customerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        });
      }

      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId },
        include: {
          property: true,
          service: { include: { category: true } },
          acceptedBid: { include: { provider: true } },
          bids: { include: { provider: true } },
          assignments: { include: { crew: true } },
          recurringSchedule: true,
          payments: true,
          photos: { orderBy: { createdAt: 'asc' } },
          review: true,
        },
      });

      if (!job || job.property.customerId !== profile.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
      }

      const [decorated] = await decorateCustomerJobs(ctx.db, [
        {
          ...job,
          bids: job.bids.map((bid) => ({
            ...bid,
            priceCents: Math.round(Number(bid.price) * 100),
          })),
          acceptedBid: job.acceptedBid
            ? {
                ...job.acceptedBid,
                priceCents: Math.round(Number(job.acceptedBid.price) * 100),
              }
            : null,
        },
      ]);

      if (!decorated) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
      }

      return decorated;
    }),

  /** Customer: cancel an open job request */
  cancelForCustomer: customerProcedure
    .input(cancelJobInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.customerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        });
      }

      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId },
        include: {
          property: true,
          service: true,
          bids: { include: { provider: true } },
        },
      });

      if (!job || job.property.customerId !== profile.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
      }

      if (job.status !== 'OPEN') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only open job requests can be cancelled',
        });
      }

      const [updated] = await ctx.db.$transaction([
        ctx.db.job.update({
          where: { id: input.jobId },
          data: { status: 'CANCELLED' },
          include: {
            property: true,
            service: { include: { category: true } },
            acceptedBid: { include: { provider: true } },
            bids: { include: { provider: true } },
            assignments: { include: { crew: true } },
            recurringSchedule: true,
            payments: true,
          },
        }),
        ctx.db.jobBid.updateMany({
          where: { jobId: input.jobId, status: 'PENDING' },
          data: { status: 'DECLINED' },
        }),
      ]);

      const pendingProviders = job.bids.filter(
        (bid) => bid.status === 'PENDING',
      );
      for (const bid of pendingProviders) {
        notifyJobCancelled(bid.provider.userId, job.service.name).catch(
          console.error,
        );
      }

      return updated;
    }),

  /** Provider: list open jobs in their service area */
  listOpen: providerProcedure
    .input(
      z
        .object({
          serviceId: z.string().cuid().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.providerProfile.findUnique({
        where: { userId: ctx.user.userId },
        include: { services: true },
      });

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        });
      }

      const providerServiceIds = profile.services.map((s) => s.serviceId);
      const providerZips = profile.serviceAreaZips
        ? profile.serviceAreaZips.split(',').map((z) => z.trim())
        : [];

      return ctx.db.job.findMany({
        where: {
          status: 'OPEN',
          serviceId: input?.serviceId
            ? input.serviceId
            : { in: providerServiceIds },
          // Filter by zip code if provider has zips set
          ...(providerZips.length > 0
            ? { property: { zip: { in: providerZips } } }
            : {}),
          // Direct rebooks are only visible to the invited provider
          OR: [
            { invitedProviderId: null },
            { invitedProviderId: profile.id },
          ],
          // Exclude jobs provider already bid on
          bids: { none: { providerId: profile.id } },
        },
        include: {
          property: true,
          service: { include: { category: true } },
          bids: { select: { id: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }),

  /** Provider: list their assigned jobs (where their bid was accepted) */
  listForProvider: providerProcedure
    .input(
      z
        .object({
          status: z
            .enum([
              'OPEN',
              'PENDING',
              'SCHEDULED',
              'IN_PROGRESS',
              'COMPLETED',
              'CANCELLED',
            ])
            .optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.providerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        });
      }

      return ctx.db.job.findMany({
        where: {
          acceptedBid: { providerId: profile.id },
          ...(input?.status ? { status: input.status } : {}),
        },
        include: {
          property: true,
          service: { include: { category: true } },
          acceptedBid: { include: { provider: true } },
          assignments: { include: { crew: { include: { members: true } } } },
          recurringSchedule: true,
          photos: { orderBy: { createdAt: 'asc' } },
          review: true,
        },
        orderBy: [{ scheduledDate: 'asc' }, { createdAt: 'desc' }],
      });
    }),

  /** Provider: list jobs they have bid on (pending bids) */
  listMyBids: providerProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.providerProfile.findUnique({
      where: { userId: ctx.user.userId },
    });

    if (!profile) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' });
    }

    return ctx.db.jobBid.findMany({
      where: { providerId: profile.id },
      include: {
        job: {
          include: {
            property: true,
            service: { include: { category: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
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
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        });
      }

      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId },
        include: { acceptedBid: true },
      });

      if (
        !job ||
        !job.acceptedBid ||
        job.acceptedBid.providerId !== profile.id
      ) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
      }

      const updated = await ctx.db.job.update({
        where: { id: input.jobId },
        data: {
          scheduledDate: new Date(input.scheduledDate),
          scheduledTime: input.scheduledTime,
          status: 'SCHEDULED',
        },
        include: {
          property: { include: { customer: { include: { user: true } } } },
          service: true,
          acceptedBid: { include: { provider: true } },
          assignments: { include: { crew: true } },
        },
      });

      // Notify customer of scheduled job
      notifyJobScheduled(
        updated.property.customer.userId,
        updated.service.name,
        input.scheduledDate,
        input.scheduledTime,
      ).catch(console.error);

      const customerEmail = updated.property.customer.email;
      if (customerEmail) {
        const { sendEmail } = await import('../lib/email');
        sendEmail({
          to: customerEmail,
          subject: `Job scheduled — ${updated.service.name}`,
          text: `Hi ${updated.property.customer.firstName},\n\nYour ${updated.service.name} job is scheduled for ${input.scheduledDate}${input.scheduledTime ? ` at ${input.scheduledTime}` : ''}.\n\nExterior Pro`,
        }).catch(console.error);
      }

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
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        });
      }

      // Verify job belongs to provider via accepted bid
      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId },
        include: { acceptedBid: true },
      });

      if (
        !job ||
        !job.acceptedBid ||
        job.acceptedBid.providerId !== profile.id
      ) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
      }

      // Verify crew belongs to provider
      const crew = await ctx.db.crew.findUnique({
        where: { id: input.crewId },
      });

      if (!crew || crew.providerId !== profile.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Crew not found' });
      }

      // Idempotent: re-assigning the crew that is already on the job used to
      // surface a raw unique-constraint error from Prisma to the caller.
      const existing = await ctx.db.jobAssignment.findUnique({
        where: {
          jobId_crewId: { jobId: input.jobId, crewId: input.crewId },
        },
        include: { crew: { include: { members: true } } },
      });

      if (existing) return existing;

      return ctx.db.jobAssignment.create({
        data: {
          jobId: input.jobId,
          crewId: input.crewId,
        },
        include: { crew: { include: { members: true } } },
      });
    }),

  /** Provider: take a crew off a job, so a different one can be assigned */
  unassignCrew: providerProcedure
    .input(unassignCrewInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.providerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        });
      }

      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId },
        include: { acceptedBid: true },
      });

      if (
        !job ||
        !job.acceptedBid ||
        job.acceptedBid.providerId !== profile.id
      ) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
      }

      await ctx.db.jobAssignment.deleteMany({
        where: { jobId: input.jobId, crewId: input.crewId },
      });

      return { ok: true as const };
    }),

  /** Provider: update job status */
  updateStatus: fieldProcedure
    .input(updateJobStatusInput)
    .mutation(async ({ ctx, input }) => {
      const { access } = await assertJobAccess(ctx, input.jobId);

      if (access.kind === 'crew') {
        if (input.status !== 'IN_PROGRESS' && input.status !== 'COMPLETED') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Crews can only start or complete assigned jobs',
          });
        }
      }

      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId },
        include: { acceptedBid: true },
      });

      if (!job) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
      }

      if (input.status === 'COMPLETED') {
        await assertCompletePhotos(ctx, input.jobId);
      }

      const updated = await ctx.db.job.update({
        where: { id: input.jobId },
        data: {
          status: input.status,
          notes: input.notes,
          ...(input.status === 'COMPLETED' ? { completedAt: new Date() } : {}),
        },
        include: {
          property: { include: { customer: { include: { user: true } } } },
          service: true,
          acceptedBid: { include: { provider: true } },
          assignments: { include: { crew: true } },
        },
      });

      const customerId = updated.property.customer.userId;
      const serviceName = updated.service.name;

      if (input.status === 'IN_PROGRESS') {
        notifyJobInProgress(customerId, serviceName).catch(console.error);
      } else if (input.status === 'COMPLETED') {
        notifyJobCompleted(customerId, serviceName).catch(console.error);
        const { payoutForCompletedJob } = await import('../lib/payments');
        payoutForCompletedJob(updated.id).catch(console.error);
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
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        });
      }

      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId },
        include: { acceptedBid: true },
      });

      if (
        !job ||
        !job.acceptedBid ||
        job.acceptedBid.providerId !== profile.id
      ) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
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
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' });
    }

    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return ctx.db.job.findMany({
      where: {
        acceptedBid: { providerId: profile.id },
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        scheduledDate: { gte: now, lte: nextWeek },
      },
      include: {
        property: true,
        service: true,
        assignments: { include: { crew: { include: { members: true } } } },
      },
      orderBy: [{ scheduledDate: 'asc' }],
    });
  }),

  /** Provider or crew: jobs visible to the signed-in field user */
  listMine: fieldProcedure
    .input(listMineInput)
    .query(async ({ ctx, input }) => {
      const access = await getFieldAccess(ctx);
      const { start, end } = todayRange();
      const view = input?.view ?? 'active';

      const extra: Prisma.JobWhereInput = input?.status
        ? { status: input.status }
        : view === 'today'
          ? {
              OR: [
                { status: 'IN_PROGRESS' },
                {
                  status: 'SCHEDULED',
                  scheduledDate: { gte: start, lte: end },
                },
              ],
            }
          : view === 'active'
            ? { status: { in: ['PENDING', 'SCHEDULED', 'IN_PROGRESS'] } }
            : {};

      return ctx.db.job.findMany({
        where: {
          ...jobWhereForAccess(access),
          ...extra,
        },
        include: fieldJobInclude,
        orderBy: [{ scheduledDate: 'asc' }, { createdAt: 'desc' }],
      });
    }),

  /** Provider or crew: single job they can access */
  getById: fieldProcedure
    .input(getJobByIdInput)
    .query(async ({ ctx, input }) => {
      const access = await getFieldAccess(ctx);
      const job = await ctx.db.job.findFirst({
        where: { id: input.jobId, ...jobWhereForAccess(access) },
        include: fieldJobInclude,
      });

      if (!job) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
      }

      return job;
    }),

  /** Provider or crew: remove a photo from a job they can access */
  deletePhoto: fieldProcedure
    .input(deleteJobPhotoInput)
    .mutation(async ({ ctx, input }) => {
      const photo = await ctx.db.jobPhoto.findUnique({
        where: { id: input.photoId },
      });
      if (!photo) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Photo not found' });
      }

      await assertJobAccess(ctx, photo.jobId);
      await deleteJobPhotoBlob(photo.url);
      await ctx.db.jobPhoto.delete({ where: { id: photo.id } });
      return { ok: true as const };
    }),

  /** Customer: rate a completed job. Upserts so they can edit the review. */
  submitReview: customerProcedure
    .input(submitJobReviewInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.customerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        });
      }

      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId },
        include: {
          property: true,
          service: true,
          acceptedBid: { include: { provider: true } },
          review: true,
        },
      });

      if (!job || job.property.customerId !== profile.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
      }

      if (job.status !== 'COMPLETED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You can only review a completed job',
        });
      }

      if (!job.acceptedBid) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This job has no assigned provider to review',
        });
      }

      const comment = input.comment?.trim() ? input.comment.trim() : null;
      const isFirstReview = !job.review;

      const review = await ctx.db.jobReview.upsert({
        where: { jobId: job.id },
        create: {
          jobId: job.id,
          providerId: job.acceptedBid.providerId,
          customerId: profile.id,
          rating: input.rating,
          comment,
        },
        update: {
          rating: input.rating,
          comment,
        },
      });

      if (isFirstReview) {
        notifyReviewReceived(
          job.acceptedBid.provider.userId,
          job.service.name,
          input.rating,
        ).catch(console.error);
      }

      return review;
    }),

  /**
   * Customer: book the same provider again at the last accepted price.
   * Creates an invite-only job and sends the customer to checkout.
   */
  rebook: customerProcedure
    .input(rebookJobInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.customerProfile.findUnique({
        where: { userId: ctx.user.userId },
        include: { user: true },
      });

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        });
      }

      const source = await ctx.db.job.findUnique({
        where: { id: input.jobId },
        include: {
          property: true,
          service: true,
          acceptedBid: { include: { provider: true } },
        },
      });

      if (!source || source.property.customerId !== profile.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
      }

      if (source.status !== 'COMPLETED' || !source.acceptedBid) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You can only rebook a completed job with an assigned provider',
        });
      }

      const provider = source.acceptedBid.provider;
      if (!provider.stripeTransfersEnabled) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'This provider has not finished payout setup yet.',
        });
      }

      const price = Number(source.acceptedBid.price);
      if (!Number.isFinite(price) || price <= 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This job has no price to rebook at',
        });
      }

      const notes = input.customerNotes?.trim() || undefined;
      const appUrl = getAppUrl();

      let job = await ctx.db.job.findFirst({
        where: {
          propertyId: source.propertyId,
          serviceId: source.serviceId,
          invitedProviderId: provider.id,
          status: 'OPEN',
        },
        include: {
          bids: {
            where: { providerId: provider.id, status: 'PENDING' },
          },
        },
      });

      if (job && job.bids.length === 0) {
        const restored = await ctx.db.jobBid.create({
          data: {
            jobId: job.id,
            providerId: provider.id,
            price,
            notes: 'Rebook at last price',
            status: 'PENDING',
          },
        });
        job = { ...job, bids: [restored] };
      }

      if (!job) {
        job = await ctx.db.job.create({
          data: {
            propertyId: source.propertyId,
            serviceId: source.serviceId,
            customerNotes: notes,
            type: 'ONE_TIME',
            status: 'OPEN',
            invitedProviderId: provider.id,
            bids: {
              create: {
                providerId: provider.id,
                price,
                notes: 'Rebook at last price',
                status: 'PENDING',
              },
            },
          },
          include: {
            bids: {
              where: { providerId: provider.id, status: 'PENDING' },
            },
          },
        });
      }

      const bid = job.bids[0];
      if (!bid) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not prepare the rebook bid',
        });
      }

      const checkout = await createJobCheckoutSession({
        customerId: profile.id,
        jobId: job.id,
        bidId: bid.id,
        providerId: provider.id,
        amountCents: toCents(price),
        description: `${source.service.name} — ${source.property.address}`,
        email: profile.email,
        name: `${profile.firstName} ${profile.lastName}`,
        phone: profile.user.phone,
        stripeCustomerId: profile.stripeCustomerId,
        successUrl: `${appUrl}/customer/jobs/${job.id}?checkout=success`,
        cancelUrl: `${appUrl}/customer/jobs/${source.id}?rebook=canceled`,
        extraMetadata: { rebook: 'true' },
      });

      return {
        checkoutUrl: checkout.checkoutUrl,
        jobId: job.id,
        amountCents: toCents(price),
        providerName: provider.businessName,
      };
    }),
});
