"use client";

import Link from "next/link";
import { useLang } from "../lib/i18n";

// ─── Translations ──────────────────────────────────────────────────────────────

const T = {
  fr: {
    lang: "FR",
    switchLang: "EN",
    badge: "🎓 Mobilité internationale · Europe · USA · Canada",
    heroTitle1: "Partez à l'étranger",
    heroTitle2: "sans stress administratif.",
    heroDesc:
      "StudyComply génère votre checklist personnalisée selon votre passeport et votre destination, suit vos délais et centralise tous vos documents.",
    ctaRegister: "Créer un compte gratuitement →",
    ctaLogin: "Se connecter",
    trust1: "🔒 Données sécurisées",
    trust2: "⚡ Checklist générée en 2 secondes",
    trust3: "📎 Dépôt de PDF intégré",
    trust4: "🆓 Gratuit pendant le MVP",

    forWhomTag: "Pour qui ?",
    forWhomTitle: "Deux espaces, une même plateforme",

    studentTitle: "Espace Étudiant",
    studentDesc:
      "Vous préparez un échange, un stage ou un diplôme à l'étranger ? Obtenez une checklist sur-mesure selon votre nationalité et votre destination.",
    studentFeature1: "Checklist visa / titre de séjour",
    studentFeature2: "Délais et urgences en temps réel",
    studentFeature3: "Dépôt et suivi de vos PDF",
    studentFeature4: "Liens officiels vérifiés",
    studentCta: "Je suis étudiant →",

    univTitle: "Espace Université",
    univDesc:
      "Vous gérez la mobilité internationale de votre établissement ? Suivez la conformité de vos étudiants et centralisez les dossiers.",
    univFeature1: "Vue d'ensemble des dossiers",
    univFeature2: "Suivi de conformité par étudiant",
    univFeature3: "Alertes avant expiration",
    univFeature4: "Gestion multi-destinations",
    univCta: "Je représente une université →",

    featuresTag: "Fonctionnalités",
    featuresTitle: "Tout ce dont vous avez besoin",
    features: [
      { icon: "🧠", title: "Checklist intelligente", desc: "Générée selon votre passeport et votre destination. Les règles s'adaptent : étudiant européen en France ≠ étudiant hors-UE aux USA." },
      { icon: "📅", title: "Suivi des délais", desc: "Chaque document est classé par urgence — en retard, critique, bientôt, à venir. Plus de mauvaise surprise." },
      { icon: "📎", title: "Dépôt de PDF", desc: "Joignez vos fichiers directement à chaque document. Téléchargez, remplacez ou supprimez à tout moment." },
      { icon: "🔗", title: "Liens officiels", desc: "Chaque exigence est accompagnée du lien vers le site gouvernemental officiel pour vous inscrire ou postuler." },
      { icon: "🌍", title: "Multi-destinations", desc: "Europe (Schengen & UE), États-Unis, Canada. D'autres destinations seront ajoutées prochainement." },
      { icon: "🛡️", title: "Données privées", desc: "Vos documents restent confidentiels. Aucune donnée n'est partagée sans votre accord explicite." },
    ],

    howTag: "Comment ça marche",
    howTitle: "Démarrez en 3 étapes",
    steps: [
      { n: "1", title: "Créez votre compte", desc: "Choisissez votre profil : étudiant ou université. Inscription rapide, sans carte bancaire." },
      { n: "2", title: "Configurez votre projet", desc: "Renseignez votre destination, votre nationalité et vos dates. La checklist se génère automatiquement." },
      { n: "3", title: "Suivez votre conformité", desc: "Cochez les étapes au fur et à mesure, déposez vos justificatifs, et partez sereinement." },
    ],

    destTag: "Destinations supportées",
    destTitle: "Partez où vous voulez en Europe et en Amérique du Nord",
    destSub: "D'autres destinations arrivent bientôt.",
    destMore: "+ d'autres bientôt…",

    ctaTitle: "Prêt à partir sereinement ?",
    ctaDesc: "Rejoignez StudyComply et ne manquez plus aucune démarche administrative.",
    ctaRegister2: "Créer un compte gratuitement",
    ctaLogin2: "J'ai déjà un compte",

    footerTagline: "Plateforme de conformité pour la mobilité internationale",
    footerLogin: "Connexion",
    footerRegister: "Inscription",
  },
  en: {
    lang: "EN",
    switchLang: "FR",
    badge: "🎓 International mobility · Europe · USA · Canada",
    heroTitle1: "Study abroad",
    heroTitle2: "without the admin headache.",
    heroDesc:
      "StudyComply generates your personalised compliance checklist based on your passport and destination, tracks your deadlines, and centralises all your documents.",
    ctaRegister: "Create a free account →",
    ctaLogin: "Sign in",
    trust1: "🔒 Secure data",
    trust2: "⚡ Checklist generated in 2 seconds",
    trust3: "📎 Built-in PDF upload",
    trust4: "🆓 Free during MVP",

    forWhomTag: "Who is it for?",
    forWhomTitle: "Two spaces, one platform",

    studentTitle: "Student Space",
    studentDesc:
      "Preparing an exchange, internship or degree abroad? Get a tailored checklist based on your nationality and destination.",
    studentFeature1: "Visa / residence permit checklist",
    studentFeature2: "Real-time deadlines and urgency",
    studentFeature3: "Upload and track your PDFs",
    studentFeature4: "Verified official links",
    studentCta: "I'm a student →",

    univTitle: "University Space",
    univDesc:
      "Managing international mobility for your institution? Track student compliance and centralise all files.",
    univFeature1: "Overview of all student files",
    univFeature2: "Per-student compliance tracking",
    univFeature3: "Alerts before expiry",
    univFeature4: "Multi-destination management",
    univCta: "I represent a university →",

    featuresTag: "Features",
    featuresTitle: "Everything you need",
    features: [
      { icon: "🧠", title: "Smart checklist", desc: "Generated from your passport and destination. Rules adapt: EU student in France ≠ non-EU student in the USA." },
      { icon: "📅", title: "Deadline tracking", desc: "Every document is sorted by urgency — overdue, critical, soon, upcoming. No more nasty surprises." },
      { icon: "📎", title: "PDF upload", desc: "Attach files directly to each document. Download, replace, or delete at any time." },
      { icon: "🔗", title: "Official links", desc: "Every requirement comes with a link to the official government website to apply or register." },
      { icon: "🌍", title: "Multi-destination", desc: "Europe (Schengen & EU), United States, Canada. More destinations coming soon." },
      { icon: "🛡️", title: "Private data", desc: "Your documents remain confidential. No data is shared without your explicit consent." },
    ],

    howTag: "How it works",
    howTitle: "Get started in 3 steps",
    steps: [
      { n: "1", title: "Create your account", desc: "Choose your profile: student or university. Quick sign-up, no credit card required." },
      { n: "2", title: "Set up your project", desc: "Enter your destination, nationality and dates. Your checklist is generated automatically." },
      { n: "3", title: "Track your compliance", desc: "Tick off steps as you go, upload your documents, and travel with peace of mind." },
    ],

    destTag: "Supported destinations",
    destTitle: "Travel to Europe or North America",
    destSub: "More destinations coming soon.",
    destMore: "+ more coming soon…",

    ctaTitle: "Ready to travel stress-free?",
    ctaDesc: "Join StudyComply and never miss an administrative step again.",
    ctaRegister2: "Create a free account",
    ctaLogin2: "I already have an account",

    footerTagline: "Compliance platform for international student mobility",
    footerLogin: "Login",
    footerRegister: "Sign up",
  },
} as const;

type Lang = keyof typeof T;

// ─── Sub-components ────────────────────────────────────────────────────────────

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-3xl mb-3">{icon}</div>
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
    </div>
  );
}

function StepCard({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow">
        {n}
      </div>
      <div>
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-500 leading-6">{desc}</p>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { lang, toggleLang } = useLang();
  const t = T[lang];

  return (
    <div className="-mx-4 -mt-8 overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 px-6 py-20 text-white sm:px-10 sm:py-28">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-violet-500/30 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-indigo-400/30 blur-3xl" />
        </div>

        {/* Language toggle — top right of hero */}
        <div className="absolute top-5 right-6 sm:right-10">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-white/20 transition"
          >
            <span className="opacity-40">{t.lang}</span>
            <span className="opacity-25">|</span>
            <span>{t.switchLang}</span>
          </button>
        </div>

        <div className="relative mx-auto max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur">
            {t.badge}
          </span>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight leading-tight sm:text-5xl lg:text-6xl">
            {t.heroTitle1} <br className="hidden sm:block" />
            <span className="text-indigo-200">{t.heroTitle2}</span>
          </h1>

          <p className="mt-5 max-w-xl text-base text-indigo-100 leading-7 sm:text-lg">
            {t.heroDesc}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow hover:bg-indigo-50 transition"
            >
              {t.ctaRegister}
            </Link>
            <Link
              href="/login"
              className="rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 transition"
            >
              {t.ctaLogin}
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-4 text-xs text-indigo-200">
            <span>{t.trust1}</span>
            <span>{t.trust2}</span>
            <span>{t.trust3}</span>
            <span>{t.trust4}</span>
          </div>
        </div>
      </section>

      {/* ── WHO IS IT FOR ── */}
      <section className="bg-slate-50 px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-2">
            {t.forWhomTag}
          </p>
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            {t.forWhomTitle}
          </h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {/* Student */}
            <div className="rounded-2xl border border-indigo-100 bg-white p-7 shadow-sm">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-lg font-bold text-slate-900">{t.studentTitle}</h3>
              <p className="mt-2 text-sm text-slate-500 leading-6">{t.studentDesc}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2"><span className="text-indigo-500">✓</span> {t.studentFeature1}</li>
                <li className="flex items-center gap-2"><span className="text-indigo-500">✓</span> {t.studentFeature2}</li>
                <li className="flex items-center gap-2"><span className="text-indigo-500">✓</span> {t.studentFeature3}</li>
                <li className="flex items-center gap-2"><span className="text-indigo-500">✓</span> {t.studentFeature4}</li>
              </ul>
              <Link
                href="/register"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
              >
                {t.studentCta}
              </Link>
            </div>

            {/* University */}
            <div className="rounded-2xl border border-violet-100 bg-white p-7 shadow-sm">
              <div className="text-4xl mb-4">🏛</div>
              <h3 className="text-lg font-bold text-slate-900">{t.univTitle}</h3>
              <p className="mt-2 text-sm text-slate-500 leading-6">{t.univDesc}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2"><span className="text-violet-500">✓</span> {t.univFeature1}</li>
                <li className="flex items-center gap-2"><span className="text-violet-500">✓</span> {t.univFeature2}</li>
                <li className="flex items-center gap-2"><span className="text-violet-500">✓</span> {t.univFeature3}</li>
                <li className="flex items-center gap-2"><span className="text-violet-500">✓</span> {t.univFeature4}</li>
              </ul>
              <Link
                href="/register"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition"
              >
                {t.univCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="bg-gradient-to-b from-white to-slate-50 px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-2">
            {t.featuresTag}
          </p>
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            {t.featuresTitle}
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {t.features.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-white px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-2">
            {t.howTag}
          </p>
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            {t.howTitle}
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {t.steps.map((s) => (
              <StepCard key={s.n} n={s.n} title={s.title} desc={s.desc} />
            ))}
          </div>
        </div>
      </section>

      {/* ── DESTINATIONS ── */}
      <section className="bg-slate-50 px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-2">
            {t.destTag}
          </p>
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">{t.destTitle}</h2>
          <p className="mt-3 text-sm text-slate-500">{t.destSub}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              "🇫🇷 France", "🇩🇪 Allemagne", "🇪🇸 Espagne", "🇮🇹 Italie",
              "🇳🇱 Pays-Bas", "🇧🇪 Belgique", "🇵🇹 Portugal", "🇸🇪 Suède",
              "🇨🇭 Suisse", "🇳🇴 Norvège", "🇵🇱 Pologne", "🇨🇿 Tchéquie",
              "🇺🇸 États-Unis", "🇨🇦 Canada",
            ].map((dest) => (
              <span key={dest} className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-700 shadow-sm">
                {dest}
              </span>
            ))}
            <span className="rounded-full border border-dashed border-slate-300 bg-transparent px-4 py-1.5 text-sm text-slate-400">
              {t.destMore}
            </span>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-gradient-to-br from-indigo-600 to-violet-700 px-6 py-20 sm:px-10 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">{t.ctaTitle}</h2>
          <p className="mt-4 text-indigo-100 text-base">{t.ctaDesc}</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="rounded-2xl bg-white px-8 py-3.5 text-sm font-bold text-indigo-700 shadow-lg hover:bg-indigo-50 transition"
            >
              {t.ctaRegister2}
            </Link>
            <Link
              href="/login"
              className="rounded-2xl border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 transition"
            >
              {t.ctaLogin2}
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-4xl flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-sm font-bold text-white">StudyComply</p>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} · {t.footerTagline}
          </p>
          <div className="flex gap-4 text-xs text-slate-400">
            <Link href="/login" className="hover:text-white transition">{t.footerLogin}</Link>
            <Link href="/register" className="hover:text-white transition">{t.footerRegister}</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
