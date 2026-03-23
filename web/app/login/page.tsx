"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../lib/config";
import { setRole, getRole } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        throw new Error(txt || `Échec de connexion (${res.status})`);
      }
      const data = await res.json();
      if (data?.token) localStorage.setItem("token", data.token);
      if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));
      // Store role from API response — getRole() uses it as source of truth
      if (data?.user?.role) setRole(data.user.role);
      else {
        // Fallback: keep existing userRole if already set (e.g. previously registered)
        // If truly unknown, getRole() will default to STUDENT in the hub
        const existing = getRole();
        if (existing) setRole(existing);
      }
      router.replace("/dashboard");
    } catch (e: any) {
      setError(e?.message ?? "Échec de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="overflow-hidden rounded-3xl border bg-white shadow-xl">

          {/* Header gradient */}
          <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-8 py-8 text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur">
              🎓
            </div>
            <h1 className="mt-4 text-2xl font-bold">Bon retour !</h1>
            <p className="mt-1 text-indigo-200 text-sm">Connecte-toi pour accéder à ton dashboard.</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form onSubmit={onSubmit} className="space-y-5">
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
                  placeholder="••••••••"
                  type="password"
                  required
                  autoComplete="current-password"
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
                    Connexion…
                  </span>
                ) : "Se connecter →"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Pas encore de compte ?{" "}
              <Link href="/register" className="font-semibold text-indigo-600 hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
