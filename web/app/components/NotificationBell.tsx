"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../lib/config";

// ─── Types ────────────────────────────────────────────────────────────────────

type Doc = { id: string; title: string; expiresAt: string };

type Notif = {
  id: string;
  level: "critical" | "warning" | "info";
  title: string;
  subtitle: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysUntil(iso: string) {
  return Math.floor((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

function computeNotifs(docs: Doc[]): Notif[] {
  const out: Notif[] = [];
  for (const doc of docs) {
    const d = daysUntil(doc.expiresAt);
    if (d < 0) {
      out.push({
        id: doc.id, level: "critical",
        title: `${doc.title} has expired`,
        subtitle: `Expired ${Math.abs(d)} day${Math.abs(d) !== 1 ? "s" : ""} ago`,
      });
    } else if (d <= 7) {
      out.push({
        id: doc.id, level: "critical",
        title: `${doc.title} expires very soon`,
        subtitle: d === 0 ? "Expires today!" : `Expires in ${d} day${d !== 1 ? "s" : ""}`,
      });
    } else if (d <= 30) {
      out.push({
        id: doc.id, level: "warning",
        title: `${doc.title} expires soon`,
        subtitle: `Expires in ${d} days`,
      });
    } else if (d <= 60) {
      out.push({
        id: doc.id, level: "info",
        title: `${doc.title} coming up`,
        subtitle: `Expires in ${d} days`,
      });
    }
  }
  // critical first, then warning, then info
  return out.sort((a, b) => ({ critical: 0, warning: 1, info: 2 }[a.level] - { critical: 0, warning: 1, info: 2 }[b.level]));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NotificationBell() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  // Fetch docs and recompute whenever the page changes
  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("token");
      if (!token) { setNotifs([]); return; }
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/documents`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const docs: Doc[] = await res.json();
        setNotifs(computeNotifs(docs));
      } catch { /* ignore */ }
    }
    load();
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const total    = notifs.length;
  const critical = notifs.filter((n) => n.level === "critical").length;
  const badgeColor = critical > 0 ? "bg-red-500" : "bg-amber-500";

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className={`relative flex h-8 w-8 items-center justify-center rounded-xl transition ${
          open ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-100"
        }`}
      >
        <BellIcon ringing={total > 0} />
        {total > 0 && (
          <span className={`absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full px-0.5 text-[10px] font-bold text-white ${badgeColor}`}>
            {total > 9 ? "9+" : total}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 w-80 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <p className="text-sm font-bold text-gray-900">Notifications</p>
              {total > 0 ? (
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white ${badgeColor}`}>
                  {total} alert{total !== 1 ? "s" : ""}
                </span>
              ) : (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  All clear
                </span>
              )}
            </div>

            {/* Body */}
            {total === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
                <span className="text-3xl">✅</span>
                <p className="text-sm font-semibold text-gray-800">You're all set!</p>
                <p className="text-xs text-gray-400 max-w-[200px] leading-relaxed">
                  No documents expiring in the next 60 days. Keep it up!
                </p>
              </div>
            ) : (
              <ul className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {notifs.map((n) => (
                  <li key={n.id} className={`flex items-start gap-3 px-4 py-3 ${
                    n.level === "critical" ? "bg-red-50/60"
                    : n.level === "warning" ? "bg-amber-50/60"
                    : "bg-blue-50/30"
                  }`}>
                    <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                      n.level === "critical" ? "bg-red-100 text-red-600"
                      : n.level === "warning" ? "bg-amber-100 text-amber-600"
                      : "bg-blue-100 text-blue-600"
                    }`}>
                      {n.level === "critical" ? "!" : n.level === "warning" ? "⚠" : "i"}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 leading-snug">{n.title}</p>
                      <p className={`mt-0.5 text-xs font-medium ${
                        n.level === "critical" ? "text-red-600"
                        : n.level === "warning" ? "text-amber-600"
                        : "text-blue-500"
                      }`}>{n.subtitle}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Footer */}
            <div className="border-t border-gray-100 p-2">
              <Link
                href="/student/dashboard"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition"
              >
                View all documents →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Bell SVG ─────────────────────────────────────────────────────────────────

function BellIcon({ ringing }: { ringing: boolean }) {
  return (
    <svg
      className={`h-5 w-5 transition-transform ${ringing ? "animate-[ring_0.4s_ease-in-out]" : ""}`}
      fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}
