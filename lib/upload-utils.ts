import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function saveUploadedFile(
  file: File,
  productId: string | null,
  buffer?: Buffer
): Promise<string> {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const nameParts = file.name.split(".");
  const extension = nameParts.length > 1 ? nameParts.pop() : "png";
  const filename = `${timestamp}-${randomString}.${extension}`;
  const mimeType = file.type || "image/png";

  try {
    const fileBuffer = buffer || Buffer.from(await file.arrayBuffer());

    // Use /tmp for serverless environments (Vercel, etc.) which have read-only filesystem
    // Use public/uploads for local development
    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || !existsSync(join(process.cwd(), "public"));
    const uploadBase = isServerless 
      ? "/tmp/uploads" 
      : join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads");
    
    const uploadDir = productId ? join(uploadBase, productId) : uploadBase;

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filepath = join(/*turbopackIgnore: true*/ uploadDir, filename);
    await writeFile(filepath, fileBuffer);

    // Return appropriate URL based on environment
    if (isServerless) {
      // In serverless, we need to serve from /tmp or use a different approach
      // For now, return a path that would work if we had a static file handler
      return `/uploads/${productId ? productId + "/" : ""}${filename}`;
    }
    
    return productId ? `/uploads/${productId}/${filename}` : `/uploads/${filename}`;
  } catch (error) {
    console.error("Filesystem upload failed:", error);
    throw new Error(`Failed to save uploaded file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

