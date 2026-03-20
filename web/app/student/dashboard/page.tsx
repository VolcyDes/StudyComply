"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../../lib/config";

// ─── Types ────────────────────────────────────────────────────────────────────

type User = { id: string; email: string; role: string };

type Project = {
  id: string;
  destinationCountry: string;
  purpose: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

type Document = {
  id: string;
  title: string;
  type: string;
  expiresAt: string;
  fileName?: string | null;
  fileMime?: string | null;
};

type Passport = {
  id: string;
  countryCode: string;
  createdAt: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PURPOSE_LABELS: Record<string, string> = {
  exchange: "Échange universitaire",
  internship: "Stage",
  degree: "Diplôme",
  phd: "Doctorat",
  language: "Cours de langue",
};

const COUNTRY_FLAGS: Record<string, string> = {
  FR: "🇫🇷", DE: "🇩🇪", ES: "🇪🇸", IT: "🇮🇹", GB: "🇬🇧", US: "🇺🇸",
  CA: "🇨🇦", NL: "🇳🇱", BE: "🇧🇪", PT: "🇵🇹", CH: "🇨🇭", SE: "🇸🇪",
  NO: "🇳🇴", DK: "🇩🇰", PL: "🇵🇱", CZ: "🇨🇿", AT: "🇦🇹", JP: "🇯🇵",
  KR: "🇰🇷", AU: "🇦🇺", NZ: "🇳🇿", BR: "🇧🇷", MX: "🇲🇽", CN: "🇨🇳",
  IN: "🇮🇳", ZA: "🇿🇦", MA: "🇲🇦", SN: "🇸🇳", CI: "🇨🇮", CM: "🇨🇲",
};

function flag(code: string) {
  return COUNTRY_FLAGS[code] ?? "🌍";
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    month: "short",
    year: "numeric",
  });
}

function isExpiringSoon(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  return diff > 0 && diff < 1000 * 60 * 60 * 24 * 60; // < 60 jours
}

function isExpired(iso: string) {
  return new Date(iso).getTime() < Date.now();
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function safeJson(res: Response) {
  const text = await res.text();
  if (!text || !text.trim()) return null;
  try { return JSON.parse(text); } catch { return null; }
}

// ─── Auth fetch ───────────────────────────────────────────────────────────────

function useAuthFetch() {
  const router = useRouter();

  return async function authFetch(path: string, init?: RequestInit) {
    const token = localStorage.getItem("token");
    if (!token) { router.replace("/login"); throw new Error("No token"); }

    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.replace("/login");
      throw new Error("Unauthorized");
    }
    return res;
  };
}

// ─── Next Step logic ──────────────────────────────────────────────────────────

function computeNextStep(
  project: Project | null,
  passports: Passport[],
  documents: Document[],
) {
  if (!project) return {
    icon: "🗺️",
    title: "Configure ton projet",
    desc: "Indique ta destination et ton type de mobilité pour démarrer.",
    cta: "Créer un projet",
    href: "/student/dashboard",
    color: "from-violet-500 to-indigo-600",
  };

  if (passports.length === 0) return {
    icon: "🛂",
    title: "Ajoute ton passeport",
    desc: "Ton passeport est indispensable pour calculer tes exigences visa.",
    cta: "Gérer mes passeports",
    href: "/profile",
    color: "from-amber-500 to-orange-600",
  };

  const hasDoc = (type: string) =>
    documents.some((d) => d.type.toLowerCase() === type.toLowerCase() && d.fileName);

  if (!hasDoc("visa")) return {
    icon: "📋",
    title: "Dépose ton visa",
    desc: "Upload ton visa ou visa en cours pour suivre son expiration.",
    cta: "Ajouter un document",
    href: "/student/dashboard",
    color: "from-rose-500 to-pink-600",
  };

  const expiring = documents.find((d) => d.fileName && isExpiringSoon(d.expiresAt));
  if (expiring) return {
    icon: "⏳",
    title: `${expiring.title} expire bientôt`,
    desc: `Ton document expire le ${fmtDate(expiring.expiresAt)}. Pense à le renouveler.`,
    cta: "Voir mes documents",
    href: "/student/dashboard",
    color: "from-amber-500 to-yellow-600",
  };

  return {
    icon: "✅",
    title: "Tout est en ordre !",
    desc: "Continue à surveiller tes dates d'expiration.",
    cta: "Voir le profil",
    href: "/profile",
    color: "from-emerald-500 to-teal-600",
  };
}

// ─── Checklist ────────────────────────────────────────────────────────────────

const REQUIRED_DOCS = [
  { type: "passport", label: "Passeport", icon: "🛂" },
  { type: "visa", label: "Visa étudiant", icon: "📋" },
  { type: "insurance", label: "Assurance santé", icon: "🏥" },
  { type: "acceptance", label: "Lettre d'acceptation", icon: "🎓" },
  { type: "transcript", label: "Relevés de notes", icon: "📄" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function StudentDashboardPage() {
  const router = useRouter();
  const authFetch = useAuthFetch();

  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [passports, setPassports] = useState<Passport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add document modal
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: "", type: "visa", expiresAt: "" });
  const [addingDoc, setAddingDoc] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [meRes, projectRes, docsRes, passportsRes] = await Promise.all([
          authFetch("/api/v1/me"),
          authFetch("/api/v1/projects/active"),
          authFetch("/api/v1/documents"),
          authFetch("/api/v1/passports"),
        ]);

        const meData = await safeJson(meRes);
        setUser(meData?.user ?? null);

        if (projectRes.ok) {
          const p = await safeJson(projectRes);
          setProject(p ?? null);
        }

        if (docsRes.ok) {
          const d = await safeJson(docsRes);
          setDocuments(Array.isArray(d) ? d : []);
        }

        if (passportsRes.ok) {
          const p = await safeJson(passportsRes);
          setPassports(Array.isArray(p) ? p : []);
        }
      } catch (e: any) {
        if (e?.message !== "Unauthorized") setError(e?.message ?? "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addDocument() {
    if (!newDoc.title || !newDoc.type || !newDoc.expiresAt) return;
    setAddingDoc(true);
    try {
      const res = await authFetch("/api/v1/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDoc),
      });
      const created = await safeJson(res);
      if (created) setDocuments((prev) => [created, ...prev]);
      setShowAddDoc(false);
      setNewDoc({ title: "", type: "visa", expiresAt: "" });
    } catch {
      // ignore
    } finally {
      setAddingDoc(false);
    }
  }

  async function deleteDocument(id: string) {
    const ok = confirm("Supprimer ce document ?");
    if (!ok) return;
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    await authFetch(`/api/v1/documents/${id}`, { method: "DELETE" }).catch(() => {});
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-gray-500">Chargement de ton dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-center">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => router.replace("/login")}
            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm text-white hover:opacity-90"
          >
            Reconnexion
          </button>
        </div>
      </div>
    );
  }

  const nextStep = computeNextStep(project, passports, documents);
  const docsWithFile = documents.filter((d) => d.fileName);
  const checklistMatched = REQUIRED_DOCS.filter((r) =>
    documents.some((d) => d.type.toLowerCase() === r.type && d.fileName)
  ).length;

  return (
    <div className="space-y-8">

      {/* ── Hero header ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-8 py-10 text-white shadow-xl">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 right-20 h-24 w-24 rounded-full bg-white/5" />
        <div className="relative">
          <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
            🎓 Espace étudiant
          </span>
          <h1 className="mt-3 text-3xl font-bold">
            Bonjour{user?.email ? `, ${user.email.split("@")[0]}` : ""} 👋
          </h1>
          <p className="mt-1 text-indigo-200">
            {project
              ? `Mobilité vers ${flag(project.destinationCountry)} ${project.destinationCountry} · ${PURPOSE_LABELS[project.purpose] ?? project.purpose}`
              : "Configure ton projet de mobilité pour commencer."}
          </p>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon="🗺️"
          label="Destination"
          value={project ? `${flag(project.destinationCountry)} ${project.destinationCountry}` : "—"}
          sub={project ? `${fmtDate(project.startDate)} → ${fmtDate(project.endDate)}` : "Aucun projet"}
          color="bg-indigo-50 border-indigo-100"
          iconBg="bg-indigo-100"
        />
        <StatCard
          icon="📄"
          label="Documents"
          value={`${docsWithFile.length} déposé${docsWithFile.length > 1 ? "s" : ""}`}
          sub={`${checklistMatched}/${REQUIRED_DOCS.length} checklist complète`}
          color="bg-violet-50 border-violet-100"
          iconBg="bg-violet-100"
        />
        <StatCard
          icon="🛂"
          label="Passeports"
          value={passports.length === 0 ? "Aucun" : `${passports.length} passeport${passports.length > 1 ? "s" : ""}`}
          sub={passports.map((p) => p.countryCode).join(", ") || "Ajouter dans Profil"}
          color="bg-emerald-50 border-emerald-100"
          iconBg="bg-emerald-100"
        />
      </div>

      {/* ── Next step ── */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${nextStep.color} p-6 text-white shadow-lg`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-white/70">Prochaine étape</p>
            <h2 className="mt-1 text-xl font-bold">{nextStep.icon} {nextStep.title}</h2>
            <p className="mt-1 text-sm text-white/80">{nextStep.desc}</p>
          </div>
          <Link
            href={nextStep.href}
            className="shrink-0 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white/30 transition"
          >
            {nextStep.cta} →
          </Link>
        </div>
      </div>

      {/* ── Checklist ── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Checklist documents</h2>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            {checklistMatched}/{REQUIRED_DOCS.length} complétés
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          {REQUIRED_DOCS.map((item, i) => {
            const matched = documents.find(
              (d) => d.type.toLowerCase() === item.type && d.fileName
            );
            const docNoFile = documents.find(
              (d) => d.type.toLowerCase() === item.type && !d.fileName
            );

            let status: "ok" | "warn" | "missing" = "missing";
            if (matched) {
              status = isExpiringSoon(matched.expiresAt) || isExpired(matched.expiresAt) ? "warn" : "ok";
            } else if (docNoFile) {
              status = "warn";
            }

            return (
              <div
                key={item.type}
                className={`flex items-center justify-between gap-4 px-5 py-4 ${i !== REQUIRED_DOCS.length - 1 ? "border-b" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    {matched && (
                      <p className="text-xs text-gray-500">
                        {isExpired(matched.expiresAt)
                          ? `⚠️ Expiré le ${fmtDate(matched.expiresAt)}`
                          : `Expire le ${fmtDate(matched.expiresAt)}`}
                      </p>
                    )}
                    {docNoFile && !matched && (
                      <p className="text-xs text-amber-600">Enregistré · fichier manquant</p>
                    )}
                    {status === "missing" && !docNoFile && (
                      <p className="text-xs text-gray-400">Non ajouté</p>
                    )}
                  </div>
                </div>
                <StatusBadge status={status} />
              </div>
            );
          })}
        </div>
      </section>

      {/* ── My documents ── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Mes documents</h2>
          <button
            onClick={() => setShowAddDoc(true)}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            + Ajouter
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-gray-50 px-6 py-12 text-center">
            <p className="text-3xl">📁</p>
            <p className="mt-2 font-medium text-gray-700">Aucun document</p>
            <p className="mt-1 text-sm text-gray-500">
              Ajoute tes documents pour suivre leurs dates d'expiration.
            </p>
            <button
              onClick={() => setShowAddDoc(true)}
              className="mt-4 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Ajouter un document
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {documents.map((doc) => (
              <DocCard
                key={doc.id}
                doc={doc}
                onDelete={() => deleteDocument(doc.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Add document modal ── */}
      {showAddDoc && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold">Nouveau document</h3>
            <p className="mt-1 text-sm text-gray-500">Renseigne les infos de base.</p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Titre</label>
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Passeport français"
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Type</label>
                <select
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newDoc.type}
                  onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}
                >
                  {REQUIRED_DOCS.map((d) => (
                    <option key={d.type} value={d.type}>{d.icon} {d.label}</option>
                  ))}
                  <option value="other">📎 Autre</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Date d'expiration</label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newDoc.expiresAt}
                  onChange={(e) => setNewDoc({ ...newDoc, expiresAt: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowAddDoc(false)}
                className="flex-1 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={addDocument}
                disabled={addingDoc || !newDoc.title || !newDoc.expiresAt}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {addingDoc ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, sub, color, iconBg,
}: {
  icon: string; label: string; value: string; sub: string; color: string; iconBg: string;
}) {
  return (
    <div className={`rounded-2xl border p-5 ${color}`}>
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-lg ${iconBg}`}>
        {icon}
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{sub}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: "ok" | "warn" | "missing" }) {
  if (status === "ok") return (
    <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> OK
    </span>
  );
  if (status === "warn") return (
    <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Attention
    </span>
  );
  return (
    <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" /> Manquant
    </span>
  );
}

function DocCard({ doc, onDelete }: { doc: Document; onDelete: () => void }) {
  const expired = isExpired(doc.expiresAt);
  const expiring = isExpiringSoon(doc.expiresAt);

  const docTypeLabel: Record<string, string> = {
    passport: "🛂 Passeport", visa: "📋 Visa", insurance: "🏥 Assurance",
    acceptance: "🎓 Acceptation", transcript: "📄 Relevé", other: "📎 Autre",
  };

  return (
    <div className={`rounded-2xl border bg-white p-4 shadow-sm transition ${expired ? "border-red-200" : expiring ? "border-amber-200" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-gray-900">{doc.title}</p>
          <p className="mt-0.5 text-xs text-gray-500">
            {docTypeLabel[doc.type] ?? doc.type}
          </p>
        </div>
        <button
          onClick={onDelete}
          className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
          title="Supprimer"
        >
          ✕
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className={`text-xs font-medium ${expired ? "text-red-600" : expiring ? "text-amber-600" : "text-gray-500"}`}>
          {expired ? "⚠️ Expiré" : expiring ? "⏳ Expire bientôt" : "✓ Valide"} · {fmtDate(doc.expiresAt)}
        </span>
        {doc.fileName ? (
          <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
            📎 Fichier
          </span>
        ) : (
          <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            Sans fichier
          </span>
        )}
      </div>
    </div>
  );
}
