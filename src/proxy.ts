import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Gives Colombia its own crawlable URL space (/co/...) without duplicating
 * route files: requests to /co/* are rewritten internally to the existing
 * (unprefixed) route, and the resolved country is passed through as a
 * request header for generateMetadata()/getRequestCountry() to read.
 *
 * AU keeps its existing unprefixed routes (CLAUDE.md: "Routes must stay:
 * /, /about, /pricing, /contact, /login, /free-trial").
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isCo = pathname === "/co" || pathname.startsWith("/co/");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-country", isCo ? "co" : "au");

  if (isCo) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/co" ? "/" : pathname.slice("/co".length);
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|studio|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
