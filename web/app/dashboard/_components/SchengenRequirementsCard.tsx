"use client";

import { iso2ToTravelDestination } from "@/lib/travelDestination";
import { useEffect, useState } from "react";

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

function badgeClass(status: EntryResult["status"]) {
  switch (status) {
    case "FREE":
      return "bg-green-100 text-green-800 border-green-200";
    case "VISA_FREE":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "VISA_REQUIRED":
      return "bg-red-100 text-red-800 border-red-200";
  }
}

function badgeLabel(status: EntryResult["status"]) {
  switch (status) {
    case "FREE":
      return "Free movement";
    case "VISA_FREE":
      return "Visa-free (short stay)";
    case "VISA_REQUIRED":
      return "Visa required";
  }
}

export function SchengenRequirementsCard({ authFetch, refreshKey }: { authFetch: (path: string, init?: RequestInit) => Promise<Response>; refreshKey: number }) {
  const [data, setData] = useState<EntryResult | null>(null);

  const destIso2 = (() => {
    try {
      return (localStorage.getItem("activeProjectDestinationIso2") || "").toString().toUpperCase();
    } catch {
      return "";
    }
  })();
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [passportChoice, setPassportChoice] = useState("BEST");

  useEffect(() => {
    try {
      const v = localStorage.getItem("activePassport") || "BEST";
      setPassportChoice(v.toString().trim().toUpperCase() || "BEST");
    } catch {}
  }, [refreshKey]);

  useEffect(() => {
  async function load() {
    try {
      setLoading(true);
      setErr(null);

      let destIso2 = "FR";
      try {
        destIso2 = (localStorage.getItem("activeProjectDestinationIso2") || "FR")
          .toString()
          .trim()
          .toUpperCase();
      } catch {}

      const res = await authFetch(
        `/api/v1/requirements/travel?destination=${iso2ToTravelDestination(destIso2)}&passport=${encodeURIComponent(passportChoice)}`
      );
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Failed (${res.status})`);
      }
      const json = (await res.json()) as EntryResult;
      setData(json);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load requirements");
    } finally {
      setLoading(false);
    }
  }

  load();
}, [refreshKey, passportChoice]);

return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Travel requirements</h2>
          <p className="text-sm text-gray-600">Short stays rules for your selected destination.</p>
        </div>

        {data ? (
          <span className={"inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium " + badgeClass(data.status)}>
            {badgeLabel(data.status)}
          </span>
        ) : null}
      </div>

      {loading ? (
        <p className="mt-3 text-sm text-gray-600">Loading…</p>
      ) : err ? (
        <p className="mt-3 text-sm text-red-700">{err}</p>
      ) : !data ? (
        <p className="mt-3 text-sm text-gray-600">No data.</p>
      ) : (
        <div className="mt-4 space-y-2">
          <p className="text-sm">{data.message}</p>
          <p className="text-xs text-gray-500">
            Based on passport: <span className="font-mono">{data.basedOn}</span>
          </p>

          {data.status === "VISA_FREE" ? (
            <ul className="mt-3 list-disc pl-5 text-sm text-gray-700">
              <li>
                Limit: {data.maxStayDays} days within any {data.periodDays}-day period
              </li>
              <li>ETIAS required: {data.etiasRequired ? "Yes" : "No"}</li>
            </ul>
          ) : null}
        </div>
      )}
    </div>
  );
}
