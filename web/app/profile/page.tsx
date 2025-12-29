"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../lib/config";


function flagUrl(code: string) {
  return `/flags/${code.toLowerCase()}.png`;
}.png`;
}


type Passport = {
  id: string;
  countryCode: string;
  createdAt: string;
};

type Country = {
  code: string;   // ex: "FR"
  name: string;   // ex: "France"
};


function normalizeIso2(v: string) {
  const s = String(v || "").trim();
  // pick last ISO2-like token (e.g. "Botswana (BW)" -> "BW")
  const m = s.match(/([A-Za-z]{2})(?!.*[A-Za-z]{2})/);
  return (m ? m[1] : s).toUpperCase();
}

function clsx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [countriesError, setCountriesError] = useState<string | null>(null);

  const [passports, setPassports] = useState<Passport[]>([]);
  const [passportsLoading, setPassportsLoading] = useState(true);
  const [passportsError, setPassportsError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [selectedCode, setSelectedCode] = useState<string>("FR");
  const [adding, setAdding] = useState(false);

  
  const [notice, setNotice] = useState<{ type: "ok" | "warn" | "err"; text: string } | null>(null);

  async function authFetch(path: string, init?: RequestInit) {
    const t = localStorage.getItem("token");
    if (!t) {
      router.push("/login");
      return new Response(null, { status: 401 });
    }

    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        Authorization: `Bearer ${t}`,
      },
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
      throw new Error("Unauthorized");
    }
    return res;
  }

  async function loadCountries() {
    setCountriesError(null);
    setCountriesLoading(true);
    try {
      const res = await authFetch("/api/v1/meta/countries");
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : [];

      // Defensive: API might return { items: [...] } or [...]
      const items: Country[] = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];

      setCountries(items);
      if (items.find((c) => c.code === "FR")) setSelectedCode("FR");
      else if (items[0]) setSelectedCode(items[0].code);
    } catch (e: any) {
      setCountriesError(e?.message ?? "Failed to load countries");
    } finally {
      setCountriesLoading(false);
    }
  }

  async function loadPassports() {
    setPassportsError(null);
    setPassportsLoading(true);
    try {
      const res = await authFetch("/api/v1/passports");
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : [];

      const items: Passport[] = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
      setPassports(items);
    } catch (e: any) {
      setPassportsError(e?.message ?? "Failed to load passports");
    } finally {
      setPassportsLoading(false);
    }
  }

  useEffect(() => {
    async function boot() {
      try {
        await loadCountries();
        await loadPassports();
      } finally {
        setLoading(false);
      }
    }
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredCountries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries.slice(0, 50);
    return countries
      .filter((c) => `${c.name} ${c.code}`.toLowerCase().includes(q))
      .slice(0, 50);
  }, [countries, query]);

  function countryName(code: string) {
    const c = countries.find((x) => x.code === code);
    return c ? c.name : code;
  }

  async function addPassport() {
    const typed = query.trim().toUpperCase();
    const code = typed.length === 2 ? typed : selectedCode;
    if (!code) return;
    setAdding(true);
    try {
      const res = await authFetch("/api/v1/passports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode: normalizeIso2(code) }),
      });
if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Add passport failed (${res.status})`);
      }

      const rawCreated = await res.text();
      const created: Passport = rawCreated ? JSON.parse(rawCreated) : { id: crypto.randomUUID?.() ?? "tmp", countryCode: selectedCode, createdAt: new Date().toISOString() };
      setPassports((prev) => [created, ...prev]);
    } catch (e: any) {
      alert(e?.message ?? "Failed to add passport");
    } finally {
      setAdding(false);
    }
  }

  async function removePassport(countryCode: string) {
    const ok = confirm("Remove this passport?");
    if (!ok) return;

    const prev = passports;
    setPassports((p) => p.filter((x) => x.countryCode !== countryCode));

    try {
      const res = await authFetch(`/api/v1/passports/${normalizeIso2(countryCode)}`, { method: "DELETE" });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Delete failed (${res.status})`);
      }
    } catch (e: any) {
      setPassports(prev);
      alert(e?.message ?? "Delete failed");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your passports — we’ll use them to compute what you need for a study mobility.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-5">
        <h2 className="text-lg font-semibold">Your passports</h2>

        {loading || passportsLoading ? (
          <p className="mt-3 text-sm text-gray-600">Loading passports...</p>
        ) : passportsError ? (
          <p className="mt-3 text-sm text-red-700">{passportsError}</p>
        ) : passports.length === 0 ? (
          <p className="mt-3 text-sm text-gray-600">No passports yet.</p>
        ) : (
          <ul className="mt-4 divide-y">
            {passports.map((p) => (
              <li key={p.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{countryName(p.countryCode)}</p>
                  <p className="text-xs text-gray-600"><span className="inline-flex items-center gap-2">
                    <img src={flagUrl(p.countryCode)} alt={p.countryCode} width={20} height={14} className="rounded-sm" />
                    <span>{p.countryCode}</span>
                  </span></p>
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

      <div className="rounded-2xl border bg-white p-5">
        <h2 className="text-lg font-semibold">Add a passport</h2>

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

        {countriesLoading ? (
          <p className="mt-3 text-sm text-gray-600">Loading countries...</p>
        ) : countriesError ? (
          <p className="mt-3 text-sm text-red-700">{countriesError}</p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="md:col-span-1">
              <label className="text-sm font-medium">Search a country</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="France, Cyprus, Germany…"
              />
              <p className="mt-2 text-xs text-gray-500">
                Tip: you can search by name or code (FR, CY, DE).
              </p>
            </div>

            <div className="md:col-span-1">
              <label className="text-sm font-medium">Select</label>
              <select
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
              >
                {filteredCountries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1 flex items-end">
              <button
                onClick={addPassport}
                disabled={adding || !selectedCode}
                className={clsx(
                  "w-full rounded-xl px-4 py-2 text-white hover:opacity-90 disabled:opacity-60",
                  "bg-black"
                )}
              >
                {adding ? "Adding..." : "Add passport"}
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        API: <span className="font-mono">{API_BASE_URL}</span>
      </p>
    </div>
  );
}
