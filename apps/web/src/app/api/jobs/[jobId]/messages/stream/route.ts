import { NextRequest, NextResponse } from "next/server";
import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import {
  assertJobMessageAccess,
  createContext,
  listJobMessagesSince,
  serializeJobMessage,
  waitForJobMessage,
} from "@repo/api";
import type { Context } from "@repo/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const encoder = new TextEncoder();
const HOLD_MS = 1_500;
const STREAM_MS = 55_000;
const POLL_MS = 25_000;

type AuthedUser = NonNullable<Context["user"]>;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function asHttp(error: unknown) {
  if (error instanceof TRPCError) {
    return jsonError(error.message, getHTTPStatusCodeFromError(error));
  }
  const message = error instanceof Error ? error.message : "Stream failed";
  console.error("Job message stream failed:", message);
  return jsonError(message, 500);
}

function parseAfter(value: string | null) {
  if (!value) return new Date(Date.now() - 2_000);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date(Date.now() - 2_000) : date;
}

async function authorize(req: NextRequest, jobId: string) {
  const ctx = await createContext({ headers: req.headers });
  if (!ctx.user) {
    return { error: jsonError("Not authenticated", 401) };
  }
  try {
    await assertJobMessageAccess({ db: ctx.db, user: ctx.user }, jobId);
  } catch (error) {
    return { error: asHttp(error) };
  }
  return { ctx: { db: ctx.db, user: ctx.user } };
}

function sseChunk(event: string, data: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

async function readNewMessages(
  ctx: { db: Context["db"]; user: AuthedUser },
  jobId: string,
  cursor: Date,
  seen: Set<string>,
) {
  const rows = await listJobMessagesSince(ctx, jobId, cursor);
  const fresh = [];
  let nextCursor = cursor;
  for (const row of rows) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    if (row.createdAt > nextCursor) nextCursor = row.createdAt;
    fresh.push(serializeJobMessage(row, ctx.user.userId));
  }
  return { fresh, nextCursor };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  const authed = await authorize(req, jobId);
  if ("error" in authed) return authed.error;

  const { ctx } = authed;
  const since = parseAfter(req.nextUrl.searchParams.get("after"));
  const wantsSse = req.headers.get("accept")?.includes("text/event-stream");

  if (wantsSse) {
    const stream = new ReadableStream({
      async start(controller) {
        const seen = new Set<string>();
        let cursor = since;
        const deadline = Date.now() + STREAM_MS;

        const send = (event: string, data: unknown) => {
          controller.enqueue(sseChunk(event, data));
        };

        send("ready", { ok: true });

        try {
          while (!req.signal.aborted && Date.now() < deadline) {
            const { fresh, nextCursor } = await readNewMessages(
              ctx,
              jobId,
              cursor,
              seen,
            );
            cursor = nextCursor;
            for (const message of fresh) send("message", message);
            if (req.signal.aborted || Date.now() >= deadline) break;
            await waitForJobMessage(jobId, HOLD_MS, req.signal);
          }
        } catch (error) {
          if (!req.signal.aborted) {
            console.error("Job message SSE failed:", error);
          }
        } finally {
          try {
            controller.close();
          } catch {
            // already closed
          }
        }
      },
      cancel() {},
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  }

  const seen = new Set<string>();
  let cursor = since;
  const deadline = Date.now() + POLL_MS;

  try {
    while (!req.signal.aborted && Date.now() < deadline) {
      const { fresh, nextCursor } = await readNewMessages(
        ctx,
        jobId,
        cursor,
        seen,
      );
      cursor = nextCursor;
      if (fresh.length > 0) {
        return NextResponse.json({ messages: fresh });
      }
      await waitForJobMessage(jobId, HOLD_MS, req.signal);
    }
  } catch (error) {
    return asHttp(error);
  }

  return NextResponse.json({ messages: [] });
}
