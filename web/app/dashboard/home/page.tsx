"use client";

import * as React from "react";
import { getMe } from "@/lib/meApi";

export default function DashboardHomeRouter() {
  React.useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        const role = me.user.role ?? "USER";

        if (role === "UNIVERSITY" || role === "ADMIN") {
          window.location.href = "/dashboard/university";
          return;
        }

        window.location.href = "/dashboard";
      } catch {
        window.location.href = "/login";
      }
    })();
  }, []);

  return <div className="p-6 text-sm opacity-70">Routing…</div>;
}
