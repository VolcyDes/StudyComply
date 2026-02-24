"use client";

import { useEffect, useMemo, useState } from "react";

type RequirementItem = {
  requiredType?: string | null;
  title?: string | null;
  notes?: string | null;
};

type ApiRequirements = {
  missing?: string[] | null;
  required?: RequirementItem[] | null;
  messages?: string[] | null;
};

type Props = {authFetch: (path: string, init?: RequestInit) => Promise<Response>;
  onQuickCreateDocument: (args: { title: string; type: string; expiresAt: string }) => Promise<any>;
  refreshKey: number;
};

function asArray<T>(v: T[] | T | null | undefined): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function addDaysIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export default function RequirementsSection({ authFetch, onQuickCreateDocument, refreshKey }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiRequirements>({});

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await authFetch("/api/v1/requirements");
        const txt = await res.text();
        if (!res.ok) throw new Error(txt || `Failed to load requirements (${res.status})`);
        const json = txt ? JSON.parse(txt) : {};
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load requirements");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [authFetch, refreshKey]);

  const missingList = useMemo(() => asArray(data.missing).filter(Boolean), [data.missing]);
  const requiredList = useMemo(() => asArray(data.required), [data.required]);
  const messagesList = useMemo(() => asArray(data.messages).filter(Boolean), [data.messages]);

  async function quickCreate(r: RequirementItem) {
    const title = (r.title || r.requiredType || "Required document").trim();
    const type = (r.requiredType || "other").trim();
    const expiresAt = addDaysIso(365);
    await onQuickCreateDocument({ title, type, expiresAt });
  }

  return (
    <div className="rounded-2xl border p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Requirements</h2>
        <span className="text-xs text-gray-500">Based on your passports + destination</span>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-gray-600">Loading requirements...</p>
      ) : error ? (
        <p className="mt-4 text-sm text-red-700">{error}</p>
      ) : (
        <div className="mt-4 space-y-4">
          {messagesList.length > 0 && (
            <div className="rounded-2xl border bg-white p-4">
              <p className="text-sm font-medium">Notes</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                {messagesList.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm font-medium">Missing documents</p>
            {missingList.length === 0 ? (
              <p className="mt-1 text-sm text-gray-600">No missing document detected.</p>
            ) : (
              <p className="mt-1 text-sm text-gray-700">{missingList.join(", ")}</p>
            )}
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm font-medium">What you may need</p>

            {requiredList.length === 0 ? (
              <p className="mt-1 text-sm text-gray-600">
                Add your passports and a destination to see requirements.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {requiredList.map((r, idx) => (
                  <li key={idx} className="rounded-xl border bg-white p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {r.title || r.requiredType || "Document"}
                        </p>
                        {r.requiredType && (
                          <p className="mt-1 text-xs text-gray-500">Type: {r.requiredType}</p>
                        )}
                        {r.notes && <p className="mt-2 text-sm text-gray-700">{r.notes}</p>}
                      </div>

                      <button
                        type="button"
                        onClick={() => quickCreate(r)}
                        className="shrink-0 rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                        title="Create a placeholder document"
                      >
                        Create doc
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
