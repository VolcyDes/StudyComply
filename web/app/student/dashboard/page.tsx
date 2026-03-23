"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../../lib/config";
import { clearAuth } from "../../../lib/auth";
import { buildChecklist, summarise } from "../../../lib/rules/engine";
import type { ChecklistItem } from "../../../lib/rules/engine";
import { SUPPORTED_DESTINATION_CODES, DESTINATION_GROUPS } from "../../../lib/rules/supported-destinations";
import { ALL_COUNTRIES } from "../../../lib/countries";
import { useLang } from "../../../lib/i18n";

// ─── Types ────────────────────────────────────────────────────────────────────

type User     = { id: string; email: string; role: string };
type Project  = { id: string; destinationCountry: string; purpose: string; startDate: string; endDate: string; isActive: boolean };
type Document = { id: string; title: string; type: string; expiresAt: string; fileName?: string | null; fileMime?: string | null; fileSize?: number | null };
type Passport = { id: string; countryCode: string; createdAt: string };
type Country  = { code: string; name: string };

// ─── Constants ────────────────────────────────────────────────────────────────

const PURPOSE_LABELS: Record<string, string> = {
  exchange: "Échange universitaire", internship: "Stage",
  degree: "Diplôme", phd: "Doctorat", language: "Cours de langue",
};
const PURPOSES = Object.entries(PURPOSE_LABELS);

const FLAGS: Record<string, string> = {
  FR:"🇫🇷",DE:"🇩🇪",ES:"🇪🇸",IT:"🇮🇹",GB:"🇬🇧",US:"🇺🇸",CA:"🇨🇦",NL:"🇳🇱",
  BE:"🇧🇪",PT:"🇵🇹",CH:"🇨🇭",SE:"🇸🇪",NO:"🇳🇴",DK:"🇩🇰",PL:"🇵🇱",CZ:"🇨🇿",
  AT:"🇦🇹",JP:"🇯🇵",KR:"🇰🇷",AU:"🇦🇺",NZ:"🇳🇿",BR:"🇧🇷",MX:"🇲🇽",CN:"🇨🇳",
  IN:"🇮🇳",ZA:"🇿🇦",MA:"🇲🇦",SN:"🇸🇳",CI:"🇨🇮",CM:"🇨🇲",TN:"🇹🇳",DZ:"🇩🇿",
  NG:"🇳🇬",GH:"🇬🇭",RO:"🇷🇴",HU:"🇭🇺",IE:"🇮🇪",FI:"🇫🇮",GR:"🇬🇷",TR:"🇹🇷",
  LU:"🇱🇺",IS:"🇮🇸",EE:"🇪🇪",LV:"🇱🇻",LT:"🇱🇹",SK:"🇸🇰",SI:"🇸🇮",HR:"🇭🇷",
};

const DOC_TYPE_LABELS: Record<string, string> = {
  passport:"🛂 Passeport", visa:"📋 Visa", insurance:"🏥 Assurance",
  acceptance:"🎓 Acceptation", transcript:"📄 Relevé", accommodation:"🏠 Logement",
  funds:"💰 Ressources", photos:"📸 Photos", appointment:"📅 Rendez-vous",
  residence_permit:"📇 Titre de séjour", bank:"🏦 Banque",
  enrollment:"✏️ Inscription", registration:"🏛️ Enregistrement", other:"📎 Autre",
};

// ─── Utils ────────────────────────────────────────────────────────────────────

async function safeJson(res: Response) {
  const text = await res.text();
  if (!text?.trim()) return null;
  try { return JSON.parse(text); } catch { return null; }
}

function fmtDate(iso: string, locale = "fr-FR") {
  return new Date(iso).toLocaleDateString(locale, { month: "short", year: "numeric" });
}
function fmtDateInput(iso: string) {
  return new Date(iso).toISOString().split("T")[0];
}
function isExpiringSoon(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  return diff > 0 && diff < 1000 * 60 * 60 * 24 * 60;
}
function isExpired(iso: string) {
  return new Date(iso).getTime() < Date.now();
}
function fmtBytes(n: number) {
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} Ko`;
  return `${(n / (1024 * 1024)).toFixed(1)} Mo`;
}

// ─── Next Step ────────────────────────────────────────────────────────────────

type StudentT = typeof import("../../../lib/i18n").TRANSLATIONS.fr.student;

function computeNextStep(project: Project | null, passports: Passport[], documents: Document[], ts: StudentT) {
  if (!project) return {
    icon:"🗺️", title: ts.nextProjectTitle, desc: ts.nextProjectDesc,
    cta: ts.nextProjectCta, action:"project" as const,
    color:"from-violet-500 to-indigo-600",
  };
  if (passports.length === 0) return {
    icon:"🛂", title: ts.nextPassportTitle, desc: ts.nextPassportDesc,
    cta: ts.nextPassportCta, action:"profile" as const,
    color:"from-amber-500 to-orange-600",
  };
  const hasDoc = (type: string) => documents.some((d) => d.type === type && d.fileName);
  if (!hasDoc("visa")) return {
    icon:"📋", title: ts.nextDocsTitle, desc: ts.nextDocsDesc,
    cta: ts.nextDocsCta, action:"add-doc" as const,
    color:"from-rose-500 to-pink-600",
  };
  const expiring = documents.find((d) => d.fileName && isExpiringSoon(d.expiresAt));
  if (expiring) return {
    icon:"⏳", title:`${expiring.title}`,
    desc:`${ts.expiry} ${fmtDate(expiring.expiresAt)}.`,
    cta: ts.nextCheckCta, action:"scroll-docs" as const,
    color:"from-amber-500 to-yellow-600",
  };
  return {
    icon:"✅", title: ts.nextDoneTitle, desc: ts.nextDoneDesc,
    cta: ts.nextDoneCta, action:"profile" as const,
    color:"from-emerald-500 to-teal-600",
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StudentDashboardPage() {
  const router = useRouter();
  const { t, lang } = useLang();

  const [user,      setUser]      = useState<User | null>(null);
  const [project,   setProject]   = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [passports, setPassports] = useState<Passport[]>([]);
  // Supported destination countries (static list filtered to supported zones)
  const supportedCountries = ALL_COUNTRIES.filter((c) => SUPPORTED_DESTINATION_CODES.has(c.code));

  // Helper: get country name by ISO code
  function countryName(code: string): string {
    return ALL_COUNTRIES.find((c) => c.code === code)?.name ?? code;
  }
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  // Modals
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showAddDoc,       setShowAddDoc]       = useState(false);

  // Project form
  const [projForm, setProjForm] = useState({ destinationCountry: "", purpose: "exchange", startDate: "", endDate: "" });
  const [savingProj, setSavingProj] = useState(false);
  const [projError,  setProjError]  = useState<string | null>(null);
  const [countryQuery, setCountryQuery] = useState("");

  // Doc form
  const [newDoc,    setNewDoc]    = useState({ title: "", type: "visa", expiresAt: "" });
  const [addingDoc, setAddingDoc] = useState(false);

  // Upload state: { [docId]: "uploading" | "done" | "error" }
  const [uploadState, setUploadState] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Docs filter & sort
  const [docFilter, setDocFilter] = useState<"all"|"expired"|"expiring"|"valid">("all");
  const [docSort,   setDocSort]   = useState<"date"|"title">("date");

  // Checklist / Timeline tab
  const [checklistTab, setChecklistTab] = useState<"checklist"|"timeline">("checklist");

  // ── Auth fetch ──
  function authFetch(path: string, init?: RequestInit) {
    const token = localStorage.getItem("token");
    if (!token) { router.replace("/login"); throw new Error("No token"); }
    return fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (res.status === 401) {
        clearAuth();
        router.replace("/login");
        throw new Error("Unauthorized");
      }
      return res;
    });
  }

  // ── Load all data ──
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

        if (projectRes.ok) { const p = await safeJson(projectRes); setProject(p ?? null); }
        if (docsRes.ok)     { const d = await safeJson(docsRes);     setDocuments(Array.isArray(d) ? d : []); }
        if (passportsRes.ok){ const p = await safeJson(passportsRes); setPassports(Array.isArray(p) ? p : []); }
      } catch (e: any) {
        if (e?.message !== "Unauthorized") setError(e?.message ?? "Erreur de chargement");
      } finally { setLoading(false); }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Prefill project form when editing ──
  function openProjectModal() {
    if (project) {
      setProjForm({
        destinationCountry: project.destinationCountry,
        purpose: project.purpose,
        startDate: fmtDateInput(project.startDate),
        endDate: fmtDateInput(project.endDate),
      });
      setCountryQuery(supportedCountries.find((c) => c.code === project.destinationCountry)?.name ?? project.destinationCountry);
    } else {
      setProjForm({ destinationCountry: "", purpose: "exchange", startDate: "", endDate: "" });
      setCountryQuery("");
    }
    setProjError(null);
    setShowProjectModal(true);
  }

  // ── Save project ──
  async function saveProject() {
    if (!projForm.destinationCountry || !projForm.startDate || !projForm.endDate) {
      setProjError(t.student.required);
      return;
    }
    setSavingProj(true);
    setProjError(null);
    try {
      const res = await authFetch("/api/v1/projects/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projForm),
      });
      const data = await safeJson(res);
      if (data?.message) { setProjError(data.message); return; }
      setProject(data);
      setShowProjectModal(false);
    } catch (e: any) {
      setProjError(e?.message ?? "Échec de sauvegarde");
    } finally { setSavingProj(false); }
  }

  // ── Delete project ──
  async function deleteProject() {
    if (!confirm(t.student.confirmDelete)) return;
    await authFetch("/api/v1/projects/active", { method: "DELETE" }).catch(() => {});
    setProject(null);
  }

  // ── Add document ──
  async function addDocument() {
    if (!newDoc.title || !newDoc.expiresAt) return;
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
    } catch { /* ignore */ }
    finally { setAddingDoc(false); }
  }

  // ── Delete document ──
  async function deleteDocument(id: string) {
    if (!confirm(t.student.deleteDocConfirm)) return;
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    authFetch(`/api/v1/documents/${id}`, { method: "DELETE" }).catch(() => {});
  }

  // ── Upload PDF ──
  async function uploadFile(docId: string, file: File) {
    setUploadState((s) => ({ ...s, [docId]: "uploading" }));
    try {
      const form = new FormData();
      form.append("file", file);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/v1/documents/${docId}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const updated = await safeJson(res);
      if (updated?.id) {
        setDocuments((prev) => prev.map((d) => d.id === docId ? { ...d, ...updated } : d));
        setUploadState((s) => ({ ...s, [docId]: "done" }));
      } else {
        setUploadState((s) => ({ ...s, [docId]: "error" }));
      }
    } catch { setUploadState((s) => ({ ...s, [docId]: "error" })); }
  }

  // ── Remove file ──
  async function removeFile(docId: string) {
    if (!confirm(t.student.deleteFileConfirm)) return;
    try {
      await authFetch(`/api/v1/documents/${docId}/file`, { method: "DELETE" });
      setDocuments((prev) => prev.map((d) => d.id === docId ? { ...d, fileName: null, fileMime: null, fileSize: null } : d));
    } catch { /* ignore */ }
  }

  // ── Download file ──
  async function downloadFile(docId: string, fileName: string) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/v1/documents/${docId}/file`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
  }

  // ── Filtered countries (only supported destinations) ──
  const filteredCountries = supportedCountries
    .filter((c) => !countryQuery || `${c.name} ${c.code}`.toLowerCase().includes(countryQuery.toLowerCase()))
    .slice(0, 50);

  // ── Smart checklist — MUST be before any early return (Rules of Hooks) ──
  const doneDocTypes = useMemo(
    () => new Set(documents.filter((d) => d.fileName).map((d) => d.type)),
    [documents],
  );
  const checklist = useMemo(
    () => project && passports.length > 0
      ? buildChecklist(
          { passportCodes: passports.map((p) => p.countryCode), destinationCountry: project.destinationCountry, startDate: project.startDate, endDate: project.endDate },
          doneDocTypes,
        )
      : [],
    [project, passports, doneDocTypes],
  );
  const summary = useMemo(() => summarise(checklist), [checklist]);

  // ── Filtered & sorted documents ──
  const filteredDocs = useMemo(() => {
    let docs = [...documents];
    if      (docFilter === "expired")  docs = docs.filter((d) => isExpired(d.expiresAt));
    else if (docFilter === "expiring") docs = docs.filter((d) => isExpiringSoon(d.expiresAt));
    else if (docFilter === "valid")    docs = docs.filter((d) => !isExpired(d.expiresAt) && !isExpiringSoon(d.expiresAt));
    if (docSort === "title") docs.sort((a, b) => a.title.localeCompare(b.title));
    else docs.sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());
    return docs;
  }, [documents, docFilter, docSort]);

  // ─── Loading / Error ──────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center space-y-3">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        <p className="text-sm text-gray-500">{t.common.loading}</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-center">
        <p className="text-red-700">{error}</p>
        <button onClick={() => router.replace("/login")}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm text-white hover:opacity-90">
          {t.nav.login}
        </button>
      </div>
    </div>
  );

  const nextStep     = computeNextStep(project, passports, documents, t.student);
  const docsWithFile = documents.filter((d) => d.fileName);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-8 py-10 text-white shadow-xl">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 right-20 h-24 w-24 rounded-full bg-white/5" />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
              🎓 {t.nav.spaceStudent}
            </span>
            <h1 className="mt-3 text-3xl font-bold">
              {t.student.greeting}{user?.email ? `, ${user.email.split("@")[0]}` : ""} 👋
            </h1>
            <p className="mt-1 text-indigo-200 text-sm">
              {project
                ? `${FLAGS[project.destinationCountry] ?? "🌍"} ${countryName(project.destinationCountry)} · ${PURPOSE_LABELS[project.purpose] ?? project.purpose} · ${fmtDate(project.startDate, lang === "en" ? "en-GB" : "fr-FR")} → ${fmtDate(project.endDate, lang === "en" ? "en-GB" : "fr-FR")}`
                : t.student.checklistEmpty}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <button onClick={openProjectModal}
              className="rounded-xl bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white/30 transition">
              {project ? t.student.editProject : t.student.createProject}
            </button>
            <button onClick={() => { clearAuth(); router.push("/login"); }}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white/20 transition">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {t.student.logout}
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon="🗺️" label={t.student.statDest}
          value={project ? `${FLAGS[project.destinationCountry] ?? "🌍"} ${countryName(project.destinationCountry)}` : t.common.na}
          sub={project ? `${fmtDate(project.startDate, lang === "en" ? "en-GB" : "fr-FR")} → ${fmtDate(project.endDate, lang === "en" ? "en-GB" : "fr-FR")}` : t.student.noDest}
          color="bg-indigo-50 border-indigo-100" iconBg="bg-indigo-100" />
        <StatCard icon="📄" label={t.student.statCompliance}
          value={checklist.length > 0 ? `${summary.score}%` : `${docsWithFile.length} ${docsWithFile.length > 1 ? t.student.docsDepositedPl : t.student.docsDeposited}`}
          sub={checklist.length > 0 ? `${summary.done}/${summary.total} ${t.student.done}` : t.student.noProject}
          color="bg-violet-50 border-violet-100" iconBg="bg-violet-100" />
        <StatCard icon="🛂" label={t.student.statPassports}
          value={passports.length === 0 ? t.common.na : `${passports.length} passport${passports.length > 1 ? "s" : ""}`}
          sub={passports.map((p) => p.countryCode).join(", ") || t.student.noPassports}
          color="bg-emerald-50 border-emerald-100" iconBg="bg-emerald-100" />
      </div>

      {/* ── Next step ── */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${nextStep.color} p-6 text-white shadow-lg`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">{t.student.nextStep}</p>
            <h2 className="mt-1 text-xl font-bold">{nextStep.icon} {nextStep.title}</h2>
            <p className="mt-1 text-sm text-white/80">{nextStep.desc}</p>
          </div>
          {nextStep.action === "project" ? (
            <button onClick={openProjectModal}
              className="shrink-0 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white/30 transition">
              {nextStep.cta} →
            </button>
          ) : nextStep.action === "add-doc" ? (
            <button onClick={() => setShowAddDoc(true)}
              className="shrink-0 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white/30 transition">
              {nextStep.cta} →
            </button>
          ) : (
            <Link href={nextStep.action === "profile" ? "/profile" : "#"}
              className="shrink-0 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white/30 transition">
              {nextStep.cta} →
            </Link>
          )}
        </div>
      </div>

      {/* ── Checklist intelligente ── */}
      <section>
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold">{t.student.myChecklist}</h2>
            {checklist.length > 0 && passports.length > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">
                {passports.map(p => p.countryCode).join(", ")} → {project?.destinationCountry}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {checklist.length > 0 && (
              <>
                {/* Tab toggle */}
                <div className="flex rounded-xl border bg-gray-50 p-0.5 text-xs font-medium">
                  <button onClick={() => setChecklistTab("checklist")}
                    className={`rounded-lg px-3 py-1.5 transition ${checklistTab === "checklist" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
                    📋 {t.student.checklist}
                  </button>
                  <button onClick={() => setChecklistTab("timeline")}
                    className={`rounded-lg px-3 py-1.5 transition ${checklistTab === "timeline" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
                    📅 {t.student.timeline}
                  </button>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  summary.score === 100 ? "bg-emerald-100 text-emerald-700" :
                  summary.overdue > 0  ? "bg-red-100 text-red-700" :
                  summary.critical > 0 ? "bg-orange-100 text-orange-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {summary.done}/{summary.total} · {summary.score}%
                </span>
              </>
            )}
          </div>
        </div>

        {/* Score bar */}
        {checklist.length > 0 && (
          <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                summary.score === 100 ? "bg-emerald-500" :
                summary.overdue > 0  ? "bg-red-500" :
                summary.critical > 0 ? "bg-orange-500" : "bg-indigo-500"
              }`}
              style={{ width: `${summary.score}%` }}
            />
          </div>
        )}

        {/* No project or no passports */}
        {checklist.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
            <p className="text-3xl">📋</p>
            <p className="mt-2 font-medium text-gray-700">{t.student.myChecklist}</p>
            <p className="mt-1 text-sm text-gray-500">
              {!project ? t.student.checklistEmpty : t.student.noPassportWarn}
            </p>
            {!project
              ? <button onClick={openProjectModal} className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">{t.student.createProject}</button>
              : <Link href="/profile" className="mt-4 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">{t.student.goProfile}</Link>
            }
          </div>
        ) : checklistTab === "checklist" ? (
          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            {checklist.map((item, i) => (
              <ChecklistRow
                key={item.id}
                item={item}
                isLast={i === checklist.length - 1}
                onAddDoc={() => setShowAddDoc(true)}
              />
            ))}
          </div>
        ) : (
          /* Timeline view */
          <TimelineView checklist={checklist} documents={documents} lang={lang} />
        )}
      </section>

      {/* ── Mes documents ── */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">{t.student.myDocs}</h2>
          <button onClick={() => setShowAddDoc(true)}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition">
            {t.student.addDoc}
          </button>
        </div>

        {documents.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {/* Filter pills */}
            <div className="flex rounded-xl border bg-gray-50 p-0.5 text-xs font-medium">
              {([
                { key: "all",      label: t.student.filterAll      },
                { key: "expired",  label: t.student.filterExpired  },
                { key: "expiring", label: t.student.filterExpiring },
                { key: "valid",    label: t.student.filterValid    },
              ] as { key: "all"|"expired"|"expiring"|"valid"; label: string }[]).map((f) => (
                <button key={f.key} onClick={() => setDocFilter(f.key)}
                  className={`rounded-lg px-3 py-1.5 transition ${docFilter === f.key ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
                  {f.label}
                </button>
              ))}
            </div>
            {/* Sort */}
            <div className="flex rounded-xl border bg-gray-50 p-0.5 text-xs font-medium">
              <button onClick={() => setDocSort("date")}
                className={`rounded-lg px-3 py-1.5 transition ${docSort === "date" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
                📅 {t.student.sortDate}
              </button>
              <button onClick={() => setDocSort("title")}
                className={`rounded-lg px-3 py-1.5 transition ${docSort === "title" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
                🔤 {t.student.sortTitle}
              </button>
            </div>
          </div>
        )}

        {documents.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-gray-50 px-6 py-12 text-center">
            <p className="text-3xl">📁</p>
            <p className="mt-2 font-medium text-gray-700">{t.student.noDocsYet}</p>
            <button onClick={() => setShowAddDoc(true)}
              className="mt-4 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              {t.student.addFirst}
            </button>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-gray-50 px-6 py-10 text-center">
            <p className="text-2xl">🔍</p>
            <p className="mt-2 text-sm text-gray-500">{t.student.noDocsFilter}</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredDocs.map((doc) => (
              <DocCard key={doc.id} doc={doc}
                uploadStatus={uploadState[doc.id]}
                fileInputRef={(el) => { fileInputRefs.current[doc.id] = el; }}
                onFileChange={(file) => uploadFile(doc.id, file)}
                onRemoveFile={() => removeFile(doc.id)}
                onDownload={() => downloadFile(doc.id, doc.fileName!)}
                onDelete={() => deleteDocument(doc.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Modal : Projet ── */}
      {showProjectModal && (
        <Modal onClose={() => setShowProjectModal(false)}>
          <h3 className="text-lg font-bold text-gray-900">{project ? t.student.modalEditProject : t.student.modalNewProject}</h3>
          <p className="mt-1 text-sm text-gray-500">{t.student.modalProjectSub}</p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">{t.student.destLabel}</label>
              <p className="mt-0.5 text-xs text-gray-400">{t.student.destHint}</p>
              <input
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder={t.student.destSearch}
                value={countryQuery}
                onChange={(e) => {
                  setCountryQuery(e.target.value);
                  setProjForm((f) => ({ ...f, destinationCountry: "" }));
                }}
              />
              {!projForm.destinationCountry && filteredCountries.length > 0 && (
                <div className="mt-1 max-h-52 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                  {countryQuery ? (
                    filteredCountries.map((c) => (
                      <button key={c.code} type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-indigo-50 text-left"
                        onClick={() => { setProjForm((f) => ({ ...f, destinationCountry: c.code })); setCountryQuery(`${FLAGS[c.code] ?? "🌍"} ${c.name}`); }}>
                        <span>{FLAGS[c.code] ?? "🌍"}</span>
                        <span className="font-medium">{c.name}</span>
                        <span className="ml-auto text-xs text-gray-400">{c.code}</span>
                      </button>
                    ))
                  ) : (
                    DESTINATION_GROUPS.map((group) => (
                      <div key={group.label}>
                        <p className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">{group.label}</p>
                        {(group.codes as readonly string[]).map((code) => {
                          const country = supportedCountries.find((c) => c.code === code);
                          if (!country) return null;
                          return (
                            <button key={code} type="button"
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-indigo-50 text-left"
                              onClick={() => { setProjForm((f) => ({ ...f, destinationCountry: code })); setCountryQuery(`${FLAGS[code] ?? "🌍"} ${country.name}`); }}>
                              <span>{FLAGS[code] ?? "🌍"}</span>
                              <span className="font-medium">{country.name}</span>
                              <span className="ml-auto text-xs text-gray-400">{code}</span>
                            </button>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>
              )}
              {projForm.destinationCountry && (
                <p className="mt-1.5 text-xs text-emerald-600 font-medium">{t.student.destSelected} {projForm.destinationCountry} {t.student.destSelectedSuffix}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">{t.student.mobilityType}</label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PURPOSES.map(([val, label]) => (
                  <button key={val} type="button"
                    onClick={() => setProjForm((f) => ({ ...f, purpose: val }))}
                    className={`rounded-xl border-2 px-3 py-2 text-xs font-medium transition text-left ${projForm.purpose === val ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">{t.student.departure}</label>
                <input type="date"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  value={projForm.startDate}
                  onChange={(e) => setProjForm((f) => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">{t.student.returnDate}</label>
                <input type="date"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  value={projForm.endDate}
                  onChange={(e) => setProjForm((f) => ({ ...f, endDate: e.target.value }))} />
              </div>
            </div>

            {projError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">⚠ {projError}</div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            {project && (
              <button onClick={() => { setShowProjectModal(false); deleteProject(); }}
                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition">
                {t.common.delete}
              </button>
            )}
            <button onClick={() => setShowProjectModal(false)}
              className="flex-1 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50">
              {t.common.cancel}
            </button>
            <button onClick={saveProject} disabled={savingProj || !projForm.destinationCountry || !projForm.startDate || !projForm.endDate}
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition">
              {savingProj ? <Spinner /> : t.student.saveProject}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modal : Ajouter document ── */}
      {showAddDoc && (
        <Modal onClose={() => setShowAddDoc(false)}>
          <h3 className="text-lg font-bold text-gray-900">{t.student.modalNewDoc}</h3>
          <p className="mt-1 text-sm text-gray-500">{t.student.docTitle}</p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">{t.student.docTitle}</label>
              <input className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Ex: Passeport français"
                value={newDoc.title}
                onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Type</label>
              <select className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                value={newDoc.type}
                onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}>
                {Object.entries(DOC_TYPE_LABELS).map(([type, label]) => (
                  <option key={type} value={type}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">{t.student.docExpiry}</label>
              <input type="date"
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                value={newDoc.expiresAt}
                onChange={(e) => setNewDoc({ ...newDoc, expiresAt: e.target.value })} />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={() => setShowAddDoc(false)}
              className="flex-1 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50">
              {t.common.cancel}
            </button>
            <button onClick={addDocument}
              disabled={addingDoc || !newDoc.title || !newDoc.expiresAt}
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
              {addingDoc ? <Spinner /> : t.common.save}
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        {children}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span className="flex items-center justify-center gap-2">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      Chargement…
    </span>
  );
}

function StatCard({ icon, label, value, sub, color, iconBg }: { icon: string; label: string; value: string; sub: string; color: string; iconBg: string }) {
  return (
    <div className={`rounded-2xl border p-5 ${color}`}>
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-lg ${iconBg}`}>{icon}</div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{sub}</p>
    </div>
  );
}

// ── Urgency config (labels injected by ChecklistRow) ─────────────────────────

const URGENCY_STYLES = {
  overdue:     { bar: "bg-red-500",    badge: "bg-red-100 text-red-700",       dot: "bg-red-500"    },
  critical:    { bar: "bg-orange-500", badge: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  soon:        { bar: "bg-amber-500",  badge: "bg-amber-100 text-amber-700",   dot: "bg-amber-500"  },
  upcoming:    { bar: "bg-indigo-400", badge: "bg-indigo-100 text-indigo-700", dot: "bg-indigo-400" },
  future:      { bar: "bg-gray-300",   badge: "bg-gray-100 text-gray-500",     dot: "bg-gray-300"   },
  post_arrival:{ bar: "bg-violet-400", badge: "bg-violet-100 text-violet-700", dot: "bg-violet-400" },
} as const;

function ChecklistRow({ item, isLast, onAddDoc }: {
  item: ChecklistItem;
  isLast: boolean;
  onAddDoc: () => void;
}) {
  const { t } = useLang();
  const cfg   = URGENCY_STYLES[item.urgency];
  const done  = item.status === "done";

  const urgencyLabel: Record<string, string> = {
    overdue:     t.student.urgencyOverdue,
    critical:    t.student.urgencyCritical,
    soon:        t.student.urgencySoon,
    upcoming:    t.student.urgencyUpcoming,
    future:      t.student.urgencyFuture,
    post_arrival:t.student.urgencyPostArr,
  };

  return (
    <div className={`flex items-start gap-3 sm:gap-4 px-4 sm:px-5 py-4 ${!isLast ? "border-b" : ""} ${done ? "opacity-60" : ""}`}>
      {/* Left accent bar */}
      <div className={`mt-1 h-full w-1 shrink-0 self-stretch rounded-full ${done ? "bg-emerald-400" : cfg.bar}`} style={{ minHeight: 36 }} />

      {/* Icon */}
      <span className="mt-0.5 text-xl leading-none shrink-0">{item.icon}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className={`font-semibold text-sm ${done ? "line-through text-gray-400" : "text-gray-900"}`}>
            {item.label}
          </p>
          {item.priority === "required" && !done && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">{t.student.required}</span>
          )}
          {item.priority === "recommended" && !done && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-500">{t.student.recommended}</span>
          )}
          {done && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">{t.student.doneBadge}</span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{item.description}</p>
        {item.note && (
          <p className="mt-1 text-xs text-amber-600 leading-relaxed">ℹ️ {item.note}</p>
        )}
      </div>

      {/* Right: deadline + urgency */}
      <div className="shrink-0 text-right">
        {done ? (
          <span className="text-xs text-emerald-600">{t.student.completedBadge}</span>
        ) : (
          <>
            <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${cfg.badge}`}>
              {urgencyLabel[item.urgency] ?? item.urgency}
            </span>
            <p className="mt-1 text-[11px] text-gray-400">{item.deadlineLabel}</p>
          </>
        )}
        {!done && (
          <button
            onClick={onAddDoc}
            className="mt-1.5 block text-[11px] text-indigo-500 hover:text-indigo-700 hover:underline"
          >
            {t.student.addLink}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Timeline view ─────────────────────────────────────────────────────────────

function TimelineView({ checklist, documents, lang }: { checklist: ChecklistItem[]; documents: Document[]; lang: string }) {
  const { t } = useLang();

  // Build timeline events from checklist items + document expiry dates
  type Event = { date: string; label: string; icon: string; badge: string; badgeText: string };
  const events: Event[] = [];

  // Checklist deadlines (items that have a deadline label but are not "done")
  for (const item of checklist) {
    if (item.status === "done") continue;
    const cfg = URGENCY_STYLES[item.urgency];
    events.push({
      date: item.deadlineLabel || "",
      label: item.label,
      icon: item.icon,
      badge: cfg.badge,
      badgeText: {
        overdue: t.student.urgencyOverdue,
        critical: t.student.urgencyCritical,
        soon: t.student.urgencySoon,
        upcoming: t.student.urgencyUpcoming,
        future: t.student.urgencyFuture,
        post_arrival: t.student.urgencyPostArr,
      }[item.urgency] ?? item.urgency,
    });
  }

  // Document expiry dates
  for (const doc of documents) {
    if (!doc.expiresAt) continue;
    const expired  = isExpired(doc.expiresAt);
    const expiring = isExpiringSoon(doc.expiresAt);
    events.push({
      date: fmtDate(doc.expiresAt, lang === "en" ? "en-GB" : "fr-FR"),
      label: doc.title,
      icon: "📄",
      badge: expired ? "bg-red-100 text-red-700" : expiring ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500",
      badgeText: expired ? t.student.expired : expiring ? t.student.expiringSoon : t.student.valid,
    });
  }

  if (events.length === 0) return (
    <div className="rounded-2xl border border-dashed bg-gray-50 px-6 py-10 text-center">
      <p className="text-2xl">📅</p>
      <p className="mt-2 text-sm text-gray-500">{t.student.noDocsFilter}</p>
    </div>
  );

  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
      <div className="divide-y">
        {events.map((ev, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3">
            <span className="text-lg shrink-0">{ev.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{ev.label}</p>
              <p className="text-xs text-gray-400">{ev.date}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${ev.badge}`}>
              {ev.badgeText}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "ok" | "warn" | "missing" }) {
  if (status === "ok") return <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />OK</span>;
  if (status === "warn") return <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Attention</span>;
  return <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500"><span className="h-1.5 w-1.5 rounded-full bg-gray-400" />Manquant</span>;
}

function DocCard({ doc, uploadStatus, fileInputRef, onFileChange, onRemoveFile, onDownload, onDelete }: {
  doc: Document;
  uploadStatus?: string;
  fileInputRef: (el: HTMLInputElement | null) => void;
  onFileChange: (file: File) => void;
  onRemoveFile: () => void;
  onDownload:   () => void;
  onDelete: () => void;
}) {
  const { t } = useLang();
  const expired  = isExpired(doc.expiresAt);
  const expiring = isExpiringSoon(doc.expiresAt);
  const isUploading = uploadStatus === "uploading";

  return (
    <div className={`rounded-2xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${expired ? "border-red-200" : expiring ? "border-amber-200" : ""}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-gray-900">{doc.title}</p>
          <p className="mt-0.5 text-xs text-gray-400">{DOC_TYPE_LABELS[doc.type] ?? doc.type}</p>
        </div>
        <button onClick={onDelete}
          className="shrink-0 rounded-lg p-1 text-gray-300 hover:bg-red-50 hover:text-red-500 transition">
          ✕
        </button>
      </div>

      {/* Expiry */}
      <p className={`mt-3 text-xs font-medium ${expired ? "text-red-600" : expiring ? "text-amber-600" : "text-gray-400"}`}>
        {expired ? t.student.expired : expiring ? t.student.expiringSoon : t.student.valid} · {fmtDate(doc.expiresAt)}
      </p>

      {/* File section */}
      <div className="mt-3 border-t pt-3">
        {doc.fileName ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm">📎</span>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-gray-700">{doc.fileName}</p>
                {doc.fileSize && <p className="text-xs text-gray-400">{fmtBytes(doc.fileSize)}</p>}
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <button onClick={onDownload}
                className="rounded-lg border border-indigo-200 px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 transition">
                {t.student.downloadPdf}
              </button>
              <button onClick={onRemoveFile}
                className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:border-red-200 hover:text-red-500 transition">
                {t.student.removeFile}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <input ref={fileInputRef} type="file" accept=".pdf" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileChange(f); }} />
            <button
              onClick={() => { const el = (fileInputRef as any)?.current ?? null; if (el) el.click(); }}
              disabled={isUploading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 transition">
              {isUploading ? (
                <><span className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />{t.student.uploadingFile}</>
              ) : <>{t.student.attachPdf}</>}
            </button>
            {uploadStatus === "error" && <p className="mt-1 text-xs text-red-500">{t.student.uploadError}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
