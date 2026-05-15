import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.headers.get("x-session-id");
    const body = await request.json();

    const {
      fullName,
      phone,
      country,
      city,
      area,
      postalCode,
      addressLine,
      notes,
      subtotal,
      shippingFee,
      total,
      cartItems,
    } = body;

    console.log("Creating order for guest:", { sessionId, fullName, total });

    // Create address for guest (we'll use a temporary user or create without userId)
    // For guest checkout, we need to handle address differently since Address requires userId
    // We'll create the order without a user and handle addresses differently

    // Generate order number
    const orderNumber = "ORD-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        subtotal,
        shippingFee,
        discount: 0,
        total,
        paymentStatus: "pending",
        orderStatus: "pending",
        notes,
        // For guest orders, we don't set userId or addressId
        // We'll store address info in notes or create a separate guest address system
      },
    });

    // Create order items
    for (const item of cartItems) {
      const price = typeof item.product.price === 'string' ? parseFloat(item.product.price) : item.product.price;
      const salePrice = item.product.salePrice ? (typeof item.product.salePrice === 'string' ? parseFloat(item.product.salePrice) : item.product.salePrice) : null;
      const finalPrice = item.product.isOnSale && salePrice ? salePrice : price;

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: finalPrice,
          total: finalPrice * item.quantity,
        },
      });
    }

    // Clear cart for guest
    if (sessionId) {
      const cart = await prisma.cart.findFirst({
        where: { sessionId },
      });

      if (cart) {
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id },
        });
      }
    }

    console.log("Order created successfully:", order.id);

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
