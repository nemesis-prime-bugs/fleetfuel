import { PrismaClient } from "@prisma/client";

import { getEnv } from "./env";

declare global {
  // eslint-disable-next-line no-var
  var __fleetfuel_prisma__: PrismaClient | undefined;
}

function createPrisma() {
  // Validate env early; Prisma 6 reads DATABASE_URL from the schema datasource.
  getEnv();
  return new PrismaClient();
}

export const prisma: PrismaClient = globalThis.__fleetfuel_prisma__ ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalThis.__fleetfuel_prisma__ = prisma;
}
