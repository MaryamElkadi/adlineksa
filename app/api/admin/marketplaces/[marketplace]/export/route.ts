// app/api/admin/marketplaces/[marketplace]/export/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import { generateExcel } from "@/lib/excelGenerator";

/**
 * Validate marketplace value – only "amazon" or "noon" are allowed.
 */
function validateMarketplace(marketplace: string | null): string {
  if (!marketplace) throw new Error("Marketplace parameter is required");
  if (marketplace !== "amazon" && marketplace !== "noon") {
    throw new Error("Invalid marketplace. Must be 'amazon' or 'noon'");
  }
  return marketplace;
}

/**
 * GET – Export ALL active products for the given marketplace.
 */
export async function GET(request: Request, context: RouteContext<"/api/admin/marketplaces/[marketplace]/export">) {
  try {
    const { marketplace } = await context.params;
    const mp = validateMarketplace(marketplace);

    await connectToDatabase();
    const products = await Product.find({ active: { $ne: false } }).lean();

    const buffer = await generateExcel(products as any, mp);
    const filename = `${mp}-products.xlsx`;
    const uint8 = new Uint8Array(buffer);
    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || "Export failed" }, { status: 400 });
  }
}

/**
 * POST – Export SELECTED product IDs for the given marketplace.
 * Expected body: { productIds: string[] }
 */
export async function POST(request: Request, context: RouteContext<"/api/admin/marketplaces/[marketplace]/export">) {
  try {
    const { marketplace } = await context.params;
    const mp = validateMarketplace(marketplace);

    const body = await request.json();
    if (!Array.isArray(body.productIds) || body.productIds.length === 0) {
      return NextResponse.json({ message: "productIds must be a non‑empty array" }, { status: 400 });
    }

    await connectToDatabase();
    const products = await Product.find({ _id: { $in: body.productIds }, active: { $ne: false } }).lean();
    if (products.length === 0) {
      return NextResponse.json({ message: "No matching products found" }, { status: 404 });
    }

    const buffer = await generateExcel(products as any, mp);
    const filename = `${mp}-selected-products.xlsx`;
    const uint8 = new Uint8Array(buffer);
    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error(err);
    const message = err instanceof SyntaxError ? "Invalid JSON body" : err.message;
    return NextResponse.json({ message: message || "Export failed" }, { status: 400 });
  }
}
