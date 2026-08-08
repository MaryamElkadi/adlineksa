import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";
import { getCurrentUserId } from "@/lib/currentUser";

export async function GET(request: Request) {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";

    const query: any = {};
    if (role && role !== "all") {
      query.role = role;
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 }).lean();

    // Fetch order statistics for each user
    const usersWithStats = await Promise.all(
      users.map(async (u: any) => {
        const userOrders = await Order.find({ userId: u._id }).lean();
        const ordersCount = userOrders.length;
        const totalSpent = userOrders.reduce(
          (sum: number, ord: any) => sum + (ord.total || 0),
          0
        );

        return {
          _id: u._id.toString(),
          id: u._id.toString(),
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          fullName: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "بدون اسم",
          email: u.email || "",
          phone: u.phone || "",
          role: u.role || "user",
          isActive: u.isActive !== undefined ? u.isActive : true,
          ordersCount,
          totalSpent,
          createdAt: u.createdAt
            ? new Date(u.createdAt).toISOString()
            : new Date().toISOString(),
        };
      })
    );

    return NextResponse.json(usersWithStats);
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    return NextResponse.json(
      { message: "Could not load users" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { userId, role, isActive } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).lean();

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      _id: updatedUser._id.toString(),
      role: updatedUser.role,
      isActive: updatedUser.isActive,
    });
  } catch (error) {
    console.error("PATCH USER ERROR:", error);
    return NextResponse.json(
      { message: "Could not update user" },
      { status: 500 }
    );
  }
}
