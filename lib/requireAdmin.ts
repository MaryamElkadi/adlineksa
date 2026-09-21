import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/currentUser";

/** Shared guard for all mutations to the catalogue and homepage content. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return { user: null, response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }
  return { user, response: null };
}
