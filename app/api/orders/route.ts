import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";

const serializeOrder = (order: any) => {
  const value = order.toObject();
  return { ...value, id: value._id.toString(), _id: undefined, date: value.createdAt?.toISOString().slice(0, 10), itemsCount: value.items.length };
};

export async function GET() {
  await connectToDatabase();
  const orders = await Order.find().sort({ createdAt: -1 });
  return NextResponse.json(orders.map(serializeOrder));
}
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!Array.isArray(body.items) || !body.items.length || !body.customer?.fullName || !body.customer?.email || !body.customer?.phone || !body.shippingAddress || !body.paymentMethod) return NextResponse.json({ message: "Complete customer, shipping, payment, and item details are required." }, { status: 400 });
    await connectToDatabase();
    const order = await Order.create({ ...body, orderNumber: `ADL-${Date.now().toString().slice(-8)}`, status: "Pending" });
    return NextResponse.json(serializeOrder(order), { status: 201 });
  } catch { return NextResponse.json({ message: "Could not create order" }, { status: 500 }); }
}
