import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const SETTINGS_KEY = "payment_settings";

const DEFAULT_SETTINGS = {
  methods: {
    cod: { enabled: true, label: "Cash on Delivery" },
    bank_transfer: { enabled: true, label: "Bank Transfer" },
    card: { enabled: false, label: "Card Payment" },
  },
  bankAccounts: [] as {
    id: string;
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
    branch: string;
    isActive: boolean;
  }[],
};

async function ensureTable() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      content JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

function verifyAdmin(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.role === "admin";
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await ensureTable();
    const rows = await prisma.$queryRaw<{ content: unknown }[]>`
      SELECT content FROM site_content WHERE key = ${SETTINGS_KEY} LIMIT 1
    `;
    if (rows.length > 0) return NextResponse.json(rows[0].content);
    return NextResponse.json(DEFAULT_SETTINGS);
  } catch (error) {
    console.error("Payment settings read error:", error);
    return NextResponse.json({ error: "Failed to read settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const content = await request.json();
    const contentJson = JSON.stringify(content);
    await ensureTable();
    await prisma.$executeRaw`
      INSERT INTO site_content (key, content, updated_at)
      VALUES (${SETTINGS_KEY}, CAST(${contentJson} AS JSONB), NOW())
      ON CONFLICT (key)
      DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment settings update error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
