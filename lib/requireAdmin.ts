import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/currentUser";
import { isAdminUser } from "@/lib/roles";
import { assertSameOrigin } from "@/lib/requestSecurity";

export async function requireUser(request?: Request) {
  if (request) {
    const originError = assertSameOrigin(request);
    if (originError) return { user: null, response: originError };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { user: null, response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }
  return { user, response: null };
}

/** Shared guard for all mutations to the catalogue and homepage content. */
export async function requireAdmin(request?: Request) {
  if (request) {
    const originError = assertSameOrigin(request);
    if (originError) return { user: null, response: originError };
  }

  const user = await getCurrentUser();
  if (!isAdminUser(user)) {
    return { user: null, response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }
  return { user, response: null };
}
