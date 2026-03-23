"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuth, getRole, hasToken } from "../../lib/auth";
import { useLang } from "../../lib/i18n";

export default function TopNav() {
  const router   = useRouter();
  const pathname = usePathname();
  const { t, lang, toggleLang } = useLang();

  const [authed,    setAuthed]    = useState(false);
  const [email,     setEmail]     = useState<string | null>(null);
  const [role,      setRoleState] = useState<"UNIVERSITY" | "STUDENT" | null>(null);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    if (!hasToken()) { setAuthed(false); setEmail(null); setRoleState(null); return; }
    setAuthed(true);
    setRoleState(getRole());
    try {
      const u = localStorage.getItem("user");
      if (u) setEmail(JSON.parse(u)?.email ?? null);
    } catch { /* ignore */ }
  }, [pathname]);

  function logout() {
    clearAuth();
    setAuthed(false);
    setEmail(null);
    setRoleState(null);
    router.push("/login");
  }

  const dashboardHref = role === "UNIVERSITY" ? "/university/dashboard" : "/student/dashboard";
  const isUniversity  = role === "UNIVERSITY";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className={`flex h-8 w-8 items-center justify-center rounded-xl text-white text-sm font-bold shadow-sm transition group-hover:scale-105 ${
            isUniversity ? "bg-gradient-to-br from-violet-600 to-purple-700" : "bg-gradient-to-br from-indigo-600 to-blue-600"
          }`}>
            {isUniversity ? "🏛" : "🎓"}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-gray-900">StudyComply</div>
            {authed && role && (
              <div className={`text-[10px] font-medium ${isUniversity ? "text-violet-500" : "text-indigo-500"}`}>
                {isUniversity ? t.nav.spaceUniv : t.nav.spaceStudent}
              </div>
            )}
          </div>
        </Link>

        {/* Nav links — desktop */}
        {authed && (
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href={dashboardHref} active={pathname.startsWith(isUniversity ? "/university" : "/student")}>
              {t.nav.dashboard}
            </NavLink>
            <NavLink href="/profile" active={pathname === "/profile"}>
              {t.nav.profile}
            </NavLink>
          </nav>
        )}

        {/* Right zone */}
        <div className="flex items-center gap-2">

          {/* Language toggle — always visible */}
          <button
            onClick={toggleLang}
            title={lang === "fr" ? "Switch to English" : "Passer en français"}
            className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            <span className={lang === "fr" ? "opacity-100" : "opacity-40"}>FR</span>
            <span className="text-gray-300">|</span>
            <span className={lang === "en" ? "opacity-100" : "opacity-40"}>EN</span>
          </button>

          {!authed ? (
            <>
              <Link href="/login"
                className="rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition">
                {t.nav.login}
              </Link>
              <Link href="/register"
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition">
                {t.nav.register}
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 transition"
              >
                {/* Avatar */}
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-white text-xs font-bold ${
                  isUniversity ? "bg-violet-600" : "bg-indigo-600"
                }`}>
                  {email ? email[0].toUpperCase() : "?"}
                </div>
                {email && (
                  <span className="hidden sm:block max-w-[140px] truncate text-gray-700">
                    {email.split("@")[0]}
                  </span>
                )}
                <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                    {/* User info */}
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="text-xs text-gray-400">{t.nav.loggedAs}</p>
                      <p className="mt-0.5 truncate text-sm font-medium text-gray-900">{email}</p>
                      <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        isUniversity ? "bg-violet-100 text-violet-700" : "bg-indigo-100 text-indigo-700"
                      }`}>
                        {isUniversity ? t.nav.roleUniv : t.nav.roleStudent}
                      </span>
                    </div>

                    {/* Links */}
                    <div className="py-1">
                      <DropdownLink href={dashboardHref} onClick={() => setMenuOpen(false)}>
                        {t.nav.dashboard}
                      </DropdownLink>
                      <DropdownLink href="/profile" onClick={() => setMenuOpen(false)}>
                        {t.nav.profile}
                      </DropdownLink>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 p-2">
                      <button
                        onClick={logout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {t.nav.logout}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-xl px-3 py-2 text-sm transition ${
        active ? "bg-gray-100 font-medium text-gray-900" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {children}
    </Link>
  );
}

function DropdownLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl mx-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
    >
      {children}
    </Link>
  );
}
