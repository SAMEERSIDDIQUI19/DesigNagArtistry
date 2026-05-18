import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

export async function GET() {
  try {
    const rows = await prisma.$queryRaw<{ content: unknown }[]>`
      SELECT content FROM site_content WHERE key = ${SETTINGS_KEY} LIMIT 1
    `;
    if (rows.length > 0) return NextResponse.json(rows[0].content);
    return NextResponse.json(DEFAULT_SETTINGS);
  } catch {
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}
