import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeDocument } from "@/lib/serializers";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { ensureInitialCatalog } from "@/lib/seed";

export async function GET() {
  try {
    await connectToDatabase();
    await ensureInitialCatalog();
    const categories = await Category.aggregate([
      { $sort: { sortOrder: 1, name: 1 } },
      { $lookup: { from: "products", localField: "slug", foreignField: "categorySlug", as: "products" } },
      { $addFields: { itemCount: { $size: "$products" } } },
      { $project: { products: 0 } },
    ]);
    return NextResponse.json(categories.map((category) => ({ ...category, id: category._id.toString(), _id: undefined })));
  } catch (error) {
    console.error("Could not load categories", error);
    return NextResponse.json({ message: "Could not load categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.nameAr || !body.slug) return NextResponse.json({ message: "Name, Arabic name, and slug are required." }, { status: 400 });
    await connectToDatabase();
    const category = await Category.create(body);
    return NextResponse.json(serializeDocument(category), { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error && "code" in error && (error as { code?: number }).code === 11000 ? "This category slug is already in use." : "Could not create category";
    return NextResponse.json({ message }, { status: message.includes("already") ? 409 : 500 });
  }
}
