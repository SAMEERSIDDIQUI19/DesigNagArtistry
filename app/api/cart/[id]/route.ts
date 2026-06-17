import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const sessionId = request.headers.get("x-session-id");

    let userId: string | undefined;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        userId = decoded.userId;
      } catch (error) {
        // Invalid token, continue as guest
      }
    }

    const body = await request.json();
    const { quantity } = body;

    console.log("Update cart item - userId:", userId, "sessionId:", sessionId, "itemId:", id, "quantity:", quantity);

    // Verify the cart item belongs to the user or session
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: {
        cart: true,
      },
    });

    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    // Check ownership based on userId or sessionId
    if (userId && cartItem.cart.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!userId && cartItem.cart.sessionId !== sessionId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Cart item update error:", error);
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
    const sessionId = request.headers.get("x-session-id");

    let userId: string | undefined;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        userId = decoded.userId;
      } catch (error) {
        // Invalid token, continue as guest
      }
    }

    console.log("Delete cart item - userId:", userId, "sessionId:", sessionId, "itemId:", id);

    await prisma.cartItem.deleteMany({ where: { id } });

    return NextResponse.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Cart item deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
