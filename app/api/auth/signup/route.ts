import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import User from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";
import { createToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
    } = await req.json();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password
    ) {
      return NextResponse.json(
        {
          message: "Please fill all required fields.",
        },
        {
          status: 400,
        }
      );
    }

    const exists = await User.findOne({
      email: email.toLowerCase(),
    });

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
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: "user",
    });

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
    console.log(error);

    return NextResponse.json(
      {
        message: "Server Error",
      },
      {
        status: 500,
      }
    );
  }
}