"use client";

import * as React from "react";

type RequirementKind = "REQUIRED" | "INFO";
type RequirementPriority = "LOW" | "MEDIUM" | "HIGH";
type StayMode = "SHORT" | "LONG" | "ANY";

type UniReq = {
  id: string;
  universityId: string;
  title: string;
  description?: string | null;
  kind: RequirementKind;
  priority: RequirementPriority;
  stayMode: StayMode;
  dueDate?: string | null;
  dueDaysBefore?: number | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

type UniPublic = {
  id: string;
  slug: string;
  name: string;
  countryCode: string;
  city?: string | null;
  websiteUrl?: string | null;
};

const LS_KEY = "studycomply_university_slug";

function badge(kind: RequirementKind) {
  return kind === "REQUIRED"
    ? "bg-red-50 border-red-200 text-red-700"
    : "bg-blue-50 border-blue-200 text-blue-700";
}

export default function UniversityRequirementsCard({
  authFetch,
}: {
  authFetch: (path: string, init?: RequestInit) => Promise<{ res: Response; data: any }>;
}) {
  const [slug, setSlug] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<UniPublic[]>([]);
  const [items, setItems] = React.useState<UniReq[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const s = (window.localStorage.getItem(LS_KEY) ?? "").trim();
    if (s) setSlug(s);
  }, []);

  async function refresh(s: string) {
    const clean = s.trim();
    if (!clean) {
      setItems([]);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const r = await authFetch(`/api/v1/universities/${encodeURIComponent(clean)}/requirements`, { method: "GET" });
      if (!r.res.ok) throw new Error(r.data?.message ?? "Failed to load university requirements");
      setItems(Array.isArray(r.data) ? (r.data as UniReq[]) : []);
    } catch (e: any) {
      setError(e?.message ?? "Erreur");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refresh(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // simple search for universities (public endpoint)
  React.useEffect(() => {
    let alive = true;
    const q = query.trim();
    if (!q) {
      setSuggestions([]);
      return;
    }
    (async () => {
      try {
        const r = await authFetch(`/api/v1/universities?query=${encodeURIComponent(q)}`, { method: "GET" });
        if (!alive) return;
        if (!r.res.ok) return setSuggestions([]);
        const arr = Array.isArray(r.data) ? (r.data as UniPublic[]) : [];
        setSuggestions(arr.slice(0, 8));
      } catch {
        if (alive) setSuggestions([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [query, authFetch]);

  function saveSlug(s: string) {
    const clean = s.trim();
    setSlug(clean);
    window.localStorage.setItem(LS_KEY, clean);
  }

  return (
    <div className="border rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">University requirements</div>
          <div className="text-xs opacity-70">
            Pick a university (slug). Students will see these requirements here.
          </div>
        </div>

        <button
          className="text-sm underline opacity-80"
          onClick={() => refresh(slug)}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg p-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-start">
        <div className="space-y-1">
          <label className="text-sm font-medium">University slug</label>
          <div className="flex gap-2">
            <input
              className="w-full border rounded-lg p-2"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="ucsd"
            />
            <button
              className="border rounded-lg px-3"
              type="button"
              onClick={() => saveSlug(slug)}
            >
              Save
            </button>
          </div>
          <div className="text-xs opacity-70">
            Tip: use the search below then click a suggestion.
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Search university</label>
          <input
            className="w-full border rounded-lg p-2"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search (e.g. san diego)"
          />
          {suggestions.length > 0 && (
            <div className="border rounded-lg p-2 space-y-1">
              {suggestions.map((u) => (
                <button
                  key={u.id}
                  className="w-full text-left text-sm hover:underline"
                  type="button"
                  onClick={() => {
                    saveSlug(u.slug);
                    setQuery("");
                    setSuggestions([]);
                  }}
                >
                  <span className="font-medium">{u.name}</span>{" "}
                  <span className="opacity-70">({u.slug})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-sm opacity-70">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-sm opacity-70">No university requirements for this slug.</div>
      ) : (
        <div className="space-y-2">
          {items.map((x) => (
            <div key={x.id} className="border rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs border rounded-full px-2 py-0.5 ${badge(x.kind)}`}>
                  {x.kind}
                </span>
                <span className="text-xs opacity-70">{x.priority} · {x.stayMode}</span>
              </div>
              <div className="font-medium">{x.title}</div>
              {x.description && <div className="text-sm opacity-80">{x.description}</div>}
              <div className="text-xs opacity-70">
                dueDaysBefore: {x.dueDaysBefore ?? "—"} · dueDate: {x.dueDate ?? "—"}
              </div>
              {(x.ctaLabel || x.ctaUrl) && (
                <div className="text-xs">
                  CTA:{" "}
                  {x.ctaUrl ? (
                    <a className="underline" href={x.ctaUrl} target="_blank" rel="noreferrer">
                      {x.ctaLabel ?? x.ctaUrl}
                    </a>
                  ) : (
                    <span>{x.ctaLabel}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
