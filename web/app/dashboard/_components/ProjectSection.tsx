"use client";

import { useEffect, useMemo, useState } from "react";
import { getCountryOptions } from "@/lib/countries";

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

export default function ProjectSection({
  authFetch,
  onChanged,
}: {
  authFetch: (path: string, init?: RequestInit) => Promise<Response>;
  onChanged?: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<ActiveProject | null>(null);

  const [destinationCountry, setDestinationCountry] = useState("DE");

  const countryOptions = useMemo(() => getCountryOptions(), []);
  const [purpose, setPurpose] = useState("study");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
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
      const res = await authFetch("/api/v1/projects", {
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
    } catch (e: any) {
      alert(e?.message ?? "Failed to save project");
    } finally {
      setSaving(false);
    }
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
        <div className="mt-4 rounded-xl border bg-gray-50 p-4">
          <p className="text-sm font-medium">
            Current: {active.destinationCountry.toUpperCase()} • {active.purpose}
          </p>
          <p className="mt-1 text-xs text-gray-600">
            {new Date(active.startDate).toLocaleDateString()} →{" "}
            {new Date(active.endDate).toLocaleDateString()}
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-600">No active project yet.</p>
      )}

      <form onSubmit={saveProject} className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="md:col-span-1">
          <label className="text-sm font-medium">Destination (ISO2)</label>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2"
            value={destinationCountry}
            onChange={(e) => setDestinationCountry(e.target.value)}
            placeholder="DE"
            maxLength={2}
          />
        </div>

        <div className="md:col-span-1">
          <label className="text-sm font-medium">Purpose</label>
          <select
            className="mt-1 w-full rounded-xl border px-3 py-2"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          >
            <option value="study">Study</option>
            <option value="internship">Internship</option>
            <option value="tourism">Tourism</option>
            <option value="work">Work</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="md:col-span-1">
          <label className="text-sm font-medium">Start date</label>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="md:col-span-1">
          <label className="text-sm font-medium">End date</label>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="md:col-span-4">
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
