import { del, put } from "@vercel/blob";
import { TRPCError } from "@trpc/server";
import type { JobPhotoKind, PrismaClient } from "@repo/db";

// Use Web Crypto API which works in both Node.js and Edge Runtime
function randomUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const MAX_JOB_PHOTO_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function normalizeContentType(type: string | null | undefined) {
  const value = (type ?? "").toLowerCase().split(";")[0]?.trim();
  if (value === "image/jpg") return "image/jpeg";
  return value;
}

function extensionFor(contentType: string) {
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  return "jpg";
}

export async function uploadJobPhoto(opts: {
  db: PrismaClient;
  jobId: string;
  kind: JobPhotoKind;
  file: Buffer;
  contentType: string | null | undefined;
  uploadedById: string;
}) {
  const contentType =
    normalizeContentType(opts.contentType) || "image/jpeg";
  if (!contentType || !ALLOWED_TYPES.has(contentType)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Photos must be JPEG, PNG, or WebP",
    });
  }
  if (opts.file.byteLength === 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Photo file is empty",
    });
  }
  if (opts.file.byteLength > MAX_JOB_PHOTO_BYTES) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Photo must be 8MB or smaller",
    });
  }

  const id = randomUUID();
  const kindPath = opts.kind === "BEFORE" ? "before" : "after";
  const pathname = `jobs/${opts.jobId}/${kindPath}/${id}.${extensionFor(contentType)}`;

  const blob = await put(pathname, opts.file, {
    access: "public",
    addRandomSuffix: false,
    contentType,
  });

  try {
    return await opts.db.jobPhoto.create({
      data: {
        jobId: opts.jobId,
        kind: opts.kind,
        url: blob.url,
        pathname: blob.pathname,
        uploadedById: opts.uploadedById,
      },
    });
  } catch (error) {
    await del(blob.url).catch(() => undefined);
    throw error;
  }
}

export async function deleteJobPhotoBlob(url: string) {
  await del(url);
}
