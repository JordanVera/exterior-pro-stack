import type { JobPhotoKind, Prisma } from "@repo/db";
import { TRPCError } from "@trpc/server";
import type { Context } from "../trpc";

export const fieldJobInclude = {
  property: {
    include: {
      customer: {
        include: {
          user: { select: { phone: true } },
        },
      },
    },
  },
  service: { include: { category: true } },
  acceptedBid: true,
  assignments: { include: { crew: { include: { members: true } } } },
  photos: { orderBy: { createdAt: "asc" } },
  review: true,
} satisfies Prisma.JobInclude;

type AuthedCtx = {
  db: Context["db"];
  user: { userId: string; role: string };
};

export type FieldAccess =
  | { kind: "provider"; providerId: string }
  | { kind: "crew"; crewId: string; providerId: string };

export async function getFieldAccess(ctx: AuthedCtx): Promise<FieldAccess> {
  if (ctx.user.role === "PROVIDER") {
    const profile = await ctx.db.providerProfile.findUnique({
      where: { userId: ctx.user.userId },
    });
    if (!profile) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    }
    return { kind: "provider", providerId: profile.id };
  }

  if (ctx.user.role === "CREW") {
    const member = await ctx.db.crewMember.findUnique({
      where: { userId: ctx.user.userId },
      include: { crew: true },
    });
    if (!member) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Ask your owner to add your phone to a crew",
      });
    }
    return {
      kind: "crew",
      crewId: member.crewId,
      providerId: member.crew.providerId,
    };
  }

  throw new TRPCError({
    code: "FORBIDDEN",
    message: "Insufficient permissions",
  });
}

export function jobWhereForAccess(
  access: FieldAccess,
): Prisma.JobWhereInput {
  if (access.kind === "provider") {
    return { acceptedBid: { providerId: access.providerId } };
  }
  return { assignments: { some: { crewId: access.crewId } } };
}

export function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export async function assertJobAccess(
  ctx: AuthedCtx,
  jobId: string,
): Promise<{ access: FieldAccess; job: { id: string } }> {
  const access = await getFieldAccess(ctx);
  const job = await ctx.db.job.findFirst({
    where: { id: jobId, ...jobWhereForAccess(access) },
    select: { id: true },
  });
  if (!job) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
  }
  return { access, job };
}

export async function assertJobPhotoUploadAccess(
  ctx: AuthedCtx,
  jobId: string,
  kind: JobPhotoKind,
) {
  if (ctx.user.role === "CUSTOMER") {
    if (kind !== "BEFORE") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Customers can only upload reference photos",
      });
    }

    const profile = await ctx.db.customerProfile.findUnique({
      where: { userId: ctx.user.userId },
    });
    if (!profile) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    }

    const job = await ctx.db.job.findFirst({
      where: {
        id: jobId,
        status: { in: ["OPEN", "PENDING"] },
        property: { customerId: profile.id },
      },
      select: { id: true },
    });
    if (!job) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
    }
    return;
  }

  if (ctx.user.role === "PROVIDER" || ctx.user.role === "CREW") {
    await assertJobAccess(ctx, jobId);
    return;
  }

  throw new TRPCError({
    code: "FORBIDDEN",
    message: "Insufficient permissions",
  });
}

export async function assertCompletePhotos(
  ctx: AuthedCtx,
  jobId: string,
) {
  const photos = await ctx.db.jobPhoto.findMany({
    where: { jobId },
    select: { kind: true },
  });
  const kinds = new Set(photos.map((photo) => photo.kind));
  if (!kinds.has("BEFORE") || !kinds.has("AFTER")) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Add before and after photos to complete",
    });
  }
}
