import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeDocument } from "@/lib/serializers";
import Product from "@/models/Product";
import mongoose from "mongoose";
import { normalizeSku, isSkuDuplicateError } from "@/lib/skuGenerator";

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

/**
 * Helper: validate SKU uniqueness for update operations.
 * Returns a 409 NextResponse if the SKU is taken by ANOTHER product,
 * or null if it's safe to proceed.
 */
async function validateSkuForUpdate(id: string, body: Record<string, unknown>) {
  if (body.sku && typeof body.sku === 'string' && body.sku.trim() !== '') {
    body.sku = normalizeSku(body.sku as string);

    // Check if another product (not this one) already uses this SKU
    const conflict = await Product.exists({
      sku: body.sku,
      _id: { $ne: id },
    });

    if (conflict) {
      console.log(`Product update blocked: SKU ${body.sku} already used by another product`);
      return NextResponse.json(
        {
          error: "SKU_ALREADY_EXISTS",
          message: "هذا الرقم التعريفي للمنتج مستخدم بالفعل. يرجى إدخال SKU مختلف.",
        },
        { status: 409 }
      );
    }
  }
  return null;
}

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/products/[id]">
) {
  try {
    const { id } = await context.params;

    await connectToDatabase();

    const body = await request.json();

    // Validate SKU uniqueness (excludes current product)
    const skuError = await validateSkuForUpdate(id, body);
    if (skuError) return skuError;

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
  } catch (error) {
    if (isSkuDuplicateError(error)) {
      return NextResponse.json(
        {
          error: "SKU_ALREADY_EXISTS",
          message: "هذا الرقم التعريفي للمنتج مستخدم بالفعل. يرجى إدخال SKU مختلف.",
        },
        { status: 409 }
      );
    }

    console.error(error);

    return NextResponse.json(
      { message: "Could not update product." },
      { status: 500 }
    );
  }
}

// PUT handler – works like PATCH but supports full replacement semantics
export async function PUT(request: Request, context: RouteContext<"/api/products/[id]">) {
  try {
    const { id } = await context.params;
    await connectToDatabase();
    const body = await request.json();

    // Validate SKU uniqueness (excludes current product)
    const skuError = await validateSkuForUpdate(id, body);
    if (skuError) return skuError;

    const product = await Product.findByIdAndUpdate(id, body, {
      new: true,
      overwrite: true, // replace the whole document
      runValidators: true,
    });
    if (!product) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }
    return NextResponse.json(serializeDocument(product));
  } catch (error) {
    if (isSkuDuplicateError(error)) {
      return NextResponse.json(
        {
          error: "SKU_ALREADY_EXISTS",
          message: "هذا الرقم التعريفي للمنتج مستخدم بالفعل. يرجى إدخال SKU مختلف.",
        },
        { status: 409 }
      );
    }

    console.error(error);
    return NextResponse.json({ message: "Could not replace product." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/products/[id]">
) {
  try {
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
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Could not delete product." },
      { status: 500 }
    );
  }
}