"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../lib/config";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Register failed (${res.status})`);
      }

      const rawOk = await res.text();
      let data: any = null;
      try { data = rawOk ? JSON.parse(rawOk) : null; } catch { data = null; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-3xl font-bold">Create account</h1>
      <p className="mt-2 text-sm text-gray-600">
        Register to start using StudyComply.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Choose a strong password"
            required
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-xs text-gray-500">
        Already have an account?{" "}
        <a className="underline" href="/login">
          Login
        </a>
      </p>
    </div>
  );
}
