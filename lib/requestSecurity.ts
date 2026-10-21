import { NextResponse } from "next/server";

const WEBHOOK_PATHS = ["/api/salla/webhook"];

function allowedOrigins(request: Request) {
  const origins = new Set<string>();
  try {
    origins.add(new URL(request.url).origin);
  } catch {
    // Ignore malformed request URLs; Host-based checks below still apply.
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    try {
      origins.add(new URL(appUrl).origin);
    } catch {
      // Ignore invalid app URL configuration rather than failing open.
    }
  }
  return origins;
}

function originFromReferer(referer: string | null) {
  if (!referer) return null;
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

export function mutationNeedsOriginCheck(request: Request) {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return false;
  try {
    const path = new URL(request.url).pathname;
    return !WEBHOOK_PATHS.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
  } catch {
    return true;
  }
}

export function assertSameOrigin(request: Request) {
  if (process.env.NODE_ENV !== "production") return null;
  if (!mutationNeedsOriginCheck(request)) return null;

  const allowed = allowedOrigins(request);
  const origin = request.headers.get("origin");
  const refererOrigin = originFromReferer(request.headers.get("referer"));
  const candidate = origin || refererOrigin;

  if (!candidate || !allowed.has(candidate)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  return null;
}

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
