import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
];

async function ensureTable() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS payment_proofs (
      id TEXT PRIMARY KEY,
      order_id TEXT UNIQUE NOT NULL,
      image_url TEXT NOT NULL,
      uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }
  try {
    await ensureTable();
    const rows = await prisma.$queryRaw<{ image_url: string; uploaded_at: string }[]>`
      SELECT image_url, uploaded_at FROM payment_proofs WHERE order_id = ${orderId} LIMIT 1
    `;
    if (rows.length === 0) return NextResponse.json(null);
    return NextResponse.json({ imageUrl: rows[0].image_url, uploadedAt: rows[0].uploaded_at });
  } catch (error) {
    console.error("Payment proof fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch proof" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const orderId = formData.get("orderId") as string | null;
    const file = formData.get("image") as File | null;

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (file.type && !ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only image files are accepted (JPEG, PNG, WebP, GIF, AVIF)" },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large (max 10MB)` },
        { status: 400 }
      );
    }

    const { saveUploadedFile } = await import("@/lib/upload-utils");
    const imageUrl = await saveUploadedFile(file, "payment-proofs");

    await ensureTable();
    const id = `proof-${Date.now()}`;
    await prisma.$executeRaw`
      INSERT INTO payment_proofs (id, order_id, image_url, uploaded_at)
      VALUES (${id}, ${orderId}, ${imageUrl}, NOW())
      ON CONFLICT (order_id)
      DO UPDATE SET image_url = EXCLUDED.image_url, uploaded_at = NOW()
    `;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Payment proof upload error:", msg);
    return NextResponse.json({ error: `Upload failed: ${msg}` }, { status: 500 });
  }
}
