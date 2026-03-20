"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={`rounded-xl px-3 py-2 text-sm transition ${
        active
          ? "bg-indigo-50 font-semibold text-indigo-700"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {children}
    </Link>
  );
}

export default function TopNav() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
    if (t) {
      try {
        const user = JSON.parse(localStorage.getItem("user") ?? "{}");
        setRole(user?.role ?? null);
      } catch { /* ignore */ }
    }
  }, []);

  const isUniversity = role === "UNIVERSITY";
  const dashboardHref = isUniversity ? "/university/dashboard" : "/student/dashboard";

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
            🎓
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-gray-900">StudyComply</div>
            <div className="text-xs text-gray-400">Mobilité internationale</div>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {token ? (
            <>
              <NavLink href={dashboardHref}>Dashboard</NavLink>
              {!isUniversity && <NavLink href="/profile">Profil</NavLink>}
            </>
          ) : (
            <NavLink href="/">Accueil</NavLink>
          )}
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center gap-2">
          {!token ? (
            <>
              <Link
                href="/login"
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition"
              >
                S'inscrire
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className={`hidden sm:inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                isUniversity
                  ? "bg-violet-100 text-violet-700"
                  : "bg-indigo-100 text-indigo-700"
              }`}>
                {isUniversity ? "🏛️ Université" : "🎓 Étudiant"}
              </span>
              <button
                onClick={logout}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
