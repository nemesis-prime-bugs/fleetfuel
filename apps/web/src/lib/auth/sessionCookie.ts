import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME, sessionCookieOptions } from "./cookies";

export async function setSessionCookie(rawToken: string, expiresAt: Date) {
  const jar = await cookies();
  // Note: in Next 16 types, cookies() is ReadonlyRequestCookies. At runtime
  // we still need to set cookies from server actions/route handlers.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (jar as any).set(SESSION_COOKIE_NAME, rawToken, sessionCookieOptions(expiresAt));
}

export async function clearSessionCookie() {
  const jar = await cookies();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (jar as any).set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions(),
    expires: new Date(0),
  });
}

export async function getSessionCookie(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE_NAME)?.value ?? null;
}
