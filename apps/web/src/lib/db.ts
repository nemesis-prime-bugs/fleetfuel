import { getEnv } from "./env";

type AnyPrismaClient = {
  // minimal surface we use across the app (keeps type simple across dual clients)
  [k: string]: any;
};

declare global {
  // eslint-disable-next-line no-var
  var __fleetfuel_prisma__: AnyPrismaClient | undefined;
}

function createPrisma(): AnyPrismaClient {
  const env = getEnv();

  // IMPORTANT: we generate two Prisma clients to avoid overwriting each other.
  // - SQLite client: src/generated/prisma-sqlite
  // - Postgres client: src/generated/prisma-postgres
  const PrismaClient =
    env.DB_MODE === "postgres"
      ? // eslint-disable-next-line @typescript-eslint/no-require-imports
        require("../generated/prisma-postgres").PrismaClient
      : // eslint-disable-next-line @typescript-eslint/no-require-imports
        require("../generated/prisma-sqlite").PrismaClient;

  return new PrismaClient();
}

export const prisma: AnyPrismaClient = globalThis.__fleetfuel_prisma__ ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalThis.__fleetfuel_prisma__ = prisma;
}
