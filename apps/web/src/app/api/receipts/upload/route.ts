import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireUserApi } from "@/lib/auth/requireUserApi";
import { ensureReceiptsDir, RECEIPTS_DIR } from "@/lib/receipts/storage";
import { isJpeg, isPng } from "@/lib/receipts/magic";

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

  const MAX_BYTES = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = new Set(["image/jpeg", "image/png"]);

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Only JPEG/PNG allowed" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length > MAX_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  if (file.type === "image/jpeg" && !isJpeg(bytes)) {
    return NextResponse.json({ error: "Invalid JPEG file" }, { status: 400 });
  }
  if (file.type === "image/png" && !isPng(bytes)) {
    return NextResponse.json({ error: "Invalid PNG file" }, { status: 400 });
  }

  // Hardening continues in next tasks (EXIF strip).
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
