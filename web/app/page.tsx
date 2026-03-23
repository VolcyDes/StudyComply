import Link from "next/link";

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
  return (
    <div className="-mx-4 -mt-8 overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 px-6 py-20 text-white sm:px-10 sm:py-28">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-violet-500/30 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-indigo-400/30 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur">
            🎓 Mobilité internationale · Europe · USA · Canada
          </span>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight leading-tight sm:text-5xl lg:text-6xl">
            Partez à l'étranger <br className="hidden sm:block" />
            <span className="text-indigo-200">sans stress administratif.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base text-indigo-100 leading-7 sm:text-lg">
            StudyComply génère votre checklist personnalisée selon votre passeport et votre destination,
            suit vos délais et centralise tous vos documents.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow hover:bg-indigo-50 transition"
            >
              Créer un compte gratuitement →
            </Link>
            <Link
              href="/login"
              className="rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 transition"
            >
              Se connecter
            </Link>
          </div>

          {/* trust strip */}
          <div className="mt-10 flex flex-wrap gap-4 text-xs text-indigo-200">
            <span>🔒 Données sécurisées</span>
            <span>⚡ Checklist générée en 2 secondes</span>
            <span>📎 Dépôt de PDF intégré</span>
            <span>🆓 Gratuit pendant le MVP</span>
          </div>
        </div>
      </section>

      {/* ── WHO IS IT FOR ── */}
      <section className="bg-slate-50 px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-2">
            Pour qui ?
          </p>
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            Deux espaces, une même plateforme
          </h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {/* Student */}
            <div className="rounded-2xl border border-indigo-100 bg-white p-7 shadow-sm">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-lg font-bold text-slate-900">Espace Étudiant</h3>
              <p className="mt-2 text-sm text-slate-500 leading-6">
                Vous préparez un échange, un stage ou un diplôme à l'étranger ?
                Obtenez une checklist sur-mesure selon votre nationalité et votre destination.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2"><span className="text-indigo-500">✓</span> Checklist visa / titre de séjour</li>
                <li className="flex items-center gap-2"><span className="text-indigo-500">✓</span> Délais et urgences en temps réel</li>
                <li className="flex items-center gap-2"><span className="text-indigo-500">✓</span> Dépôt et suivi de vos PDF</li>
                <li className="flex items-center gap-2"><span className="text-indigo-500">✓</span> Liens officiels vérifiés</li>
              </ul>
              <Link
                href="/register"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
              >
                Je suis étudiant →
              </Link>
            </div>

            {/* University */}
            <div className="rounded-2xl border border-violet-100 bg-white p-7 shadow-sm">
              <div className="text-4xl mb-4">🏛</div>
              <h3 className="text-lg font-bold text-slate-900">Espace Université</h3>
              <p className="mt-2 text-sm text-slate-500 leading-6">
                Vous gérez la mobilité internationale de votre établissement ?
                Suivez la conformité de vos étudiants et centralisez les dossiers.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2"><span className="text-violet-500">✓</span> Vue d'ensemble des dossiers</li>
                <li className="flex items-center gap-2"><span className="text-violet-500">✓</span> Suivi de conformité par étudiant</li>
                <li className="flex items-center gap-2"><span className="text-violet-500">✓</span> Alertes avant expiration</li>
                <li className="flex items-center gap-2"><span className="text-violet-500">✓</span> Gestion multi-destinations</li>
              </ul>
              <Link
                href="/register"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition"
              >
                Je représente une université →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="bg-gradient-to-b from-white to-slate-50 px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-2">
            Fonctionnalités
          </p>
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            Tout ce dont vous avez besoin
          </h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            <FeatureCard
              icon="🧠"
              title="Checklist intelligente"
              desc="Générée selon votre passeport et votre destination. Les règles s'adaptent : étudiant européen en France ≠ étudiant hors-UE aux USA."
            />
            <FeatureCard
              icon="📅"
              title="Suivi des délais"
              desc="Chaque document est classé par urgence — en retard, critique, bientôt, à venir. Plus de mauvaise surprise."
            />
            <FeatureCard
              icon="📎"
              title="Dépôt de PDF"
              desc="Joignez vos fichiers directement à chaque document. Téléchargez, remplacez ou supprimez à tout moment."
            />
            <FeatureCard
              icon="🔗"
              title="Liens officiels"
              desc="Chaque exigence est accompagnée du lien vers le site gouvernemental officiel pour vous inscrire ou postuler."
            />
            <FeatureCard
              icon="🌍"
              title="Multi-destinations"
              desc="Europe (Schengen & UE), États-Unis, Canada. D'autres destinations seront ajoutées prochainement."
            />
            <FeatureCard
              icon="🛡️"
              title="Données privées"
              desc="Vos documents restent confidentiels. Aucune donnée n'est partagée sans votre accord explicite."
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-white px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-2">
            Comment ça marche
          </p>
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            Démarrez en 3 étapes
          </h2>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <StepCard
              n="1"
              title="Créez votre compte"
              desc="Choisissez votre profil : étudiant ou université. Inscription rapide, sans carte bancaire."
            />
            <StepCard
              n="2"
              title="Configurez votre projet"
              desc="Renseignez votre destination, votre nationalité et vos dates. La checklist se génère automatiquement."
            />
            <StepCard
              n="3"
              title="Suivez votre conformité"
              desc="Cochez les étapes au fur et à mesure, déposez vos justificatifs, et partez sereinement."
            />
          </div>
        </div>
      </section>

      {/* ── DESTINATIONS ── */}
      <section className="bg-slate-50 px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-2">
            Destinations supportées
          </p>
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Partez où vous voulez en Europe et en Amérique du Nord
          </h2>
          <p className="mt-3 text-sm text-slate-500">D'autres destinations arrivent bientôt.</p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              "🇫🇷 France", "🇩🇪 Allemagne", "🇪🇸 Espagne", "🇮🇹 Italie",
              "🇳🇱 Pays-Bas", "🇧🇪 Belgique", "🇵🇹 Portugal", "🇸🇪 Suède",
              "🇨🇭 Suisse", "🇳🇴 Norvège", "🇵🇱 Pologne", "🇨🇿 Tchéquie",
              "🇺🇸 États-Unis", "🇨🇦 Canada",
            ].map((dest) => (
              <span
                key={dest}
                className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-700 shadow-sm"
              >
                {dest}
              </span>
            ))}
            <span className="rounded-full border border-dashed border-slate-300 bg-transparent px-4 py-1.5 text-sm text-slate-400">
              + d'autres bientôt…
            </span>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-gradient-to-br from-indigo-600 to-violet-700 px-6 py-20 sm:px-10 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Prêt à partir sereinement ?
          </h2>
          <p className="mt-4 text-indigo-100 text-base">
            Rejoignez StudyComply et ne manquez plus aucune démarche administrative.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="rounded-2xl bg-white px-8 py-3.5 text-sm font-bold text-indigo-700 shadow-lg hover:bg-indigo-50 transition"
            >
              Créer un compte gratuitement
            </Link>
            <Link
              href="/login"
              className="rounded-2xl border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 transition"
            >
              J'ai déjà un compte
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-4xl flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-sm font-bold text-white">StudyComply</p>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} · Plateforme de conformité pour la mobilité internationale
          </p>
          <div className="flex gap-4 text-xs text-slate-400">
            <Link href="/login" className="hover:text-white transition">Connexion</Link>
            <Link href="/register" className="hover:text-white transition">Inscription</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
