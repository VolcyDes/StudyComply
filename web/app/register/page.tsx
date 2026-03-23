"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../lib/config";
import { setRole as saveRole } from "../../lib/auth";

type Role = "STUDENT" | "UNIVERSITY";

const ROLES = [
  {
    value: "STUDENT" as Role,
    icon: "🎓",
    title: "Étudiant",
    desc: "Je prépare une mobilité à l'étranger",
    color: "border-indigo-500 bg-indigo-50",
    textColor: "text-indigo-700",
  },
  {
    value: "UNIVERSITY" as Role,
    icon: "🏛️",
    title: "Université",
    desc: "Je gère des étudiants en mobilité",
    color: "border-violet-500 bg-violet-50",
    textColor: "text-violet-700",
  },
];

export default function RegisterPage() {
  const router = useRouter();
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
        throw new Error(txt || `Échec d'inscription (${res.status})`);
      }
      const data = await res.json();
      if (data?.token) localStorage.setItem("token", data.token);
      if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));
      // Save role to localStorage — use API response if available, otherwise form selection
      saveRole(data?.user?.role ?? role);
      router.replace("/dashboard");
    } catch (e: any) {
      setError(e?.message ?? "Échec d'inscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md">

        <div className="overflow-hidden rounded-3xl border bg-white shadow-xl">

          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-8 py-8 text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur">
              🚀
            </div>
            <h1 className="mt-4 text-2xl font-bold">Créer un compte</h1>
            <p className="mt-1 text-indigo-200 text-sm">Rejoins StudyComply gratuitement.</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form onSubmit={onSubmit} className="space-y-5">

              {/* Role selector */}
              <div>
                <label className="text-sm font-medium text-gray-700">Tu es…</label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRoleState(r.value)}
                      className={`rounded-xl border-2 p-4 text-left transition ${
                        role === r.value ? r.color : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <span className="text-xl">{r.icon}</span>
                      <p className={`mt-1.5 text-sm font-semibold ${role === r.value ? r.textColor : "text-gray-900"}`}>
                        {r.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Adresse email</label>
                <input
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="toi@exemple.com"
                  type="email"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Mot de passe</label>
                <input
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choisis un mot de passe sécurisé"
                  type="password"
                  required
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <span className="text-red-500 mt-0.5">⚠</span>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:opacity-90 disabled:opacity-50 transition"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Création du compte…
                  </span>
                ) : "Créer mon compte →"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Déjà un compte ?{" "}
              <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
