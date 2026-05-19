import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log("=== LOGIN DEBUG ===");
    console.log("Email received:", email);
    console.log("Password length:", password?.length);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    console.log("User found:", !!user);
    if (user) {
      console.log("User role:", user.role);
      console.log("User email in DB:", user.email);
      console.log("Password hash length:", user.password?.length);
    }

    if (!user) {
      console.log("Login failed: User not found");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (user.role !== "admin") {
      console.log("Login failed: Not admin, role is:", user.role);
      return NextResponse.json(
        { error: "Access denied. Admin only." },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isValidPassword);

    if (!isValidPassword) {
      console.log("Login failed: Invalid password");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return user data without password
    const { password: _password, ...userWithoutPassword }: { password: string } & Record<string, unknown> = user;

    return NextResponse.json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    const isDbConfig =
      error instanceof Error && error.message.includes("DATABASE_URL");
    return NextResponse.json(
      {
        error: isDbConfig
          ? "Database is not configured. Add DATABASE_URL to your .env file and restart the dev server."
          : "Internal server error",
      },
      { status: isDbConfig ? 503 : 500 }
    );
  }
}
