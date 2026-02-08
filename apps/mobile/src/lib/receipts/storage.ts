import { Directory, Filesystem } from "@capacitor/filesystem";

export const RECEIPTS_DIR = "fleetfuel/receipts";

function toBase64(bytes: Uint8Array): string {
  // Browser-safe base64
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin);
}

function sanitizeFilename(name: string) {
  return name.replaceAll(/[^a-zA-Z0-9._-]+/g, "_");
}

export async function writeReceiptFile(input: { receiptId: string; filename: string; bytes: Uint8Array }) {
  const safeName = sanitizeFilename(input.filename || "receipt");
  const path = `${RECEIPTS_DIR}/${input.receiptId}-${safeName}`;

  await Filesystem.writeFile({
    path,
    data: toBase64(input.bytes),
    directory: Directory.Data,
    recursive: true,
  });

  return { storageKey: path };
}

export async function deleteReceiptFile(storageKey: string) {
  await Filesystem.deleteFile({
    path: storageKey,
    directory: Directory.Data,
  });
}

export async function readReceiptFileAsBase64(storageKey: string) {
  const res = await Filesystem.readFile({
    path: storageKey,
    directory: Directory.Data,
  });
  return res.data;
}
