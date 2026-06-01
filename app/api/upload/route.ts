import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary - support both CLOUDINARY_URL and individual vars
if (process.env.CLOUDINARY_URL) {
  cloudinary.config(process.env.CLOUDINARY_URL);
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const productId = formData.get("productId") as string | null;

    console.log("Upload request received:", { 
      fileName: file?.name, 
      fileSize: file?.size, 
      fileType: file?.type, 
      productId 
    });

    if (!file) {
      console.error("No file provided in request");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type (skip if browser didn't report a type)
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/avif", "image/heic", "image/heif"];
    if (file.type && !allowedTypes.includes(file.type)) {
      console.error("Invalid file type:", file.type);
      return NextResponse.json(
        { error: `Invalid file type (${file.type}). Only JPEG, PNG, WebP, GIF, and AVIF are allowed.` },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.error("File size exceeds limit:", file.size);
      return NextResponse.json(
        { error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds 10MB limit` },
        { status: 400 }
      );
    }

    console.log("File validation passed, attempting to upload to Cloudinary...");

    // Convert File to Buffer for Cloudinary upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: productId ? `products/${productId}` : 'products',
          resource_type: 'auto',
          quality: 'auto:good',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    console.log("File uploaded successfully to Cloudinary:", uploadResult.secure_url);
    return NextResponse.json({ url: uploadResult.secure_url });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Upload error:", msg, error);
    return NextResponse.json(
      { error: `Failed to upload file: ${msg}` },
      { status: 500 }
    );
  }
}
