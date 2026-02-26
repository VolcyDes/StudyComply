"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccountKindClient } from "../../../lib/meClient";

export default function UniversityDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const kind = await getAccountKindClient();
        if (kind !== "university") router.replace("/student/dashboard");
      } catch {
        router.replace("/login");
      }
    })();
  }, [router]);

  return <>{children}</>;
}
