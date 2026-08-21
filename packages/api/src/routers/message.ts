import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import {
  listJobMessagesInput,
  sendJobMessageInput,
  jobMessageUnreadInput,
} from '@repo/validators';
import { notifyJobMessage } from '../lib/notifications';
import { publishJobMessage } from '../lib/job-message-hub';
import {
  assertJobMessageAccess,
  markJobThreadRead,
  participantUserIds,
  senderDisplayName,
  senderInclude,
  serializeJobMessage,
  unreadCountForJob,
} from '../lib/job-messages';

const MESSAGE_PAGE_SIZE = 100;

export const messageRouter = router({
  /** Job thread for the current customer, provider, or assigned crew member. */
  list: protectedProcedure
    .input(listJobMessagesInput)
    .query(async ({ ctx, input }) => {
      const { job, canSend } = await assertJobMessageAccess(ctx, input.jobId);

      const rows = await ctx.db.jobMessage.findMany({
        where: { jobId: input.jobId },
        include: { sender: { select: senderInclude } },
        orderBy: { createdAt: 'desc' },
        take: MESSAGE_PAGE_SIZE,
      });

      const messages = rows
        .reverse()
        .map((message) => serializeJobMessage(message, ctx.user.userId));

      return {
        jobId: job.id,
        serviceName: job.service.name,
        canSend,
        messages,
      };
    }),

  unreadCount: protectedProcedure
    .input(jobMessageUnreadInput)
    .query(async ({ ctx, input }) => {
      await assertJobMessageAccess(ctx, input.jobId);
      const count = await unreadCountForJob(ctx, input.jobId);
      return { count };
    }),

  markRead: protectedProcedure
    .input(listJobMessagesInput)
    .mutation(async ({ ctx, input }) => {
      await assertJobMessageAccess(ctx, input.jobId);
      await markJobThreadRead(ctx, input.jobId);
      return { success: true as const };
    }),

  send: protectedProcedure
    .input(sendJobMessageInput)
    .mutation(async ({ ctx, input }) => {
      const { job, canSend } = await assertJobMessageAccess(ctx, input.jobId);
      if (!canSend) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Messaging is not available for this job yet',
        });
      }

      const created = await ctx.db.jobMessage.create({
        data: {
          jobId: input.jobId,
          senderId: ctx.user.userId,
          body: input.body,
        },
        include: { sender: { select: senderInclude } },
      });

      await markJobThreadRead(ctx, input.jobId);
      publishJobMessage(input.jobId);

      const senderName = senderDisplayName(created.sender);
      const recipients = participantUserIds(job, ctx.user.userId);
      for (const userId of recipients) {
        notifyJobMessage(
          userId,
          senderName,
          job.service.name,
          created.body,
          job.id,
        ).catch(console.error);
      }

      return serializeJobMessage(created, ctx.user.userId);
    }),
});
