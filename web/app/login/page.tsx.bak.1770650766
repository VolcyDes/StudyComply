"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { getLoginRole, setLoginRole, type LoginRole } from "@/lib/loginRole";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
const TOKEN_KEY = "token"; // adapte si ton projet utilise une autre clé

async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message ?? "Login failed");
  }
  const token = data?.token;
  if (!token) throw new Error("No token returned by API");
  return { token };
}

async function fetchMe(token: string) {
  const res = await fetch(`${API_BASE}/api/v1/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message ?? "Failed to fetch /me");
  return data?.user;
}

export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] = React.useState<LoginRole>("STUDENT");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setRole(getLoginRole());
  }, []);

  function pickRole(r: LoginRole) {
    setRole(r);
    setLoginRole(r);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { token } = await login(email.trim(), password);
      window.localStorage.setItem(TOKEN_KEY, token);

      // Vérifie le role réel côté backend
      const me = await fetchMe(token);
      const backendRole = (me?.role ?? "USER") as string;

      // Mapping backend (tu as USER / UNIVERSITY / ADMIN)
      const wantsUniversity = role === "UNIVERSITY";
      const isUniversity = backendRole === "UNIVERSITY" || backendRole === "ADMIN";

      if (wantsUniversity && !isUniversity) {
        throw new Error("Ce compte n’est pas un compte université (role UNIVERSITY requis).");
      }

      // Redirect
      if (wantsUniversity) {
        router.push("/dashboard/university");
      } else {
        router.push("/dashboard");
      }
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
          <p className="text-sm opacity-70">Choose your portal then log in.</p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => pickRole("STUDENT")}
            className={`border rounded-lg p-3 text-sm font-medium ${
              role === "STUDENT" ? "bg-black text-white" : "bg-transparent"
            }`}
          >
            Étudiant
          </button>

<a href="/register" className="mt-4 block text-center text-sm text-gray-500 hover:text-black">Create an account</a>

          <button
            type="button"
            onClick={() => pickRole("UNIVERSITY")}
            className={`border rounded-lg p-3 text-sm font-medium ${
              role === "UNIVERSITY" ? "bg-black text-white" : "bg-transparent"
            }`}
          >
            Université
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input
              className="w-full border rounded-lg p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === "UNIVERSITY" ? "ucsd@ucsd.com" : "student@student.com"}
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <input
              className="w-full border rounded-lg p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
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

        <div className="text-xs opacity-70">
          Après login :
          <span className="font-medium"> Étudiant</span> → <code>/dashboard</code> ·{" "}
          <span className="font-medium">Université</span> → <code>/dashboard/university</code>
        </div>
      </div>
    </div>
  );
}
