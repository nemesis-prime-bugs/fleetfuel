import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/currentUser";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  return NextResponse.json({ user }, { status: 200 });
}
