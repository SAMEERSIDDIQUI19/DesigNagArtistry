import { usePathname } from 'next/navigation';

interface SeoCanonicalProps {
  /**
   * Optional custom canonical URL. If not provided, will use current page URL
   */
  customCanonical?: string;
}

/**
 * Dynamic Self-Referencing Canonical Tag Component
 * 
 * This component automatically generates the correct canonical URL for each page.
 * It handles:
 * - Self-referencing canonicals (canonical points to the page itself)
 * - URL parameter removal (removes tracking parameters, filters, etc.)
 * - Protocol and domain normalization
 * - Trailing slash normalization
 * 
 * Usage:
 * <SeoCanonical /> - Uses current page URL
 * <SeoCanonical customCanonical="https://www.designagartistry.com/custom-url" /> - Uses custom URL
 */
export default function SeoCanonical({ customCanonical }: SeoCanonicalProps) {
  const pathname = usePathname();
  
  // Base domain
  const baseUrl = 'https://www.designagartistry.com';
  
  // Generate canonical URL
  const canonicalUrl = customCanonical 
    ? customCanonical 
    : `${baseUrl}${pathname}`;
  
  // Remove trailing slash for consistency
  const cleanCanonicalUrl = canonicalUrl.endsWith('/') && canonicalUrl !== baseUrl
    ? canonicalUrl.slice(0, -1)
    : canonicalUrl;
  
  return (
    <link rel="canonical" href={cleanCanonicalUrl} />
  );
}
