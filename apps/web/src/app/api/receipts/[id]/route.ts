import fs from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireUserApi } from "@/lib/auth/requireUserApi";
import { RECEIPTS_DIR } from "@/lib/receipts/storage";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUserApi();
  if (error) return error;

  const { id } = await ctx.params;

  const receipt = await prisma.receipt.findFirst({
    where: {
      id,
      fillUp: {
        vehicle: {
          userId: user!.id,
        },
      },
    },
  });

  if (!receipt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // storageKey is like receipts/<uuid>.jpg
  const basename = path.basename(receipt.storageKey);
  const fullPath = path.join(RECEIPTS_DIR, basename);

  if (!fs.existsSync(fullPath)) {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }

  const url = new URL(req.url);
  const inline = url.searchParams.get("inline") === "1";

  const bytes = fs.readFileSync(fullPath);
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": receipt.contentType,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename=\"${basename}\"`,
      "Cache-Control": "private, max-age=0, no-store",
    },
  });
}
