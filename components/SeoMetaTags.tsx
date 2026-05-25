import { Metadata } from 'next';

interface SeoMetaConfig {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  noindex?: boolean;
  canonical?: string;
}

/**
 * SEO Meta Tags Generator
 * 
 * This function generates optimized metadata for Next.js pages.
 * Follows Google's best practices to prevent title/description rewriting.
 * 
 * Title Guidelines:
 * - Maximum 60 characters (ideal: 50-60)
 * - Include primary keyword near the beginning
 * - Include brand name at the end with separator
 * - Avoid keyword stuffing
 * - Make it compelling and click-worthy
 * 
 * Description Guidelines:
 * - Maximum 160 characters (ideal: 150-160)
 * - Include primary keyword naturally
 * - Include call-to-action
 * - Match page content accurately
 * - Avoid duplication across pages
 */
export function generateSeoMetadata(config: SeoMetaConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    ogImage = 'https://www.designagartistry.com/images/MainImage3.png',
    noindex = false,
    canonical,
  } = config;

  // Validate title length
  if (title.length > 60) {
    console.warn(`Title exceeds 60 characters: "${title}" (${title.length} chars)`);
  }

  // Validate description length
  if (description.length > 160) {
    console.warn(`Description exceeds 160 characters: "${description}" (${description.length} chars)`);
  }

  const metadata: Metadata = {
    title,
    description,
    keywords,
    openGraph: {
      type: 'website',
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };

  // Add canonical if provided
  if (canonical) {
    metadata.alternates = {
      canonical,
    };
  }

  return metadata;
}

/**
 * Product Page SEO Metadata Generator
 * 
 * Specialized metadata generator for product pages with e-commerce best practices.
 */
export function generateProductMetadata(product: {
  name: string;
  slug: string;
  description: string;
  price: string;
  category?: string;
  images?: string[];
}): Metadata {
  const title = `${product.name} | Designagartistry`;
  const description = product.description.length > 160
    ? product.description.substring(0, 157) + '...'
    : product.description;

  const ogImage = product.images?.[0] || 'https://www.designagartistry.com/images/MainImage3.png';

  return generateSeoMetadata({
    title,
    description,
    keywords: [
      product.name,
      product.category || 'luxury fashion',
      'designer wear',
      'premium couture',
      'Pakistan fashion',
    ],
    ogImage,
    canonical: `https://www.designagartistry.com/product/${product.slug}`,
  });
}

/**
 * Category Page SEO Metadata Generator
 */
export function generateCategoryMetadata(category: {
  name: string;
  slug: string;
  description?: string;
}): Metadata {
  const title = `${category.name} Collection | Designagartistry`;
  const description = category.description || 
    `Explore our ${category.name} collection. Premium luxury fashion with handcrafted artistry and contemporary designs.`;

  return generateSeoMetadata({
    title,
    description,
    keywords: [
      category.name,
      'luxury collection',
      'designer fashion',
      'Pakistan couture',
    ],
    canonical: `https://www.designagartistry.com/shop?category=${category.slug}`,
  });
}
