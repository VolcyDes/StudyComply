"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../lib/config";
import { setRole, getRole } from "../../lib/auth";
import { useLang } from "../../lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLang();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || t.login.errorFallback);
      }
      const data = await res.json();
      if (data?.token) localStorage.setItem("token", data.token);
      if (data?.user)  localStorage.setItem("user", JSON.stringify(data.user));
      if (data?.user?.role) setRole(data.user.role);
      else { const existing = getRole(); if (existing) setRole(existing); }
      router.replace("/dashboard");
    } catch (e: any) {
      setError(e?.message ?? t.login.errorFallback);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="-mx-4 -mt-8 flex min-h-screen">

      {/* ── Left panel — branding ── */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 p-12 text-white">
        {/* Decorative flags */}
        <div className="pointer-events-none absolute inset-0 select-none overflow-hidden">
          <span className="absolute top-20 left-12 text-6xl opacity-15 rotate-[-12deg]">🇫🇷</span>
          <span className="absolute top-32 right-16 text-5xl opacity-10 rotate-[8deg]">🇯🇵</span>
          <span className="absolute top-1/2 left-8 text-4xl opacity-10 rotate-[5deg]">🇨🇦</span>
          <span className="absolute bottom-40 right-12 text-6xl opacity-15 rotate-[-6deg]">🇺🇸</span>
          <span className="absolute bottom-24 left-16 text-5xl opacity-10 rotate-[10deg]">🇩🇪</span>
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-xl backdrop-blur">🎓</div>
            <span className="text-lg font-black">StudyComply</span>
          </Link>
        </div>

        {/* Center text */}
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-4">Welcome back</p>
          <h2 className="text-4xl font-black leading-tight">
            Your semester<br />
            <span className="bg-gradient-to-r from-indigo-300 to-pink-300 bg-clip-text text-transparent">
              abroad awaits.
            </span>
          </h2>
          <p className="mt-4 text-slate-400 text-sm leading-relaxed max-w-xs">
            Sign back in to track your documents, deadlines, and compliance — all in one place.
          </p>

          {/* Testimonial-style quote */}
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <p className="text-sm text-slate-300 leading-relaxed">
              "I got my student visa sorted 3 weeks before departure instead of panicking last minute. StudyComply literally saved my exchange."
            </p>
            <div className="mt-3 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/30 text-sm">👤</div>
              <div>
                <p className="text-xs font-semibold text-white">Alex, 22</p>
                <p className="text-[11px] text-slate-400">Erasmus in Germany 🇩🇪</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom trust */}
        <div className="relative flex flex-wrap gap-3">
          {["🆓 Free to use", "🔒 Private & secure", "🌍 15 destinations"].map((item) => (
            <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex w-full flex-col items-center justify-center bg-white px-6 py-16 lg:w-1/2">

        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-base">🎓</div>
            <span className="text-base font-black text-gray-900">StudyComply</span>
          </Link>
        </div>

        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-black text-gray-900">{t.login.title}</h1>
          <p className="mt-2 text-sm text-gray-500">{t.login.subtitle}</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-700">{t.login.email}</label>
              <input
                className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" type="email" required autoComplete="email"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">{t.login.password}</label>
              <input
                className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" type="password" required autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                <span className="mt-0.5 text-red-500">⚠</span>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="group w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:opacity-90 hover:shadow-indigo-500/40 disabled:opacity-50">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  {t.login.submitting}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {t.login.submit}
                </span>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            {t.login.noAccount}{" "}
            <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-800 transition">
              {t.login.createLink} →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
