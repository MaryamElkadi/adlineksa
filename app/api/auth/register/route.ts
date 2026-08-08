import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
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
      !password
    ) {
      return NextResponse.json(
        {
          message: "All required fields are required.",
        },
        { status: 400 }
      );
    }

    const exists = await User.findOne({ email });

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
      email,
      password: hashedPassword,
      phone,
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
    console.log(error);

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