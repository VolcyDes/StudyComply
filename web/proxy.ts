import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isAuthPath(pathname: string) {
  return (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public") ||
    pathname === "/"
  );
}

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isAuthPath(pathname)) return NextResponse.next();

  // Read "account kind" from cookie (set on login)
  const kind = (req.cookies.get("sc_account_kind")?.value || "").toUpperCase();

  // If no kind cookie, assume not logged in
  if (!kind && (pathname.startsWith("/student") || pathname.startsWith("/university") || pathname === "/dashboard" || pathname === "/profile")) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/student") && kind === "UNIVERSITY") {
    const url = req.nextUrl.clone();
    url.pathname = "/university/dashboard";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/university") && kind === "STUDENT") {
    const url = req.nextUrl.clone();
    url.pathname = "/student/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/university/:path*", "/dashboard", "/profile"],
};
