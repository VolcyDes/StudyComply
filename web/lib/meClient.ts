import { API_BASE_URL } from "./config";

export type AccountKind = "student" | "university";

function normalizeRole(v: any): string {
  if (v == null) return "";
  return String(v).trim().toUpperCase();
}

function detectKindFromAny(data: any): AccountKind | null {
  // candidates: handle many possible shapes
  const candidates = [
    data?.user?.role,
    data?.user?.kind,
    data?.user?.accountKind,
    data?.user?.accountType,
    data?.user?.type,
    data?.role,
    data?.kind,
    data?.accountKind,
    data?.accountType,
    data?.type,
  ].map(normalizeRole).filter(Boolean);

  for (const raw of candidates) {
    // Typical cases
    if (raw === "UNIVERSITY") return "university";
    if (raw === "STUDENT") return "student";

    // Variants
    if (raw.includes("UNIVERSITY")) return "university";
    if (raw.includes("SCHOOL")) return "university";
    if (raw.includes("ADMIN_UNIVERSITY")) return "university";
    if (raw.includes("UNI")) return "university";

    if (raw.includes("STUDENT")) return "student";
  }

  return null;
}

export async function getAccountKindClient(): Promise<AccountKind> {
  // 1) Token required
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token");

  // 2) Try /me first
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/me`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      const k = detectKindFromAny(data);
      if (k) return k;
    }
  } catch {
    // ignore, fallback below
  }

  // 3) Fallback: localStorage user (if your login/register stores user)
  try {
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      const user = JSON.parse(rawUser);
      const k = detectKindFromAny({ user });
      if (k) return k;
    }
  } catch {
    // ignore
  }

  // 4) If we STILL can't detect, don't silently lie.
  // But to keep UX, default student (you can change to throw if you prefer).
  return "student";
}
