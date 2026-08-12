import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("========== SALLA WEBHOOK ==========");
    console.log(JSON.stringify(body, null, 2));

    // Easy Mode authorization event
    if (body.event === "app.store.authorize") {
      console.log("SALLA STORE AUTHORIZED!");
      console.log("Merchant:", body.merchant);
      console.log("Access Token received:", !!body.data?.access_token);
      console.log("Refresh Token received:", !!body.data?.refresh_token);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Webhook received",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Salla webhook error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Invalid webhook payload",
      },
      { status: 400 }
    );
  }
}