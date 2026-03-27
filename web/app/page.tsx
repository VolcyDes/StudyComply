"use client";

import Link from "next/link";

// ─── Destination data ────────────────────────────────────────────────────────

const DESTINATIONS = [
  { flag: "🇫🇷", name: "France" },
  { flag: "🇩🇪", name: "Germany" },
  { flag: "🇪🇸", name: "Spain" },
  { flag: "🇮🇹", name: "Italy" },
  { flag: "🇳🇱", name: "Netherlands" },
  { flag: "🇵🇹", name: "Portugal" },
  { flag: "🇸🇪", name: "Sweden" },
  { flag: "🇧🇪", name: "Belgium" },
  { flag: "🇨🇭", name: "Switzerland" },
  { flag: "🇵🇱", name: "Poland" },
  { flag: "🇺🇸", name: "USA" },
  { flag: "🇨🇦", name: "Canada" },
  { flag: "🇬🇧", name: "UK" },
  { flag: "🇯🇵", name: "Japan" },
  { flag: "🇦🇺", name: "Australia" },
];

const STEPS = [
  {
    n: "01",
    icon: "🛂",
    title: "Add your passport",
    desc: "Tell us your nationality. StudyComply instantly knows which visas and permits apply to you.",
    color: "bg-indigo-50 border-indigo-100",
    numColor: "text-indigo-500",
  },
  {
    n: "02",
    icon: "🌍",
    title: "Pick your destination",
    desc: "Choose where you're heading. Your personalised checklist is generated in seconds.",
    color: "bg-violet-50 border-violet-100",
    numColor: "text-violet-500",
  },
  {
    n: "03",
    icon: "✅",
    title: "Track & submit",
    desc: "Upload your PDFs, tick off deadlines, and land abroad with everything sorted.",
    color: "bg-emerald-50 border-emerald-100",
    numColor: "text-emerald-500",
  },
];

const FEATURES = [
  {
    icon: "🧠",
    title: "Smart checklist",
    desc: "Rules adapt to your passport and destination — EU student in Germany ≠ non-EU student in the USA.",
    accent: "bg-indigo-100 text-indigo-600",
  },
  {
    icon: "⏰",
    title: "Deadline alerts",
    desc: "Every document is ranked by urgency. Know exactly what to do next, with no surprises.",
    accent: "bg-amber-100 text-amber-600",
  },
  {
    icon: "📎",
    title: "PDF uploads",
    desc: "Attach your documents directly in the app. Download, replace, or delete anytime.",
    accent: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: "🔗",
    title: "Official links",
    desc: "Every requirement links directly to the official government page. No more googling.",
    accent: "bg-rose-100 text-rose-600",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="-mx-4 -mt-8 overflow-x-hidden font-sans">

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 px-6 py-20 sm:px-10 sm:py-28 flex items-center">

        {/* Decorative floating flags */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
          <span className="absolute top-16 left-[8%] text-5xl opacity-20 rotate-[-12deg] hidden sm:block">🇫🇷</span>
          <span className="absolute top-28 right-[12%] text-4xl opacity-15 rotate-[8deg] hidden sm:block">🇺🇸</span>
          <span className="absolute top-[55%] left-[5%] text-3xl opacity-15 rotate-[6deg] hidden md:block">🇯🇵</span>
          <span className="absolute bottom-20 right-[8%] text-5xl opacity-20 rotate-[-6deg] hidden sm:block">🇨🇦</span>
          <span className="absolute top-[40%] right-[4%] text-3xl opacity-10 rotate-[15deg] hidden lg:block">🇦🇺</span>
          <span className="absolute bottom-24 left-[15%] text-4xl opacity-15 rotate-[-8deg] hidden md:block">🇩🇪</span>
          {/* Glow blobs */}
          <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-4xl">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-indigo-200 backdrop-blur">
            ✈️ Built for students going abroad
          </div>

          {/* Headline */}
          <h1 className="mt-6 text-5xl font-black tracking-tight leading-[1.1] text-white sm:text-6xl lg:text-7xl">
            Your semester abroad,{" "}
            <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">
              stress-free.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-slate-300 leading-relaxed sm:text-xl">
            Stop drowning in visa paperwork. StudyComply generates your personalised compliance checklist in seconds — based on your passport and destination.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-slate-900 shadow-lg shadow-white/10 hover:bg-indigo-50 transition-all hover:scale-[1.02]"
            >
              Get started for free
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-medium text-white backdrop-blur hover:bg-white/10 transition-all"
            >
              I already have an account
            </Link>
          </div>

          {/* Trust pills */}
          <div className="mt-10 flex flex-wrap gap-3">
            {[
              "🆓 Free during beta",
              "⚡ Checklist in 2 seconds",
              "🔒 Your data stays private",
              "🌍 15 destinations",
            ].map((item) => (
              <span key={item} className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-slate-300 backdrop-blur">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────────── */}
      <section className="bg-white px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">How it works</p>
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">
              Ready to go in 3 steps
            </h2>
            <p className="mt-3 text-slate-500 max-w-xl mx-auto">No guesswork. No endless government websites. Just a clear list of exactly what you need.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className={`relative rounded-3xl border p-7 ${s.color}`}>
                <span className={`text-5xl font-black opacity-20 ${s.numColor} select-none`}>{s.n}</span>
                <div className="mt-2 text-3xl">{s.icon}</div>
                <h3 className="mt-3 text-base font-bold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DESTINATIONS ─────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Where are you going?</p>
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">15 destinations covered</h2>
            <p className="mt-3 text-slate-500">More coming soon — we add new countries based on student demand.</p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {DESTINATIONS.map((d) => (
              <div
                key={d.name}
                className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-4 shadow-sm hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5 transition-all"
              >
                <span className="text-3xl">{d.flag}</span>
                <span className="text-xs font-medium text-slate-600 text-center leading-tight">{d.name}</span>
              </div>
            ))}
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-transparent px-3 py-4">
              <span className="text-3xl">🌐</span>
              <span className="text-xs text-slate-400 text-center leading-tight">More soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section className="bg-white px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Features</p>
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">Everything in one place</h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-5 rounded-3xl border border-slate-100 bg-slate-50 p-6 hover:shadow-sm transition-shadow">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${f.accent}`}>
                  {f.icon}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{f.title}</p>
                  <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR WHO ──────────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Who is it for?</p>
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">Two spaces, one platform</h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">

            {/* Student card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white shadow-xl">
              <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
              <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-white/5" />
              <div className="relative">
                <span className="text-5xl">🎒</span>
                <h3 className="mt-4 text-xl font-black">Student</h3>
                <p className="mt-2 text-sm text-indigo-100 leading-relaxed">
                  Going on exchange, an internship or a full degree abroad? Get your personalised admin checklist in under 30 seconds.
                </p>
                <ul className="mt-5 space-y-2 text-sm text-indigo-100">
                  {[
                    "✓ Visa & residence permit checklist",
                    "✓ Deadlines tracked automatically",
                    "✓ Upload & manage your PDFs",
                    "✓ Links to official gov websites",
                  ].map((f) => <li key={f}>{f}</li>)}
                </ul>
                <Link
                  href="/register"
                  className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-indigo-700 hover:bg-indigo-50 transition-all hover:scale-[1.02]"
                >
                  Start for free →
                </Link>
              </div>
            </div>

            {/* University card */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-violet-50" />
              <div className="relative">
                <span className="text-5xl">🏛️</span>
                <h3 className="mt-4 text-xl font-black text-slate-900">University</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  Managing international mobility for your institution? Track student compliance and centralise all files in one dashboard.
                </p>
                <ul className="mt-5 space-y-2 text-sm text-slate-500">
                  {[
                    "✓ Overview of all student files",
                    "✓ Per-student compliance tracking",
                    "✓ Alerts before document expiry",
                    "✓ Multi-destination management",
                  ].map((f) => <li key={f}>{f}</li>)}
                </ul>
                <Link
                  href="/register"
                  className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-700 transition-all hover:scale-[1.02]"
                >
                  Request access →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-600 px-6 py-24 sm:px-10 text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-2xl">
          <p className="text-5xl">🚀</p>
          <h2 className="mt-4 text-3xl font-black text-white sm:text-5xl leading-tight">
            Stop stressing.<br />Start packing.
          </h2>
          <p className="mt-4 text-lg text-white/80 max-w-md mx-auto leading-relaxed">
            Join StudyComply and never miss a deadline or a document again.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="rounded-2xl bg-white px-8 py-4 text-sm font-black text-violet-700 shadow-xl hover:bg-violet-50 transition-all hover:scale-[1.02]"
            >
              Create my free account →
            </Link>
            <Link
              href="/login"
              className="rounded-2xl border border-white/25 bg-white/10 px-8 py-4 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 transition-all"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-4xl flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-sm font-black text-white">StudyComply</p>
            <p className="mt-0.5 text-xs text-slate-500">Compliance platform for international student mobility</p>
          </div>
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} StudyComply</p>
          <div className="flex gap-5 text-xs text-slate-500">
            <Link href="/login" className="hover:text-white transition">Sign in</Link>
            <Link href="/register" className="hover:text-white transition">Sign up</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
