"use client";

type RequirementItem = {
  requiredType?: string | null;
  title?: string | null;
  notes?: string | null;
};

type Props = {
  loading: boolean;
  error: string | null;

  // what the API returns can evolve; we keep it tolerant:
  missing?: string[] | null;
  required?: RequirementItem[] | null;

  // optional extra fields you might already have
  messages?: string[] | null;
};

function asArray<T>(v: T[] | T | null | undefined): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function safeJoin(v: string[] | string | null | undefined, sep = ", ") {
  return asArray(v).filter(Boolean as any).join(sep);
}

export default function RequirementsSection({
  loading,
  error,
  missing,
  required,
  messages,
}: Props) {
  const missingList = asArray(missing).filter(Boolean);
  const requiredList = asArray(required);

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
          {/* Missing */}
          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm font-medium">Missing documents</p>

            {missingList.length === 0 ? (
              <p className="mt-1 text-sm text-gray-600">No missing document detected.</p>
            ) : (
              <p className="mt-1 text-sm text-gray-700">
                {missingList.join(", ")}
              </p>
            )}
          </div>

          {/* Required list */}
          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm font-medium">What you may need</p>

            {requiredList.length === 0 ? (
              <p className="mt-1 text-sm text-gray-600">
                Add your passports and a destination to see requirements.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {requiredList.map((r, idx) => (
                  <li key={idx} className="rounded-xl border p-3">
                    <p className="text-sm font-medium">
                      {r.title || r.requiredType || "Requirement"}
                    </p>
                    {r.notes ? (
                      <p className="mt-1 text-xs text-gray-600">{r.notes}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Optional messages */}
          {asArray(messages).length > 0 ? (
            <div className="rounded-2xl border bg-white p-4">
              <p className="text-sm font-medium">Notes</p>
              <p className="mt-1 text-sm text-gray-700">{safeJoin(messages, " • ")}</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
