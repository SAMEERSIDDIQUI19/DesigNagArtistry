import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Our Craftsmanship & Brand Story",
  description: "Discover the story behind Designagartistry — Pakistan's premium luxury fashion brand blending original craftsmanship, tonal embroidery & contemporary couture silhouettes.",
  keywords: [
    "original craftsmanship Pakistan",
    "tonal embroidery suits",
    "artisanal heritage craft",
    "handcrafted couture brand story",
    "schiffli cutwork fashion",
    "modern ethnic couture brand",
    "luxury fashion brand Pakistan",
    "runway-inspired ethnic wear",
    "Designagartistry about",
  ],
  openGraph: {
    type: "website",
    url: "https://www.designagartistry.com/about",
    siteName: "Designagartistry",
    title: "Our Craftsmanship & Brand Story | Designagartistry",
    description: "Discover the story behind Designagartistry — Pakistan's premium luxury fashion brand blending original craftsmanship, tonal embroidery & contemporary couture silhouettes.",
    images: [
      {
        url: "https://www.designagartistry.com/images/MainImage3.png",
        width: 1200,
        height: 630,
        alt: "Designagartistry — Handcrafted Luxury Couture, Pakistan",
      },
    ],
  },
  alternates: {
    canonical: "https://www.designagartistry.com/about",
  },
};

export default function About() {
  return (
    <main aria-labelledby="about-title" className="padding-large">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-8 offset-md-2">
            <div className="display-header text-center">
              <h1 id="about-title" className="display-2 text-capitalize text-dark pb-2">
                Our Craftsmanship &amp; Brand Story
              </h1>
              <p className="pb-3">
                Born from a reverence for artisanal heritage and a fearless contemporary vision,{' '}
                <strong>Designagartistry</strong> stands as Pakistan&apos;s definitive voice in premium luxury fashion.
                Each collection is an intimate dialogue between <em>original craftsmanship</em> and runway-inspired
                global silhouettes &mdash; where tonal embroidery adorns structured Kalidaars, and schiffli cutwork
                breathes poetry into modern Angrakha kurtas.
              </p>
              <p className="pb-3">
                We believe that true luxury lives in the details: in the deliberate hand of an artisan, in the
                precision of a sculpted seam, in the quiet opulence of tissue silk falling in perfect weight.
                Every piece that bears our name is conceived with an <em>artistic soul</em> and executed with
                uncompromising excellence &mdash; a celebration of the woman who demands beauty in every thread.
              </p>
              <p className="pb-3">
                Designagartistry is not merely a couture brand. It is an elevated experience &mdash; where
                contemporary ethnic fashion meets timeless, original artistry. Discover collections that honour
                Pakistan&apos;s rich textile heritage while redefining it for the modern, global muse.
              </p>
              <Link href="/shop" className="btn btn-medium btn-arrow outline-dark position-relative mt-3">
                <span className="text-capitalize">Explore the Collection</span>
                <svg className="arrow-right position-absolute" width="18" height="20" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M18.719 6.781L17.28 8.22L24.063 15H4v2h20.063l-6.782 6.781l1.438 1.438l8.5-8.5l.687-.719l-.687-.719z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
