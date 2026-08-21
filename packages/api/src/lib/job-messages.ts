import { TRPCError } from '@trpc/server';
import type { JobStatus, Prisma } from '@repo/db';
import type { Context } from '../trpc';
import { assertJobAccess } from './field-access';

type AuthedCtx = {
  db: Context['db'];
  user: { userId: string; role: string };
};

const MESSAGEABLE_STATUSES: JobStatus[] = [
  'PENDING',
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
];

const jobMessageInclude = {
  property: {
    include: {
      customer: { select: { userId: true, firstName: true, lastName: true } },
    },
  },
  service: { select: { name: true } },
  acceptedBid: {
    include: {
      provider: { select: { userId: true, businessName: true } },
    },
  },
  assignments: {
    include: {
      crew: {
        include: {
          members: { select: { userId: true, name: true } },
        },
      },
    },
  },
} satisfies Prisma.JobInclude;

type JobForMessages = Prisma.JobGetPayload<{ include: typeof jobMessageInclude }>;

export type JobMessageAccess = {
  job: JobForMessages;
  canSend: boolean;
};

export const senderInclude = {
  id: true,
  role: true,
  customerProfile: { select: { firstName: true, lastName: true } },
  providerProfile: { select: { businessName: true } },
  crewMemberships: { select: { name: true }, take: 1 },
} satisfies Prisma.UserSelect;

type SenderRecord = Prisma.UserGetPayload<{ select: typeof senderInclude }>;

export function isMessageableStatus(status: JobStatus) {
  return MESSAGEABLE_STATUSES.includes(status);
}

export function senderDisplayName(sender: SenderRecord) {
  if (sender.role === 'PROVIDER' && sender.providerProfile?.businessName) {
    return sender.providerProfile.businessName;
  }
  if (sender.role === 'CUSTOMER' && sender.customerProfile) {
    return `${sender.customerProfile.firstName} ${sender.customerProfile.lastName}`.trim();
  }
  if (sender.crewMemberships[0]?.name) {
    return sender.crewMemberships[0].name;
  }
  return 'Team member';
}

export type SerializedJobMessage = {
  id: string;
  body: string;
  createdAt: Date;
  mine: boolean;
  sender: { id: string; role: string | null; name: string };
};

type MessageWithSender = {
  id: string;
  body: string;
  createdAt: Date;
  senderId: string;
  sender: SenderRecord;
};

export function serializeJobMessage(
  message: MessageWithSender,
  viewerId: string,
): SerializedJobMessage {
  return {
    id: message.id,
    body: message.body,
    createdAt: message.createdAt,
    mine: message.senderId === viewerId,
    sender: {
      id: message.senderId,
      role: message.sender.role,
      name: senderDisplayName(message.sender),
    },
  };
}

export async function listJobMessagesSince(
  ctx: AuthedCtx,
  jobId: string,
  since: Date,
) {
  return ctx.db.jobMessage.findMany({
    where: { jobId, createdAt: { gt: since } },
    include: { sender: { select: senderInclude } },
    orderBy: { createdAt: 'asc' },
    take: 50,
  });
}

export async function assertJobMessageAccess(
  ctx: AuthedCtx,
  jobId: string,
): Promise<JobMessageAccess> {
  if (ctx.user.role === 'CUSTOMER') {
    const profile = await ctx.db.customerProfile.findUnique({
      where: { userId: ctx.user.userId },
      select: { id: true },
    });
    if (!profile) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' });
    }

    const job = await ctx.db.job.findFirst({
      where: { id: jobId, property: { customerId: profile.id } },
      include: jobMessageInclude,
    });
    if (!job) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
    }

    return { job, canSend: isMessageableStatus(job.status) };
  }

  if (ctx.user.role === 'PROVIDER' || ctx.user.role === 'CREW') {
    await assertJobAccess(ctx, jobId);
    const job = await ctx.db.job.findFirst({
      where: { id: jobId },
      include: jobMessageInclude,
    });
    if (!job) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
    }
    return { job, canSend: isMessageableStatus(job.status) };
  }

  throw new TRPCError({
    code: 'FORBIDDEN',
    message: 'Insufficient permissions',
  });
}

/** Everyone on the job thread except the sender. */
export function participantUserIds(job: JobForMessages, exceptUserId: string) {
  const ids = new Set<string>();
  ids.add(job.property.customer.userId);
  if (job.acceptedBid?.provider.userId) {
    ids.add(job.acceptedBid.provider.userId);
  }
  for (const assignment of job.assignments) {
    for (const member of assignment.crew.members) {
      if (member.userId) ids.add(member.userId);
    }
  }
  ids.delete(exceptUserId);
  return Array.from(ids);
}

export async function unreadCountForJob(
  ctx: AuthedCtx,
  jobId: string,
) {
  const read = await ctx.db.jobThreadRead.findUnique({
    where: {
      jobId_userId: { jobId, userId: ctx.user.userId },
    },
    select: { lastReadAt: true },
  });

  return ctx.db.jobMessage.count({
    where: {
      jobId,
      senderId: { not: ctx.user.userId },
      ...(read ? { createdAt: { gt: read.lastReadAt } } : {}),
    },
  });
}

export async function markJobThreadRead(ctx: AuthedCtx, jobId: string) {
  await ctx.db.jobThreadRead.upsert({
    where: {
      jobId_userId: { jobId, userId: ctx.user.userId },
    },
    create: { jobId, userId: ctx.user.userId, lastReadAt: new Date() },
    update: { lastReadAt: new Date() },
  });
}
