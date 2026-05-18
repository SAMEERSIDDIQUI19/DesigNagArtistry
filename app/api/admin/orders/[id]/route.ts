import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

function verifyAdmin(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.role === "admin" ? decoded : null;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        shippingAddress: true,
        items: {
          include: {
            product: { select: { thumbnail: true, slug: true } },
            variant: { select: { variantName: true, variantValue: true } },
          },
        },
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Fetch payment proof if exists
    let paymentProof: { imageUrl: string; uploadedAt: string } | null = null;
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS payment_proofs (
          id TEXT PRIMARY KEY,
          order_id TEXT UNIQUE NOT NULL,
          image_url TEXT NOT NULL,
          uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      const rows = await prisma.$queryRaw<{ image_url: string; uploaded_at: string }[]>`
        SELECT image_url, uploaded_at FROM payment_proofs WHERE order_id = ${id} LIMIT 1
      `;
      if (rows.length > 0) {
        paymentProof = { imageUrl: rows[0].image_url, uploadedAt: String(rows[0].uploaded_at) };
      }
    } catch {
      // Table may not exist yet — ignore
    }

    return NextResponse.json({ ...order, paymentProof });
  } catch (error) {
    console.error("Order detail fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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

    const order = await prisma.order.update({
      where: { id },
      data: {
        orderStatus: body.orderStatus,
        paymentStatus: body.paymentStatus,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
