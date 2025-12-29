"use client";

import { useEffect, useState } from "react";


function flagUrl(code: string) {
  return `/flags/${code.toLowerCase()}.png`;
}.png`;
}


type Passport = {
  id: string;
  countryCode: string;
  createdAt: string;
};


function normalizeIso2(v: string) {
  const s = String(v || "").trim();
  // pick last ISO2-like token (e.g. "Botswana (BW)" -> "BW")
  const m = s.match(/([A-Za-z]{2})(?!.*[A-Za-z]{2})/);
  return (m ? m[1] : s).toUpperCase();
}

function extractPassports(json: any): Passport[] {
  if (Array.isArray(json)) return json as Passport[];
  if (json && Array.isArray(json.passports)) return json.passports as Passport[];
  return [];
}

export default function PassportsSection({
  authFetch,
  onChanged,
}: {
  authFetch: (path: string, init?: RequestInit) => Promise<Response>;
  onChanged?: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Passport[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [notice, setNotice] = useState<{ type: "ok" | "warn" | "err"; text: string } | null>(null);

  const [countryCode, setCountryCode] = useState("FR");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const res = await authFetch("/api/v1/passports");

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Failed (${res.status})`);
      }

      const raw = await res.text();
      const json = raw ? JSON.parse(raw) : [];
      setItems(extractPassports(json));
    } catch (e: any) {
      setItems([]);
      setError(e?.message ?? "Failed to load passports");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addPassport(e: React.FormEvent) {
    e.preventDefault();
    const cc = countryCode.trim().toUpperCase();
    if (!cc) return;

    setSaving(true);
    try {
      const res = await authFetch("/api/v1/passports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode: normalizeIso2(cc) }),
      });

      if (res.status === 409) {
        setNotice({ type: "warn", text: "You already added this passport in your profile." });
        return;
      }

      if (!res.ok) {
        const msg = await res.text();
        setNotice({ type: "err", text: msg || `Failed (${res.status})` });
        return;
      }

      setNotice({ type: "ok", text: "Passport added ✅" });
      await load();
      onChanged?.();
    } catch (e: any) {
      setNotice({ type: "err", text: e?.message ?? "Failed to add passport" });
    } finally {
      setSaving(false);
    }
  }

  async function removePassport(countryCode: string) {
    const ok = confirm("Remove this passport?");
    if (!ok) return;

    const prev = items;
    setItems((cur) => cur.filter((p) => p.countryCode !== countryCode));

    try {
      const res = await authFetch(`/api/v1/passports/${normalizeIso2(countryCode)}`, { method: "DELETE" });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Failed (${res.status})`);
      }
      onChanged?.();
    } catch (e: any) {
      setItems(prev);
      alert(e?.message ?? "Failed to remove passport");
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Your passports</h2>
        <button
          onClick={load}
          className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      <p className="mt-1 text-sm text-gray-600">
        Add your nationality(ies). Requirements depend on your passport(s).
      </p>

      {notice ? (
        <div
          className={[
            "mt-4 rounded-xl border px-3 py-2 text-sm",
            notice.type === "ok" ? "border-green-200 bg-green-50 text-green-800" : "",
            notice.type === "warn" ? "border-amber-200 bg-amber-50 text-amber-900" : "",
            notice.type === "err" ? "border-red-200 bg-red-50 text-red-800" : "",
          ].join(" ")}
        >
          {notice.text}
        </div>
      ) : null}

      <form onSubmit={addPassport} className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="text-sm font-medium">Country code (ISO2)</label>
          <input
            className="mt-1 w-32 rounded-xl border px-3 py-2"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            placeholder="FR"
            maxLength={2}
          />
          <p className="mt-1 text-xs text-gray-500">Example: FR, DE, ES</p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="h-10 rounded-xl bg-black px-4 text-white hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Adding..." : "Add passport"}
        </button>
      </form>

      {loading ? (
        <p className="mt-4 text-sm text-gray-600">Loading passports...</p>
      ) : error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
          <div className="mt-2 text-xs text-red-700/80">
            Tip: check your API route <span className="font-mono">GET /api/v1/passports</span> returns a JSON array.
          </div>
        </div>
      ) : items.length === 0 ? (
        <p className="mt-4 text-sm text-gray-600">No passports yet.</p>
      ) : (
        <ul className="mt-4 divide-y">
          {items.map((p) => (
            <li key={p.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium"><span className="inline-flex items-center gap-2">
                <img src={flagUrl(p.countryCode)} alt={p.countryCode} width={20} height={14} className="rounded-sm" />
                <span>{p.countryCode}</span>
              </span></p>
                <p className="text-xs text-gray-500">
                  Added: {new Date(p.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => removePassport(p.countryCode)}
                className="rounded-xl border px-3 py-1.5 text-xs hover:bg-gray-50"
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
