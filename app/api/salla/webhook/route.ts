import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SallaStore from "@/models/SallaStore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("========== SALLA WEBHOOK ==========");
    console.log("Event:", body.event);
    console.log("Merchant:", body.merchant);

    /*
     * Easy Mode authorization
     */
    if (body.event === "app.store.authorize") {
      const accessToken = body.data?.access_token;
      const refreshToken = body.data?.refresh_token;
      const expires = body.data?.expires;

      console.log(
        "Access Token received:",
        !!accessToken
      );

      console.log(
        "Refresh Token received:",
        !!refreshToken
      );

      console.log(
        "Expires:",
        expires
      );

      if (!accessToken) {
        console.error("No access token received");
        return NextResponse.json(
          {
            success: false,
            message: "Access token missing",
          },
          { status: 400 }
        );
      }

      await connectToDatabase();

      await SallaStore.findOneAndUpdate(
        {
          merchantId: String(body.merchant),
        },
        {
          merchantId: String(body.merchant),
          accessToken,
          refreshToken: refreshToken || "",
          expires: expires || null,
          scope: body.data?.scope || "",
          tokenType: body.data?.token_type || "bearer",
          updatedAt: new Date(),
        },
        {
          upsert: true,
          new: true,
        }
      );

      console.log("SALLA STORE SAVED TO DATABASE!");
    }

    /*
     * App updated
     */
    if (body.event === "app.updated") {
      console.log("SALLA APP UPDATED");
    }

    /*
     * App uninstalled
     */
    if (body.event === "app.uninstalled") {
      console.log(
        "SALLA APP UNINSTALLED FROM:",
        body.merchant
      );
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