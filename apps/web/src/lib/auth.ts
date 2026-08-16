"use client";

const TOKEN_PRESENT = "auth-present";

export function isAuthenticated(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.startsWith(`${TOKEN_PRESENT}=`));
}

export async function setSession(token: string): Promise<void> {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) {
    throw new Error("Failed to establish session");
  }
}

export async function clearSession(): Promise<void> {
  await fetch("/api/auth/session", { method: "DELETE" });
}

/** @deprecated use setSession */
export async function setToken(token: string): Promise<void> {
  await setSession(token);
}

/** @deprecated use clearSession */
export async function clearToken(): Promise<void> {
  await clearSession();
}

export function getToken(): string | null {
  return isAuthenticated() ? "present" : null;
}
