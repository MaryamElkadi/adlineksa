// app/api/admin/marketplaces/[marketplace]/export/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { generateExcel, generateSallaImportExcel } from "@/lib/excelGenerator";
import { requireAdmin } from "@/lib/requireAdmin";

/**
 * Validate marketplace value.
 */
type Marketplace = "amazon" | "noon" | "salla";
const MAX_EXPORT_PRODUCTS = 5_000;
const EXPORT_QUERY_TIMEOUT_MS = 45_000;

export const maxDuration = 60;

async function loadArabicCategoryNames(categorySlugs: string[]) {
  const slugs = [...new Set(categorySlugs.filter(Boolean))];
  if (slugs.length === 0) return new Map<string, string>();

  const categories = await Category.find({ slug: { $in: slugs } }).select("slug nameAr").lean();
  return new Map(
    categories
      .filter((category) => category.nameAr)
      .map((category) => [category.slug, category.nameAr]),
  );
}

function getErrorDetails(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : undefined;

  return {
    errorName: error instanceof Error ? error.name : "unknown",
    errorCode: code,
    errorMessage: message.replace(/mongodb(?:\+srv)?:\/\/[^\s"'`]+/gi, "mongodb://[redacted]"),
  };
}

function validateMarketplace(marketplace: string | null): Marketplace {
  if (!marketplace) throw new Error("Marketplace parameter is required");
  if (marketplace !== "amazon" && marketplace !== "noon" && marketplace !== "salla") {
    throw new Error("Invalid marketplace.");
  }
  return marketplace;
}

/**
 * GET – Export ALL active products for the given marketplace.
 */
export async function GET(request: Request, context: RouteContext<"/api/admin/marketplaces/[marketplace]/export">) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const { marketplace } = await context.params;
  let mp: Marketplace;
  try {
    mp = validateMarketplace(marketplace);
  } catch {
    return NextResponse.json({ message: "Invalid marketplace." }, { status: 400 });
  }

  const startedAt = Date.now();
  let phase = "database connection";
  try {
    await connectToDatabase();
    phase = "product query";
    const products = await Product.find({ active: { $ne: false } })
      .select(
        "name nameAr description shortDescription basePrice salePrice stock sku categorySlug image coverImage gallery images",
      )
      .limit(MAX_EXPORT_PRODUCTS + 1)
      .maxTimeMS(EXPORT_QUERY_TIMEOUT_MS)
      .lean();

    if (products.length > MAX_EXPORT_PRODUCTS) {
      return NextResponse.json(
        {
          message: `This export contains more than ${MAX_EXPORT_PRODUCTS} products. Export a smaller selection at a time.`,
        },
        { status: 413 },
      );
    }

    phase = "workbook generation";
    const buffer = mp === "salla"
      ? generateSallaImportExcel(
          products,
          await loadArabicCategoryNames(products.map((product) => product.categorySlug)),
        )
      : await generateExcel(products, mp);
    const filename = `${mp}-products.xlsx`;
    const uint8 = new Uint8Array(buffer);
    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: unknown) {
    console.error("Marketplace export failed:", JSON.stringify({
      ...getErrorDetails(err),
      marketplace: mp,
      phase,
      durationMs: Date.now() - startedAt,
    }));
    const isQueryTimeout =
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err.code === 50 || err.code === "50");
    return NextResponse.json(
      {
        message: isQueryTimeout
          ? "The product query took too long. Please retry or export fewer products."
          : "Export failed. Please retry, and contact support if the problem continues.",
      },
      { status: isQueryTimeout ? 504 : 500 },
    );
  }
}

/**
 * POST – Export SELECTED product IDs for the given marketplace.
 * Expected body: { productIds: string[] }
 */
export async function POST(request: Request, context: RouteContext<"/api/admin/marketplaces/[marketplace]/export">) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  const { marketplace } = await context.params;
  let mp: Marketplace;
  try {
    mp = validateMarketplace(marketplace);
  } catch {
    return NextResponse.json({ message: "Invalid marketplace." }, { status: 400 });
  }

  const startedAt = Date.now();
  let phase = "request parsing";
  try {
    const body = await request.json();
    if (!Array.isArray(body.productIds) || body.productIds.length === 0) {
      return NextResponse.json({ message: "productIds must be a non‑empty array" }, { status: 400 });
    }

    if (body.productIds.length > MAX_EXPORT_PRODUCTS) {
      return NextResponse.json(
        { message: `Export at most ${MAX_EXPORT_PRODUCTS} products at a time.` },
        { status: 413 },
      );
    }

    if (
      !body.productIds.every(
        (productId: unknown) =>
          typeof productId === "string" && /^[a-f\d]{24}$/i.test(productId),
      )
    ) {
      return NextResponse.json({ message: "productIds contains an invalid product ID." }, { status: 400 });
    }

    phase = "database connection";
    await connectToDatabase();
    phase = "product query";
    const products = await Product.find({ _id: { $in: body.productIds }, active: { $ne: false } })
      .select(
        "name nameAr description shortDescription basePrice salePrice stock sku categorySlug image coverImage gallery images",
      )
      .maxTimeMS(EXPORT_QUERY_TIMEOUT_MS)
      .lean();
    if (products.length === 0) {
      return NextResponse.json({ message: "No matching products found" }, { status: 404 });
    }

    phase = "workbook generation";
    const buffer = mp === "salla"
      ? generateSallaImportExcel(
          products,
          await loadArabicCategoryNames(products.map((product) => product.categorySlug)),
        )
      : await generateExcel(products, mp);
    const filename = `${mp}-selected-products.xlsx`;
    const uint8 = new Uint8Array(buffer);
    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: unknown) {
    console.error("Marketplace export failed:", JSON.stringify({
      ...getErrorDetails(err),
      marketplace: mp,
      phase,
      durationMs: Date.now() - startedAt,
    }));
    const message = err instanceof SyntaxError ? "Invalid JSON body" : "Export failed";
    return NextResponse.json(
      {
        message:
          err instanceof SyntaxError
            ? message
            : "Export failed. Please retry, and contact support if the problem continues.",
      },
      { status: err instanceof SyntaxError ? 400 : 500 },
    );
  }
}
