import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
export const RECEIPTS_DIR = path.join(DATA_DIR, "receipts");

export function ensureReceiptsDir() {
  if (!fs.existsSync(RECEIPTS_DIR)) {
    fs.mkdirSync(RECEIPTS_DIR, { recursive: true });
  }
}
