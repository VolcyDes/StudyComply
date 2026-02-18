"use client";

/**
 * Client helper to determine which dashboard to show.
 * It calls GET /me with the bearer token (stored in localStorage).
 *
 * It supports both cases:
 * - NEXT_PUBLIC_API_BASE_URL = https://studycomply-api.fly.dev   (no /api/v1)
 * - NEXT_PUBLIC_API_BASE_URL = http://localhost:3000/api/v1     (already includes /api/v1)
 */
function baseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/+$/, "");
  if (!raw) return ""; // will crash later with a clearer error
  return raw;
}

function meUrl(): string {
  const base = baseUrl();
  // If base already ends with /api/v1 (or contains /api/), we call /me directly
  if (base.includes("/api/")) return `${base}/me`;
  return `${base}/api/v1/me`;
}

function readToken(): string {
  // adapt if you store under another key
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwt") ||
    ""
  );
}

export type AccountKind = "student" | "university" | "admin";

export async function getAccountKindClient(): Promise<AccountKind | null> {
  const url = meUrl();
  if (!url) throw new Error("NEXT_PUBLIC_API_BASE_URL is missing");

  const token = readToken();
  const res = await fetch(url, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    cache: "no-store",
  });

  if (!res.ok) return null;

  const json: any = await res.json().catch(() => ({}));

  // try common shapes
  const role =
    (json?.role || json?.accountKind || json?.kind || json?.user?.role || json?.user?.accountKind || "")
      .toString()
      .toLowerCase()
      .trim();

  if (role === "student" || role === "university" || role === "admin") return role as AccountKind;
  return null;
}
