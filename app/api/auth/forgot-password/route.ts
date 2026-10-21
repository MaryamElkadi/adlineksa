import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { sendPasswordResetEmail } from "@/lib/email";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { assertSameOrigin } from "@/lib/requestSecurity";

function appBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      // Fall through to the local development default.
    }
  }
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
  throw new Error("NEXT_PUBLIC_APP_URL is required in production");
}

export async function POST(req: Request) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const limited = rateLimit(`forgot:${getClientIp(req)}`, 5, 15 * 60_000);
  if (!limited.ok) {
    return NextResponse.json(rateLimitResponse(limited.retryAfter), {
      status: 429,
      headers: { "Retry-After": String(limited.retryAfter) },
    });
  }

  const genericResponse = NextResponse.json({
    message: "إذا كان البريد الإلكتروني مسجلاً لدينا، فسنرسل رابط إعادة تعيين كلمة المرور.",
  });

  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return genericResponse;
    }

    const normalizedEmail = email.toLowerCase().trim();

    await connectToDatabase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return genericResponse;
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

    await user.save();

    const resetUrl = `${appBaseUrl()}/reset-password?token=${rawToken}`;

    await sendPasswordResetEmail({
      to: user.email,
      resetUrl,
    });

    return genericResponse;
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json(
      { message: "حدث خطأ أثناء معالجة الطلب. يرجى المحاولة لاحقاً." },
      { status: 500 }
    );
  }
}
