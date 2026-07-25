import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeDocument } from "@/lib/serializers";
import Category from "@/models/Category";
import Product from "@/models/Product";

export async function GET(_request: Request, { params }: RouteContext<'/api/categories/[id]'>) {
  await connectToDatabase();
  const { id } = await params;
  const category = await Category.findById(id);
  return category ? NextResponse.json(serializeDocument(category)) : NextResponse.json({ message: "Category not found" }, { status: 404 });
}

export async function PATCH(request: Request, { params }: RouteContext<'/api/categories/[id]'>) {
  try {
    const { id } = await params;
    const body = await request.json();
    await connectToDatabase();
    const category = await Category.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    return category ? NextResponse.json(serializeDocument(category)) : NextResponse.json({ message: "Category not found" }, { status: 404 });
  } catch (error: unknown) {
    const duplicate = error instanceof Error && "code" in error && (error as { code?: number }).code === 11000;
    return NextResponse.json({ message: duplicate ? "This category slug is already in use." : "Could not update category" }, { status: duplicate ? 409 : 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext<'/api/categories/[id]'>) {
  const { id } = await params;
  await connectToDatabase();
  const category = await Category.findById(id);
  if (!category) return NextResponse.json({ message: "Category not found" }, { status: 404 });
  const productCount = await Product.countDocuments({ categorySlug: category.slug });
  if (productCount) return NextResponse.json({ message: "Move or delete this category's products first." }, { status: 409 });
  await category.deleteOne();
  return new NextResponse(null, { status: 204 });
}
