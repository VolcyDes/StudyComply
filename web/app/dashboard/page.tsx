"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/meApi";

export default function DashboardGatePage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        if (me.user.role === "UNIVERSITY") {
          router.replace("/dashboard/university");
          return;
        }
        // USER / ADMIN -> dashboard étudiant (l’ancien)
        router.replace("/dashboard/student");
      } catch (e: any) {
        setErr(e?.message || "Not authenticated");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (err) return <div className="p-6">❌ {err}</div>;
  if (loading) return <div className="p-6">Redirecting…</div>;
  return null;
}
