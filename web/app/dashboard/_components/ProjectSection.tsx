"use client";

import { useEffect, useState, useRef } from "react";
import { PassportCountryCombobox } from "@/components/passport/PassportCountryCombobox";

function scPersistStayBucket(bucket: string) {
  try { localStorage.setItem("activeProjectStayBucket", String(bucket)); } catch {}
}
function scReadStayBucket(): string | null {
  try { return localStorage.getItem("activeProjectStayBucket"); } catch { return null; }
}


function persistStayBucket(bucket: string) {
  try { localStorage.setItem("activeProjectStayBucket", String(bucket)); } catch {}
}
function readStayBucket(): string | null {
  try { return localStorage.getItem("activeProjectStayBucket"); } catch { return null; }
}


import { isSupportedDestinationIso2, iso2ToTravelDestination } from "@/lib/travelDestination";
import { stayDaysToBucket, stayBucketLabel } from "@/lib/stayBucket";
type ActiveProject = {
  id: string;
  destinationCountry: string;
  purpose: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

function isoToDateInput(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

function stayDaysFromInputs(start: string, end: string): number | null {
  if (!start || !end) return null;
  const a = new Date(start);
  const b = new Date(end);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
  const ms = b.getTime() - a.getTime();
  if (ms < 0) return null;
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

type StayMode = "SHORT" | "SEMESTER" | "YEAR" | "MULTIYEAR" | "CUSTOM";

export default function ProjectSection({
  authFetch,
  onChanged,
}: {
  authFetch: (path: string, init?: RequestInit) => Promise<Response>;
  onChanged?: () => void;
}) {
  const [loading, setLoading] = useState(true);
  
  const [mounted, setMounted] = useState(false);
const [countries, setCountries] = useState<{ code: string; name: string }[]>([]);

  const supportedCountries = (countries ?? [])
    .map((c: any) => ({
      code: String(c?.code ?? c?.iso2 ?? c?.id ?? "").toUpperCase(),
      name: String(c?.name ?? c?.label ?? c?.country ?? "")
    }))
    .filter((c: any) => c.code && c.name && isSupportedDestinationIso2(c.code));
  const [passports, setPassports] = useState<{ countryCode: string }[]>([]);
  const [passportChoice, setPassportChoice] = useState("BEST");
  const [active, setActive] = useState<ActiveProject | null>(null);

    const [destinationCountry, setDestinationCountry] = useState("DE");

  const destinationName =
    countries.find((c) => c.code === destinationCountry)?.name ||
    destinationCountry;

  const purposeLabel: Record<string, string> = {
    exchange: "Exchange program",
    internship: "Internship",
    degree: "Full degree",
    phd: "PhD / Research",
    language: "Language program",
  };
const [purpose, setPurpose] = useState("exchange");
  

  const CONTROL_CLASS = "mt-1 w-full h-10 rounded-xl border px-3 text-sm";

  const [stayMode, setStayMode] = useState("SHORT" as any);
  

  

  // STAY_RESTORE_EFFECT_HYDRATIONSAFE_V1
  const stayRestoreOnce = useRef(false);

  useEffect(() => {
    setMounted(true);
    if (stayRestoreOnce.current) return;
    stayRestoreOnce.current = true;

    try {
      const stored = localStorage.getItem("activeProjectStayBucket");
      if (stored) setStayMode(stored as any);
    } catch {}
  }, []);
const [customDatesOpen, setCustomDatesOpen] = useState(false);

  function addDays(dateInput: string, days: number): string {
    const d = new Date(dateInput + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function daysForStayMode(mode: StayMode): number | null {
    switch (mode) {
      case "SHORT": return 90;
      case "SEMESTER": return 180;
      case "YEAR": return 365;
      case "MULTIYEAR": return 365 * 4;
      case "CUSTOM": return null;
    }
  }

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");  const effectiveEndDate =
    stayMode === "CUSTOM"
      ? endDate
      : startDate
        ? addDays(startDate, daysForStayMode(stayMode) ?? 0)
        : endDate;

  const stayDays = stayDaysFromInputs(startDate, effectiveEndDate);
  const stayBucket = stayMode === "CUSTOM" ? stayDaysToBucket(stayDays) : (stayMode as any);
useEffect(() => {
  // RESTORE_STAY_BUCKET_ON_MOUNT_V7
    try { try { localStorage.setItem("activeProjectStayMode", stayMode); } catch {}
    localStorage.setItem("activeProjectStayBucket", stayBucket); } catch {}
  }, [stayMode, stayBucket]);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);

      // load countries for Destination combobox
      try {
        const rc = await authFetch("/api/v1/meta/countries");
        if (rc.ok) {
          const arr = await rc.json();
          if (Array.isArray(arr)) {
            setCountries(
              arr.map((c: any) => ({
                code: String(c?.code ?? c?.iso2 ?? c?.id ?? "").toUpperCase(),
                name: String(c?.name ?? c?.label ?? c?.country ?? "")
              })).filter((x: any) => x.code && x.name)
            );
          }
        }
      } catch {}
    try {
      // load passports for passport selector
      try {
        const rp = await authFetch("/api/v1/passports");
        if (rp.ok) {
          const pp = await rp.json();
          setPassports(pp);
        }
      } catch {}

      // restore passport choice
      try {
        const v = localStorage.getItem("activePassport") || "BEST";
        setPassportChoice(v.toString().trim().toUpperCase() || "BEST");
      } catch {}
      // restore stay mode
      try {
        const m = (localStorage.getItem("activeProjectStayMode") || "").toUpperCase();
        if (m === "SHORT" || m === "SEMESTER" || m === "YEAR" || m === "MULTIYEAR" || m === "CUSTOM") {
          if (m && m !== stayMode) setStayMode(m as any);
        }
      } catch {}
      const res = await authFetch("/api/v1/projects/active");
      if (res.status === 200) {
        const raw = await res.text();
      let data: any = null;
      try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }
        setActive(data ?? null);

        if (data) {
          setDestinationCountry(data.destinationCountry);
          setPurpose(data.purpose);
          setStartDate(isoToDateInput(data.startDate));
          setEndDate(isoToDateInput(data.endDate));
        }
      } else {
        setActive(null);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveProject(e: React.FormEvent) {
    e.preventDefault();

    const dc = destinationCountry.trim().toUpperCase();
    if (!dc) return;

    if (!startDate || !endDate) {
      alert("Please set start & end dates.");
      return;
    }

    setSaving(true);
    try {
      // MVP: always create a NEW active project (simpler)
      const res = await authFetch("/api/v1/projects/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationCountry: dc,
          purpose: purpose.trim().toLowerCase(),
          startDate,
          endDate,
          isActive: true,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      await load();
      onChanged?.();
          try {
        localStorage.setItem("activeProjectStartDate", String(startDate));
        localStorage.setItem("activeProjectEndDate", String(endDate));
      } catch {}
} catch (e: any) {
      alert(e?.message ?? "Failed to save project");
    } finally {
      setSaving(false);
    }
  }
  function onPassportChoice(v: string) {
    const next = (v || "BEST").toString().trim().toUpperCase();
    setPassportChoice(next);
    try { localStorage.setItem("activePassport", next); } catch {}
    onChanged?.();
  }


  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Active mobility project</h2>
        <button
          onClick={load}
          className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      <p className="mt-1 text-sm text-gray-600">
        Tell us where you&apos;re going and why. We&apos;ll compute your required documents.
      </p>

      
{loading ? (
  <p className="mt-4 text-sm text-gray-600">Loading active project...</p>
) : active ? (
  <div className="mt-4 rounded-xl border bg-gray-50 p-4 space-y-1">
    <p className="text-xs uppercase tracking-wide text-gray-500">
      Current project
    </p>
    <p className="text-sm font-medium">
      {destinationName}
    </p>
    <p className="text-sm text-gray-600">
      {purposeLabel[active.purpose] ?? active.purpose}
    </p>
    <p className="text-xs text-gray-500">
      {new Date(active.startDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} →{" "}
      {new Date(active.endDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
    </p>
          <p className="text-xs text-gray-500">
      Stay length: {stayMode === "CUSTOM" ? "Custom dates" : stayBucketLabel(stayBucket)}
    </p>
</div>
) : (
  <p className="mt-4 text-sm text-gray-600">No active project yet.</p>
)}


      <form onSubmit={saveProject} className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="md:col-span-1 min-w-0 space-y-1">
  <label className="text-sm font-medium">Destination</label>
<PassportCountryCombobox
  countries={supportedCountries}
  value={destinationCountry}
  onChange={(v) => {
    setDestinationCountry(v);
    try {       // FORCE_WRITE_STAY_BUCKET_V2
    // removed: do not overwrite activeProjectStayBucket from computed stayMode on reload
      // SC_FORCE_WRITE_STAY_BUCKET_ON_UPDATE_V1
    // removed: do not overwrite activeProjectStayBucket from computed stayMode on reload
localStorage.setItem("activeProjectDestinationIso2", (v || "").toString().toUpperCase()); } catch {}
  }}
  placeholder="Choose a destination…"
  triggerClassName="h-10 rounded-xl border px-3 text-sm"
/>
          <p className="mt-2 text-xs text-gray-500">Rules: {iso2ToTravelDestination(destinationCountry)}</p>

        </div>

        <div className="md:col-span-1 min-w-0 space-y-1">
          <label className="text-sm font-medium">Purpose</label>
          <select
            className={CONTROL_CLASS}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          >
            <option value="exchange">Exchange</option>
            <option value="internship">Internship</option>
            <option value="degree">Full degree</option>
            <option value="phd">PhD / Research</option>
            <option value="language">Language program</option>
          </select>
        </div>
        {/* Stay length */}
        <div className="md:col-span-1 min-w-0 space-y-1">
          <label className="text-sm font-medium">Stay length</label>
          <select
            className={CONTROL_CLASS}
            value={stayMode}
            onChange={(e) => {
              const v = e.target.value as any;
              setStayMode(v);
              try { localStorage.setItem("activeProjectStayBucket", String(v)); } catch {}
              if (v === "CUSTOM") setCustomDatesOpen(true);
              else setCustomDatesOpen(false);
            }}>
            <option value="SHORT">Short stay (≤ 90 days)</option>
            <option value="SEMESTER">Semester (~ 4–6 months)</option>
            <option value="YEAR">Academic year (~ 8–12 months)</option>
            <option value="MULTIYEAR">Multi-year (2+ years)</option>
            <option value="CUSTOM">Custom dates…</option>
          </select>
</div>
        
        {stayMode === "CUSTOM" ? (
          <>
            <div className="md:col-span-1 min-w-0 space-y-1">
              <label className="text-sm font-medium">Custom dates</label>
              <button
                type="button"
                className="h-10 w-full rounded-xl border px-3 text-sm text-left"
                onClick={() => setCustomDatesOpen(true)}
              >
                {startDate && endDate ? `${startDate} → ${endDate}` : "Set dates…"}
              </button>
              <p className="text-xs text-gray-500">Exact dates (opens a popup).</p>
            </div>

            <dialog
              open={customDatesOpen}
              className="rounded-2xl border p-0 w-[min(520px,92vw)]"
              onClose={() => setCustomDatesOpen(false)}
            >
              <div className="p-4 space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Set custom dates</p>
                  <p className="text-xs text-gray-500">
                    Provide exact dates for your mobility project.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Start date</label>
                    <input
                      type="date"
                      className={CONTROL_CLASS}
                      value={startDate}
                      onChange={(e) => {
                        const v = e.target.value;
                        setStartDate(v);
                        if (endDate && v && endDate < v) setEndDate(v);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">End date</label>
                    <input
                      type="date"
                      className={CONTROL_CLASS}
                      value={endDate}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (startDate && v < startDate) return;
                        setEndDate(v);
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    className="rounded-xl border px-4 py-2 text-sm"
                    onClick={() => setCustomDatesOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="rounded-xl bg-black px-4 py-2 text-sm text-white"
                    onClick={() => setCustomDatesOpen(false)}
                  >
                    Save dates
                  </button>
                </div>
              </div>
            </dialog>
          </>
        ) : (
          <div className="md:col-span-1 min-w-0 space-y-1">
            <label className="text-sm font-medium">Duration</label>
            <div className="h-10 w-full rounded-xl border px-3 text-sm flex items-center bg-gray-50">
              {!mounted ? "…" : (stayMode === "SHORT"
                ? "≤ 90 days"
                : stayMode === "SEMESTER"
                ? "~ 180 days (4–6 months)"
                : stayMode === "YEAR"
                ? "~ 365 days (8–12 months)"
                : "~ multi-year (2+ years)")}
            </div>
            <p className="text-xs text-gray-500">
              Choose “Custom dates…” if you want to enter exact dates.
            </p>
          </div>
        )}

{stayMode === "CUSTOM" && stayDays !== null && stayDays > 90 ? (
        <p className="text-xs text-amber-700">
          ⚠️ This dashboard shows <b>short-stay</b> rules. Your selected dates are {stayDays} days.
        </p>
      ) : null}
<div className="md:col-span-1 min-w-0 space-y-1">
          <label className="text-sm font-medium">Passport to use</label>
          <select
            className={CONTROL_CLASS}
            value={passportChoice}
            onChange={(e) => onPassportChoice(e.target.value)}
          >
            <option value="BEST">Best choice</option>
            {passports.map((p) => (
              <option key={p.countryCode} value={p.countryCode}>{p.countryCode}</option>
            ))}
          </select>
        </div>

        <div className="min-w-0 space-y-1 sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving..." : active ? "Update active project" : "Create active project"}
          </button>
        </div>
      </form>
    </div>
  );
}
