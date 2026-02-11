"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/authFetch";

type MeResponse = { user: { id: string; email: string } };

export default function UniversityDashboardPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("...");
  const [loading, setLoading] = React.useState(true);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">University Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          {loading ? "Loading…" : <>Logged in as <span className="font-medium">{email}</span></>}
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-5">
        <h2 className="text-lg font-semibold">Requirements management</h2>
        <p className="mt-1 text-sm text-gray-600">
          Go to <a className="underline" href="/university/requirements">Requirements</a> to create/update university rules.
        </p>
      </div>
    </div>
  );
}
