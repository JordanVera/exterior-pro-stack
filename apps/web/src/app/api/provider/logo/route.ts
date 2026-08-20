import { NextRequest, NextResponse } from "next/server";
import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import {
  createContext,
  deleteProviderLogo,
  uploadProviderLogo,
} from "@repo/api";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function asHttp(error: unknown) {
  if (error instanceof TRPCError) {
    return jsonError(error.message, getHTTPStatusCodeFromError(error));
  }
  const message = error instanceof Error ? error.message : "Upload failed";
  console.error("Provider logo upload failed:", message);
  return jsonError(message, 500);
}

async function requireProvider(req: NextRequest) {
  const ctx = await createContext({ headers: req.headers });
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }
  if (ctx.user.role !== "PROVIDER") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only businesses can upload a logo",
    });
  }
  return { ...ctx, user: ctx.user };
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireProvider(req);
    const form = await req.formData().catch(() => null);
    if (!form) {
      return jsonError("Expected multipart form data", 400);
    }

    const file = form.get("file");
    if (!(file instanceof File)) {
      return jsonError("Missing logo file", 400);
    }

    const logo = await uploadProviderLogo({
      db: ctx.db,
      userId: ctx.user.userId,
      file: Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
    });
    return NextResponse.json(logo);
  } catch (error) {
    return asHttp(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await requireProvider(req);
    await deleteProviderLogo({ db: ctx.db, userId: ctx.user.userId });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return asHttp(error);
  }
}

