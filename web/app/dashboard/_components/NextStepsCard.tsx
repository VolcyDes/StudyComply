"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

type EntryResult =
  | { destination: "SCHENGEN"; status: "FREE"; basedOn: string; message: string }
  | {
      destination: "SCHENGEN";
      status: "VISA_FREE";
      basedOn: string;
      maxStayDays: number;
      periodDays: number;
      etiasRequired: boolean;
      message: string;
    }
  | { destination: "SCHENGEN"; status: "VISA_REQUIRED"; basedOn: string; message: string };

type NextStep = {
  title: string;
  detail: string;
  urgency: "LOW" | "MEDIUM" | "HIGH";
  createDoc?: { title: string; type: string };
  ctaLabel?: string;
};

function pillClass(u: NextStep["urgency"]) {
  switch (u) {
    case "HIGH":
      return "bg-red-100 text-red-800 border-red-200";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "LOW":
      return "bg-green-100 text-green-800 border-green-200";
  }
}

function computeNextStep(res: EntryResult): NextStep {
  if (res.status === "FREE") {
    return {
      title: "Nothing urgent",
      detail: "You have free movement for short stays in Schengen.",
      urgency: "LOW",
    };
  }

  if (res.status === "VISA_REQUIRED") {
    return {
      title: "Start your visa application",
      detail: "A Schengen visa is required for your passport. Begin the application process as soon as possible.",
      urgency: "HIGH",
      createDoc: { title: "Schengen visa", type: "visa" },
      ctaLabel: "Create visa document",
    };
  }

  // VISA_FREE
  if (res.etiasRequired) {
    return {
      title: "Apply for ETIAS",
      detail: "You can travel visa-free for short stays, but ETIAS will be required before travel.",
      urgency: "MEDIUM",
      createDoc: { title: "ETIAS", type: "visa" },
      ctaLabel: "Create ETIAS document",
    };
  }

  return {
    title: "No additional authorization needed",
    detail: "You can travel visa-free for short stays in Schengen.",
    urgency: "LOW",
  };
}

function isoToDateInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function suggestedExpiryDate(): string {
  // Suggest: project start date if available
  try {
    const s = localStorage.getItem("activeProjectStartDate");
    const v = isoToDateInput(s);
    if (v) return v;
  } catch {}
  return "";
}

export function NextStepsCard({
  authFetch,
  refreshKey,
  onDocumentCreated,
}: {
  authFetch: (path: string, init?: RequestInit) => Promise<Response>;
  refreshKey: number;
  onDocumentCreated?: () => void;
}) {
  const [data, setData] = useState<EntryResult | null>(null);
  const [step, setStep] = useState<NextStep | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docExpires, setDocExpires] = useState(""); // yyyy-mm-dd
  const [creating, setCreating] = useState(false);

  const canCreate = Boolean(step?.createDoc);

  const urgencyLabel = useMemo(() => {
    if (!step) return "";
    return step.urgency === "HIGH" ? "High priority" : step.urgency === "MEDIUM" ? "Recommended" : "All good";
  }, [step]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setErr(null);

        let passportChoice = "BEST";
        try {
          passportChoice =
            (localStorage.getItem("activePassport") || "BEST").toString().trim().toUpperCase() || "BEST";
        } catch {}

        const res = await authFetch(
          `/api/v1/requirements/travel?destination=SCHENGEN&passport=${encodeURIComponent(passportChoice)}`
        );

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `Failed (${res.status})`);
        }

        const json = (await res.json()) as EntryResult;
        setData(json);
        setStep(computeNextStep(json));
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load next steps");
        setData(null);
        setStep(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [refreshKey, authFetch]);

  function openCreateModal() {
    if (!step?.createDoc) return;
    setDocTitle(step.createDoc.title);
    setDocExpires(suggestedExpiryDate());
    setOpen(true);
  }

  async function confirmCreate() {
    if (!step?.createDoc) return;

    if (!docExpires) {
      alert("Please set an expiration date (or a target deadline).");
      return;
    }

    setCreating(true);
    try {
      const expiresAt = new Date(docExpires + "T00:00:00.000Z").toISOString();

      const res = await authFetch("/api/v1/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: docTitle || step.createDoc.title,
          type: step.createDoc.type,
          expiresAt,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      setOpen(false);
      onDocumentCreated?.();
    } catch (e: any) {
      alert(e?.message ?? "Failed to create document");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">What you need next</h2>
          <p className="text-sm text-gray-600">Based on your selected passport and Schengen rules.</p>
        </div>

        {step ? (
          <span className={"inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium " + pillClass(step.urgency)}>
            {urgencyLabel}
          </span>
        ) : null}
      </div>

      {loading ? (
        <p className="mt-3 text-sm text-gray-600">Loading…</p>
      ) : err ? (
        <p className="mt-3 text-sm text-red-700">{err}</p>
      ) : !step || !data ? (
        <p className="mt-3 text-sm text-gray-600">No data.</p>
      ) : (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">{step.title}</p>
          <p className="text-sm text-gray-700">{step.detail}</p>

          <p className="text-xs text-gray-500">
            Based on passport: <span className="font-mono">{data.basedOn}</span>
          </p>

          {canCreate ? (
            <button
              onClick={openCreateModal}
              className="mt-3 inline-flex rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-60"
            >
              {step.ctaLabel ?? "Create document"}
            </button>
          ) : null}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Create a document</DialogTitle>
            <DialogDescription>
              Add it to your documents list so you can track it. Choose a realistic deadline/expiry.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 grid gap-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="ETIAS"
              />
              <p className="mt-1 text-xs text-gray-500">You can rename it (ex: “Schengen visa appointment”).</p>
            </div>

            <div>
              <label className="text-sm font-medium">Expiration / deadline</label>
              <input
                type="date"
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={docExpires}
                onChange={(e) => setDocExpires(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                Tip: we suggest your project start date if available.
              </p>
            </div>

            <div className="rounded-xl border bg-gray-50 p-3 text-sm text-gray-700">
              <p className="font-medium">Suggested info</p>
              <ul className="mt-2 list-disc pl-5 text-sm">
                <li>If you don’t know the expiry yet, use the date you must have it ready by.</li>
                <li>Later we can auto-fill based on official rules (ETIAS/visa processing times).</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setOpen(false)}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
              disabled={creating}
            >
              Cancel
            </button>
            <button
              onClick={confirmCreate}
              disabled={creating}
              className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-60"
            >
              {creating ? "Creating…" : "Create"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
