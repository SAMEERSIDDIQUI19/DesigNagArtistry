import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ORDER_INCLUDE = {
  items: {
    include: {
      variant: { select: { variantName: true, variantValue: true } },
    },
  },
  shippingAddress: {
    select: {
      fullName: true,
      city: true,
      area: true,
      country: true,
      addressLine: true,
    },
  },
} as const;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("orderNumber")?.trim();

  if (!query) {
    return NextResponse.json({ error: "Order number is required" }, { status: 400 });
  }

  try {
    // Try by orderNumber first, then fall back to id (UUID)
    let order = await prisma.order.findUnique({
      where: { orderNumber: query.toUpperCase() },
      include: ORDER_INCLUDE,
    });

    if (!order) {
      order = await prisma.order.findUnique({
        where: { id: query },
        include: ORDER_INCLUDE,
      });
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found. Please check your order number and try again." }, { status: 404 });
    }

    return NextResponse.json({
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      discount: order.discount,
      total: order.total,
      notes: order.notes,
      shippingAddress: order.shippingAddress
        ? {
            fullName: order.shippingAddress.fullName,
            area: order.shippingAddress.area,
            city: order.shippingAddress.city,
            country: order.shippingAddress.country,
            addressLine: order.shippingAddress.addressLine,
          }
        : null,
      items: order.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        price: Number(item.price),
        total: Number(item.total),
        variant: item.variant
          ? { variantName: item.variant.variantName, variantValue: item.variant.variantValue }
          : null,
      })),
    });
  } catch (error) {
    console.error("Order track error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
