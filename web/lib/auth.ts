/**
 * Single source of truth for authentication and role detection.
 * Never import from meClient.ts for routing — use this file instead.
 */

export type UserRole = "UNIVERSITY" | "STUDENT";

/**
 * Determines the user's role using multiple fallbacks:
 * 1. Explicit localStorage.userRole (set at register/login)
 * 2. JWT payload role field
 * 3. localStorage.user role field
 * Returns null only if truly nothing is found.
 */
export function getRole(): UserRole | null {
  try {
    // 1. Explicit stored role (most reliable — set by us at login/register)
    const stored = localStorage.getItem("userRole");
    if (stored) {
      if (stored.toUpperCase() === "UNIVERSITY") return "UNIVERSITY";
      return "STUDENT";
    }

    // 2. JWT payload
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const r = (payload?.role ?? "").toString().toUpperCase();
        if (r === "UNIVERSITY") return "UNIVERSITY";
        if (r === "USER" || r === "STUDENT") return "STUDENT";
      } catch { /* ignore */ }
    }

    // 3. User object stored at login/register
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        const user = JSON.parse(raw);
        const r = (user?.role ?? "").toString().toUpperCase();
        if (r === "UNIVERSITY") return "UNIVERSITY";
        if (r === "USER" || r === "STUDENT") return "STUDENT";
      } catch { /* ignore */ }
    }

    return null;
  } catch {
    return null;
  }
}

/** Returns true if a JWT token exists in localStorage. */
export function hasToken(): boolean {
  try {
    return !!localStorage.getItem("token");
  } catch {
    return false;
  }
}

/** Stores the role explicitly — call this at login and register. */
export function setRole(role: string): void {
  try {
    const normalized = role.toString().toUpperCase();
    localStorage.setItem(
      "userRole",
      normalized === "UNIVERSITY" ? "UNIVERSITY" : "STUDENT"
    );
  } catch { /* ignore */ }
}

/** Clears all auth data — call this at logout. */
export function clearAuth(): void {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
  } catch { /* ignore */ }
}
