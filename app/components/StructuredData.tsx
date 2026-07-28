'use client';

function serializeJsonLd(schema: unknown) {
  return JSON.stringify(schema).replace(/</g, '\\u003c');
}

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Oxiom',
    url: 'https://oxiom.in',
    logo: 'https://oxiom.in/logo.png',
    description: 'Enterprise business platform for customer invoicing and accounts receivable automation',
    sameAs: [
      'https://www.linkedin.com/company/oxiom',
      'https://x.com/oxiom',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-014-9028',
      contactType: 'Sales',
      email: 'oximindia@gmail.com',
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
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
    name: 'Oxiom Invoice Software',
    description: 'AI-powered customer invoicing and accounts receivable automation solution built on the Oxiom One platform. Automate invoice creation, sending, validation, payment tracking, and audit-ready billing.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: 'https://oxiom.in',
    image: 'https://oxiom.in/app-screenshot.png',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: 'Contact for pricing',
      availability: 'https://schema.org/OnlineOnly',
    },
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
    description: 'Enterprise customer invoicing and accounts receivable automation platform',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://oxiom.in/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
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
