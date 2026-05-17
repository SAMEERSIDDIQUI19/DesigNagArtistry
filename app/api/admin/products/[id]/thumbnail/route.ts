import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function PATCH(
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

    const { thumbnail } = await request.json();

    const product = await prisma.product.update({
      where: { id },
      data: { thumbnail: thumbnail || null },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Thumbnail update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
