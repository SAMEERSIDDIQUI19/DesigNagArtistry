import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.designagartistry.com/#organization",
      "name": "Designagartistry",
      "url": "https://www.designagartistry.com/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.designagartistry.com/images/MainImage3.png"
      },
      "description": "Premium luxury fashion brand redefining modern ethnic couture with handcrafted artistry, contemporary silhouettes, and timeless elegance.",
      "sameAs": ["https://www.instagram.com/designagartistry.official"],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+923241272547",
        "contactType": "customer service"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://www.designagartistry.com/#website",
      "url": "https://www.designagartistry.com/",
      "name": "Designagartistry",
      "publisher": { "@id": "https://www.designagartistry.com/#organization" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.designagartistry.com/shop?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ]
};

export const metadata: Metadata = {
  title: {
    default: "Designagartistry | Premium Luxury Fashion Pakistan",
    template: "%s | Designagartistry",
  },
  description: "Pakistan's premier luxury pret & couture house. Explore Designagartistry's handcrafted modern ethnic couture — runway-inspired silhouettes & timeless artistry.",
  // Ignored by Google but add for completeness.
  keywords: [
    "premium luxury fashion brand Pakistan",
    "luxury pret wear Pakistan",
    "modern ethnic couture",
    "handcrafted couture",
    "contemporary fashion Pakistan",
    "runway-inspired outfits",
    "luxury ethnic couture",
    "designer ethnic wear",
    "premium women's fashion Pakistan",
    "luxe pret collection",
    "festive formals Pakistan",
    "luxury lawn dresses",
    "premium co-ord sets",
    "matching separates",
    "modern Angrakha kurta",
    "structured Kalidaar",
    "contemporary Pishwas",
    "tonal embroidery suits",
    "schiffli cutwork",
    "tissue silk evening wear",
    "elevated couture fashion",
    "designer luxury outfits",
    "original craftsmanship",
    "artisanal heritage craft",
    "Designagartistry",
  ],
  openGraph: {
    type: "website",
    url: "https://www.designagartistry.com/",
    siteName: "Designagartistry",
    title: "Designagartistry | Premium Luxury Fashion Pakistan",
    description: "Pakistan's premier luxury pret & couture house. Explore Designagartistry's handcrafted modern ethnic couture — runway-inspired silhouettes & timeless artistry.",
    images: [
      {
        url: "https://www.designagartistry.com/images/MainImage3.png",
        width: 1200,
        height: 630,
        alt: "Designagartistry — Premium Luxury Fashion & Modern Ethnic Couture",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Designagartistry | Premium Luxury Fashion Pakistan",
    description: "Pakistan's premier luxury pret & couture house. Explore Designagartistry's handcrafted modern ethnic couture — runway-inspired silhouettes & timeless artistry.",
    images: ["https://www.designagartistry.com/images/MainImage3.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.designagartistry.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Upright:wght@300;400;500;600;700&family=Sofia+Sans:ital,wght@0,1..1000;1,1..1000&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.css" media="print" />
        <link rel="stylesheet" href="/style.css" media="print" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              setTimeout(() => {
                document.querySelectorAll('link[media="print"]').forEach(link => {
                  link.media = 'all';
                });
              }, 0);
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-body">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
