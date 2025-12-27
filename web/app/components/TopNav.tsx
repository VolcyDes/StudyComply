"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  const base =
    "rounded-xl px-3 py-2 text-sm transition hover:bg-gray-50";
  const cls = active
    ? `${base} bg-gray-100 font-medium`
    : `${base} text-gray-700`;

  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export default function TopNav() {
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(Boolean(localStorage.getItem("token")));
  }, []);

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gray-900" />
          <div className="leading-tight">
            <div className="text-sm font-semibold">StudyComply</div>
            <div className="text-xs text-gray-500">
              Stay compliant abroad
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink href="/">Home</NavLink>

          {hasToken && (
            <>
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/profile">Profile</NavLink>
            </>
          )}

          <div className="ml-2 flex items-center gap-2">
            {!hasToken ? (
              <>
                <Link
                  href="/login"
                  className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-black px-3 py-2 text-sm text-white hover:opacity-90"
                >
                  Create account
                </Link>
              </>
            ) : (
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  router.push("/login");
                }}
                className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
              >
                Logout
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
