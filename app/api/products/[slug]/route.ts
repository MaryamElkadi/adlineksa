import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeDocument } from "@/lib/serializers";
import Product from "@/models/Product";
import { ensureInitialCatalog } from "@/lib/seed";




export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { message: "Product slug is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    await ensureInitialCatalog();

    const product = await Product.findOne({
      slug,
      active: { $ne: false },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(serializeDocument(product));
  } catch (error) {
    console.error("Could not load product details:", error);
    return NextResponse.json(
      { message: "Could not load product details." },
      { status: 500 }
    );
  }
}