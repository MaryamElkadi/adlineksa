import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeDocument } from "@/lib/serializers";
import Product from "@/models/Product";
import { ensureInitialCatalog } from "@/lib/seed";
import { generateUniqueSku, normalizeSku, isSkuDuplicateError } from "@/lib/skuGenerator";
import { requireAdmin } from "@/lib/requireAdmin";
import { prepareMediaBody } from "@/lib/media";

const MAX_CREATION_RETRIES = 3;

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    await ensureInitialCatalog();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const compactParam = searchParams.get("compact");
    const format = searchParams.get("format");

    const query: Record<string, any> = { active: { $ne: false } };

    if (category) {
      query.categorySlug = category;
    }

    if (search && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      query.$or = [
        { name: regex },
        { nameAr: regex },
        { categorySlug: regex },
        { description: regex },
      ];
    }

    const isPaginated = Boolean(limitParam || pageParam || format === "paginated");
    const isCompact = compactParam === "true" || (isPaginated && compactParam !== "false");

    let queryBuilder = Product.find(query).sort({ _id: -1 });

    // Use projection for card listings to avoid returning huge documents
    if (isCompact) {
      queryBuilder = queryBuilder.select(
        "name nameAr slug categorySlug description image coverImage basePrice rating reviewCount badge featured bestseller newArrival active configurableQuantityTiers quantityTiers updatedAt"
      );
    }

    queryBuilder = queryBuilder.lean();

    if (isPaginated) {
      const page = Math.max(1, parseInt(pageParam || "1", 10));
      const limit = Math.max(1, Math.min(100, parseInt(limitParam || "12", 10)));
      const skip = (page - 1) * limit;

      const [total, items] = await Promise.all([
        Product.countDocuments(query),
        queryBuilder.skip(skip).limit(limit),
      ]);

      const totalPages = Math.ceil(total / limit);
      const hasMore = page < totalPages;

      if (format === "paginated") {
        return NextResponse.json({
          products: items.map(serializeDocument),
          total,
          page,
          totalPages,
          hasMore,
        });
      }

      return NextResponse.json(items.map(serializeDocument), {
        headers: {
          "x-total-count": total.toString(),
          "x-page": page.toString(),
          "x-total-pages": totalPages.toString(),
          "x-has-more": hasMore.toString(),
        },
      });
    }

    const products = await queryBuilder;
    return NextResponse.json(products.map(serializeDocument));
  } catch (error) {
    console.error("Could not load products", error);
    return NextResponse.json({ message: "Could not load products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  try {
    const body = await request.json() as Record<string, unknown>;
    if (!prepareMediaBody(body)) {
      return NextResponse.json({ message: "Product media is invalid. Use HTTPS image URLs and supported video providers." }, { status: 400 });
    }

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

    if (typeof body.sku === "string" && body.sku.trim() !== '') {
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
        revalidatePath("/", "page");
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
