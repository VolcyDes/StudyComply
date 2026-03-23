"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasToken, getRole } from "../../lib/auth";

export default function DashboardRoutingPage() {
  const router = useRouter();

  useEffect(() => {
    if (!hasToken()) {
      router.replace("/login");
      return;
    }

    const role = getRole();

    if (role === "UNIVERSITY") {
      router.replace("/university/dashboard");
    } else {
      // STUDENT, USER, or unknown → student section
      router.replace("/student/dashboard");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
    </div>
  );
}
