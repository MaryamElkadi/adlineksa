import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeDocument } from "@/lib/serializers";
import Product from "@/models/Product";
import { ensureInitialCatalog } from "@/lib/seed";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    await ensureInitialCatalog();
    const category = new URL(request.url).searchParams.get("category");
    const products = await Product.find({ ...(category ? { categorySlug: category } : {}), active: { $ne: false } }).sort({ createdAt: -1 });
    return NextResponse.json(products.map(serializeDocument));
  } catch { return NextResponse.json({ message: "Could not load products" }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.slug || !body.categorySlug || body.basePrice === undefined) return NextResponse.json({ message: "Name, slug, category, and price are required." }, { status: 400 });
    await connectToDatabase();
    const product = await Product.create(body);
    return NextResponse.json(serializeDocument(product), { status: 201 });
  } catch (error: unknown) {
    const duplicate = error instanceof Error && "code" in error && (error as { code?: number }).code === 11000;
    return NextResponse.json({ message: duplicate ? "This product slug is already in use." : "Could not create product" }, { status: duplicate ? 409 : 500 });
  }
}
