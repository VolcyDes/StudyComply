"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccountKindClient } from "@/lib/meClient";

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const kind = await getAccountKindClient();
        router.replace(kind === "university" ? "/university/dashboard" : "/student/dashboard");
      } catch {
        router.replace("/login");
      }
    })();
  }, [router]);

  return <p className="text-sm text-gray-600">Redirecting…</p>;
}
