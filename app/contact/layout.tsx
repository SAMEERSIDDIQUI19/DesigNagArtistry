import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Designagartistry. Reach us via WhatsApp, email, or our contact form for questions about orders, products, sizing, and custom inquiries.",
  alternates: {
    canonical: "https://www.designagartistry.com/contact",
  },
  openGraph: {
    type: "website",
    url: "https://www.designagartistry.com/contact",
    siteName: "Designagartistry",
    title: "Contact Us | Designagartistry",
    description:
      "Reach Designagartistry via WhatsApp, email, or our contact form. We typically reply within 24 hours.",
    images: [
      {
        url: "https://www.designagartistry.com/images/MainImage3.png",
        width: 1200,
        height: 630,
        alt: "Designagartistry — Contact Us",
      },
    ],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
