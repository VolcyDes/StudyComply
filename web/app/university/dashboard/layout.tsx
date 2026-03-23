"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

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

export default function UniversityDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const role = getRoleFromToken();
    if (!role) {
      router.replace("/login");
      return;
    }
    // Wrong role → routing hub decides where to go (no direct cross-redirect)
    if (role !== "UNIVERSITY") {
      router.replace("/dashboard");
    }
  }, [router]);

  return <>{children}</>;
}
