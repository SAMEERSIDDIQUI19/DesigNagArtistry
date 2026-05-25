import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductDetailClient from "./ProductDetailClient";

const BASE_URL = "https://www.designagartistry.com";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { slug, status: "active" },
      select: {
        name: true,
        metaTitle: true,
        metaDescription: true,
        shortDescription: true,
        description: true,
        images: {
          select: { imageUrl: true },
          take: 1,
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!product) {
      return {
        title: "Product Not Found",
        robots: { index: false, follow: false },
      };
    }

    const title = product.metaTitle || product.name;
    const description =
      product.metaDescription ||
      product.shortDescription ||
      product.description?.replace(/<[^>]+>/g, "").slice(0, 160) ||
      `Shop ${product.name} at Designagartistry — premium luxury fashion Pakistan.`;
    const ogImage =
      product.images[0]?.imageUrl || `${BASE_URL}/images/MainImage3.png`;

    return {
      title,
      description,
      alternates: {
        canonical: `${BASE_URL}/product/${slug}`,
      },
      openGraph: {
        title: `${title} | Designagartistry`,
        description,
        url: `${BASE_URL}/product/${slug}`,
        type: "website",
        images: [{ url: ogImage, width: 800, height: 800, alt: title }],
      },
    };
  } catch {
    return { title: "Product | Designagartistry" };
  }
}

export default function ProductPage() {
  return <ProductDetailClient />;
}
