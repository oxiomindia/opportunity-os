function serializeJsonLd(schema: unknown) {
  return JSON.stringify(schema).replace(/</g, '\\u003c');
}

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Oxiom',
    url: 'https://oxiom.in',
    // Google recommends a logo of at least 112x112px; apple-icon (180x180,
    // square) is the largest brand image this repo generates, so it's reused
    // here rather than referencing a dedicated logo file that doesn't exist.
    logo: 'https://oxiom.in/apple-icon',
    description: 'Finance automation platform for Accounts Payable, Accounts Receivable, and Finance Suite, built for businesses in India.',
    sameAs: [
      'https://www.linkedin.com/company/oxiom',
      'https://x.com/oxiom',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Sales',
      email: 'oxiomindia@gmail.com',
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
    />
  );
}

export function SoftwareApplicationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Oxiom',
    description: 'Finance automation platform for Accounts Payable, Accounts Receivable, and Finance Suite -- invoice creation, sending, validation, payment tracking, and audit-ready billing.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: 'https://oxiom.in',
    image: 'https://oxiom.in/opengraph-image',
    // No `offers` here: pricing varies by product and plan (see the Product
    // schema on /pricing, built from real numeric prices) -- a single flat
    // price on a multi-product platform would be invalid/misleading data.
    author: {
      '@type': 'Organization',
      name: 'Oxiom',
    },
    featureList: [
      'Customer and invoice search with intelligent filtering',
      'Product and service catalog for invoice line items',
      'Multi-currency invoice support (INR, USD, EUR)',
      'Invoice status tracking through complete lifecycle',
      'Payment tracking and collections visibility',
      'Audit trail and compliance documentation',
      'Real-time dashboard and visibility',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
    />
  );
}

export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Oxiom',
    url: 'https://oxiom.in',
    description: 'Finance automation platform for Accounts Payable, Accounts Receivable, and Finance Suite.',
    // No SearchAction: this site has no /search route, so a sitelinks
    // searchbox action would point at a page that doesn't exist.
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
    />
  );
}

export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
    />
  );
}

export function FAQSchema({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
    />
  );
}

export function ProductSchema({
  name,
  description,
  offers,
}: {
  name: string;
  description: string;
  offers: Array<{ name: string; priceInr: number; url: string }>;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    brand: { '@type': 'Brand', name: 'Oxiom' },
    offers: offers.map((offer) => ({
      '@type': 'Offer',
      name: offer.name,
      price: offer.priceInr,
      priceCurrency: 'INR',
      url: offer.url,
      availability: 'https://schema.org/InStock',
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
    />
  );
}
