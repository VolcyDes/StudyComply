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

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-3xl shadow-lg">
          🎓
        </div>
        <div className="space-y-1">
          <p className="text-lg font-semibold text-gray-900">Redirection en cours…</p>
          <p className="text-sm text-gray-500">On te redirige vers ton espace.</p>
        </div>
        <div className="flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-2 w-2 animate-bounce rounded-full bg-indigo-500"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
