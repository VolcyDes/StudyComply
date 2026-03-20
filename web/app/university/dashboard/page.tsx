"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../../lib/config";

type User = { id: string; email: string; role: string };

async function safeJson(res: Response) {
  const text = await res.text();
  if (!text?.trim()) return null;
  try { return JSON.parse(text); } catch { return null; }
}

const FEATURES = [
  {
    icon: "👥",
    title: "Gestion des étudiants",
    desc: "Suivez la conformité documentaire de vos étudiants en mobilité entrante et sortante.",
    status: "Bientôt",
    color: "from-indigo-50 to-indigo-100 border-indigo-200",
  },
  {
    icon: "📊",
    title: "Tableau de bord analytique",
    desc: "Visualisez en un coup d'œil le taux de conformité et les documents manquants.",
    status: "Bientôt",
    color: "from-violet-50 to-violet-100 border-violet-200",
  },
  {
    icon: "🔔",
    title: "Alertes automatiques",
    desc: "Notifiez automatiquement les étudiants dont les documents expirent bientôt.",
    status: "Bientôt",
    color: "from-amber-50 to-amber-100 border-amber-200",
  },
  {
    icon: "📋",
    title: "Checklists personnalisées",
    desc: "Créez des checklists spécifiques à vos programmes et destinations partenaires.",
    status: "Bientôt",
    color: "from-emerald-50 to-emerald-100 border-emerald-200",
  },
  {
    icon: "🔗",
    title: "Intégration SIS",
    desc: "Connectez StudyComply à votre système d'information étudiant.",
    status: "À venir",
    color: "from-rose-50 to-rose-100 border-rose-200",
  },
  {
    icon: "📄",
    title: "Export & rapports",
    desc: "Exportez les données de conformité en PDF ou CSV pour vos rapports internes.",
    status: "Bientôt",
    color: "from-sky-50 to-sky-100 border-sky-200",
  },
];

export default function UniversityDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }

    async function loadMe() {
      const token = localStorage.getItem("token");
      if (!token) { router.replace("/login"); return; }
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await safeJson(res);
          if (data?.user) setUser(data.user);
        } else if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login");
        }
      } catch { /* ignore */ }
    }
    loadMe();
  }, [router]);

  return (
    <div className="space-y-8">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 px-8 py-10 text-white shadow-xl">
        <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute right-24 bottom-4 h-20 w-20 rounded-full bg-white/5" />
        <div className="relative">
          <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
            🏛️ Espace université
          </span>
          <h1 className="mt-3 text-3xl font-bold">
            Bienvenue{user?.email ? `, ${user.email.split("@")[0]}` : ""} 👋
          </h1>
          <p className="mt-1 text-violet-200 text-sm max-w-lg">
            Votre espace université est en cours de déploiement.
            Les fonctionnalités avancées arrivent très prochainement.
          </p>
        </div>
      </div>

      {/* ── Status banner ── */}
      <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5">
        <span className="text-2xl">🚧</span>
        <div>
          <p className="font-semibold text-amber-800">Espace en construction</p>
          <p className="mt-1 text-sm text-amber-700">
            Votre compte est bien créé et configuré en mode Université.
            Nous travaillons activement sur les fonctionnalités ci-dessous.
            Vous serez notifié dès qu'elles seront disponibles.
          </p>
        </div>
      </div>

      {/* ── Stats preview ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: "👥", label: "Étudiants", value: "—", sub: "À venir" },
          { icon: "📋", label: "Conformité", value: "—", sub: "À venir" },
          { icon: "⚠️", label: "Alertes", value: "—", sub: "À venir" },
          { icon: "🎓", label: "Programmes", value: "—", sub: "À venir" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border bg-white p-5 shadow-sm opacity-60">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg">
              {s.icon}
            </div>
            <p className="mt-3 text-xs font-medium uppercase tracking-wider text-gray-400">{s.label}</p>
            <p className="mt-1 text-xl font-bold text-gray-400">{s.value}</p>
            <p className="mt-1 text-xs text-gray-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Features roadmap ── */}
      <section>
        <h2 className="mb-5 text-lg font-bold text-gray-900">Fonctionnalités à venir</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 ${f.color}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-xl shadow-sm">
                  {f.icon}
                </div>
                <span className="rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-medium text-gray-600 backdrop-blur">
                  {f.status}
                </span>
              </div>
              <h3 className="mt-3 font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-1 text-sm text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact CTA ── */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-700 p-8 text-white text-center shadow-lg">
        <p className="text-2xl">💬</p>
        <h3 className="mt-3 text-xl font-bold">Vous avez des besoins spécifiques ?</h3>
        <p className="mt-2 text-violet-200 text-sm max-w-md mx-auto">
          Contactez-nous pour discuter de vos besoins en gestion de mobilité étudiante.
          Nous construisons StudyComply avec les universités, pas juste pour elles.
        </p>
        <a
          href="mailto:contact@studycomply.com"
          className="mt-5 inline-block rounded-2xl bg-white px-6 py-3 text-sm font-bold text-violet-700 shadow-md hover:scale-105 transition-transform"
        >
          Nous contacter →
        </a>
      </div>

    </div>
  );
}
