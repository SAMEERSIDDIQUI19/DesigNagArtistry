/**
 * Parse a thumbnail string into an array of individual URLs.
 *
 * Handles three formats:
 *  1. New format  — "|||" separated  (safe for base64 data URLs)
 *  2. Base64 URL  — "data:..." single value (never split these by comma)
 *  3. Legacy      — comma separated regular file paths
 */
export function parseThumbnails(thumbnail: string | null | undefined): string[] {
  if (!thumbnail) return [];
  if (thumbnail.includes("|||")) return thumbnail.split("|||").filter(Boolean);
  if (thumbnail.startsWith("data:")) return [thumbnail];
  return thumbnail.split(",").map((t) => t.trim()).filter(Boolean);
}

/**
 * Join thumbnail URLs for database storage.
 * Uses "|||" separator so base64 data URLs are never broken by comma-splits.
 */
export function joinThumbnails(urls: string[]): string {
  return urls.join("|||");
}

/**
 * Return the first (primary) thumbnail URL with a leading "/" if needed.
 */
export function getPrimaryThumbnail(
  thumbnail: string | null | undefined
): string | null {
  const urls = parseThumbnails(thumbnail);
  if (urls.length === 0) return null;
  const url = urls[0];
  if (url.startsWith("data:") || url.startsWith("/") || url.startsWith("http")) {
    return url;
  }
  return `/${url}`;
}
