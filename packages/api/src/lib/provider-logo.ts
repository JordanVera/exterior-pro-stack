import { del, list, put } from "@vercel/blob";
import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@repo/db";

export const MAX_PROVIDER_LOGO_BYTES = 2 * 1024 * 1024;
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

function logoPrefix(userId: string) {
  return `providers/${userId}/logo`;
}

async function deleteExistingLogos(userId: string) {
  const { blobs } = await list({ prefix: logoPrefix(userId) });
  if (blobs.length === 0) return;
  await del(blobs.map((blob) => blob.url));
}

export async function uploadProviderLogo(opts: {
  db: PrismaClient;
  userId: string;
  file: Buffer;
  contentType: string | null | undefined;
}) {
  const contentType = normalizeContentType(opts.contentType) || "image/jpeg";
  if (!ALLOWED_TYPES.has(contentType)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Logos must be JPEG, PNG, or WebP",
    });
  }
  if (opts.file.byteLength === 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Logo file is empty",
    });
  }
  if (opts.file.byteLength > MAX_PROVIDER_LOGO_BYTES) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Logo must be 2MB or smaller",
    });
  }

  await deleteExistingLogos(opts.userId);

  const pathname = `${logoPrefix(opts.userId)}.${extensionFor(contentType)}`;
  const blob = await put(pathname, opts.file, {
    access: "public",
    addRandomSuffix: true,
    contentType,
  });

  const profile = await opts.db.providerProfile.findUnique({
    where: { userId: opts.userId },
    select: { id: true },
  });

  if (profile) {
    await opts.db.providerProfile.update({
      where: { userId: opts.userId },
      data: { logoUrl: blob.url, logoPathname: blob.pathname },
    });
  }

  return { url: blob.url, pathname: blob.pathname };
}

export async function deleteProviderLogo(opts: {
  db: PrismaClient;
  userId: string;
}) {
  await deleteExistingLogos(opts.userId);
  await opts.db.providerProfile.updateMany({
    where: { userId: opts.userId },
    data: { logoUrl: null, logoPathname: null },
  });
}

export function assertOwnedLogoPath(userId: string, pathname: string | undefined) {
  if (!pathname) return;
  if (!pathname.startsWith(`${logoPrefix(userId)}`)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid logo upload",
    });
  }
}
