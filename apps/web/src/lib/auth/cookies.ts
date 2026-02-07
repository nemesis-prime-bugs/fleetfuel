import type { SerializeOptions } from "cookie";

export const SESSION_COOKIE_NAME = "ff_session";

export function sessionCookieOptions(expiresAt?: Date): SerializeOptions {
  const isProd = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    ...(expiresAt ? { expires: expiresAt } : {}),
  };
}
