import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const productId = formData.get("productId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type (skip if browser didn't report a type)
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/avif", "image/heic", "image/heif"];
    if (file.type && !allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type (${file.type}). Only JPEG, PNG, WebP, GIF, and AVIF are allowed.` },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds 10MB limit` },
        { status: 400 }
      );
    }

    // Dynamically import upload utilities only at runtime
    const { saveUploadedFile } = await import("@/lib/upload-utils");
    const url = await saveUploadedFile(file, productId);
    return NextResponse.json({ url });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Upload error:", msg, error);
    return NextResponse.json(
      { error: `Failed to upload file: ${msg}` },
      { status: 500 }
    );
  }
}
