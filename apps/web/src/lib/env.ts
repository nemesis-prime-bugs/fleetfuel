export type AppEnv = {
  DATABASE_URL: string;

  // Rate limiting (durable)
  RATE_LIMIT_SIGNUP_IP_PER_MIN: number;
  RATE_LIMIT_SIGNUP_EMAIL_PER_MIN: number;
  RATE_LIMIT_LOGIN_IP_PER_MIN: number;
  RATE_LIMIT_LOGIN_EMAIL_PER_MIN: number;
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

  const RATE_LIMIT_SIGNUP_IP_PER_MIN = Number(process.env.RATE_LIMIT_SIGNUP_IP_PER_MIN ?? 10);
  const RATE_LIMIT_SIGNUP_EMAIL_PER_MIN = Number(process.env.RATE_LIMIT_SIGNUP_EMAIL_PER_MIN ?? 5);
  const RATE_LIMIT_LOGIN_IP_PER_MIN = Number(process.env.RATE_LIMIT_LOGIN_IP_PER_MIN ?? 20);
  const RATE_LIMIT_LOGIN_EMAIL_PER_MIN = Number(process.env.RATE_LIMIT_LOGIN_EMAIL_PER_MIN ?? 10);

  for (const [k, v] of Object.entries({
    RATE_LIMIT_SIGNUP_IP_PER_MIN,
    RATE_LIMIT_SIGNUP_EMAIL_PER_MIN,
    RATE_LIMIT_LOGIN_IP_PER_MIN,
    RATE_LIMIT_LOGIN_EMAIL_PER_MIN,
  })) {
    if (!Number.isFinite(v) || v <= 0) throw new Error(`Invalid env ${k}`);
  }

  cached = {
    DATABASE_URL,
    RATE_LIMIT_SIGNUP_IP_PER_MIN,
    RATE_LIMIT_SIGNUP_EMAIL_PER_MIN,
    RATE_LIMIT_LOGIN_IP_PER_MIN,
    RATE_LIMIT_LOGIN_EMAIL_PER_MIN,
  };
  return cached;
}
