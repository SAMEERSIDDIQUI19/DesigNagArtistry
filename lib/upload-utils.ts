import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function saveUploadedFile(
  file: File,
  productId: string | null,
  buffer?: Buffer
): Promise<string> {
  const fileBuffer = buffer || Buffer.from(await file.arrayBuffer());

  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = file.name.split(".").pop();
  const filename = `${timestamp}-${randomString}.${extension}`;

  try {
    const uploadBase = join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads");
    const uploadDir = productId ? join(uploadBase, productId) : uploadBase;

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filepath = join(/*turbopackIgnore: true*/ uploadDir, filename);
    await writeFile(filepath, fileBuffer);

    return productId ? `/uploads/${productId}/${filename}` : `/uploads/${filename}`;
  } catch (error) {
    console.error("Filesystem upload failed, using inline image data:", error);
    return `data:${file.type};base64,${fileBuffer.toString("base64")}`;
  }
}

