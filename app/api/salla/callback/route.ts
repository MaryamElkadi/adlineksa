import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { exchangeSallaAuthorizationCode } from "@/lib/salla";
import SallaStore from "@/models/SallaStore";

export const runtime = "nodejs";

function stateMatches(expected: string | undefined, received: string | null) {
  if (!expected || !received) return false;

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const expectedState = request.headers
    .get("cookie")
    ?.match(/(?:^|; )salla_oauth_state=([^;]+)/)?.[1];

  const settingsUrl = new URL("/admin/settings", request.url);
  const response = NextResponse.redirect(settingsUrl);
  response.cookies.delete("salla_oauth_state");

  if (error || !code || !stateMatches(expectedState, state)) {
    settingsUrl.searchParams.set("salla", "failed");
    return NextResponse.redirect(settingsUrl, { headers: response.headers });
  }

  try {
    const tokens = await exchangeSallaAuthorizationCode(code);
    await connectToDatabase();
    await SallaStore.findOneAndUpdate(
      { merchantId: "primary" },
      {
        merchantId: "primary",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || "",
        expires: Math.floor(Date.now() / 1000) + Math.max(tokens.expires_in || 0, 60),
        scope: "orders.read_write products.read webhooks.read_write",
        tokenType: tokens.token_type || "Bearer",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    settingsUrl.searchParams.set("salla", "connected");
    return NextResponse.redirect(settingsUrl, { headers: response.headers });
  } catch (callbackError) {
    console.error("SALLA CALLBACK ERROR:", callbackError);
    settingsUrl.searchParams.set("salla", "failed");
    return NextResponse.redirect(settingsUrl, { headers: response.headers });
  }
}
