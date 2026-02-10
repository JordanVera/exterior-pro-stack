import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { db } from "@repo/db";
import type { UserRole } from "@repo/db";
import { verifyToken } from "./lib/jwt";

export type Context = {
  db: typeof db;
  user: { userId: string; role: string } | null;
};

export async function createContext(opts: {
  headers: Headers;
}): Promise<Context> {
  let user: Context["user"] = null;

  // Try Authorization header first, then cookie
  const authHeader = opts.headers.get("authorization");
  let token: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else {
    // Parse token from cookies (for web)
    const cookieHeader = opts.headers.get("cookie");
    if (cookieHeader) {
      const cookies = Object.fromEntries(
        cookieHeader.split("; ").map((c) => {
          const [key, ...rest] = c.split("=");
          return [key, rest.join("=")];
        })
      );
      token = cookies["auth-token"] ?? null;
    }
  }

  if (token) {
    try {
      user = await verifyToken(token);
    } catch {
      // Invalid token — user stays null
    }
  }

  return { db, user };
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

// ─── Auth middleware ─────────────────────────────────────────────────────────

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }
  return next({
    ctx: { ...ctx, user: ctx.user },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);

// ─── Role-based middleware ───────────────────────────────────────────────────

function hasRole(...roles: UserRole[]) {
  return t.middleware(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
    }
    if (!roles.includes(ctx.user.role as UserRole)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Insufficient permissions",
      });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  });
}

export const customerProcedure = t.procedure.use(isAuthed).use(hasRole("CUSTOMER"));
export const providerProcedure = t.procedure.use(isAuthed).use(hasRole("PROVIDER"));
export const adminProcedure = t.procedure.use(isAuthed).use(hasRole("ADMIN"));
