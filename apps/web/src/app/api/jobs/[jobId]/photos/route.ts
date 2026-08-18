import { NextRequest, NextResponse } from "next/server";
import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { assertJobAccess, createContext, uploadJobPhoto } from "@repo/api";
import type { JobPhotoKind } from "@repo/db";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function asHttp(error: unknown) {
  if (error instanceof TRPCError) {
    return jsonError(error.message, getHTTPStatusCodeFromError(error));
  }
  const message = error instanceof Error ? error.message : "Upload failed";
  console.error("Job photo upload failed:", message);
  return jsonError(message, 500);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  const ctx = await createContext({ headers: req.headers });
  if (!ctx.user) {
    return jsonError("Not authenticated", 401);
  }
  if (ctx.user.role !== "PROVIDER" && ctx.user.role !== "CREW") {
    return jsonError("Insufficient permissions", 403);
  }

  try {
    await assertJobAccess({ db: ctx.db, user: ctx.user }, jobId);
  } catch (error) {
    return asHttp(error);
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return jsonError("Expected multipart form data", 400);
  }

  const kindRaw = String(form.get("kind") ?? "");
  if (kindRaw !== "BEFORE" && kindRaw !== "AFTER") {
    return jsonError("kind must be BEFORE or AFTER", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return jsonError("Missing photo file", 400);
  }

  try {
    const photo = await uploadJobPhoto({
      db: ctx.db,
      jobId,
      kind: kindRaw as JobPhotoKind,
      file: Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
      uploadedById: ctx.user.userId,
    });
    return NextResponse.json(photo);
  } catch (error) {
    return asHttp(error);
  }
}
