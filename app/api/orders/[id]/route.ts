import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeDocument } from "@/lib/serializers";
import Order from "@/models/Order";

export async function PATCH(request: Request, { params }: RouteContext<'/api/orders/[id]'>) {
  const { id } = await params;
  const { status } = await request.json();
  if (!['Pending', 'In Production', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) return NextResponse.json({ message: 'Invalid order status' }, { status: 400 });
  await connectToDatabase();
  const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
  return order ? NextResponse.json(serializeDocument(order)) : NextResponse.json({ message: 'Order not found' }, { status: 404 });
}
