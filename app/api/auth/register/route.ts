import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { assertSameOrigin } from "@/lib/requestSecurity";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const limited = rateLimit(`register:${getClientIp(req)}`, 8, 60 * 60_000);
  if (!limited.ok) {
    return NextResponse.json(rateLimitResponse(limited.retryAfter), {
      status: 429,
      headers: { "Retry-After": String(limited.retryAfter) },
    });
  }

  try {
    await connectToDatabase();

    const {
      firstName,
      lastName,
      email,
      password,
      phone,
    } = await req.json();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        {
          message: "All required fields are required.",
        },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email) || password.length < 6) {
      return NextResponse.json(
        { message: "A valid email and a password of at least 6 characters are required." },
        { status: 400 }
      );
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });

    if (exists) {
      return NextResponse.json(
        {
          message: "Email already exists.",
        },
        {
          status: 400,
        }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      firstName: firstName.trim().slice(0, 80),
      lastName: lastName.trim().slice(0, 80),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: typeof phone === "string" ? phone.trim().slice(0, 30) : "",
      role: "user",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration failed:", error instanceof Error ? error.name : "unknown");

    return NextResponse.json(
      {
        message: "Registration failed",
      },
      {
        status: 500,
      }
    );
  }
}
