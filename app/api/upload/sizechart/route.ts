import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { existsSync } from "fs";
import { writeFile, mkdir, unlink } from "fs/promises";
import { prisma } from "@/lib/prisma";

const getSizeChartPath = (productId: string) =>
  join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads", "sizechart", `${productId}_image.png`);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { sizeChart: true },
    });

    const url = product?.sizeChart || null;
    return NextResponse.json({ exists: !!url, url });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Check failed: ${msg}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const productId = formData.get("productId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (file.type && !allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: `Invalid file type: ${file.type}` }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const uploadDir = join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads", "sizechart");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filepath = getSizeChartPath(productId);
    await writeFile(filepath, fileBuffer);

    const url = `/uploads/sizechart/${productId}_image.png`;

    await prisma.product.update({
      where: { id: productId },
      data: { sizeChart: url },
    });

    return NextResponse.json({ url });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Upload failed: ${msg}` }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const filepath = getSizeChartPath(productId);
    if (existsSync(filepath)) {
      await unlink(filepath);
    }

    await prisma.product.update({
      where: { id: productId },
      data: { sizeChart: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Delete failed: ${msg}` }, { status: 500 });
  }
}
