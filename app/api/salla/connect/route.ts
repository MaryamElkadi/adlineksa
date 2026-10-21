import crypto from "crypto";
import { NextResponse } from "next/server";
import { getSallaAuthorizationUrl } from "@/lib/salla";
import { requireAdmin } from "@/lib/requireAdmin";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  try {
    const state = crypto.randomBytes(32).toString("hex");
    const response = NextResponse.redirect(getSallaAuthorizationUrl(state));

    response.cookies.set("salla_oauth_state", state, {
      httpOnly: true,
      maxAge: 10 * 60,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("SALLA CONNECT ERROR:", error);
    return NextResponse.json({ message: "Salla connection is not configured." }, { status: 500 });
  }
}
