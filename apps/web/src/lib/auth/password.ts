import argon2 from "argon2";

const MIN_PASSWORD_LENGTH = 12;

export function validatePasswordOrThrow(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
}

export async function hashPassword(password: string): Promise<string> {
  validatePasswordOrThrow(password);

  // Argon2id is the recommended variant for password hashing.
  return argon2.hash(password, {
    type: argon2.argon2id,
    // Reasonable defaults; can be tuned later.
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  // Don't reveal details; just return true/false.
  try {
    // Argon2id is encoded into the hash; verify() will use it.
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}
