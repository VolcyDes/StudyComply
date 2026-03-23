"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Routing hub — reads the role from the JWT or localStorage
 * and redirects to the correct dashboard.
 *
 *   UNIVERSITY → /university/dashboard
 *   USER / STUDENT / unknown → /student/dashboard
 *   No token at all → /login
 */
function detectRole(): { hasToken: boolean; role: string } {
  try {
    const token = localStorage.getItem("token");
    if (!token) return { hasToken: false, role: "" };

    // 1) Try reading from JWT payload
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const role = (payload?.role ?? "").toString().toUpperCase();
      if (role) return { hasToken: true, role };
    } catch { /* ignore */ }

    // 2) Fallback: localStorage user object (stored at login/register)
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const user = JSON.parse(raw);
        const role = (user?.role ?? "").toString().toUpperCase();
        if (role) return { hasToken: true, role };
      }
    } catch { /* ignore */ }

    // 3) Token exists but role unknown → treat as student
    return { hasToken: true, role: "USER" };
  } catch {
    return { hasToken: false, role: "" };
  }
}

export default function DashboardRoutingPage() {
  const router = useRouter();

  useEffect(() => {
    const { hasToken, role } = detectRole();

    if (!hasToken) {
      router.replace("/login");
      return;
    }

    if (role === "UNIVERSITY") {
      router.replace("/university/dashboard");
    } else {
      router.replace("/student/dashboard");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
    </div>
  );
}
