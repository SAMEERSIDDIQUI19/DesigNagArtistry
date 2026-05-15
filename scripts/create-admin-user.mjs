/**
 * Creates or updates an admin user for /admin/login.
 * Usage:
 *   npm run db:create-admin
 *   npm run db:create-admin -- you@site.com YourSecurePassword "Your Name"
 *
 * Loads DATABASE_URL from .env in the project root (run from repo root).
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

function createPrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Missing DATABASE_URL in .env");
  }
  return new PrismaClient({ adapter: new PrismaPg(connectionString) });
}

const prisma = createPrisma();

const email = process.argv[2] || "admin@example.com";
const password = process.argv[3] || "Admin123!";
const name = process.argv[4] || "Admin";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("Missing DATABASE_URL. Add it to .env or export it in your shell.");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hash, role: "admin", name },
    create: {
      email,
      name,
      password: hash,
      role: "admin",
    },
  });

  console.log("Admin user ready.");
  console.log("  Email:", user.email);
  console.log("  Role:", user.role);
  console.log("  Id:", user.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
