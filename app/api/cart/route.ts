import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Helper function to get or create user/cart
async function getOrCreateCart(userId?: string, sessionId?: string) {
  const productSelect = {
    id: true,
    name: true,
    slug: true,
    price: true,
    salePrice: true,
    isOnSale: true,
    thumbnail: true,
    stock: true,
  };

  const itemsInclude = {
    items: {
      include: {
        product: { select: productSelect },
        variant: true,
      },
    },
  };

  if (userId) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: itemsInclude,
    });
    if (cart) return cart;

    return await prisma.cart.create({
      data: { userId },
      include: itemsInclude,
    });
  }

  // For guest users, use sessionId (from localStorage)
  if (sessionId) {
    const cart = await prisma.cart.findFirst({
      where: { sessionId },
      include: itemsInclude,
    });
    if (cart) return cart;

    return await prisma.cart.create({
      data: { sessionId },
      include: itemsInclude,
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
    return NextResponse.json(cart.items, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
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
      const newQty = existingItem.quantity + quantity;
      await prisma.$executeRaw`UPDATE cart_items SET quantity = ${newQty} WHERE id = ${existingItem.id}`;
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
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                salePrice: true,
                isOnSale: true,
                thumbnail: true,
                stock: true,
              },
            },
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
