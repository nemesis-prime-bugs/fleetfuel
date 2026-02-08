import { NextResponse } from "next/server";

import { getCurrentUser } from "./currentUser";

export async function requireUserApi() {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, error: NextResponse.json({ error: "Unauthenticated" }, { status: 401 }) };
  }

  return { user, error: null };
}
