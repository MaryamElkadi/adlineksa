import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";
import { getCurrentUserId } from "@/lib/currentUser";

function serializeOrder(order: any) {
  const value = order.toObject();

  return {
    ...value,
    _id: value._id.toString(),
    id: value._id.toString(),
    date: value.createdAt
      ? new Date(value.createdAt).toISOString().slice(0, 10)
      : "",
    itemsCount: value.items?.length || 0,
  };
}

// GET ORDERS (Support Admin all orders & filtering)
export async function GET(request: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get("admin") === "true" || searchParams.get("all") === "true";
    const statusFilter = searchParams.get("status") || "";
    const searchFilter = searchParams.get("search") || "";

    const query: any = {};

    if (!isAdmin) {
      query.userId = userId;
    }

    if (statusFilter && statusFilter !== "all" && statusFilter !== "الكل") {
      query.status = statusFilter;
    }

    if (searchFilter) {
      const searchRegex = new RegExp(searchFilter, "i");
      query.$or = [
        { orderNumber: searchRegex },
        { "customer.fullName": searchRegex },
        { "customer.email": searchRegex },
        { "customer.phone": searchRegex },
      ];
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      orders.map((order: any) => ({
        ...order,
        _id: order._id.toString(),
        id: order._id.toString(),
        date: order.createdAt
          ? new Date(order.createdAt).toISOString().slice(0, 10)
          : "",
        itemsCount: order.items?.length || 0,
      }))
    );
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    return NextResponse.json(
      { message: "Could not load orders" },
      { status: 500 }
    );
  }
}

// CREATE ORDER FOR CURRENT USER
export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (
      !Array.isArray(body.items) ||
      !body.items.length ||
      !body.customer?.fullName ||
      !body.customer?.email ||
      !body.customer?.phone ||
      !body.shippingAddress ||
      !body.paymentMethod
    ) {
      return NextResponse.json(
        {
          message:
            "Complete customer, shipping, payment, and item details are required.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const order = await Order.create({
      ...body,

      // IMPORTANT
      userId,

      orderNumber: `ADL-${Date.now()
        .toString()
        .slice(-8)}`,

      status: "Pending",
    });

    return NextResponse.json(
      serializeOrder(order),
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    return NextResponse.json(
      { message: "Could not create order" },
      { status: 500 }
    );
  }
}