export type AppEnv = {
  DATABASE_URL: string;
};

let cached: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cached) return cached;

  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error(
      "Missing DATABASE_URL. Create apps/web/.env with DATABASE_URL=\"file:./dev.db\" (local-first)."
    );
  }

  cached = { DATABASE_URL };
  return cached;
}
