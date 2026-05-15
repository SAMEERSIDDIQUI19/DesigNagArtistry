import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function saveUploadedFile(
  file: File,
  productId: string | null
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadBase = join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads");
  const uploadDir = productId ? join(uploadBase, productId) : uploadBase;

  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = file.name.split(".").pop();
  const filename = `${timestamp}-${randomString}.${extension}`;
  const filepath = join(/*turbopackIgnore: true*/ uploadDir, filename);

  await writeFile(filepath, buffer);

  return productId ? `/uploads/${productId}/${filename}` : `/uploads/${filename}`;
}

