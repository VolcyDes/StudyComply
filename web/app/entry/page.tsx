"use client";

import Link from "next/link";

export default function EntryPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 rounded-xl border p-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">StudyComply</h1>
          <p className="text-sm opacity-80">Choose how you want to sign in.</p>
        </div>

        <div className="grid gap-3">
          <Link
            href="/login?as=student"
            className="rounded-lg border px-4 py-3 hover:bg-black/5"
          >
            <div className="font-medium">I’m a student</div>
            <div className="text-sm opacity-80">Manage travel + requirements</div>
          </Link>

          <Link
            href="/login?as=university"
            className="rounded-lg border px-4 py-3 hover:bg-black/5"
          >
            <div className="font-medium">I’m a university</div>
            <div className="text-sm opacity-80">Manage required documents & deadlines</div>
          </Link>
        </div>

        <div className="text-sm opacity-70">
          No account?{" "}
          <Link className="underline" href="/register">
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
