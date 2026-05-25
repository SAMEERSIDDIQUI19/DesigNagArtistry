/**
 * JSON-LD Structured Data Generator
 * 
 * This component generates schema.org structured data for enhanced search visibility.
 * Place this in the <head> section of your pages.
 */

interface StructuredDataProps {
  type: 'Organization' | 'WebSite' | 'Product' | 'BreadcrumbList' | 'Article' | 'FAQPage';
  data: any;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  let schema: any;

  switch (type) {
    case 'Organization':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': 'https://www.designagartistry.com/#organization',
        name: data.name || 'Designagartistry',
        url: 'https://www.designagartistry.com/',
        logo: {
          '@type': 'ImageObject',
          url: data.logo || 'https://www.designagartistry.com/images/MainImage3.png',
        },
        description: data.description || 'Premium luxury fashion brand redefining modern ethnic couture with handcrafted artistry.',
        sameAs: data.socialLinks || ['https://www.instagram.com/designagartistry.official'],
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: data.phone || '+923241272547',
          contactType: 'customer service',
        },
      };
      break;

    case 'WebSite':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': 'https://www.designagartistry.com/#website',
        url: 'https://www.designagartistry.com/',
        name: data.name || 'Designagartistry',
        publisher: { '@id': 'https://www.designagartistry.com/#organization' },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://www.designagartistry.com/shop?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      };
      break;

    case 'Product':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: data.name,
        description: data.description,
        image: data.images,
        url: `https://www.designagartistry.com/product/${data.slug}`,
        sku: data.sku,
        brand: {
          '@type': 'Brand',
          name: 'Designagartistry',
        },
        offers: {
          '@type': 'Offer',
          price: data.price,
          priceCurrency: 'PKR',
          availability: data.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          url: `https://www.designagartistry.com/product/${data.slug}`,
        },
        category: data.category,
      };
      break;

    case 'BreadcrumbList':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: data.items.map((item: any, index: number) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      };
      break;

    case 'Article':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: data.headline,
        description: data.description,
        image: data.image,
        author: {
          '@type': 'Organization',
          name: 'Designagartistry',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Designagartistry',
          logo: {
            '@type': 'ImageObject',
            url: 'https://www.designagartistry.com/images/MainImage3.png',
          },
        },
        datePublished: data.datePublished,
        dateModified: data.dateModified || data.datePublished,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': data.url,
        },
      };
      break;

    case 'FAQPage':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: data.faqs.map((faq: any) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      };
      break;

    default:
      return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Usage Examples:
 * 
 * 1. Organization Schema (already in layout.tsx):
 * <StructuredData type="Organization" data={{ name: 'Designagartistry', phone: '+923241272547' }} />
 * 
 * 2. Product Schema:
 * <StructuredData type="Product" data={{
 *   name: 'Luxury Angrakha Kurta',
 *   description: 'Handcrafted luxury kurta with intricate embroidery',
 *   images: ['https://www.designagartistry.com/images/product1.jpg'],
 *   slug: 'luxury-angrakha-kurta',
 *   sku: 'SKU-001',
 *   price: '15000',
 *   inStock: true,
 *   category: 'Luxury Pret'
 * }} />
 * 
 * 3. Breadcrumb Schema:
 * <StructuredData type="BreadcrumbList" data={{
 *   items: [
 *     { name: 'Home', url: 'https://www.designagartistry.com/' },
 *     { name: 'Shop', url: 'https://www.designagartistry.com/shop' },
 *     { name: 'Luxury Pret', url: 'https://www.designagartistry.com/shop?category=luxury-pret' }
 *   ]
 * }} />
 * 
 * 4. FAQ Schema:
 * <StructuredData type="FAQPage" data={{
 *   faqs: [
 *     { question: 'What is your return policy?', answer: 'We accept returns within 14 days of purchase.' },
 *     { question: 'Do you ship internationally?', answer: 'Yes, we ship to over 50 countries worldwide.' }
 *   ]
 * }} />
 */
