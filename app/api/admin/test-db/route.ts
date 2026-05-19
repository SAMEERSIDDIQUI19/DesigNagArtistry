import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Test database connection and check if admin user exists
    const adminUser = await prisma.user.findFirst({
      where: { role: "admin" },
      select: { id: true, email: true, role: true, password: true },
    });

    return NextResponse.json({
      database: "connected",
      adminUser: adminUser ? {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        passwordHashLength: adminUser.password?.length,
      } : null,
    });
  } catch (error: unknown) {
    return NextResponse.json({
      database: "error",
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
