import { MetadataRoute } from 'next';

// Define your site URL
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

// Function to fetch dynamic product pages from your database
async function getProductPages(): Promise<Array<{
  url: string;
  lastModified: Date;
  changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'always';
  priority: number;
}>> {
  try {
    // Fetch products from your API
    const response = await fetch(`${SITE_URL}/api/products`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    
    if (!response.ok) {
      console.error('Failed to fetch products for sitemap');
      return [];
    }
    
    const products = await response.json();
    
    return products.map((product: any) => ({
      url: `${SITE_URL}/product/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
    return [];
  }
}

// Function to fetch dynamic category/shop pages
async function getCategoryPages(): Promise<Array<{
  url: string;
  lastModified: Date;
  changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'always';
  priority: number;
}>> {
  try {
    // Fetch categories from your API
    const response = await fetch(`${SITE_URL}/api/categories`, {
      next: { revalidate: 3600 },
    });
    
    if (!response.ok) {
      console.error('Failed to fetch categories for sitemap');
      return [];
    }
    
    const categories = await response.json();
    
    return categories.map((category: any) => ({
      url: `${SITE_URL}/shop?category=${category.slug}`,
      lastModified: category.updatedAt ? new Date(category.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch dynamic pages
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
