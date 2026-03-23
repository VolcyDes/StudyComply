"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../lib/config";
import { clearAuth, getRole } from "../../lib/auth";

// ── Types ─────────────────────────────────────────────────────────────────────

type User     = { id: string; email: string; role: string };
type Passport = { id: string; countryCode: string; createdAt: string };
type Country  = { code: string; name: string };

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

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
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
          <span className="text-gray-400">Choisir un pays…</span>
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
                  placeholder="Rechercher un pays ou un code…"
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
                <li className="px-4 py-3 text-sm text-gray-400 text-center">Aucun pays trouvé</li>
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
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <p className="text-lg font-semibold text-gray-900">Supprimer ce passeport ?</p>
        <p className="mt-2 text-sm text-gray-500">
          Le passeport <span className="font-medium text-gray-800">{country}</span> sera retiré de ton profil. Cette action est réversible.
        </p>
        <div className="mt-5 flex gap-3">
          <button onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
            Annuler
          </button>
          <button onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition">
            Supprimer
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
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</label>
      <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3">
        <span className="text-sm text-gray-400 italic">{placeholder}</span>
        <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-400">Bientôt</span>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const toast  = useToast();

  const [user,    setUser]    = useState<User | null>(null);
  const [role,    setRoleState] = useState<"UNIVERSITY" | "STUDENT" | null>(null);
  const [loading, setLoading] = useState(true);

  // Student-only state
  const [countries,       setCountries]       = useState<Country[]>([]);
  const [passports,       setPassports]       = useState<Passport[]>([]);
  const [selectedCode,    setSelectedCode]    = useState<string>("FR");
  const [adding,          setAdding]          = useState(false);
  const [confirmCode,     setConfirmCode]     = useState<string | null>(null);

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
      Promise.all([loadCountries(), loadPassports()]).finally(() => setLoading(false));
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

  // ── Countries & Passports ───────────────────────────────────────────────────

  async function loadCountries() {
    try {
      const res = await authFetch("/api/v1/meta/countries");
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : [];
      const items: Country[] = Array.isArray(data) ? data : (data?.items ?? []);
      setCountries(items);
      if (items.find((c) => c.code === "FR")) setSelectedCode("FR");
      else if (items[0]) setSelectedCode(items[0].code);
    } catch { /* ignore */ }
  }

  async function loadPassports() {
    try {
      const res = await authFetch("/api/v1/passports");
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : [];
      setPassports(Array.isArray(data) ? data : (data?.items ?? []));
    } catch { /* ignore */ }
  }

  async function addPassport() {
    const code = normalizeIso2(selectedCode);
    if (!code) return;
    if (passports.some((p) => normalizeIso2(p.countryCode) === code)) {
      toast.err("Ce passeport est déjà dans ton profil.");
      return;
    }
    setAdding(true);
    try {
      const res = await authFetch("/api/v1/passports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode: code }),
      });
      if (!res.ok) throw new Error(await res.text() || `Erreur ${res.status}`);
      const raw     = await res.text();
      const created: Passport = raw ? JSON.parse(raw) : { id: crypto.randomUUID?.() ?? "tmp", countryCode: code, createdAt: new Date().toISOString() };
      setPassports((prev) => [created, ...prev]);
      toast.ok("Passeport ajouté !");
    } catch (e: any) {
      toast.err(e?.message ?? "Erreur lors de l'ajout");
    } finally {
      setAdding(false);
    }
  }

  async function confirmRemove() {
    if (!confirmCode) return;
    const code = normalizeIso2(confirmCode);
    const prev = passports;
    setPassports((p) => p.filter((x) => normalizeIso2(x.countryCode) !== code));
    setConfirmCode(null);
    try {
      const res = await authFetch(`/api/v1/passports/${code}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text() || `Erreur ${res.status}`);
      toast.ok("Passeport supprimé.");
    } catch (e: any) {
      setPassports(prev);
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
          <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
          <p className="text-sm text-gray-500">
            {isUniversity ? "Paramètres de votre établissement" : "Gère tes passeports et informations personnelles"}
          </p>
        </div>
      </div>

      {/* ── Compte ── */}
      <SectionCard title="Compte" icon="👤">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Adresse email</label>
            <div className="mt-1.5 flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-800">
              {user?.email ?? "—"}
              <span className={`ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                isUniversity ? "bg-violet-100 text-violet-700" : "bg-indigo-100 text-indigo-700"
              }`}>
                {isUniversity ? "Université" : "Étudiant"}
              </span>
            </div>
          </div>
          <ComingSoonField label="Mot de passe" placeholder="Modifier le mot de passe" />
        </div>
      </SectionCard>

      {/* ── Contenu selon le rôle ── */}
      {isUniversity ? (
        <>
          {/* Informations établissement */}
          <SectionCard title="Informations de l'établissement" icon="🏛️">
            <div className="space-y-4">
              <ComingSoonField label="Nom de l'établissement" placeholder="Ex : Université Paris-Saclay" />
              <ComingSoonField label="Pays" placeholder="Ex : France" />
              <ComingSoonField label="Site web" placeholder="Ex : https://universite.fr" />
              <ComingSoonField label="Numéro SIRET / identifiant" placeholder="Ex : 12345678900012" />
            </div>
          </SectionCard>

          {/* Contact */}
          <SectionCard title="Contact responsable mobilité" icon="📬">
            <div className="space-y-4">
              <ComingSoonField label="Nom du responsable" placeholder="Ex : Marie Dupont" />
              <ComingSoonField label="Téléphone" placeholder="Ex : +33 1 23 45 67 89" />
            </div>
          </SectionCard>

          {/* Programmes */}
          <SectionCard title="Programmes & partenaires" icon="🌍">
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
              <p className="text-3xl">🚧</p>
              <p className="mt-2 font-semibold text-gray-700">Fonctionnalité en développement</p>
              <p className="mt-1 text-sm text-gray-500">
                Gérez vos universités partenaires, programmes Erasmus+ et accords bilatéraux directement ici.
              </p>
            </div>
          </SectionCard>

          {/* Notifications */}
          <SectionCard title="Notifications" icon="🔔">
            <div className="space-y-3">
              {[
                { label: "Alertes documents expirés", desc: "Notifier quand un document étudiant expire" },
                { label: "Rappels de conformité", desc: "Résumé hebdomadaire du taux de conformité" },
                { label: "Nouveaux étudiants", desc: "Notifier à l'arrivée d'un nouvel étudiant" },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 opacity-60">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{n.label}</p>
                    <p className="text-xs text-gray-400">{n.desc}</p>
                  </div>
                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500">Bientôt</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </>
      ) : (
        <>
          {/* Passeports */}
          <SectionCard title="Mes passeports" icon="🛂">
            <p className="mb-5 text-sm text-gray-500 leading-relaxed">
              Ajoute tous les passeports que tu possèdes. StudyComply les utilise pour calculer les documents et visas dont tu as besoin selon ta destination.
            </p>

            {/* Add passport */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400">
                  Nationalité du passeport
                </label>
                <PassportCombobox
                  countries={countries}
                  value={selectedCode}
                  onChange={setSelectedCode}
                />
              </div>
              <button
                onClick={addPassport}
                disabled={adding || !selectedCode}
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition sm:self-auto self-stretch"
              >
                {adding ? (
                  <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Ajout…</>
                ) : (
                  <><svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg> Ajouter</>
                )}
              </button>
            </div>

            {/* Passport list */}
            {passports.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-8 text-center">
                <p className="text-3xl">🛂</p>
                <p className="mt-2 text-sm font-medium text-gray-500">Aucun passeport ajouté</p>
                <p className="mt-1 text-xs text-gray-400">Ajoute ton premier passeport ci-dessus</p>
              </div>
            ) : (
              <ul className="mt-5 space-y-2">
                {passports.map((p) => (
                  <li key={p.id}
                    className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3.5">
                    <span className="text-2xl leading-none">{flagEmoji(p.countryCode)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{countryName(p.countryCode)}</p>
                      <p className="text-xs text-gray-400">Ajouté le {fmtDate(p.createdAt)}</p>
                    </div>
                    <button
                      onClick={() => setConfirmCode(p.countryCode)}
                      className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Supprimer
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          {/* Infos personnelles */}
          <SectionCard title="Informations personnelles" icon="📝">
            <div className="space-y-4">
              <ComingSoonField label="Prénom & nom" placeholder="Ex : Jean Dupont" />
              <ComingSoonField label="Date de naissance" placeholder="Ex : 01/01/2000" />
              <ComingSoonField label="Université d'origine" placeholder="Ex : Université de Bordeaux" />
            </div>
          </SectionCard>

          {/* Notifications */}
          <SectionCard title="Notifications" icon="🔔">
            <div className="space-y-3">
              {[
                { label: "Expiration de documents", desc: "Rappel 60 jours avant l'expiration" },
                { label: "Nouvelles exigences", desc: "Alerte si les règles de ta destination changent" },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 opacity-60">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{n.label}</p>
                    <p className="text-xs text-gray-400">{n.desc}</p>
                  </div>
                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500">Bientôt</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </>
      )}

    </div>
  );
}
