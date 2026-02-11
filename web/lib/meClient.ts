"use client";

import type { AccountKind } from "@/lib/accountKind";
import { authFetch } from "@/lib/authFetch";

type MeResponse = { user?: any; accountKind?: AccountKind };

export async function getAccountKindClient(): Promise<AccountKind> {
  const out = await authFetch("/api/v1/me", { method: "GET" });

  const res = out.res;
  if (!res.ok) throw new Error("Unauthorized");

  const data = (out.data ?? {}) as MeResponse;

  // Accept multiple shapes (robust)
  const k =
    (data.accountKind as AccountKind | undefined) ??
    (data.user?.accountKind as AccountKind | undefined) ??
    (data.user?.kind as AccountKind | undefined);

  if (k === "UNIVERSITY" || k === "STUDENT") return k;

  // Default: if backend doesn't send it yet, treat as STUDENT
  return "STUDENT";
}
