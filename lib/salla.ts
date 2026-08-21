import SallaStore from "@/models/SallaStore";
import { connectToDatabase } from "@/lib/mongodb";

const SALLA_API_URL = "https://api.salla.dev/admin/v2";

const SALLA_TOKEN_URL =
  "https://accounts.salla.sa/oauth2/token";

interface SallaTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires?: number;
  token_type?: string;
  scope?: string;
}

/**
 * Get the stored Salla store
 */
export async function getSallaStore(
  merchantId: string
) {
  await connectToDatabase();

  const store = await SallaStore.findOne({
    merchantId: String(merchantId),
  });

  if (!store) {
    throw new Error(
      `Salla store ${merchantId} is not authorized`
    );
  }

  return store;
}

/**
 * Refresh the Salla access token
 */
export async function refreshSallaToken(
  merchantId: string
) {
  const store = await getSallaStore(merchantId);

  if (!store.refreshToken) {
    throw new Error(
      "Salla refresh token is missing"
    );
  }

  const response = await fetch(
    SALLA_TOKEN_URL,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: store.refreshToken,
        client_id:
          process.env.SALLA_CLIENT_ID!,
        client_secret:
          process.env.SALLA_CLIENT_SECRET!,
      }),
    }
  );

  const data =
    (await response.json()) as SallaTokenResponse;

  if (!response.ok) {
    console.error(
      "Salla token refresh failed:",
      data
    );

    throw new Error(
      "Could not refresh Salla access token"
    );
  }

  store.accessToken = data.access_token;

  if (data.refresh_token) {
    store.refreshToken = data.refresh_token;
  }

  if (data.expires) {
    store.expires = data.expires;
  }

  if (data.scope) {
    store.scope = data.scope;
  }

  if (data.token_type) {
    store.tokenType = data.token_type;
  }

  await store.save();

  return store.accessToken;
}

/**
 * Get a valid access token
 */
export async function getSallaAccessToken(
  merchantId: string
) {
  const store = await getSallaStore(
    merchantId
  );

  /*
   * Salla's expires value is a Unix timestamp.
   */
  if (
    store.expires &&
    Date.now() >=
      Number(store.expires) * 1000
  ) {
    return refreshSallaToken(merchantId);
  }

  return store.accessToken;
}

/**
 * Make an authenticated Salla API request
 */
export async function sallaRequest<T>(
  merchantId: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken =
    await getSallaAccessToken(merchantId);

  const response = await fetch(
    `${SALLA_API_URL}${endpoint}`,
    {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(options.headers || {}),
      },
    }
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    console.error(
      "Salla API request failed:",
      response.status,
      data
    );

    throw new Error(
      data?.error?.message ||
        data?.message ||
        "Salla API request failed"
    );
  }

  return data as T;
}