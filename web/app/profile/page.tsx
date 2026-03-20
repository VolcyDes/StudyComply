"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../lib/config";

type Passport = { id: string; countryCode: string; createdAt: string };
type Country  = { code: string; name: string };
type User     = { id: string; email: string; role: string };

async function safeJson(res: Response) {
  const text = await res.text();
  if (!text?.trim()) return null;
  try { return JSON.parse(text); } catch { return null; }
}

const ROLE_OPTIONS = [
  { value: "USER",       label: "Étudiant",    icon: "🎓", desc: "Je prépare une mobilité" },
  { value: "UNIVERSITY", label: "Université",  icon: "🏛️", desc: "Je gère des étudiants" },
];

export default function ProfilePage() {
  const router = useRouter();

  const [user,     setUser]     = useState<User | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [passports, setPassports] = useState<Passport[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [query,    setQuery]    = useState("");
  const [selectedCode, setSelectedCode] = useState("FR");
  const [adding,   setAdding]   = useState(false);
  const [notice,   setNotice]   = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Role update
  const [savingRole,  setSavingRole]  = useState(false);
  const [pendingRole, setPendingRole] = useState<string | null>(null);

  function authFetch(path: string, init?: RequestInit) {
    const token = localStorage.getItem("token");
    if (!token) { router.replace("/login"); throw new Error("No token"); }
    return fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${token}` },
    });
  }

  async function updateRole(newRole: string) {
    if (newRole === user?.role) return;
    setSavingRole(true);
    setPendingRole(newRole);
    try {
      const res = await authFetch("/api/v1/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await safeJson(res);
      if (data?.user) {
        setUser(data.user);
        // Update localStorage so TopNav + redirects reflect new role
        const stored = JSON.parse(localStorage.getItem("user") ?? "{}");
        localStorage.setItem("user", JSON.stringify({ ...stored, role: data.user.role }));
        setNotice({ type: "ok", text: `Compte mis à jour en ${newRole === "UNIVERSITY" ? "Université" : "Étudiant"} ✓ — reconnecte-toi pour appliquer.` });
      }
    } catch {
      setNotice({ type: "err", text: "Échec de la mise à jour." });
    } finally {
      setSavingRole(false);
      setPendingRole(null);
    }
  }

  useEffect(() => {
    async function boot() {
      try {
        const [meRes, cRes, pRes] = await Promise.all([
          authFetch("/api/v1/me"),
          authFetch("/api/v1/meta/countries"),
          authFetch("/api/v1/passports"),
        ]);

        const meData = await safeJson(meRes);
        if (meData?.user) setUser(meData.user);

        const cData = await safeJson(cRes);
        const items: Country[] = Array.isArray(cData) ? cData : cData?.items ?? [];
        setCountries(items);
        if (items.find((c) => c.code === "FR")) setSelectedCode("FR");
        else if (items[0]) setSelectedCode(items[0].code);

        const pData = await safeJson(pRes);
        setPassports(Array.isArray(pData) ? pData : pData?.items ?? []);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries.slice(0, 50);
    return countries.filter((c) => `${c.name} ${c.code}`.toLowerCase().includes(q)).slice(0, 50);
  }, [countries, query]);

  function countryName(code: string) {
    return countries.find((c) => c.code === code)?.name ?? code;
  }

  async function addPassport() {
    const typed = query.trim().toUpperCase();
    const code = typed.length === 2 ? typed : selectedCode;
    if (!code) return;
    setAdding(true);
    setNotice(null);
    try {
      const res = await authFetch("/api/v1/passports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode: code }),
      });
      if (!res.ok) { const msg = await res.text(); throw new Error(msg || "Échec"); }
      const created = await safeJson(res);
      if (created) {
        setPassports((prev) => [created, ...prev]);
        setNotice({ type: "ok", text: `Passeport ${countryName(code)} ajouté ✓` });
        setQuery("");
      }
    } catch (e: any) {
      setNotice({ type: "err", text: e?.message ?? "Échec de l'ajout" });
    } finally { setAdding(false); }
  }

  async function removePassport(id: string) {
    if (!confirm("Supprimer ce passeport ?")) return;
    setPassports((p) => p.filter((x) => x.id !== id));
    authFetch(`/api/v1/passports/${id}`, { method: "DELETE" }).catch(() => {});
  }

  const FLAG: Record<string, string> = {
    FR: "🇫🇷", DE: "🇩🇪", ES: "🇪🇸", IT: "🇮🇹", GB: "🇬🇧", US: "🇺🇸",
    CA: "🇨🇦", NL: "🇳🇱", BE: "🇧🇪", PT: "🇵🇹", CH: "🇨🇭", MA: "🇲🇦",
    SN: "🇸🇳", CI: "🇨🇮", CM: "🇨🇲", TN: "🇹🇳", DZ: "🇩🇿", NG: "🇳🇬",
  };

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-8 py-10 text-white shadow-xl">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="relative">
          <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
            👤 Mon profil
          </span>
          <h1 className="mt-3 text-3xl font-bold">Mes passeports</h1>
          <p className="mt-1 text-violet-200 text-sm">
            Renseigne ta nationalité — on calcule les visas dont tu as besoin.
          </p>
        </div>
      </div>

      {/* ── Type de compte ── */}
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Type de compte</h2>
            <p className="mt-1 text-sm text-gray-500">
              Sélectionne ton rôle — cela détermine ton dashboard et tes fonctionnalités.
            </p>
          </div>
          {user && (
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
              user.role === "UNIVERSITY" ? "bg-violet-100 text-violet-700" : "bg-indigo-100 text-indigo-700"
            }`}>
              {user.role === "UNIVERSITY" ? "🏛️ Université" : "🎓 Étudiant"}
            </span>
          )}
        </div>

        {notice && (
          <div className={`mt-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
            notice.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}>
            <span>{notice.type === "ok" ? "✓" : "⚠"}</span>
            {notice.text}
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          {ROLE_OPTIONS.map((r) => {
            const isActive  = user?.role === r.value;
            const isLoading = savingRole && pendingRole === r.value;
            return (
              <button key={r.value} type="button"
                onClick={() => updateRole(r.value)}
                disabled={savingRole || isActive}
                className={`relative rounded-2xl border-2 p-4 text-left transition ${
                  isActive
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                } disabled:cursor-default`}>
                <span className="text-xl">{r.icon}</span>
                <p className={`mt-2 font-semibold text-sm ${isActive ? "text-indigo-700" : "text-gray-800"}`}>
                  {r.label}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">{r.desc}</p>
                {isActive && (
                  <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white text-xs">✓</span>
                )}
                {isLoading && (
                  <span className="absolute right-3 top-3 h-5 w-5 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
                )}
              </button>
            );
          })}
        </div>

        {notice?.type === "ok" && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
              }}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition">
              Se reconnecter maintenant →
            </button>
          </div>
        )}
      </section>

      {/* ── Passeports existants ── */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          Passeports enregistrés
          <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-600">
            {passports.length}
          </span>
        </h2>

        {loading ? (
          <div className="flex items-center gap-3 rounded-2xl border bg-white p-6 text-gray-500">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <span className="text-sm">Chargement…</span>
          </div>
        ) : passports.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-gray-50 px-6 py-12 text-center">
            <p className="text-3xl">🛂</p>
            <p className="mt-2 font-medium text-gray-700">Aucun passeport</p>
            <p className="mt-1 text-sm text-gray-500">Ajoute ton/tes passeport(s) ci-dessous.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            {passports.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center justify-between px-5 py-4 gap-4 ${i !== passports.length - 1 ? "border-b" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{FLAG[p.countryCode] ?? "🌍"}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{countryName(p.countryCode)}</p>
                    <p className="text-xs text-gray-400">{p.countryCode}</p>
                  </div>
                </div>
                <button
                  onClick={() => removePassport(p.id)}
                  className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Ajouter ── */}
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Ajouter un passeport</h2>
        <p className="mt-1 text-sm text-gray-500">
          Tu peux avoir plusieurs passeports (dual nationalité).
        </p>

        {notice && (
          <div className={`mt-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
            notice.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}>
            <span>{notice.type === "ok" ? "✓" : "⚠"}</span>
            {notice.text}
          </div>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Recherche un pays</label>
            <input
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="France, Morocco, Germany…"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Sélectionne</label>
            <select
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              value={selectedCode}
              onChange={(e) => setSelectedCode(e.target.value)}
            >
              {filtered.map((c) => (
                <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={addPassport}
              disabled={adding || !selectedCode}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90 disabled:opacity-50 transition"
            >
              {adding ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Ajout…
                </span>
              ) : "+ Ajouter"}
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
