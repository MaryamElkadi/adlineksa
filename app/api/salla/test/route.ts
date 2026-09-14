import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SallaStore from "@/models/SallaStore";
import { sallaRequest } from "@/lib/salla";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectToDatabase();

    const store = await SallaStore.findOne().lean();

    if (!store) {
      return NextResponse.json(
        {
          success: false,
          message: "No Salla store found in database.",
        },
        { status: 404 }
      );
    }

    if (!store.merchantId) {
      return NextResponse.json(
        {
          success: false,
          message: "Salla merchant ID is missing.",
        },
        { status: 400 }
      );
    }

    // Request products list from Salla.
    const data = await sallaRequest<any>(
      String(store.merchantId),
      "/products"
    );

    // Determine how many products were returned (fallback to 0).
    const productsFound = Array.isArray(data)
      ? data.length
      : Array.isArray((data as any).data)
      ? (data as any).data.length
      : 0;

    return NextResponse.json({
      success: true,
      message: "Salla API connection works!",
      merchantId: store.merchantId,
      productsFound,
    });
  } catch (error) {
    // Log minimal, non‑sensitive info.
    console.error(
      "Salla test error:",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Salla API request failed",
      },
      { status: 500 }
    );
  }
}