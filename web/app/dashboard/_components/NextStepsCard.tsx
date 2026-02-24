"use client";

type Props = {
  onQuickCreate?: (args: { title: string; type: string; expiresAt: string }) => void;
  refreshKey?: number;
};

export function NextStepsCard({ onQuickCreate, refreshKey }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Next steps</h2>
          <p className="mt-1 text-sm text-slate-600">
            Requirements / checklist module (temporarily disabled).
          </p>
        </div>
        {onQuickCreate ? (
          <button
            type="button"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
            onClick={() =>
              onQuickCreate({
                title: "Visa / Permit",
                type: "visa",
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .slice(0, 10),
              })
            }
          >
            + Quick add
          </button>
        ) : null}
      </div>
    </div>
  );
}
