import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@repo/api";

const TOKEN_COOKIE = "auth-token";
const PRESENT_COOKIE = "auth-present";
const maxAge = 60 * 60 * 24 * 30;

function cookieOptions() {
  return {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { token?: string } | null;
  const token = body?.token;
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  try {
    await verifyToken(token);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(TOKEN_COOKIE, token, {
    ...cookieOptions(),
    httpOnly: true,
  });
  res.cookies.set(PRESENT_COOKIE, "1", {
    ...cookieOptions(),
    httpOnly: false,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(TOKEN_COOKIE, "", { ...cookieOptions(), httpOnly: true, maxAge: 0 });
  res.cookies.set(PRESENT_COOKIE, "", { ...cookieOptions(), httpOnly: false, maxAge: 0 });
  return res;
}
