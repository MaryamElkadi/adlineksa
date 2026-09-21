import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getCurrentUser } from "@/lib/currentUser";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const notifications = await Notification.find({ userId: currentUser._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = await Notification.countDocuments({
      userId: currentUser._id,
      read: false,
    });

    return NextResponse.json({
      notifications: notifications.map((n: any) => ({
        ...n,
        _id: n._id.toString(),
        id: n._id.toString(),
      })),
      unreadCount,
    });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    return NextResponse.json(
      { message: "Could not load notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    await Notification.updateMany(
      { userId: currentUser._id, read: false },
      { read: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("MARK NOTIFICATIONS READ ERROR:", error);
    return NextResponse.json(
      { message: "Could not update notifications" },
      { status: 500 }
    );
  }
}
