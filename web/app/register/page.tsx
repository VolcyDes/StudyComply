"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../lib/config";
import { setRole as saveRole } from "../../lib/auth";
import { useLang } from "../../lib/i18n";

type Role = "STUDENT" | "UNIVERSITY";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRoleState] = useState<Role>("STUDENT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || t.register.errorFallback);
      }
      const data = await res.json();
      if (data?.token) localStorage.setItem("token", data.token);
      if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));
      saveRole(data?.user?.role ?? role);
      router.replace("/dashboard");
    } catch (e: any) {
      setError(e?.message ?? t.register.errorFallback);
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
          <span className="absolute top-16 left-10 text-6xl opacity-15 rotate-[8deg]">🇺🇸</span>
          <span className="absolute top-28 right-14 text-5xl opacity-10 rotate-[-10deg]">🇦🇺</span>
          <span className="absolute top-1/2 left-6 text-4xl opacity-10 rotate-[-5deg]">🇯🇵</span>
          <span className="absolute bottom-44 right-10 text-6xl opacity-15 rotate-[7deg]">🇫🇷</span>
          <span className="absolute bottom-20 left-14 text-5xl opacity-10 rotate-[-8deg]">🇨🇦</span>
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
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-4">Join thousands of students</p>
          <h2 className="text-4xl font-black leading-tight">
            Your next adventure<br />
            <span className="bg-gradient-to-r from-indigo-300 to-pink-300 bg-clip-text text-transparent">
              starts here.
            </span>
          </h2>
          <p className="mt-4 text-slate-400 text-sm leading-relaxed max-w-xs">
            Create your free account and get a personalised compliance checklist for your study abroad destination in seconds.
          </p>

          {/* Steps */}
          <div className="mt-10 space-y-4">
            {[
              { n: "01", title: "Create your account", desc: "Free forever — no credit card needed." },
              { n: "02", title: "Set your destination", desc: "Pick from 15 countries across 4 continents." },
              { n: "03", title: "Track your documents", desc: "Never miss a deadline or a required form." },
            ].map((step) => (
              <div key={step.n} className="flex items-start gap-4">
                <span className="shrink-0 text-xs font-black text-indigo-400 pt-0.5">{step.n}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{step.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom trust */}
        <div className="relative flex flex-wrap gap-3">
          {["🆓 Free during beta", "🔒 Private & secure", "🌍 15 destinations"].map((item) => (
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
          <h1 className="text-3xl font-black text-gray-900">{t.register.title}</h1>
          <p className="mt-2 text-sm text-gray-500">{t.register.subtitle}</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            {/* Role selector */}
            <div>
              <label className="text-sm font-semibold text-gray-700">{t.register.youAre}</label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {[
                  { value: "STUDENT" as Role, icon: "🎓", title: t.register.studentTitle, desc: t.register.studentDesc, active: "border-indigo-500 bg-indigo-50", text: "text-indigo-700" },
                  { value: "UNIVERSITY" as Role, icon: "🏛️", title: t.register.univTitle, desc: t.register.univDesc, active: "border-violet-500 bg-violet-50", text: "text-violet-700" },
                ].map((r) => (
                  <button key={r.value} type="button" onClick={() => setRoleState(r.value)}
                    className={`rounded-2xl border-2 p-4 text-left transition ${role === r.value ? r.active : "border-gray-200 bg-white hover:border-gray-300"}`}>
                    <span className="text-xl">{r.icon}</span>
                    <p className={`mt-1.5 text-sm font-semibold ${role === r.value ? r.text : "text-gray-900"}`}>{r.title}</p>
                    <p className="mt-0.5 text-xs text-gray-500 leading-snug">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">{t.register.email}</label>
              <input
                className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" type="email" required autoComplete="email"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">{t.register.password}</label>
              <input
                className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder={t.register.passwordPlaceholder} type="password" required autoComplete="new-password"
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
                  {t.register.submitting}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {t.register.submit}
                </span>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            {t.register.hasAccount}{" "}
            <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-800 transition">
              {t.register.loginLink} →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
