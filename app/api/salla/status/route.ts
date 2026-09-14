import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SallaStore from "@/models/SallaStore";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectToDatabase();

    const store = await SallaStore.findOne().lean();

    if (!store) {
      return NextResponse.json({
        success: false,
        connected: false,
        message: "No Salla store found in database",
      });
    }

    return NextResponse.json({
      success: true,
      connected: true,
      merchantId: store.merchantId,
      hasAccessToken: Boolean(store.accessToken),
      hasRefreshToken: Boolean(store.refreshToken),
      expires: store.expires ?? null,
      scope: store.scope ?? null,
      tokenType: store.tokenType ?? null,
    });
  } catch (error) {
    console.error("Salla status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to check Salla connection",
      },
      { status: 500 }
    );
  }
}