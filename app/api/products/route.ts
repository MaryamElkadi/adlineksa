import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeDocument } from "@/lib/serializers";
import Product from "@/models/Product";
import { ensureInitialCatalog } from "@/lib/seed";
import { generateUniqueSku, normalizeSku, isSkuDuplicateError } from "@/lib/skuGenerator";

const MAX_CREATION_RETRIES = 3;

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

    if (!body.name || !body.slug || !body.categorySlug || body.basePrice === undefined) {
      return NextResponse.json(
        { message: "Name, slug, category, and price are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // ── SKU Handling ──────────────────────────────────────
    // If SKU is provided and non-empty, normalise it and check for duplicates
    // explicitly so we can return a clear 409 instead of a raw MongoDB error.
    // If SKU is empty/missing, generate a unique one automatically.
    let manualSku = false;

    if (body.sku && body.sku.trim() !== '') {
      body.sku = normalizeSku(body.sku);
      manualSku = true;

      // Pre-check: does another product already use this SKU?
      const existing = await Product.exists({ sku: body.sku });
      if (existing) {
        console.log(`Product creation blocked: SKU ${body.sku} already exists`);
        return NextResponse.json(
          {
            error: "SKU_ALREADY_EXISTS",
            message: "هذا الرقم التعريفي للمنتج مستخدم بالفعل. يرجى إدخال SKU مختلف.",
          },
          { status: 409 }
        );
      }
    } else {
      // Auto-generate a unique SKU
      body.sku = await generateUniqueSku();
      console.log(`Product creation: auto-generated SKU ${body.sku}`);
    }

    // ── Attempt Creation with retry for concurrent collisions ──
    for (let attempt = 0; attempt < MAX_CREATION_RETRIES; attempt++) {
      try {
        const product = await Product.create(body);
        console.log(`Product created: ${product.name} (SKU: ${product.sku})`);
        return NextResponse.json(serializeDocument(product), { status: 201 });
      } catch (error: unknown) {
        if (isSkuDuplicateError(error)) {
          if (manualSku) {
            // Admin-supplied SKU collided (race condition with another request)
            console.log(`SKU collision on manual SKU ${body.sku}`);
            return NextResponse.json(
              {
                error: "SKU_ALREADY_EXISTS",
                message: "هذا الرقم التعريفي للمنتج مستخدم بالفعل. يرجى إدخال SKU مختلف.",
              },
              { status: 409 }
            );
          }
          // Auto-generated SKU collided — generate a new one and retry
          body.sku = await generateUniqueSku();
          console.log(`SKU collision detected, retrying with new SKU: ${body.sku} (attempt ${attempt + 2})`);
          continue;
        }

        // Check for slug duplicate
        const isDuplicateSlug =
          error instanceof Error &&
          "code" in error &&
          (error as { code?: number }).code === 11000 &&
          (error as Error).message?.includes("slug");

        if (isDuplicateSlug) {
          return NextResponse.json(
            { message: "This product slug is already in use." },
            { status: 409 }
          );
        }

        // Unknown error — rethrow
        throw error;
      }
    }

    // Exhausted retries
    return NextResponse.json(
      { message: "Could not generate a unique SKU. Please try again." },
      { status: 500 }
    );
  } catch (error: unknown) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      { message: "Could not create product" },
      { status: 500 }
    );
  }
}
