"use client";

import { iso2ToTravelDestination } from "@/lib/travelDestination";
import { useEffect, useMemo, useState } from "react";
import type { UserDocument } from "@/lib/documents/types";
import { readDismissedAlerts, writeDismissedAlerts } from "@/lib/documents/alerts";
import type { DismissedAlertsMap } from "@/lib/documents/alerts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

function scPersistStayBucket(bucket: string) {
// removed: NextStepsCard should not write activeProjectStayBucket
}
function scReadStayBucket(): string | null {
  try { return localStorage.getItem("activeProjectStayBucket"); } catch { return null; }
}


import { fetchUserDocumentsWith, documentsTypeSet } from "@/lib/documents/api";
import { isChecklistItemDone, isChecklistItemAutoDone } from "@/lib/dashboard/checklistDone";
import type { ChecklistItemId } from "@/lib/dashboard/checklistMapping";


import { toResData, toResOnly, errMsg, type AuthFetchLike } from "@/lib/http/res";
import { ALERT_SOON_DAYS, ALERT_URGENT_DAYS, DISMISS_DEFAULT_DAYS, alertPillClass, daysUntil, fmtDate, isDismissed, todayISO, addDaysISODateOnly } from "@/lib/travel/alerts";
import { buildChecklist } from "@/lib/travel/checklist";
import { computeNextStep, type EntryResult, type NextStep, suggestedDateForCreate, mapCreateDocTypeToBackend } from "@/lib/travel/nextStep";


export function NextStepsCard({
  authFetch,
  refreshKey,
  onDocumentCreated,
}: {
  authFetch: AuthFetchLike;
  refreshKey: number;
  onDocumentCreated?: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [alertsCenterOpen, setAlertsCenterOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docExpires, setDocExpires] = useState("");

  // Manual completion map (fallback)
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>({});

  // 📄 Documents + Alerts (Step 3)
  const [docs, setDocs] = useState<UserDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsErr, setDocsErr] = useState<string | null>(null);
  const [docsRefreshKey, setDocsRefreshKey] = useState(0);

  // 🔕 Dismissed alerts (per doc, local-only)
  const [dismissedMap, setDismissedMap] = useState<DismissedAlertsMap>({});

  const [doneSourceMap, setDoneSourceMap] = useState<Record<string, "manual" | "created">>({});


  // Documents types fetched from API (drives auto-done)
  const [docTypes, setDocTypes] = useState<Set<string>>(new Set());

  const checklistKey = useMemo(() => {
    if (!mounted) return "checklist:pending";
    const dest = (() => {
      try {
        return (localStorage.getItem("activeProjectDestinationIso2") || "").toUpperCase();
      } catch {
        return "";
      }
    })();
    const passport = (() => {
      try {
        // Note: your code uses both activePassport and activeProjectPassportChoice in places.
        // We'll keep the one used by your requests engine.
        return (localStorage.getItem("activePassport") || "BEST").toUpperCase();
      } catch {
        return "BEST";
      }
    })();
    const purpose = (() => {
      try {
        return (localStorage.getItem("activeProjectPurpose") || "").toLowerCase();
      } catch {
        return "";
      }
    })();
    const stayBucket = (() => {
      try {
        return (localStorage.getItem("activeProjectStayBucket") || "SHORT").toUpperCase();
      } catch {
        return "SHORT";
      }
    })();
    return `checklist:v2:${dest}:${passport}:${purpose}:${stayBucket}`;
  }, [mounted, refreshKey]);

  useEffect(() => {
    setMounted(true);
  }, []);
  // Load dismissed alerts map (localStorage)
  useEffect(() => {
    if (!mounted) return;
    setDismissedMap(readDismissedAlerts());
  }, [mounted]);
useEffect(() => {
    if (!mounted) return;
    try {
      const raw = localStorage.getItem(checklistKey);
      const src = localStorage.getItem(checklistKey + ":source");
      setDoneMap(raw ? JSON.parse(raw) : {});
      setDoneSourceMap(src ? JSON.parse(src) : {});
    } catch {
      setDoneMap({});
      setDoneSourceMap({});
    }
  }, [mounted, checklistKey]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(checklistKey, JSON.stringify(doneMap));
      localStorage.setItem(checklistKey + ":source", JSON.stringify(doneSourceMap));
    } catch {}
  }, [mounted, checklistKey, doneMap, doneSourceMap]);

  function toggleDone(itemId: string) {
    setDoneSourceMap((prev) => ({ ...prev, [itemId]: "manual" }));

    setDoneMap((prev) => {
      const next = { ...prev, [itemId]: !prev[itemId] };
      try {
        localStorage.setItem(checklistKey, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  const [destIso2, setDestIso2] = useState<string>("FR");
  const [passportChoice, setPassportChoice] = useState<string>("BEST");
  const [stayDays, setStayDays] = useState<number>(0);

  useEffect(() => {
    try {
      const d = (localStorage.getItem("activeProjectDestinationIso2") || "FR").toString().trim().toUpperCase();
      const psp = (localStorage.getItem("activePassport") || "BEST").toString().trim().toUpperCase();

      const sIso = localStorage.getItem("activeProjectStartDate");
      const eIso = localStorage.getItem("activeProjectEndDate");
      const sd = sIso ? new Date(sIso) : null;
      const ed = eIso ? new Date(eIso) : null;

      let days = 0;
      if (sd && ed && !Number.isNaN(sd.getTime()) && !Number.isNaN(ed.getTime())) {
        const diff = Math.ceil((ed.getTime() - sd.getTime()) / (1000 * 60 * 60 * 24));
        days = Number.isFinite(diff) && diff > 0 ? diff : 0;
      }

      setDestIso2(d || "FR");
      setPassportChoice(psp || "BEST");
      setStayDays(days);
    } catch {
      // ignore
    }
  }, []);

  const [data, setData] = useState<EntryResult | null>(null);
  const [step, setStep] = useState<NextStep | null>(null);


  // Load user documents to compute upcoming expiry alerts
  useEffect(() => {
    const run = async () => {
      if (!mounted) return;
      try {
        setDocsLoading(true);
        setDocsErr(null);

        const r = await toResData(await authFetch("/api/v1/documents", { method: "GET" }));
        if (!r.res.ok) {
          const txt = errMsg(r.data, "");
          throw new Error(txt || `Failed to fetch documents (${r.res.status})`);
      }
        const json = r.data;
        const arr = Array.isArray(json) ? json : Array.isArray((json as any)?.items) ? (json as any).items : [];
        setDocs(arr as UserDocument[]);
      } catch (e: any) {
        setDocsErr(e?.message ?? "Failed to load documents");
        setDocs([]);
      } finally {
        setDocsLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, refreshKey, docsRefreshKey, authFetch]);

  const requiredDocsFromResult = Array.isArray((data as any)?.requiredDocuments)
    ? (((data as any).requiredDocuments as any[]) ?? [])
    : [];

  const baseChecklist = useMemo(() => {
    if (!mounted) return [];
    return buildChecklist({
      destinationIso2: destIso2,
      passportChoice,
      travelResult: data,
      stayDays,
    });
  }, [mounted, destIso2, passportChoice, data, stayDays]);

  const checklist = useMemo(() => {
    if (!mounted) return [];
    const _reqDocs = requiredDocsFromResult;
    if (!_reqDocs.length) return baseChecklist;

    const longStayItems = _reqDocs
    .map((d: any) => {
      const level = String(d?.level ?? "BLOCKING").toUpperCase();
const isInfo = level === "INFO";
      return {
        id: `reqdoc:${String(d?.id ?? d?.code ?? d?.title ?? d?.name ?? "doc")}`,
        title: String(d?.title ?? d?.name ?? "Required document"),
        detail: String(d?.detail ?? d?.description ?? "Add this document to your vault."),
        status: isInfo ? "INFO" : "TODO",
        urgency: isInfo ? "LOW" : "HIGH",
        canComplete: !isInfo,
        level,
      };
    })
    // BLOCKING first, INFO after
    .sort((a: any, b: any) => {
      const ai = a.level === "INFO" ? 1 : 0;
      const bi = b.level === "INFO" ? 1 : 0;
      if (ai === bi) return 0;
      return ai < bi ? -1 : 1;
    }) as any[];

    return ([...longStayItems, ...(baseChecklist as any)] as any);
  }, [mounted, baseChecklist, requiredDocsFromResult]);

  useEffect(() => {
    const run = async () => {
      if (!mounted) return;
      try {
        setLoading(true);
        setErr(null);

        let passportChoiceLocal = "BEST";
        try {
          passportChoiceLocal = (localStorage.getItem("activePassport") || "BEST").toString().trim().toUpperCase() || "BEST";
        } catch {}

        let destIso2Local = "FR";
        try {
          destIso2Local = (localStorage.getItem("activeProjectDestinationIso2") || "FR").toString().trim().toUpperCase();
        } catch {}

        const stayBucket = (() => {
          try {
            return localStorage.getItem("activeProjectStayBucket") || "SHORT";
          } catch {
            return "SHORT";
          }
        })();

        const travelPromise = authFetch(
          `/api/v1/requirements/travel?destination=${iso2ToTravelDestination(destIso2Local)}&passport=${encodeURIComponent(
            passportChoiceLocal
          )}&stayBucket=${encodeURIComponent(stayBucket)}`
        );

        const docsPromise = fetchUserDocumentsWith((p,i)=>toResOnly(authFetch,p,i));

        const [travelRes, docs] = await Promise.all([travelPromise, docsPromise]);

        // ✅ authFetch might already have read the body and returned { res, data }.
        // Always use toResData() so we never read the stream twice.
        const travel = await toResData(travelRes);

        if (!travel.res.ok) {
          throw new Error(errMsg(travel.data, `Failed (${travel.res.status})`));
        }

        const json = travel.data as EntryResult;
setData(json);
        setStep(computeNextStep(json, localStorage.getItem("activeProjectStayBucket") || "SHORT"));

        setDocTypes(documentsTypeSet(docs));
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load next steps");
        setData(null);
        setStep(null);
        setDocTypes(new Set());
      } finally {
        setLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authFetch, mounted, destIso2, passportChoice, stayDays, refreshKey]);  // Upcoming expiry alerts (computed from docs)
function isDismissed(id: string, dismissed: DismissedAlertsMap): boolean {
  return !!dismissed?.[id];
}


  const upcoming = useMemo(() => {
    const list = (docs ?? [])
      .map((d) => ({ doc: d, days: daysUntil(d.expiresAt) }))
      .filter((x) => typeof x.days === "number" && (x.days as number) >= 0) as { doc: UserDocument; days: number }[];
    list.sort((a, b) => a.days - b.days);
    return list;
  }, [docs]);

  const expiringSoon = useMemo(() => upcoming.filter((x) => x.days <= ALERT_SOON_DAYS && !isDismissed(x.doc.id, dismissedMap)), [upcoming, dismissedMap]);
  const expiringUrgent = useMemo(() => upcoming.filter((x) => x.days <= ALERT_URGENT_DAYS && !isDismissed(x.doc.id, dismissedMap)), [upcoming, dismissedMap]);

  const renewalStep: NextStep | null = useMemo(() => {
    if (!expiringSoon.length) return null;
    const top = expiringSoon[0];
    return {
      title: `Renew "${top.doc.title}"`,
      detail: `This document expires in ${top.days} day(s) (${fmtDate(top.doc.expiresAt)}). Update it in your Document vault.`,
      urgency: top.days <= 7 ? "HIGH" : "MEDIUM",
    };
  }, [expiringSoon]);

  const displayStep = renewalStep ?? step;


  const urgencyLabel =
    displayStep?.urgency === "HIGH" ? "High" :
    displayStep?.urgency === "MEDIUM" ? "Medium" :
    displayStep?.urgency === "LOW" ? "Low" :
    "Info";
      // Helper: compute "done" with auto-done for known checklist ids, else fallback manual
      const resolvedDone = (itemId: string): boolean => {
        const id = itemId as ChecklistItemId;
        // only apply auto-done for ids we map (eta/esta/visa/...)); otherwise fallback to doneMap
        if (itemId === "eta" || itemId === "esta" || itemId === "visa" || itemId === "study_permit" || itemId === "biometrics" || itemId === "medical_exam" || itemId === "letter_of_acceptance") {
          return isChecklistItemDone(id, docTypes, doneMap);
        }
        return !!doneMap?.[itemId];
      };
    
      const resolvedAutoDone = (itemId: string): boolean => {
        const id = itemId as ChecklistItemId;
        if (itemId === "eta" || itemId === "esta" || itemId === "visa" || itemId === "study_permit" || itemId === "biometrics" || itemId === "medical_exam" || itemId === "letter_of_acceptance") {
          return isChecklistItemAutoDone(id, docTypes);
        }
        return false;
      };


  const canCreate = !!displayStep && !(displayStep?.createDoc?.type && resolvedDone(displayStep.createDoc.type.toLowerCase()));

  const openCreateModal = () => {
    setErr(null);
    if (displayStep?.createDoc?.type && resolvedDone(displayStep.createDoc.type.toLowerCase())) {
      return;
    }
    setDocTitle(step?.createDoc?.title ?? "");
    setDocExpires(suggestedDateForCreate(displayStep?.createDoc?.type));
    setCreateOpen(true);
  };

  const confirmCreate = async () => {
    try {
      if (!step?.createDoc?.type) {
        setErr("No document type inferred for this step.");
        return;
      }
      if (!docTitle.trim()) {
        setErr("Please enter a title.");
        return;
      }
      if (!docExpires.trim()) {
        setErr("Please enter an expiration/deadline date.");
        return;
      }

      setCreating(true);
      setErr(null);

      const r = await toResData(await authFetch("/api/v1/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: docTitle.trim(),
          type: mapCreateDocTypeToBackend(step.createDoc.type),
          expiresAt: docExpires.trim(),
        }),
      }));
      if (!r.res.ok) {
        const txt = errMsg(r.data, '');
        throw new Error(txt || ("Failed (" + String(r.res.status) + ")"));
      }

      // Refresh docs types so checklist auto-updates immediately
      try {
        const docs = await fetchUserDocumentsWith((p,i)=>toResOnly(authFetch,p,i));
        setDocTypes(documentsTypeSet(docs));
      } catch {}

      setDocTitle("");
      setDocExpires("");
      setCreateOpen(false);
      setDocsRefreshKey((x) => x + 1);

      // Mark corresponding checklist item as done (created via StudyComply)
      if (step?.createDoc?.type) {
        const id = step.createDoc.type.toLowerCase();
        setDoneMap((prev) => ({ ...prev, [id]: true }));
        setDoneSourceMap((prev) => ({ ...prev, [id]: "created" }));
      }

      onDocumentCreated?.();
    } catch (e: any) {
      setErr((e && (e.message || e.toString()) || "Failed to create document"));
    } finally {
      setCreating(false);
    }
  };
  // Persist dismissed alerts map
  useEffect(() => {
    if (!mounted) return;
    try {
      writeDismissedAlerts(dismissedMap);
    } catch {}
  }, [mounted, dismissedMap]);

  function dismissAlert(docId: string, days: number) {
    const until = addDaysISODateOnly(days);
    setDismissedMap((prev) => ({ ...prev, [docId]: true }));
  }

  function undoDismiss(docId: string) {
    setDismissedMap((prev) => {
      const next = { ...(prev || {}) };
      delete next[docId];
      return next;
    });
  }


  
  // SC_CHECKLIST_INFO_UI_V3 — separate blocking vs info items for display (must be in component scope)
  const visibleChecklist = useMemo(() => {
    return (checklist ?? []).filter((it: any) => it?.id !== "passport" && it?.id !== "destination");
  }, [checklist]);

  const isInfoItem = (it: any) => {
    // INFO if:
    // - base checklist uses `status: "INFO"`
    // - requiredDocuments uses `level: "INFO"`
    // - future-proof: required === false
    return it?.status === "INFO" || it?.level === "INFO" || it?.required === false;
  };

  const blockingChecklist = useMemo(() => {
    return (visibleChecklist ?? []).filter((it: any) => !isInfoItem(it));
  }, [visibleChecklist]);

  const infoChecklist = useMemo(() => {
    return (visibleChecklist ?? []).filter((it: any) => isInfoItem(it));
  }, [visibleChecklist]);

  function pillClass(u: NextStep["urgency"]) {
    if (u === "HIGH") return "bg-red-50 text-red-700 border-red-200";
    if (u === "MEDIUM") return "bg-amber-50 text-amber-700 border-amber-200";
    if (u === "LOW") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  }



return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">What you need next</h2>
          <p className="text-sm text-gray-600">Based on your selected passport and destination rules.</p>
        
      {expiringSoon.length > 0 && (
        <div className="mt-4 rounded-2xl border bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium">⚠️ {expiringSoon.length} document(s) expiring within {ALERT_SOON_DAYS} days</p>
              <p className="mt-1 text-sm text-gray-700">
                Next: <span className="font-medium">{expiringSoon[0].doc.title}</span> —{" "}
                <span className={"inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium " + alertPillClass(expiringSoon[0].days)}>
                  {expiringSoon[0].days} days
                </span>
              </p>
              <p className="mt-1 text-xs text-gray-500">Update it in your Document vault below.</p>
            </div>
            <span className={"inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium " + alertPillClass(expiringSoon[0].days)}>
              {expiringSoon[0].days <= ALERT_URGENT_DAYS ? "Urgent" : "Soon"}
            </span>
          </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => dismissAlert(expiringSoon[0].doc.id, DISMISS_DEFAULT_DAYS)}
                className="rounded-xl border px-3 py-2 text-xs hover:bg-gray-50"
              >
                Dismiss 7d
              </button>
              <button
                type="button"
                onClick={() => undoDismiss(expiringSoon[0].doc.id)}
                className="rounded-xl border px-3 py-2 text-xs hover:bg-gray-50"
              >
                Undo
              </button>
            </div>
        </div>
      )}


</div>

        {displayStep ? (
          <div className="flex items-center gap-2">
            <span className={"inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium " + pillClass(displayStep.urgency)}>
              {urgencyLabel}
            </span>

            <button
              type="button"
              onClick={() => setAlertsCenterOpen(true)}
              className="inline-flex items-center rounded-xl border px-3 py-1 text-xs font-medium hover:bg-gray-50"
            >
              View alerts
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAlertsCenterOpen(true)}
            className="inline-flex items-center rounded-xl border px-3 py-1 text-xs font-medium hover:bg-gray-50"
          >
            View alerts
          </button>
        )}
      </div>

      {loading ? (
        <p className="mt-3 text-sm text-gray-600">Loading…</p>
      ) : err ? (
        <p className="mt-3 text-sm text-red-700">{err}</p>
      ) : !displayStep ? (
        <p className="mt-3 text-sm text-gray-600">No data.</p>
      ) : (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">{displayStep.title}</p>
          <p className="text-sm text-gray-700">{displayStep.detail}</p>

          {!renewalStep && data ? (
            <p className="text-xs text-gray-500">
              Based on passport: <span className="font-mono">{data.basedOn}</span>
            </p>
          ) : null}

          <button
            onClick={openCreateModal}
            disabled={!canCreate}
            className="mt-3 inline-flex rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-60"
          >
            {displayStep?.ctaLabel ?? "Create document"}
          </button>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
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
                Tip: we suggest a date based on the document type (and your project dates if available).
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
              onClick={() => setCreateOpen(false)}
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


      {/* Alerts Center (Step 6) */}
      <Dialog open={alertsCenterOpen} onOpenChange={setAlertsCenterOpen}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Alerts</DialogTitle>
            <DialogDescription>
              Upcoming expirations from your document vault. You can dismiss alerts temporarily.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-4">
            <div className="rounded-2xl border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">
                    Active alerts (≤ {ALERT_SOON_DAYS} days)
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Urgent: ≤ {ALERT_URGENT_DAYS} days. Dismiss hides alerts until the chosen date.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {expiringUrgent.length > 0 ? (
                    <span className="inline-flex items-center rounded-full border bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                      {expiringUrgent.length} urgent
                    </span>
                  ) : null}
                  {expiringSoon.length > 0 ? (
                    <span className={"inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium " + alertPillClass(expiringSoon[0].days)}>
                      {expiringSoon.length} soon
                    </span>
                  ) : null}
                </div>
              </div>

              {docsLoading ? (
                <p className="mt-3 text-sm text-gray-600">Loading documents…</p>
              ) : docsErr ? (
                <p className="mt-3 text-sm text-red-700">{docsErr}</p>
              ) : expiringSoon.length === 0 ? (
                <p className="mt-3 text-sm text-gray-700">No active alerts right now.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {expiringSoon.slice(0, 20).map((x) => (
                    <li key={x.doc.id} className="flex items-center justify-between gap-3 rounded-xl border bg-gray-50 p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{x.doc.title}</p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          Expires: {fmtDate(x.doc.expiresAt)}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span className={"inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium " + alertPillClass(x.days)}>
                          {x.days} days
                        </span>

                        <button
                          type="button"
                          onClick={() => dismissAlert(x.doc.id, DISMISS_DEFAULT_DAYS)}
                          className="rounded-xl border px-3 py-2 text-xs hover:bg-gray-50"
                        >
                          Dismiss {DISMISS_DEFAULT_DAYS}d
                        </button>

                        <button
                          type="button"
                          onClick={() => undoDismiss(x.doc.id)}
                          className="rounded-xl border px-3 py-2 text-xs hover:bg-gray-50"
                        >
                          Undo
                        </button>
                      </div>
                    </li>
                  ))}                </ul>
              )}
            </div>

            <div className="rounded-2xl border bg-white p-4">
              <p className="text-sm font-medium">Dismissed</p>
              <p className="mt-1 text-xs text-gray-500">
                These alerts are hidden until their dismiss-until date.
              </p>

              {Object.keys(dismissedMap || {}).length === 0 ? (
                <p className="mt-3 text-sm text-gray-700">No dismissed alerts.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {Object.entries(dismissedMap).slice(0, 30).map(([docId, until]) => (
                    <li key={docId} className="flex items-center justify-between gap-3 rounded-xl border bg-gray-50 p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{docId}</p>
                        <p className="mt-0.5 text-xs text-gray-500">Dismissed until: {until}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => undoDismiss(docId)}
                        className="rounded-xl border px-3 py-2 text-xs hover:bg-gray-50"
                      >
                        Undo
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setAlertsCenterOpen(false)}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {mounted && checklist.length > 0 && (
        <details className="mt-4 rounded-2xl border bg-white p-5">
          <summary className="cursor-pointer select-none text-sm font-medium">
            Your checklist
            <span className="ml-2 text-sm font-normal text-gray-600">(click to expand)</span>
          </summary>

          <div className="mt-4">

            {(expiringSoon.length > 0 || docsLoading || docsErr) && (
              <div className="rounded-2xl border bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Upcoming expirations</p>
                    <p className="mt-1 text-xs text-gray-500">We highlight documents expiring soon. No auto-uncheck.</p>
                  </div>
                  {expiringUrgent.length > 0 ? (
                    <span className="inline-flex items-center rounded-full border bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                      {expiringUrgent.length} urgent
                    </span>
                  ) : null}
                </div>

                {docsLoading ? (
                  <p className="mt-2 text-sm text-gray-600">Loading documents…</p>
                ) : docsErr ? (
                  <p className="mt-2 text-sm text-red-700">{docsErr}</p>
                ) : expiringSoon.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-600">No upcoming expirations within 30 days.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {expiringSoon.slice(0, 3).map((x) => (
                      <li key={x.doc.id} className="flex items-center justify-between gap-3 rounded-xl border bg-gray-50 p-3">
                        <div>
                          <p className="text-sm font-medium">{x.doc.title}</p>
                          <p className="text-xs text-gray-500">Expires: {fmtDate(x.doc.expiresAt)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                        <span className={"inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium " + alertPillClass(x.days)}>
                          {x.days} days
                        </span>
                        {isDismissed(x.doc.id, dismissedMap) ? (
                          <button
                            type="button"
                            onClick={() => undoDismiss(x.doc.id)}
                            className="rounded-xl border px-3 py-2 text-xs hover:bg-gray-50"
                          >
                            Undo
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => dismissAlert(x.doc.id, DISMISS_DEFAULT_DAYS)}
                            className="rounded-xl border px-3 py-2 text-xs hover:bg-gray-50"
                          >
                            Dismiss 7d
                          </button>
                        )}
                      </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}


            <ul className="mt-4 space-y-3">


            {/* BLOCKING (required) */}
            {blockingChecklist.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Required before travel
                </p>
              </div>
            )}

            {blockingChecklist.map((it: any) => (
              <li key={it.id} className={`rounded-xl border bg-gray-50 p-4 ${doneMap[it.id] ? "opacity-70" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${doneMap[it.id] ? "line-through" : ""}`}>{it.title}</p>
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium bg-red-50 text-red-700 border-red-200">
                        Required
                      </span>
                    </div>
                    <p className={`mt-1 text-sm text-gray-600 ${doneMap[it.id] ? "line-through" : ""}`} suppressHydrationWarning>
                      {it.detail}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleDone(it.id)}
                    className={`shrink-0 rounded-lg border px-3 py-1 text-xs font-medium ${doneMap[it.id] ? "bg-white" : "bg-black text-white"}`}
                  >
                    {doneMap[it.id] ? "Undo" : "Done"}
                  </button>
                </div>
              </li>
            ))}

            {/* INFO (non-blocking) */}
            {infoChecklist.length > 0 && (
              <div className="mt-6 mb-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Additional info
                </p>
              </div>
            )}

            {infoChecklist.map((it: any) => (
              <li key={it.id} className={`rounded-xl border bg-gray-50 p-4 ${doneMap[it.id] ? "opacity-70" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${doneMap[it.id] ? "line-through" : ""}`}>{it.title}</p>
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium bg-blue-50 text-blue-700 border-blue-200">
                        Info
                      </span>
                    </div>
                    <p className={`mt-1 text-sm text-gray-600 ${doneMap[it.id] ? "line-through" : ""}`} suppressHydrationWarning>
                      {it.detail}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleDone(it.id)}
                    className={`shrink-0 rounded-lg border px-3 py-1 text-xs font-medium ${doneMap[it.id] ? "bg-white" : "bg-black text-white"}`}
                  >
                    {doneMap[it.id] ? "Undo" : "Done"}
                  </button>
                </div>
              </li>
            ))}


</ul>
          </div>
        </details>
      )}
    </div>
  );
}
