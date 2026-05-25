import { MetadataRoute } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SITE_URL = 'https://www.designagartistry.com';

// Static pages that should always be in the sitemap
const staticPages = [
  {
    url: SITE_URL,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  },
  {
    url: `${SITE_URL}/about`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  },
  {
    url: `${SITE_URL}/shop`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  },
  {
    url: `${SITE_URL}/contact`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  },
  {
    url: `${SITE_URL}/return-policy`,
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.5,
  },
  {
    url: `${SITE_URL}/shipping-information`,
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.5,
  },
  {
    url: `${SITE_URL}/terms-conditions`,
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  },
];

// Function to fetch dynamic product pages from database
async function getProductPages(): Promise<Array<{
  url: string;
  lastModified: Date;
  changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'always';
  priority: number;
}>> {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'active',
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });
    
    return products.map((product) => ({
      url: `${SITE_URL}/product/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
    return [];
  }
}

// Function to fetch dynamic category pages from database
async function getCategoryPages(): Promise<Array<{
  url: string;
  lastModified: Date;
  changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'always';
  priority: number;
}>> {
  try {
    const categories = await prisma.category.findMany({
      where: {
        parentId: null, // Only top-level categories
      },
      select: {
        slug: true,
        createdAt: true,
      },
    });
    
    return categories.map((category) => ({
      url: `${SITE_URL}/shop?category=${category.slug}`,
      lastModified: category.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch dynamic pages from database
  const [productPages, categoryPages] = await Promise.all([
    getProductPages(),
    getCategoryPages(),
  ]);
  
  // Combine all pages
  const allPages = [
    ...staticPages,
    ...productPages,
    ...categoryPages,
  ];
  
  return allPages;
}
