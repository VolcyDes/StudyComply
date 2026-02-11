"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/authFetch";

// Import your existing dashboard section if you already have one
import ProjectSection from "@/app/dashboard/_components/ProjectSection";
import { NextStepsCard } from "@/app/dashboard/_components/NextStepsCard";

type MeResponse = { user: { id: string; email: string } };

export default function StudentDashboardPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("...");
  const [loading, setLoading] = React.useState(true);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    (async () => {
      try {
        const r = await authFetch("/api/v1/me");
        if (!r.res.ok) throw new Error("Unauthorized");
        const data = r.data as MeResponse;
        setEmail(data.user.email);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  // authFetchLike compatibility:
  const authFetchLike = React.useCallback(async (path: string, init?: RequestInit) => {
    const r = await authFetch(path, init);
    return r.res;
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          {loading ? "Loading…" : <>Logged in as <span className="font-medium">{email}</span></>}
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Manage passports in <a className="underline" href="/profile">Profile</a>.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <NextStepsCard authFetch={authFetchLike} refreshKey={refreshKey} onDocumentCreated={() => setRefreshKey((k) => k + 1)} />
          <ProjectSection authFetch={authFetchLike} onChanged={() => setRefreshKey((k) => k + 1)} />
        </div>

        <div className="space-y-6">
          {/* Student-only future cards */}
        </div>
      </div>
    </div>
  );
}
