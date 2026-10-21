export const AUTH_COOKIE_NAME = "adline_token";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  };
}

export function getClearedAuthCookieOptions() {
  return {
    ...getAuthCookieOptions(),
    maxAge: 0,
  };
}
