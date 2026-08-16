import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SallaStore from "@/lib/models/SallaStore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("========== SALLA WEBHOOK ==========");
    console.log("Event:", body.event);
    console.log("Merchant:", body.merchant);

    if (body.event === "app.store.authorize") {
      const merchantId = body.merchant;
      const data = body.data;

      if (!merchantId || !data?.access_token || !data?.refresh_token) {
        console.error("Invalid Salla authorization payload");

        return NextResponse.json(
          {
            success: false,
            message: "Missing Salla authorization data",
          },
          { status: 400 }
        );
      }

      await connectToDatabase();

      const expiresAt = new Date(data.expires * 1000);

      await SallaStore.findOneAndUpdate(
        { merchantId: String(merchantId) },
        {
          merchantId: String(merchantId),
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt,
          scope: data.scope || "",
          tokenType: data.token_type || "bearer",
        },
        {
          upsert: true,
          new: true,
        }
      );

      console.log("SALLA STORE AUTHORIZED!");
      console.log("Merchant:", merchantId);
      console.log("Access token saved successfully.");
      console.log("Refresh token saved successfully.");
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