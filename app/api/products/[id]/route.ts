import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeDocument } from "@/lib/serializers";
import Product from "@/models/Product";
import mongoose from "mongoose";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/products/[id]">
) {
  try {
    const { id } = await context.params;

    await connectToDatabase();

    let product;

    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    } else {
      product = await Product.findOne({ slug: id });
    }

    if (!product) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(serializeDocument(product));
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Could not load product." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/products/[id]">
) {
  const { id } = await context.params;

  await connectToDatabase();

  const body = await request.json();

  const product = await Product.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return NextResponse.json(
      { message: "Product not found." },
      { status: 404 }
    );
  }

  return NextResponse.json(serializeDocument(product));
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/products/[id]">
) {
  const { id } = await context.params;

  await connectToDatabase();

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    return NextResponse.json(
      { message: "Product not found." },
      { status: 404 }
    );
  }

  return new NextResponse(null, { status: 204 });
}