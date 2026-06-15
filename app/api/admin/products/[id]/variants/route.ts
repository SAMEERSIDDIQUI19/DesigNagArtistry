import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const variants = await prisma.productVariant.findMany({
      where: { productId: id },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(variants);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const sizes: { size: string; stock: number }[] = body.sizes ?? [];
    const fabrics: { fabric: string }[] = body.fabrics ?? [];
    const colors: { color: string; hexCode: string }[] = body.colors ?? [];

    // Handle sizes
    await prisma.productVariant.deleteMany({
      where: { productId: id, variantName: "size" },
    });

    if (sizes.length > 0) {
      await prisma.productVariant.createMany({
        data: sizes.map((s) => ({
          productId: id,
          variantName: "size",
          variantValue: s.size,
          stock: s.stock,
          price: null,
        })),
      });
    }

    // Handle fabrics
    await prisma.productVariant.deleteMany({
      where: { productId: id, variantName: "fabric" },
    });

    if (fabrics.length > 0) {
      await prisma.productVariant.createMany({
        data: fabrics.map((f) => ({
          productId: id,
          variantName: "fabric",
          variantValue: f.fabric,
          stock: 0,
          price: null,
        })),
      });
    }

    // Handle colors
    await prisma.productVariant.deleteMany({
      where: { productId: id, variantName: "color" },
    });

    if (colors.length > 0) {
      await prisma.productVariant.createMany({
        data: colors.map((c) => ({
          productId: id,
          variantName: "color",
          variantValue: `${c.color}|${c.hexCode}`,
          stock: 0,
          price: null,
        })),
      });
    }

    const variants = await prisma.productVariant.findMany({
      where: { productId: id },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(variants);
  } catch (error) {
    console.error("Variants update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
