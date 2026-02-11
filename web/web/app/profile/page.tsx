"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/authFetch";
import PassportsSection from "@/app/dashboard/_components/PassportsSection";
import { API_BASE_URL } from "@/lib/config"; // si ton chemin est différent, garde ton import actuel

type MeResponse = {
  user: {
    id: string;
    email: string;
    role?: "USER" | "UNIVERSITY" | "ADMIN";
    universityId?: string | null;
    createdAt: string;
    updatedAt: string;
  };
};

function UniversityProfile({ me }: { me: MeResponse["user"] }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">University profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your university account and requirements.
        </p>

        <div className="mt-4 rounded-2xl border bg-white p-5 space-y-2">
          <p className="text-sm">
            Logged in as <span className="font-medium">{me.email}</span>
          </p>
          <p className="text-xs text-gray-600">
            Role: <span className="font-mono">{me.role ?? "UNIVERSITY"}</span>
          </p>
          <p className="text-xs text-gray-600">
            University ID: <span className="font-mono">{me.universityId ?? "—"}</span>
          </p>

          <div className="pt-3 flex gap-2 flex-wrap">
            <a
              href="/dashboard/university"
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Open university dashboard
            </a>

            <a
              href="/dashboard/university"
              className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Manage requirements
            </a>
          </div>

          <p className="pt-2 text-xs text-gray-500">
            University accounts don’t manage passports here (students do).
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        API: <span className="font-mono">{API_BASE_URL}</span>
      </p>
    </div>
  );
}

function StudentProfile() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your passports — we’ll use them to compute what you need for a study mobility.
        </p>
      </div>

      <PassportsSection authFetch={authFetch} />

      <p className="text-xs text-gray-500">
        API: <span className="font-mono">{API_BASE_URL}</span>
      </p>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [me, setMe] = React.useState<MeResponse["user"] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const r = await authFetch("/api/v1/me");
        if (!r.res.ok) throw new Error((r.data as any)?.message ?? "Failed to load profile");

        if (mounted) setMe((r.data as MeResponse).user);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading) return <div className="text-sm text-gray-600">Loading...</div>;
  if (error) return <div className="text-sm text-red-700">{error}</div>;
  if (!me) return <div className="text-sm text-gray-600">No user.</div>;

  if (me.role === "UNIVERSITY") {
    return <UniversityProfile me={me} />;
  }

  return <StudentProfile />;
}
