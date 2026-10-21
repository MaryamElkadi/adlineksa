import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/authCookie";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { mutationNeedsOriginCheck } from "@/lib/requestSecurity";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/control"]);
const AUTH_LIMITS: Array<{ prefix: string; limit: number; windowMs: number }> = [
  { prefix: "/api/auth/login", limit: 8, windowMs: 15 * 60_000 },
  { prefix: "/api/auth/signup", limit: 8, windowMs: 60 * 60_000 },
  { prefix: "/api/auth/register", limit: 8, windowMs: 60 * 60_000 },
  { prefix: "/api/auth/forgot-password", limit: 5, windowMs: 15 * 60_000 },
  { prefix: "/api/auth/reset-password", limit: 8, windowMs: 15 * 60_000 },
];

function hasSessionCookie(request: NextRequest) {
  return Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);
}

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/control" || pathname.startsWith("/control/");
}

function allowedOrigins(request: NextRequest) {
  const origins = new Set([request.nextUrl.origin]);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    try {
      origins.add(new URL(appUrl).origin);
    } catch {
      // Ignore invalid public app URL configuration.
    }
  }
  return origins;
}

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (process.env.NODE_ENV === "production" && mutationNeedsOriginCheck(request)) {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    let candidate = origin;
    if (!candidate && referer) {
      try {
        candidate = new URL(referer).origin;
      } catch {
        candidate = null;
      }
    }
    if (!candidate || !allowedOrigins(request).has(candidate)) {
      return applySecurityHeaders(NextResponse.json({ message: "Forbidden" }, { status: 403 }));
    }
  }

  if (pathname.startsWith("/api/")) {
    const authLimit = AUTH_LIMITS.find((item) => pathname === item.prefix || pathname.startsWith(`${item.prefix}/`));
    if (authLimit) {
      const limited = rateLimit(`proxy:${authLimit.prefix}:${getClientIp(request)}`, authLimit.limit, authLimit.windowMs);
      if (!limited.ok) {
        return applySecurityHeaders(NextResponse.json(
          { message: "تم تجاوز عدد المحاولات مؤقتاً. يرجى المحاولة لاحقاً." },
          { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
        ));
      }
    } else {
      const limited = rateLimit(`proxy:api:${getClientIp(request)}`, 240, 60_000);
      if (!limited.ok) {
        return applySecurityHeaders(NextResponse.json(
          { message: "تم تجاوز عدد الطلبات مؤقتاً. يرجى المحاولة لاحقاً." },
          { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
        ));
      }
    }
  }

  if (isAdminPath(pathname) && !PUBLIC_ADMIN_PATHS.has(pathname) && !hasSessionCookie(request)) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  if ((pathname === "/dashboard" || pathname.startsWith("/dashboard/")) && !hasSessionCookie(request)) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)"],
};
