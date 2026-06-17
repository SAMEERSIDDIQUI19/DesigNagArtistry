import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productSlug, rating, comment, guestName, guestEmail, images } = body;

    if (!productSlug || !rating || Number(rating) < 1 || Number(rating) > 5) {
      return NextResponse.json(
        { error: "productSlug and a rating between 1–5 are required." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const review = await prisma.review.create({
      data: {
        productId: product.id,
        rating: Number(rating),
        comment: comment?.trim() || null,
        guestName: guestName?.trim() || "Anonymous",
        guestEmail: guestEmail?.trim() || null,
        images:
          Array.isArray(images) && images.length > 0
            ? JSON.stringify(images)
            : null,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Review create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
