import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { isValidSallaWebhookSignature } from "@/lib/salla";
import SallaStore from "@/models/SallaStore";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();

  if (!isValidSallaWebhookSignature(body, request.headers.get("x-salla-signature"))) {
    return NextResponse.json({ message: "Invalid Salla webhook signature." }, { status: 401 });
  }

  const event = JSON.parse(body) as {
    event?: string;
    merchant?: string | number;
    data?: { access_token?: string; refresh_token?: string; expires?: number; expires_in?: number; scope?: string; token_type?: string };
  };

  // Supports Salla Easy Mode as well as the Custom OAuth callback route.
  if (event.event === "app.store.authorize" && event.data?.access_token && event.merchant) {
    await connectToDatabase();
    await SallaStore.findOneAndUpdate(
      { merchantId: String(event.merchant) },
      {
        merchantId: String(event.merchant),
        accessToken: event.data.access_token,
        refreshToken: event.data.refresh_token || "",
        expires: event.data.expires || Math.floor(Date.now() / 1000) + (event.data.expires_in || 14 * 24 * 60 * 60),
        scope: event.data.scope || "",
        tokenType: event.data.token_type || "Bearer",
      },
      { upsert: true, new: true }
    );
  }

  // Salla retries failed deliveries, so only acknowledge a verified payload.
  return NextResponse.json({ received: true });
}
