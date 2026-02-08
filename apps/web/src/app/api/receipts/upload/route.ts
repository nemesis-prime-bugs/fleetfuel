import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireUserApi } from "@/lib/auth/requireUserApi";
import { ensureReceiptsDir, RECEIPTS_DIR } from "@/lib/receipts/storage";

export async function POST(req: Request) {
  const { user, error } = await requireUserApi();
  if (error) return error;

  const form = await req.formData();
  const fillUpId = String(form.get("fillUpId") ?? "");
  const file = form.get("file");

  if (!fillUpId) return NextResponse.json({ error: "fillUpId is required" }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ error: "file is required" }, { status: 400 });

  // Ownership check: fill-up must belong to user.
  const fillUp = await prisma.fillUp.findFirst({
    where: {
      id: fillUpId,
      vehicle: { userId: user!.id },
    },
    select: { id: true },
  });
  if (!fillUp) return NextResponse.json({ error: "Not found" }, { status: 404 });

  ensureReceiptsDir();

  const bytes = Buffer.from(await file.arrayBuffer());

  // Skeleton: store as random file; hardening (type/size/magic/EXIF) in next tasks.
  const ext = path.extname(file.name || "").slice(0, 8) || ".bin";
  const basename = `${crypto.randomUUID()}${ext}`;
  const relKey = `receipts/${basename}`;
  const fullPath = path.join(RECEIPTS_DIR, basename);

  fs.writeFileSync(fullPath, bytes);

  const receipt = await prisma.receipt.create({
    data: {
      fillUpId,
      storageKey: relKey,
      contentType: file.type || "application/octet-stream",
      sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
    },
  });

  return NextResponse.json({ receipt }, { status: 201 });
}
