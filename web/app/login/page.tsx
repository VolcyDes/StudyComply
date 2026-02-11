"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: "POST",
    credentials: "include", // ✅ cookie auth
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message ?? "Login failed");
  return true;
}

async function fetchMe() {
  const res = await fetch(`${API_BASE}/api/v1/me`, {
    credentials: "include", // ✅ cookie auth
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message ?? "Failed to fetch /me");
  return data.user;
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email.trim(), password);
      const me = await fetchMe();

      // ✅ Persist account kind for proxy routing/guard (both roles)
      const kind = me?.role === "UNIVERSITY" ? "UNIVERSITY" : "STUDENT";
      try {
        // 30 days
        const maxAge = 60 * 60 * 24 * 30;
        const secure = typeof window !== "undefined" && window.location?.protocol === "https:" ? "; Secure" : "";
      } catch {
        // ignore
      }

      router.push(kind === "UNIVERSITY" ? "/university/dashboard" : "/student/dashboard");

    } catch (err: any) {
      setError(err?.message ?? "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-xl p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm opacity-70">
            Log in to access your dashboard.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input
              className="w-full border rounded-lg p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <input
              className="w-full border rounded-lg p-2"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg p-2">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full rounded-lg p-2 border bg-black text-white disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="text-sm text-center opacity-70">
          <a href="/register" className="hover:underline">
            Create an account
          </a>
        </div>
      </div>
    </div>
  );
}
