import crypto from "node:crypto";

export type SessionToken = {
  raw: string;
  hash: string;
};

/**
 * Generate a high-entropy session token for cookie storage.
 * Store ONLY the hash in the database.
 */
export function createSessionToken(): SessionToken {
  // 32 bytes -> 256 bits of entropy.
  const raw = crypto.randomBytes(32).toString("base64url");
  const hash = hashSessionToken(raw);
  return { raw, hash };
}

export function hashSessionToken(raw: string): string {
  // Fast, one-way hash for lookup.
  // If the DB leaks, attackers still need the raw cookie token.
  return crypto.createHash("sha256").update(raw, "utf8").digest("hex");
}
