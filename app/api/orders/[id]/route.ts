import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeDocument } from "@/lib/serializers";
import Order from "@/models/Order";
import { getCurrentUser } from "@/lib/currentUser";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (currentUser.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { status } = await request.json();

    const allowedStatuses = [
      "Pending",
      "In Production",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Invalid order status" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(serializeDocument(updatedOrder));
  } catch (error) {
    console.error("PATCH ORDER ERROR:", error);
    return NextResponse.json(
      { message: "Could not update order status" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectToDatabase();

    const order = await Order.findById(id).lean();

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    // Verify ownership: must be admin or the owner of the order
    if (
      currentUser.role !== "admin" &&
      order.userId?.toString() !== currentUser._id?.toString()
    ) {
      return NextResponse.json(
        { message: "Forbidden: You do not have access to this order" },
        { status: 403 }
      );
    }

    return NextResponse.json(serializeDocument(order));
  } catch (error) {
    console.error("GET ORDER BY ID ERROR:", error);
    return NextResponse.json(
      { message: "Could not load order details" },
      { status: 500 }
    );
  }
}

