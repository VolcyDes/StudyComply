"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccountKindClient } from "../../../lib/meClient";

export default function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const kind = await getAccountKindClient();
        if (kind !== "student") router.replace("/university/dashboard");
      } catch {
        router.replace("/login");
      }
    })();
  }, [router]);

  return <>{children}</>;
}
