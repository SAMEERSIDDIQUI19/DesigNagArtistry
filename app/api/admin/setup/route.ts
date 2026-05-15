import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const adminCount = await prisma.user.count({
      where: { role: "admin" },
    });
    return NextResponse.json({
      needsSetup: adminCount === 0,
      adminCount,
    });
  } catch (error) {
    console.error("Setup status error:", error);
    return NextResponse.json(
      { error: "Could not check setup status" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminCount = await prisma.user.count({
      where: { role: "admin" },
    });

    if (adminCount > 0) {
      return NextResponse.json(
        {
          error:
            "An admin account already exists. Sign in or ask an admin to add users from the dashboard.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists. Try signing in." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: "admin",
      },
    });

    const { password: _password, ...userWithoutPassword } = user;
    return NextResponse.json(
      { message: "Admin account created. You can sign in now.", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Setup error:", error);
    const message =
      error instanceof Error && error.message.includes("DATABASE_URL")
        ? "Database is not configured. Add DATABASE_URL to your .env file."
        : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
