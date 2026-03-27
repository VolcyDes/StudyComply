import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Lightweight route-protection middleware.
 *
 * Checks for the `sc_authed` cookie (set by lib/auth.ts after login/register).
 * This is a UX guard — it prevents protected pages from rendering before the
 * client-side auth check fires. The real security boundary is the JWT guard on
 * the API; every protected API call requires a valid Bearer token.
 */
export function middleware(request: NextRequest) {
  const authed = request.cookies.has("sc_authed");

  if (!authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/student/:path*",
    "/university/:path*",
    "/profile/:path*",
  ],
};
