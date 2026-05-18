import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const orderNumber = request.nextUrl.searchParams.get("orderNumber")?.trim().toUpperCase();

  if (!orderNumber) {
    return NextResponse.json({ error: "Order number is required" }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            variant: { select: { size: true, color: true } },
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
      },
    });

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
          ? { size: item.variant.size, color: item.variant.color }
          : null,
      })),
    });
  } catch (error) {
    console.error("Order track error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
