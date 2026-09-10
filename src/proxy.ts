import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Runs before every route. Three jobs:
 *  1. Refresh the Supabase session cookie if the access token is stale.
 *  2. Coarse route gating from verified JWT claims (no DB call). Pages re-check
 *     authorization server-side; RLS re-checks it again at the data layer.
 *  3. Attach a per-request nonce-based Content-Security-Policy.
 */
const PROTECTED = ["/dashboard", "/apply", "/account"];
const ORGANIZER = ["/organizer"];
const AUTH_ONLY = ["/login", "/signup"];

function startsWithAny(path: string, prefixes: string[]) {
  return prefixes.some((p) => path === p || path.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // Verifies signature locally via cached JWKS; refreshes the session if expired.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims as { user_role?: string } | undefined;
  const path = request.nextUrl.pathname;

  if (!claims && (startsWithAny(path, PROTECTED) || startsWithAny(path, ORGANIZER))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(path)}`;
    return withCsp(NextResponse.redirect(url), csp);
  }

  // `user_role` is stamped by the custom access-token hook. If the claim is absent
  // (hook not enabled yet, or token issued before enabling it) we let the request
  // through: the organizer layout re-checks the role in the database and 403s.
  if (claims && startsWithAny(path, ORGANIZER) && claims.user_role !== undefined && claims.user_role !== "organizer") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return withCsp(NextResponse.redirect(url), csp);
  }

  if (claims && startsWithAny(path, AUTH_ONLY)) {
    const url = request.nextUrl.clone();
    url.pathname = claims.user_role === "organizer" ? "/organizer" : "/dashboard";
    url.search = "";
    return withCsp(NextResponse.redirect(url), csp);
  }

  return withCsp(response, csp);
}

function withCsp(res: NextResponse, csp: string) {
  res.headers.set("Content-Security-Policy", csp);
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
