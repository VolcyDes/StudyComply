"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { CountryCombobox } from "@/components/CountryCombobox";

type Passport = {
  id: string;
  countryCode: string;
  createdAt: string;
};

function normalizeIso2(code: string) {
  return (code || "").trim().toUpperCase().slice(0, 2);
}

function flagUrl(code: string) {
  return `/flags/${code.toLowerCase()}.png`;
}

type AuthFetchLike =
  | ((path: string, init?: RequestInit) => Promise<Response>)
  | ((path: string, init?: RequestInit) => Promise<{ res: Response; data: any }>);

async function toResData(out: Response | { res: Response; data: any }) {
  if (out instanceof Response) {
    const res = out;
    const ct = res.headers.get("content-type") || "";
    let data: any = null;

    // ✅ read ONCE via clone (no "body already read")
    try {
      if (ct.includes("application/json")) data = await res.clone().json();
      else data = await res.clone().text();
    } catch {
      data = null;
    }

    return { res, data };
  }
  return out;
}

function errMsg(data: any, fallback: string) {
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object" && typeof data.message === "string") return data.message;
  try {
    const s = JSON.stringify(data ?? {});
    return s === "{}" ? fallback : s;
  } catch {
    return fallback;
  }
}

export default function PassportsSection({
  authFetch,
  onChanged,
  showAddForm = true,
}: {
  authFetch: AuthFetchLike;
  onChanged?: () => void;
  showAddForm?: boolean;
}) {
  const [items, setItems] = useState<Passport[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState<string | null>(null);

  const [countryCode, setCountryCode] = useState("FR");
  const [adding, setAdding] = useState(false);

  async function load() {
    setItemsError(null);
    setItemsLoading(true);
    try {
      const r = await toResData(await authFetch("/api/v1/passports"));
      if (!r.res.ok) throw new Error(errMsg(r.data, "Failed to load passports"));
      const data = Array.isArray(r.data) ? (r.data as Passport[]) : [];
      setItems(data);
    } catch (e: any) {
      setItemsError(e?.message ?? "Failed to load passports");
    } finally {
      setItemsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addPassport() {
    const cc = normalizeIso2(countryCode);
    if (!cc) return;

    setAdding(true);
    try {
      const r = await toResData(
        await authFetch("/api/v1/passports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ countryCode: cc }),
        })
      );
      if (!r.res.ok) throw new Error(errMsg(r.data, "Failed to add passport"));
      await load();
      onChanged?.();
    } catch (e: any) {
      alert(e?.message ?? "Failed to add passport");
    } finally {
      setAdding(false);
    }
  }

  async function removePassport(ccRaw: string) {
    const cc = normalizeIso2(ccRaw);
    if (!cc) return;

    const prev = items;
    setItems((cur) => cur.filter((p) => p.countryCode !== cc));

    try {
      const r = await toResData(await authFetch(`/api/v1/passports/${cc}`, { method: "DELETE" }));
      if (!r.res.ok) throw new Error(errMsg(r.data, "Failed to remove passport"));
      onChanged?.();
    } catch (e: any) {
      setItems(prev);
      alert(e?.message ?? "Failed to remove passport");
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Your passports</h2>
          <p className="text-sm text-gray-600">Add your nationality(ies). Requirements depend on your passport(s).</p>
        </div>

        <button onClick={load} className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50">
          Refresh
        </button>
      </div>

      {showAddForm ? (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="text-sm font-medium">Country</label>
            <div className="mt-1">
              <CountryCombobox
                value={countryCode}
                onChange={(iso2) => setCountryCode(iso2)}
                placeholder="Select your passport country…"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Search by country name, it will save ISO2.</p>
          </div>

          <div className="md:col-span-1 flex items-end">
            <button
              onClick={addPassport}
              disabled={adding || !normalizeIso2(countryCode)}
              className={clsx("w-full rounded-xl px-4 py-2 text-white hover:opacity-90 disabled:opacity-60", "bg-black")}
            >
              {adding ? "Adding..." : "Add passport"}
            </button>
          </div>
        </div>
      ) : null}

      {itemsLoading ? (
        <p className="mt-4 text-sm text-gray-600">Loading passports...</p>
      ) : itemsError ? (
        <p className="mt-4 text-sm text-red-700">{itemsError}</p>
      ) : items.length === 0 ? (
        <p className="mt-4 text-sm text-gray-600">No passports yet.</p>
      ) : (
        <ul className="mt-4 divide-y">
          {items.map((p) => (
            <li key={p.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <img src={flagUrl(p.countryCode)} alt={p.countryCode} width={20} height={14} className="rounded-sm" />
                  <span className="font-medium">{p.countryCode}</span>
                </div>
                <p className="text-xs text-gray-500">Added: {new Date(p.createdAt).toLocaleDateString()}</p>
              </div>

              <button
                onClick={() => removePassport(p.countryCode)}
                className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
