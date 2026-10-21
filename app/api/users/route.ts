import { NextResponse } from "next/server";
import type { PipelineStage } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/requireAdmin";
import { escapeRegex } from "@/lib/requestSecurity";

const ALLOWED_ROLES = new Set(["user", "admin"]);

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";

    const query: Record<string, unknown> = {};
    if (role && role !== "all") {
      if (!ALLOWED_ROLES.has(role)) {
        return NextResponse.json({ message: "Invalid role filter" }, { status: 400 });
      }
      query.role = role;
    }

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search.slice(0, 80)), "i");
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const page = parseInt(searchParams.get("page") || "0", 10);
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "0", 10));

    const projection = {
      _id: 1,
      firstName: 1,
      lastName: 1,
      email: 1,
      phone: 1,
      role: 1,
      isActive: 1,
      createdAt: 1,
    };

    const pipeline: PipelineStage[] = [{ $match: query }];
    pipeline.push({ $project: projection });
    pipeline.push({ $sort: { createdAt: -1 } });

    async function withStats(users: Array<Record<string, unknown>>) {
      return Promise.all(
        users.map(async (u) => {
          const userOrders = await Order.find({ userId: u._id }).lean();
          const ordersCount = userOrders.length;
          const totalSpent = userOrders.reduce((sum: number, ord: { total?: number }) => sum + (ord.total || 0), 0);
          return {
            _id: String(u._id),
            id: String(u._id),
            firstName: u.firstName || "",
            lastName: u.lastName || "",
            fullName: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "بدون اسم",
            email: u.email || "",
            phone: u.phone || "",
            role: u.role || "user",
            isActive: u.isActive !== undefined ? u.isActive : true,
            ordersCount,
            totalSpent,
            createdAt: u.createdAt ? new Date(String(u.createdAt)).toISOString() : new Date().toISOString(),
          };
        })
      );
    }

    if (page > 0 && limit > 0) {
      const total = await User.countDocuments(query);
      const totalPages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });
      const users = await User.aggregate(pipeline);
      return NextResponse.json({
        users: await withStats(users),
        pagination: { page, limit, total, totalPages },
      });
    }

    const users = await User.aggregate(pipeline);
    return NextResponse.json(await withStats(users));
  } catch (error) {
    console.error("GET USERS ERROR:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json(
      { message: "Could not load users" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    await connectToDatabase();
    const { userId, role, isActive } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (role !== undefined) {
      if (!ALLOWED_ROLES.has(role)) {
        return NextResponse.json({ message: "Invalid role" }, { status: 400 });
      }
      if (String(userId) === auth.user?._id.toString() && role !== "admin") {
        return NextResponse.json({ message: "You cannot remove your own admin role." }, { status: 400 });
      }
      updateData.role = role;
    }
    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return NextResponse.json({ message: "Invalid account status" }, { status: 400 });
      }
      if (String(userId) === auth.user?._id.toString() && isActive === false) {
        return NextResponse.json({ message: "You cannot deactivate your own account." }, { status: 400 });
      }
      updateData.isActive = isActive;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      returnDocument: "after",
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
    console.error("PATCH USER ERROR:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json(
      { message: "Could not update user" },
      { status: 500 }
    );
  }
}
