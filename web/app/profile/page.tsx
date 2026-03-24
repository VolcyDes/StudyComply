"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../lib/config";
import { clearAuth, getRole } from "../../lib/auth";
import { ALL_COUNTRIES, type Country } from "../../lib/countries";
import { useLang } from "../../lib/i18n";

// ── Types ─────────────────────────────────────────────────────────────────────

type User     = { id: string; email: string; role: string };
type Passport = { id: string; countryCode: string; createdAt: string };

// ── Utils ─────────────────────────────────────────────────────────────────────

/** Converts an ISO 3166-1 alpha-2 code to its flag emoji (works for all countries). */
function flagEmoji(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(c.charCodeAt(0) + 127397));
}

function normalizeIso2(v: string) {
  const s = String(v || "").trim();
  const m = s.match(/([A-Za-z]{2})(?!.*[A-Za-z]{2})/);
  return (m ? m[1] : s).toUpperCase();
}

function fmtDate(iso: string, locale = "fr-FR") {
  return new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

// ── Toast ─────────────────────────────────────────────────────────────────────

type Toast = { id: number; type: "ok" | "err"; text: string };

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  function push(type: Toast["type"], text: string) {
    const id = Date.now();
    setToasts((t) => [...t, { id, type, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }
  return { toasts, ok: (t: string) => push("ok", t), err: (t: string) => push("err", t) };
}

// ── Passport combobox ─────────────────────────────────────────────────────────

function PassportCombobox({
  countries,
  value,
  onChange,
}: {
  countries: Country[];
  value: string;
  onChange: (code: string) => void;
}) {
  const { t } = useLang();
  const [query, setQuery]   = useState("");
  const [open, setOpen]     = useState(false);

  const filtered = query.trim()
    ? countries.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.code.toLowerCase().includes(query.toLowerCase())
      )
    : countries;

  const selected = countries.find((c) => c.code === value);

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
      >
        {selected ? (
          <span className="flex items-center gap-2">
            <span className="text-xl leading-none">{flagEmoji(selected.code)}</span>
            <span className="font-medium text-gray-900">{selected.name}</span>
            <span className="text-gray-400">({selected.code})</span>
          </span>
        ) : (
          <span className="text-gray-400">{t.profile.passChoosePlaceholder}</span>
        )}
        <svg className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => { setOpen(false); setQuery(""); }} />
          <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
            {/* Search input */}
            <div className="border-b border-gray-100 px-3 py-2">
              <div className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2">
                <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0z" />
                </svg>
                <input
                  autoFocus
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                  placeholder={t.profile.passSearchPlaceholder}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            {/* List */}
            <ul className="max-h-64 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-sm text-gray-400 text-center">{t.profile.passNotFound}</li>
              ) : filtered.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => { onChange(c.code); setOpen(false); setQuery(""); }}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-indigo-50 ${
                      c.code === value ? "bg-indigo-50 font-semibold text-indigo-700" : "text-gray-800"
                    }`}
                  >
                    <span className="text-lg leading-none w-7 text-center">{flagEmoji(c.code)}</span>
                    <span className="flex-1 text-left">{c.name}</span>
                    <span className="text-xs text-gray-400">{c.code}</span>
                    {c.code === value && (
                      <svg className="h-4 w-4 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

// ── Confirm dialog ────────────────────────────────────────────────────────────

function ConfirmDialog({
  open, onConfirm, onCancel, country,
}: { open: boolean; onConfirm: () => void; onCancel: () => void; country: string }) {
  const { t } = useLang();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <p className="text-lg font-semibold text-gray-900">{t.profile.passDeleteConfirm}</p>
        <p className="mt-2 text-sm text-gray-500">
          {t.profile.passDeleteDesc.replace("{country}", country)}
        </p>
        <div className="mt-5 flex gap-3">
          <button onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
            {t.common.cancel}
          </button>
          <button onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition">
            {t.common.delete}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Section components ────────────────────────────────────────────────────────

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
        <span className="text-xl">{icon}</span>
        <h2 className="font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function ComingSoonField({ label, placeholder }: { label: string; placeholder: string }) {
  const { t } = useLang();
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</label>
      <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3">
        <span className="text-sm text-gray-400 italic">{placeholder}</span>
        <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-400">{t.common.comingSoon}</span>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const toast  = useToast();
  const { t, lang, setLang } = useLang();
  const locale = lang === "fr" ? "fr-FR" : "en-GB";

  const [user,    setUser]    = useState<User | null>(null);
  const [role,    setRoleState] = useState<"UNIVERSITY" | "STUDENT" | null>(null);
  const [loading, setLoading] = useState(true);

  // Student-only state
  const countries = ALL_COUNTRIES; // full static list — no API call needed
  const [passports,       setPassports]       = useState<Passport[]>([]);
  const [selectedCode,    setSelectedCode]    = useState<string>("FR");
  const [adding,          setAdding]          = useState(false);
  const [confirmCode,     setConfirmCode]     = useState<string | null>(null);
  const [addError,        setAddError]        = useState<string | null>(null);

  // ── Auth fetch ──────────────────────────────────────────────────────────────

  function authFetch(path: string, init?: RequestInit) {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); throw new Error("No token"); }
    return fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (res.status === 401) { clearAuth(); router.push("/login"); throw new Error("Unauthorized"); }
      return res;
    });
  }

  // ── Boot ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const r = getRole();
    setRoleState(r);

    const stored = localStorage.getItem("user");
    if (stored) { try { setUser(JSON.parse(stored)); } catch { /* ignore */ } }

    if (r === "STUDENT") {
      loadPassports().finally(() => setLoading(false));

      // Re-fetch when the user navigates back to this page (Next.js router cache
      // or browser bfcache can serve a stale snapshot without remounting).
      const onVisible = () => { if (document.visibilityState === "visible") loadPassports(); };
      const onFocus   = () => loadPassports();
      document.addEventListener("visibilitychange", onVisible);
      window.addEventListener("focus", onFocus);
      return () => {
        document.removeEventListener("visibilitychange", onVisible);
        window.removeEventListener("focus", onFocus);
      };
    } else {
      // University: just load user info
      const token = localStorage.getItem("token");
      if (!token) { router.replace("/login"); return; }
      fetch(`${API_BASE_URL}/api/v1/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.ok ? res.json() : null)
        .then((data) => { if (data?.user) setUser(data.user); })
        .finally(() => setLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Passports ────────────────────────────────────────────────────────────────

  async function loadPassports() {
    try {
      const res = await authFetch("/api/v1/passports");
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Erreur ${res.status}`);
      }
      const raw  = await res.text();
      const data = raw ? JSON.parse(raw) : [];
      // Defensive extraction — handles [], {items:[]}, {data:[]}
      const list = Array.isArray(data)         ? data
                 : Array.isArray(data?.items)   ? data.items
                 : Array.isArray(data?.data)    ? data.data
                 : Array.isArray(data?.passports) ? data.passports
                 : [];
      setPassports(list);
    } catch (e: any) {
      // Only show a toast for non-auth errors (auth errors redirect to login)
      if (e?.message !== "Unauthorized" && e?.message !== "No token") {
        toast.err(`Erreur de chargement : ${e?.message ?? "inconnue"}`);
      }
    }
  }

  /** Parse a raw API error string into a human-readable message. */
  function parseApiError(raw: string): string {
    try {
      const obj = JSON.parse(raw);
      const msg = obj?.message;
      return Array.isArray(msg) ? msg[0] : String(msg ?? raw);
    } catch { return raw; }
  }

  async function addPassport() {
    const code = normalizeIso2(selectedCode);
    if (!code) return;
    // Duplicate already blocked by isDuplicate disabling the button,
    // but keep the guard in case of race conditions.
    if (passports.some((p) => normalizeIso2(p.countryCode) === code)) {
      setAddError(t.profile.passDuplicate);
      return;
    }
    setAddError(null);
    setAdding(true);
    try {
      const res = await authFetch("/api/v1/passports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode: code }),
      });
      if (!res.ok) {
        const raw = await res.text().catch(() => "");
        throw new Error(parseApiError(raw) || `Erreur ${res.status}`);
      }
      // Reload from server to guarantee the state matches the DB
      await loadPassports();
      toast.ok(t.profile.passAdded);
      // Reset selection to first country not already in list
      const next = countries.find(
        (c) => !passports.some((p) => normalizeIso2(p.countryCode) === c.code) && c.code !== code
      );
      if (next) setSelectedCode(next.code);
    } catch (e: any) {
      const msg = e?.message ?? "Erreur lors de l'ajout";
      // Show inline for duplicate/conflict errors, toast for unexpected errors
      if (msg.toLowerCase().includes("exist") || msg.toLowerCase().includes("déjà") || msg.toLowerCase().includes("conflict")) {
        setAddError(t.profile.passDuplicate);
      } else {
        toast.err(msg);
      }
    } finally {
      setAdding(false);
    }
  }

  async function confirmRemove() {
    if (!confirmCode) return;
    const code = normalizeIso2(confirmCode);
    setConfirmCode(null);
    // Optimistic removal
    setPassports((p) => p.filter((x) => normalizeIso2(x.countryCode) !== code));
    try {
      const res = await authFetch(`/api/v1/passports/${code}`, { method: "DELETE" });
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Erreur ${res.status}`);
      }
      // Reload to confirm the DB state
      await loadPassports();
      toast.ok(t.profile.passDeleted);
    } catch (e: any) {
      // On error, reload to restore the real server state
      await loadPassports();
      toast.err(e?.message ?? "Erreur lors de la suppression");
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function countryName(code: string) {
    return countries.find((c) => c.code === code)?.name ?? code;
  }

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-7 w-7 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  const isUniversity = role === "UNIVERSITY";

  return (
    <div className="mx-auto max-w-2xl space-y-8">

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toast.toasts.map((t) => (
          <div key={t.id} className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium shadow-lg pointer-events-auto ${
            t.type === "ok" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
          }`}>
            {t.type === "ok" ? "✓" : "✕"} {t.text}
          </div>
        ))}
      </div>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={!!confirmCode}
        country={confirmCode ? countryName(confirmCode) : ""}
        onConfirm={confirmRemove}
        onCancel={() => setConfirmCode(null)}
      />

      {/* ── Page header ── */}
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl text-white shadow-md ${
          isUniversity ? "bg-gradient-to-br from-violet-600 to-purple-700" : "bg-gradient-to-br from-indigo-600 to-blue-600"
        }`}>
          {isUniversity ? "🏛️" : "🎓"}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.profile.title}</h1>
          <p className="text-sm text-gray-500">{t.profile.subtitle}</p>
        </div>
      </div>

      {/* ── Langue ── */}
      <SectionCard title={t.profile.langSection} icon="🌐">
        <p className="text-sm text-gray-500 mb-4">{t.profile.langDesc}</p>
        <div className="grid grid-cols-2 gap-3">
          {(["fr", "en"] as const).map((l) => (
            <button key={l} type="button" onClick={() => setLang(l)}
              className={`flex items-center justify-between gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition ${
                lang === l
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 text-gray-700 hover:border-gray-300"
              }`}>
              <span>{l === "fr" ? t.profile.langFr : t.profile.langEn}</span>
              {lang === l && (
                <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  {t.profile.langActive}
                </span>
              )}
            </button>
          ))}
        </div>
      </SectionCard>

      {/* ── Compte ── */}
      <SectionCard title={t.profile.accountTitle} icon="👤">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-gray-400">{t.profile.email}</label>
            <div className="mt-1.5 flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-800">
              {user?.email ?? "—"}
              <span className={`ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                isUniversity ? "bg-violet-100 text-violet-700" : "bg-indigo-100 text-indigo-700"
              }`}>
                {isUniversity ? t.profile.roleUniv : t.profile.roleStudent}
              </span>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Contenu selon le rôle ── */}
      {isUniversity ? (
        <>
          {/* Informations établissement */}
          <SectionCard title={t.profile.univInfoTitle} icon="🏛️">
            <div className="space-y-4">
              <ComingSoonField label={t.profile.univInfoName} placeholder={t.profile.univInfoNameEx} />
              <ComingSoonField label={t.profile.univInfoCountry} placeholder={t.profile.univInfoCountryEx} />
              <ComingSoonField label={t.profile.univInfoWebsite} placeholder={t.profile.univInfoWebsiteEx} />
              <ComingSoonField label={t.profile.univInfoId} placeholder={t.profile.univInfoIdEx} />
            </div>
          </SectionCard>

          {/* Contact */}
          <SectionCard title={t.profile.univContactTitle} icon="📬">
            <div className="space-y-4">
              <ComingSoonField label={t.profile.univContactName} placeholder={t.profile.univContactNameEx} />
              <ComingSoonField label={t.profile.univContactPhone} placeholder={t.profile.univContactPhoneEx} />
            </div>
          </SectionCard>

          {/* Programmes */}
          <SectionCard title={t.profile.univProgsTitle} icon="🌍">
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
              <p className="text-3xl">🚧</p>
              <p className="mt-2 font-semibold text-gray-700">{t.profile.univProgsDev}</p>
              <p className="mt-1 text-sm text-gray-500">{t.profile.univProgsDesc}</p>
            </div>
          </SectionCard>

          {/* Notifications */}
          <SectionCard title={t.profile.univNotifTitle} icon="🔔">
            <div className="space-y-3">
              {([
                { label: t.profile.univNotif1Label, desc: t.profile.univNotif1Desc },
                { label: t.profile.univNotif2Label, desc: t.profile.univNotif2Desc },
                { label: t.profile.univNotif3Label, desc: t.profile.univNotif3Desc },
              ] as const).map((n) => (
                <div key={n.label} className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 opacity-60">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{n.label}</p>
                    <p className="text-xs text-gray-400">{n.desc}</p>
                  </div>
                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500">{t.common.comingSoon}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </>
      ) : (
        <>
          {/* Passeports */}
          <SectionCard title={t.profile.passSection} icon="🛂">
            <p className="mb-5 text-sm text-gray-500 leading-relaxed">
              {t.profile.passDescFull}
            </p>

            {/* Add passport */}
            {(() => {
              const isDuplicate = !!selectedCode &&
                passports.some((p) => normalizeIso2(p.countryCode) === normalizeIso2(selectedCode));
              return (
                <div className="space-y-2">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400">
                        {t.profile.passNationality}
                      </label>
                      <PassportCombobox
                        countries={countries}
                        value={selectedCode}
                        onChange={(code) => { setSelectedCode(code); setAddError(null); }}
                      />
                    </div>
                    <button
                      onClick={addPassport}
                      disabled={adding || !selectedCode || isDuplicate}
                      className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition sm:self-auto self-stretch"
                    >
                      {adding ? (
                        <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> {t.profile.passAdding}</>
                      ) : isDuplicate ? (
                        <>{t.profile.passAddedAlready}</>
                      ) : (
                        <><svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg> {t.profile.passAddBtn}</>
                      )}
                    </button>
                  </div>

                  {/* Inline duplicate banner */}
                  {isDuplicate && (
                    <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                      <span className="text-base leading-none">⚠️</span>
                      <p className="text-xs font-medium text-amber-700">
                        {flagEmoji(selectedCode)} {t.profile.passAlreadyIn.replace("{country}", countryName(selectedCode))}
                      </p>
                    </div>
                  )}

                  {/* Server/other error banner */}
                  {addError && !isDuplicate && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
                      <span className="text-base leading-none">❌</span>
                      <p className="text-xs font-medium text-red-700">{addError}</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Passport list */}
            {passports.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-8 text-center">
                <p className="text-3xl">🛂</p>
                <p className="mt-2 text-sm font-medium text-gray-500">{t.profile.passEmptyTitle}</p>
                <p className="mt-1 text-xs text-gray-400">{t.profile.passEmptyDesc}</p>
              </div>
            ) : (
              <ul className="mt-5 space-y-2">
                {passports.map((p) => {
                  const isSelected = normalizeIso2(selectedCode) === normalizeIso2(p.countryCode);
                  return (
                    <li
                      key={p.id}
                      onClick={() => { setSelectedCode(p.countryCode); setAddError(null); }}
                      className={`group flex cursor-pointer items-center gap-4 rounded-2xl border px-4 py-3.5 transition-all ${
                        isSelected
                          ? "border-indigo-300 bg-indigo-50 shadow-sm"
                          : "border-gray-100 bg-gray-50 hover:border-indigo-200 hover:bg-white"
                      }`}
                    >
                      <span className="text-2xl leading-none">{flagEmoji(p.countryCode)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-semibold ${isSelected ? "text-indigo-700" : "text-gray-900"}`}>
                            {countryName(p.countryCode)}
                          </p>
                          {isSelected && (
                            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
                              {t.profile.passSelected}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{t.profile.passAddedOn} {fmtDate(p.createdAt, locale)}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmCode(p.countryCode); }}
                        className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {t.common.delete}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>

          {/* Infos personnelles */}
          <SectionCard title={t.profile.personalTitle} icon="📝">
            <div className="space-y-4">
              <ComingSoonField label={t.profile.personalName} placeholder={t.profile.personalNameEx} />
              <ComingSoonField label={t.profile.personalDob} placeholder={t.profile.personalDobEx} />
              <ComingSoonField label={t.profile.personalUniv} placeholder={t.profile.personalUnivEx} />
            </div>
          </SectionCard>

          {/* Notifications */}
          <SectionCard title={t.profile.univNotifTitle} icon="🔔">
            <div className="space-y-3">
              {([
                { label: t.profile.studNotif1Label, desc: t.profile.studNotif1Desc },
                { label: t.profile.studNotif2Label, desc: t.profile.studNotif2Desc },
              ] as const).map((n) => (
                <div key={n.label} className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 opacity-60">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{n.label}</p>
                    <p className="text-xs text-gray-400">{n.desc}</p>
                  </div>
                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500">{t.common.comingSoon}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </>
      )}

    </div>
  );
}
