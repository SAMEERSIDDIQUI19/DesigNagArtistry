import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Helper function to get or create user/cart
async function getOrCreateCart(userId?: string, sessionId?: string) {
  if (userId) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
    if (cart) return cart;

    return await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
  }

  // For guest users, use sessionId (from localStorage)
  if (sessionId) {
    const cart = await prisma.cart.findFirst({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
    if (cart) return cart;

    return await prisma.cart.create({
      data: { sessionId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
  }

  return { items: [] };
}

export async function GET(request: NextRequest) {
  try {
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

    const cart = await getOrCreateCart(userId, sessionId || undefined);
    return NextResponse.json(cart.items);
  } catch (error) {
    console.error("Cart fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const { productId, quantity, variantId, fabricId, colorId } = body;

    console.log("Add to cart - userId:", userId, "sessionId:", sessionId, "productId:", productId);

    // Get or create cart
    let cart;
    if (userId) {
      cart = await prisma.cart.findUnique({
        where: { userId },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId },
        });
      }
    } else if (sessionId) {
      cart = await prisma.cart.findFirst({
        where: { sessionId },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { sessionId },
        });
      }
    } else {
      return NextResponse.json(
        { error: "Session required" },
        { status: 400 }
      );
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
        fabricId: fabricId || null,
        colorId: colorId || null,
      },
    });

    if (existingItem) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // Fetch product to get price
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { price: true, salePrice: true, isOnSale: true },
      });

      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      const itemPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;

      // Add new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          variantId: variantId || null,
          fabricId: fabricId || null,
          colorId: colorId || null,
          price: itemPrice,
        },
      });
    }

    // Fetch updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCart?.items || []);
  } catch (error) {
    console.error("Cart add error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
