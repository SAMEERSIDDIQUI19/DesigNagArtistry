import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const body = await request.json();
    const { productId, imageUrl, altText, sortOrder } = body;

    console.log("Creating product image:", { productId, imageUrl });

    const productImage = await prisma.productImage.create({
      data: {
        productId,
        imageUrl,
        altText: altText || null,
        sortOrder: sortOrder || 0,
      },
    });

    console.log("Product image created successfully:", productImage.id);

    return NextResponse.json(productImage);
  } catch (error) {
    console.error("Product image creation error:", error);
    return NextResponse.json({ error: "Failed to create product image" }, { status: 500 });
  }
}
