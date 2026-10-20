import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { createToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
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
    });

    const cookieStore = await cookies();

    cookieStore.set({
      name: "adline_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
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
    console.error("Login request failed:", error instanceof Error ? error.message : error);

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
