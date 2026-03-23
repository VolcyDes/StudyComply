"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasToken, getRole } from "../../../lib/auth";

export default function UniversityDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!hasToken()) {
      router.replace("/login");
      return;
    }
    const role = getRole();
    // Wrong role → routing hub decides where to go (no direct cross-redirect)
    if (role !== "UNIVERSITY") {
      router.replace("/dashboard");
    }
  }, [router]);

  return <>{children}</>;
}
