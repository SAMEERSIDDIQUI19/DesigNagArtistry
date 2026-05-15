import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_xfSzH4GF1eRt@ep-lively-bonus-ap3m0d4n.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require";

  const adapter = new PrismaPg(connectionString);
  const client = new PrismaClient({ adapter });
  globalForPrisma.prisma = client;
  return client;
}

/** Lazy client — safe to import; connects on first query. */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    const value = client[prop as keyof PrismaClient];
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});
