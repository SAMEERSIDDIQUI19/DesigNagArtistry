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

    const result = await prisma.$executeRaw`UPDATE cart_items SET quantity = ${quantity} WHERE id = ${id}`;

    if (result === 0) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    return NextResponse.json({ id, quantity });
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

    await prisma.$executeRaw`DELETE FROM cart_items WHERE id = ${id}`;

    return NextResponse.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Cart item deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
