"use client";

import * as React from "react";
import { getUniversityRequirements, type UniversityRequirement } from "@/lib/universitiesApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatDate(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "2-digit" });
}

type Props = {
  slug?: string;
  stayMode?: "SHORT" | "LONG" | "ANY";
  projectStart?: string; // ISO
};

export function UniversityRequirementsCard({ slug, stayMode = "ANY", projectStart }: Props) {
  const [items, setItems] = React.useState<UniversityRequirement[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!slug) {
        setItems([]);
        setErr(null);
        return;
      }

      setLoading(true);
      setErr(null);
      try {
        const res = await getUniversityRequirements({ slug, stayMode, projectStart });
        if (!cancelled) setItems(res);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Failed to load requirements");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [slug, stayMode, projectStart]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>University requirements</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {!slug && <div className="text-sm opacity-70">Select a university to see its checklist.</div>}

        {loading && <div className="text-sm">Loading…</div>}
        {err && <div className="text-sm text-red-600">{err}</div>}

        {!!slug && !loading && !err && items.length === 0 && (
          <div className="text-sm opacity-70">No requirements found.</div>
        )}

        {items.map((r) => {
          const due = formatDate(r.computedDueDate ?? r.dueDate);
          return (
            <div key={r.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{r.title}</div>
                  {r.description && <div className="text-sm opacity-80 mt-1">{r.description}</div>}
                  <div className="text-xs opacity-70 mt-2">
                    {r.kind} • {r.priority} • stay: {r.stayMode}
                  </div>
                </div>

                <div className="text-right text-sm">
                  {due ? (
                    <>
                      <div className="font-medium">Due</div>
                      <div>{due}</div>
                    </>
                  ) : (
                    <div className="opacity-70">No due date</div>
                  )}
                </div>
              </div>

              {(r.ctaUrl || r.ctaLabel) && (
                <div className="mt-2">
                  <a className="text-sm underline" href={r.ctaUrl ?? "#"} target="_blank" rel="noreferrer">
                    {r.ctaLabel ?? "Open link"}
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
