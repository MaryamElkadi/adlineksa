import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { assertSameOrigin } from "@/lib/requestSecurity";

export async function POST(req: Request) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const limited = rateLimit(`reset:${getClientIp(req)}`, 8, 15 * 60_000);
  if (!limited.ok) {
    return NextResponse.json(rateLimitResponse(limited.retryAfter), {
      status: 429,
      headers: { "Retry-After": String(limited.retryAfter) },
    });
  }

  try {
    const { token, password } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { message: "رابط التعيين غير صالح أو مفقود." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { message: "كلمة المرور يجب أن لا تقل عن 6 أحرف." },
        { status: 400 }
      );
    }

    // Hash incoming token to match against DB
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    await connectToDatabase();

    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "رابط إعادة تعيين كلمة المرور غير صالح أو انتهت صلاحيته." },
        { status: 400 }
      );
    }

    // Hash new password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.sessionVersion = (user.sessionVersion || 0) + 1;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return NextResponse.json({
      message: "تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء إعادة تعيين كلمة المرور." },
      { status: 500 }
    );
  }
}
