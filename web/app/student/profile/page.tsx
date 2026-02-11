"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccountKindClient } from "@/lib/meClient";

export default function ProfileRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const kind = await getAccountKindClient();
        router.replace(kind === "UNIVERSITY" ? "/university/profile" : "/student/profile");
      } catch {
        router.replace("/login");
      }
    })();
  }, [router]);

  return <p className="text-sm text-gray-600">Redirecting…</p>;
}
