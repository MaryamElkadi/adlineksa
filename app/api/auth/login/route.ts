import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { createToken } from "@/lib/auth";
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from "@/lib/authCookie";
import { getClientIp, rateLimitResponse } from "@/lib/rateLimit";
import { persistentRateLimit } from "@/lib/persistentRateLimit";
import { assertSameOrigin } from "@/lib/requestSecurity";

export async function POST(req: Request) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  try {
    const { email, password } = await req.json();

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const ip = getClientIp(req);
    const limits = await Promise.all([
      persistentRateLimit(`login:ip:${ip}`, 30, 15 * 60_000),
      persistentRateLimit(`login:email:${normalizedEmail}`, 8, 15 * 60_000),
    ]);
    const limited = limits.find((result) => !result.ok);
    if (limited) {
      return NextResponse.json(rateLimitResponse(limited.retryAfter), {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfter) },
      });
    }

    await connectToDatabase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user || user.isActive === false) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const passwordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordCorrect) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = createToken({
      id: user._id.toString(),
      role: user.role,
      sessionVersion: user.sessionVersion || 0,
    });

    const cookieStore = await cookies();

    cookieStore.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      ...getAuthCookieOptions(),
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (error) {
    const isDatabaseUnavailable = error instanceof Error && (
      error.name === "MongooseServerSelectionError" ||
      error.name === "MongoServerSelectionError"
    );
    console.error("Login request failed:", error instanceof Error ? error.name : "unknown");

    return NextResponse.json(
      {
        message: isDatabaseUnavailable
          ? "تعذر الاتصال بقاعدة البيانات حالياً. يرجى مراجعة إعدادات MongoDB Atlas والسماح بعنوان IP الخاص بالخادم."
          : "تعذر تسجيل الدخول حالياً.",
      },
      { status: isDatabaseUnavailable ? 503 : 500 }
    );
  }
}
