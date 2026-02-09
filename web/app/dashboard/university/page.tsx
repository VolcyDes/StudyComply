"use client";

import * as React from "react";
import { getMe } from "@/lib/meApi";

export default function UniversityDashboardPage() {
  const [me, setMe] = React.useState<Awaited<ReturnType<typeof getMe>> | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    getMe()
      .then(setMe)
      .catch((e) => setErr(e?.message || "Not authenticated"));
  }, []);

  if (err) return <div className="p-6">❌ {err}</div>;
  if (!me) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 space-y-3">
      <h1 className="text-xl font-semibold">University Dashboard</h1>
      <div className="text-sm text-muted-foreground">
        Logged as: <span className="font-mono">{me.user.email}</span> — role:{" "}
        <span className="font-mono">{me.user.role}</span>
      </div>

      <div className="rounded-lg border p-4">
        <div className="text-sm font-medium mb-1">Next</div>
        <div className="text-sm text-muted-foreground">
          Ici on branchera: CRUD requirements + types de docs à rentrer.
        </div>
      </div>
    </div>
  );
}
