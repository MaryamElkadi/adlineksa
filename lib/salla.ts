import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import SallaStore from "@/models/SallaStore";

const SALLA_AUTH_URL = "https://accounts.salla.sa/oauth2/auth";
const SALLA_API_URL = "https://api.salla.dev/admin/v2";
const SALLA_TOKEN_URL = "https://accounts.salla.sa/oauth2/token";

export type SallaTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
};

function required(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required Salla configuration: ${name}`);
  }

  return value;
}

export function getSallaAuthorizationUrl(state: string) {
  const params = new URLSearchParams({
    client_id: required("SALLA_CLIENT_ID"),
    response_type: "code",
    redirect_uri: required("SALLA_REDIRECT_URI"),
    scope: "orders.read_write products.read webhooks.read_write offline_access",
    state,
  });

  return `${SALLA_AUTH_URL}?${params.toString()}`;
}

export async function exchangeSallaAuthorizationCode(code: string) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: required("SALLA_CLIENT_ID"),
    client_secret: required("SALLA_CLIENT_SECRET"),
    redirect_uri: required("SALLA_REDIRECT_URI"),
    code,
  });

  const response = await fetch(SALLA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  const data = (await response.json().catch(() => ({}))) as SallaTokenResponse & {
    error?: string;
    message?: string;
  };

  if (!response.ok || !data.access_token) {
    throw new Error(data.message || data.error || "Salla did not return an access token.");
  }

  return data;
}

export async function getSallaStore(merchantId = "primary") {
  await connectToDatabase();
  const store = await SallaStore.findOne({ merchantId: String(merchantId) });

  if (!store) {
    throw new Error("Salla has not been connected yet.");
  }

  return store;
}

async function refreshSallaToken(merchantId = "primary") {
  const store = await getSallaStore(merchantId);

  if (!store.refreshToken) {
    throw new Error("The Salla connection has expired. Connect Salla again.");
  }

  const response = await fetch(SALLA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: store.refreshToken,
      client_id: required("SALLA_CLIENT_ID"),
      client_secret: required("SALLA_CLIENT_SECRET"),
    }),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => ({}))) as SallaTokenResponse & {
    error?: string;
    message?: string;
  };

  if (!response.ok || !data.access_token) {
    throw new Error(data.message || data.error || "Could not refresh the Salla connection.");
  }

  store.accessToken = data.access_token;
  store.refreshToken = data.refresh_token || store.refreshToken;
  store.expires = Math.floor(Date.now() / 1000) + (data.expires_in || 14 * 24 * 60 * 60);
  await store.save();

  return store.accessToken as string;
}

export async function getSallaAccessToken(merchantId = "primary") {
  const store = await getSallaStore(merchantId);
  const expiresAt = Number(store.expires || 0) * 1000;

  if (expiresAt && Date.now() >= expiresAt - 60_000) {
    return refreshSallaToken(merchantId);
  }

  return store.accessToken as string;
}

export async function sallaRequest<T>(
  merchantId: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = await getSallaAccessToken(merchantId);
  const response = await fetch(`${SALLA_API_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {}),
    },
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error?.message || data?.message || "Salla API request failed.");
  }

  return data as T;
}

export function isValidSallaWebhookSignature(body: string, signature: string | null) {
  const secret = process.env.SALLA_WEBHOOK_SECRET;

  if (!secret || !signature) return false;

  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  const received = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  return received.length === expectedBuffer.length && crypto.timingSafeEqual(received, expectedBuffer);
}
