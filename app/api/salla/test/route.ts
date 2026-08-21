import { NextResponse } from "next/server";
import { sallaRequest } from "@/lib/salla";

export async function GET() {
  try {
    /*
     * Replace this with the merchant ID
     * received from your Salla webhook.
     */
    const merchantId = "1982883112";

    const data = await sallaRequest(
      merchantId,
      "/products"
    );

    return NextResponse.json({
      success: true,
      message: "Salla API connection works",
      data,
    });
  } catch (error) {
    console.error(
      "Salla test error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Salla API request failed",
      },
      { status: 500 }
    );
  }
}