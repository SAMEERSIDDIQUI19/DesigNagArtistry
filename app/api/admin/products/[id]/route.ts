import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        variants: true,
        inventory: true,
        productFabrics: {
          include: {
            fabric: true,
          },
        },
        productColors: {
          include: {
            color: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Build update data only from fields explicitly present in the body.
    // This means thumbnail-only updates won't accidentally clear other fields,
    // while full updates still normalize empty strings to null.
    const data: Record<string, unknown> = {};
    if (body.name !== undefined)            data.name = body.name;
    if (body.slug !== undefined)            data.slug = body.slug;
    if (body.shortDescription !== undefined) data.shortDescription = body.shortDescription || null;
    if (body.description !== undefined)     data.description = body.description || null;
    if (body.sku !== undefined)             data.sku = body.sku || null;
    if (body.brand !== undefined)           data.brand = body.brand || null;
    if (body.price !== undefined)           data.price = body.price;
    if (body.salePrice !== undefined)       data.salePrice = body.salePrice || null;
    if (body.costPrice !== undefined)       data.costPrice = body.costPrice || null;
    if (body.isOnSale !== undefined)        data.isOnSale = body.isOnSale;
    if (body.stock !== undefined)           data.stock = body.stock;
    if (body.thumbnail !== undefined)       data.thumbnail = body.thumbnail || null;
    if (body.weight !== undefined)          data.weight = body.weight || null;
    if (body.status !== undefined)          data.status = body.status;
    if (body.featured !== undefined)        data.featured = body.featured;
    if (body.metaTitle !== undefined)       data.metaTitle = body.metaTitle || null;
    if (body.metaDescription !== undefined) data.metaDescription = body.metaDescription || null;
    if (body.categoryId !== undefined)      data.categoryId = body.categoryId || null;

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Product deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
