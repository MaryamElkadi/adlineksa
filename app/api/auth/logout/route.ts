import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { AUTH_COOKIE_NAME, getClearedAuthCookieOptions } from "@/lib/authCookie";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import RevokedSession from "@/models/RevokedSession";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    let decoded: ReturnType<typeof verifyToken> | null = null;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      const isInvalidToken =
        error instanceof Error &&
        (error.name === "JsonWebTokenError" ||
          error.name === "TokenExpiredError" ||
          error.name === "NotBeforeError" ||
          error.message === "Invalid authentication token");
      if (!isInvalidToken) {
        console.error("Session verification failed during logout:", error instanceof Error ? error.name : "unknown");
        return NextResponse.json(
          { message: "Could not securely end the session." },
          { status: 503 },
        );
      }
    }

    if (decoded) {
      try {
        await connectToDatabase();

        if (decoded.jti && decoded.exp) {
          await RevokedSession.collection.createIndex(
            { expiresAt: 1 },
            { expireAfterSeconds: 0 },
          );
          await RevokedSession.updateOne(
            { _id: decoded.jti },
            { $set: { expiresAt: new Date(decoded.exp * 1000) } },
            { upsert: true },
          );
        } else {
          await User.updateOne(
            { _id: decoded.id },
            { $inc: { sessionVersion: 1 } },
          );
        }
      } catch (error) {
        console.error("Session revocation failed:", error instanceof Error ? error.name : "unknown");
        return NextResponse.json(
          { message: "Could not securely end the session." },
          { status: 503 },
        );
      }
    }
  }

  cookieStore.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    ...getClearedAuthCookieOptions(),
  });

  return NextResponse.json({
    success: true,
  });
}
