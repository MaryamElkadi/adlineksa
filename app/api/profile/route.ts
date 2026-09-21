import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/currentUser";
import { createToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ message: "غير مصرح بالحصول على البيانات" }, { status: 401 });
    }

    return NextResponse.json({
      _id: currentUser._id.toString(),
      id: currentUser._id.toString(),
      firstName: currentUser.firstName || "",
      lastName: currentUser.lastName || "",
      email: currentUser.email || "",
      phone: currentUser.phone || "",
      avatar: currentUser.avatar || "",
      role: currentUser.role || "user",
      createdAt: currentUser.createdAt,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    return NextResponse.json({ message: "تعذر تحميل بيانات الملف الشخصي" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ message: "غير مصرح بالتعديل" }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, email, phone, avatar } = body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { message: "يرجى إدخال الاسم الأول، اسم العائلة، والبريد الإلكتروني" },
        { status: 400 }
      );
    }

    // Validate Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.toLowerCase().trim();
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { message: "صيغة البريد الإلكتروني غير صحيحة" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check for duplicate email across other users
    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: currentUser._id },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "البريد الإلكتروني مستخدم بالفعل لحساب آخر" },
        { status: 400 }
      );
    }

    // Update only safe allowed fields
    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      {
        $set: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: normalizedEmail,
          phone: phone ? phone.trim() : "",
          ...(avatar !== undefined ? { avatar: avatar.trim() } : {}),
        },
      },
      { new: true, runValidators: true }
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    if (!updatedUser) {
      return NextResponse.json({ message: "المستخدم غير موجود" }, { status: 404 });
    }

    const responseUser = {
      _id: updatedUser._id.toString(),
      id: updatedUser._id.toString(),
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone || "",
      avatar: updatedUser.avatar || "",
      role: updatedUser.role || "user",
    };

    const response = NextResponse.json(responseUser);

    // If email changed, re-issue adline_token session cookie
    if (normalizedEmail !== currentUser.email) {
      const newToken = createToken({
        id: updatedUser._id.toString(),
        role: updatedUser.role,
      });

      const cookieStore = await cookies();
      cookieStore.set("adline_token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });
    }

    return response;
  } catch (error: any) {
    console.error("PATCH PROFILE ERROR:", error);
    return NextResponse.json(
      { message: error?.message || "حدث خطأ أثناء تحديث الملف الشخصي" },
      { status: 500 }
    );
  }
}
