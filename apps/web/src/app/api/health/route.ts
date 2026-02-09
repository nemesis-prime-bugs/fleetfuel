import { NextResponse } from "next/server";

import { getEnv } from "@/lib/env";

export async function GET() {
  try {
    const env = getEnv();
    return NextResponse.json(
      {
        ok: true,
        dbMode: env.DB_MODE,
        receiptsMode: env.RECEIPTS_MODE,
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: (e as Error).message,
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      },
      { status: 500 }
    );
  }
}
