import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luxe Pret & Ready-to-Wear",
  description: "Discover Designagartistry's luxe pret collection — premium co-ord sets, matching separates & handcrafted modern ethnic couture for Pakistan's discerning woman.",
  keywords: [
    "luxury pret dresses Pakistan",
    "luxe pret collection",
    "premium co-ord sets Pakistan",
    "matching separates",
    "monochromatic solid suits",
    "premium women's ready-to-wear",
    "designer ethnic wear Pakistan",
    "modern ethnic couture",
    "elevated everyday fashion",
    "unstitched luxury ensembles",
    "luxury lawn dresses Pakistan",
    "Designagartistry shop",
  ],
  openGraph: {
    type: "website",
    url: "https://www.designagartistry.com/shop",
    siteName: "Designagartistry",
    title: "Luxe Pret & Ready-to-Wear | Designagartistry",
    description: "Discover Designagartistry's luxe pret collection — premium co-ord sets, matching separates & handcrafted modern ethnic couture for Pakistan's discerning woman.",
    images: [
      {
        url: "https://www.designagartistry.com/images/MainImage3.png",
        width: 1200,
        height: 630,
        alt: "Designagartistry Luxe Pret & Ready-to-Wear Collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxe Pret & Ready-to-Wear | Designagartistry",
    description: "Discover Designagartistry's luxe pret collection — premium co-ord sets, matching separates & handcrafted modern ethnic couture for Pakistan's discerning woman.",
    images: ["https://www.designagartistry.com/images/MainImage3.png"],
  },
  alternates: {
    canonical: "https://www.designagartistry.com/shop",
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
