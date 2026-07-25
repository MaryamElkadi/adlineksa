import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeDocument } from "@/lib/serializers";
import Product from "@/models/Product";

export async function PATCH(request: Request, { params }: RouteContext<'/api/products/[id]'>) {
  const { id } = await params;
  await connectToDatabase();
  const product = await Product.findByIdAndUpdate(id, await request.json(), { new: true, runValidators: true });
  return product ? NextResponse.json(serializeDocument(product)) : NextResponse.json({ message: "Product not found" }, { status: 404 });
}
export async function DELETE(_request: Request, { params }: RouteContext<'/api/products/[id]'>) {
  const { id } = await params;
  await connectToDatabase();
  const product = await Product.findByIdAndDelete(id);
  return product ? new NextResponse(null, { status: 204 }) : NextResponse.json({ message: "Product not found" }, { status: 404 });
}
