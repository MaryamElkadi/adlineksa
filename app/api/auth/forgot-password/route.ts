import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const genericResponse = NextResponse.json({
      message: "إذا كان البريد الإلكتروني مسجلاً لدينا، فسنرسل رابط إعادة تعيين كلمة المرور.",
    });

    if (!email || typeof email !== "string") {
      return genericResponse;
    }

    const normalizedEmail = email.toLowerCase().trim();

    await connectToDatabase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Return generic response to prevent account enumeration
      return genericResponse;
    }

    // Generate unhashed random token for link
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Store hash of token in DB
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.save();

    // Determine application base URL
    const origin = req.headers.get("origin") || req.headers.get("referer");
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (origin ? new URL(origin).origin : "http://localhost:3000");

    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

    await sendPasswordResetEmail({
      to: user.email,
      resetUrl,
    });

    return genericResponse;
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء معالجة الطلب. يرجى المحاولة لاحقاً." },
      { status: 500 }
    );
  }
}
