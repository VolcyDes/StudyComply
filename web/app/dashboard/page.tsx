"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Routing hub — reads the role from the JWT (no API call needed)
 * and redirects to the correct dashboard.
 *
 *   UNIVERSITY → /university/dashboard
 *   anything else (USER / STUDENT) → /student/dashboard
 */
function getRoleFromToken(): string | null {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (payload?.role ?? "").toString().toUpperCase();
  } catch {
    return null;
  }
}

export default function DashboardRoutingPage() {
  const router = useRouter();

  useEffect(() => {
    const role = getRoleFromToken();

    if (!role) {
      // No token → go to login
      router.replace("/login");
      return;
    }

    if (role === "UNIVERSITY") {
      router.replace("/university/dashboard");
    } else {
      router.replace("/student/dashboard");
    }
  }, [router]);

  // Blank page while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
    </div>
  );
}
