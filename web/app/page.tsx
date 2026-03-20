import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-16">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-8 py-16 text-white shadow-2xl">
        <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 left-1/2 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute right-32 bottom-8 h-20 w-20 rounded-full bg-white/10" />

        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
            🎓 Plateforme de mobilité internationale
          </span>

          <h1 className="mt-5 text-5xl font-extrabold leading-tight tracking-tight">
            Tout ce qu'il faut pour
            <span className="block text-indigo-200">étudier à l'étranger.</span>
          </h1>

          <p className="mt-4 text-lg text-indigo-100 leading-relaxed">
            StudyComply t'aide à gérer tes documents, suivre tes deadlines et
            savoir exactement quoi faire pour ta mobilité — visa, assurance, passeport.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Commencer gratuitement →
            </Link>
            <Link
              href="/login"
              className="rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur hover:bg-white/20 transition"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { value: "190+", label: "Pays couverts", icon: "🌍" },
          { value: "5 min", label: "Pour démarrer", icon: "⚡" },
          { value: "100%", label: "Données privées", icon: "🔒" },
          { value: "Gratuit", label: "Pour commencer", icon: "🎁" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border bg-white p-5 text-center shadow-sm">
            <p className="text-2xl">{s.icon}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="mt-1 text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── How it works ── */}
      <section>
        <div className="text-center">
          <span className="rounded-full bg-indigo-50 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Comment ça marche
          </span>
          <h2 className="mt-3 text-3xl font-bold text-gray-900">3 étapes simples</h2>
          <p className="mt-2 text-gray-500">Pas de complexité. Juste l'essentiel.</p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              step: "01",
              icon: "🛂",
              title: "Crée ton profil",
              desc: "Indique ta nationalité, ta destination et le type de mobilité envisagé.",
              color: "from-indigo-50 to-indigo-100",
              border: "border-indigo-200",
            },
            {
              step: "02",
              icon: "📋",
              title: "Complète ta checklist",
              desc: "Visa, assurance, passeport — on te dit exactement quels documents tu dois réunir.",
              color: "from-violet-50 to-violet-100",
              border: "border-violet-200",
            },
            {
              step: "03",
              icon: "✅",
              title: "Pars l'esprit tranquille",
              desc: "Tes deadlines sont trackées. Tu reçois des alertes avant expiration.",
              color: "from-emerald-50 to-emerald-100",
              border: "border-emerald-200",
            },
          ].map((item) => (
            <div key={item.step} className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br p-7 ${item.color} ${item.border}`}>
              <span className="absolute right-5 top-5 text-5xl font-black opacity-10 select-none">{item.step}</span>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm text-2xl">
                {item.icon}
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section>
        <div className="text-center">
          <span className="rounded-full bg-violet-50 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-violet-600">
            Fonctionnalités
          </span>
          <h2 className="mt-3 text-3xl font-bold text-gray-900">Tout ce dont tu as besoin</h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: "🗺️", title: "Projet de mobilité", desc: "Configure ta destination, tes dates et ton objectif en quelques clics." },
            { icon: "📁", title: "Documents centralisés", desc: "Visa, passeport, assurance, relevés — tout au même endroit avec date d'expiration." },
            { icon: "⏰", title: "Alertes d'expiration", desc: "Sois prévenu 60 jours avant qu'un document expire. Jamais pris de court." },
            { icon: "📎", title: "PDF joints", desc: "Attache les fichiers directement à chaque document pour ne rien perdre." },
            { icon: "🎓", title: "Checklist intelligente", desc: "On calcule automatiquement les documents requis selon ta nationalité et ta destination." },
            { icon: "🏛️", title: "Espace université", desc: "Les établissements partenaires peuvent suivre la conformité de leurs étudiants." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-100 text-xl shadow-sm">
                {f.icon}
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-700 p-10 text-center text-white shadow-xl">
        <p className="text-4xl">🚀</p>
        <h2 className="mt-4 text-3xl font-extrabold">Prêt à simplifier ta mobilité ?</h2>
        <p className="mt-3 text-indigo-200">
          Rejoins StudyComply gratuitement et commence à organiser ton départ en 5 minutes.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="rounded-2xl bg-white px-8 py-3 text-sm font-bold text-indigo-700 shadow-lg hover:scale-105 transition-transform"
          >
            Créer mon compte →
          </Link>
          <Link
            href="/login"
            className="rounded-2xl border border-white/30 bg-white/10 px-8 py-3 text-sm font-medium text-white backdrop-blur hover:bg-white/20 transition"
          >
            J'ai déjà un compte
          </Link>
        </div>
      </section>

    </div>
  );
}
