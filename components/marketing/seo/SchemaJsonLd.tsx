/**
 * Hoizr JSON-LD helpers. Uses next/script so the inline JSON payload
 * doesn't require the consumer to wire dangerouslySetInnerHTML.
 * Search engines pick up these script tags during server render.
 */
import Script from "next/script";
import { ProductContent } from "../data/product-content";

const SITE_URL = "https://business.hoizr.com";
const ORG_NAME = "Hoizr Business";
const LEGAL_NAME = "Hoizr Technologies Pvt. Ltd.";
const LOGO_URL = `${SITE_URL}/opengraph-image.webp`;

const HOIZR_FAMILY = [
  { "@type": "Organization", name: "Hoizr", url: "https://hoizr.com" },
  { "@type": "Organization", name: "Hoizr Business", url: "https://business.hoizr.com" },
  { "@type": "Organization", name: "Hoizr Artist", url: "https://artist.hoizr.com" },
  { "@type": "Organization", name: "Hoizr Promoters", url: "https://promoters.hoizr.com" },
];

const ldScript = (id: string, data: object) => (
  <Script
    id={id}
    type="application/ld+json"
    strategy="afterInteractive"
  >
    {JSON.stringify(data)}
  </Script>
);

export const OrganizationJsonLd = () =>
  ldScript("hoizr-organization-jsonld", {
    "@context": "https://schema.org",
    "@type": ["Organization", "SoftwareApplication"],
    name: ORG_NAME,
    legalName: LEGAL_NAME,
    url: SITE_URL,
    logo: LOGO_URL,
    description:
      "Hoizr Business is the ticketing, marketing, and ops platform built for Indian event organizers, venues, and promoters. Lowest commission in India, owned fan CRM, and event-specific AI pricing for clubs, festivals, comedy promoters, and live music venues.",
    parentOrganization: {
      "@type": "Organization",
      name: LEGAL_NAME,
      url: "https://hoizr.com",
    },
    subOrganization: HOIZR_FAMILY,
    sameAs: ["https://hoizr.com", "https://artist.hoizr.com"],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "hello@hoizr.in",
        areaServed: "IN",
        availableLanguage: ["en", "hi"],
      },
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: "sales@hoizr.in",
        areaServed: "IN",
        availableLanguage: ["en", "hi"],
      },
    ],
    areaServed: { "@type": "Country", name: "India" },
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
    },
    // SoftwareApplication fields — picks up rich result eligibility
    // as an "events ticketing software" listing.
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Event Ticketing & Marketing Software",
    operatingSystem: "Web, iOS, Android",
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: "0",
      description:
        "Hoizr quotes an event-specific commission per show. No setup fee, no long-term contract.",
    },
    // Audience targeting — Schema.org Audience type signals to AI
    // search engines + Google who this product is for.
    audience: {
      "@type": "BusinessAudience",
      audienceType:
        "Event organizers, venues, promoters, festival hosts, comedy promoters, nightclub operators in India",
      geographicArea: { "@type": "Country", name: "India" },
    },
    knowsAbout: [
      "Event ticketing",
      "Live music ticketing India",
      "Festival ticketing India",
      "Nightclub event management",
      "Comedy show ticketing India",
      "Fan CRM",
      "Event marketing automation",
      "WhatsApp marketing for events",
      "AI commission pricing for events",
      "Door scanning",
      "Guestlist management",
      "Promoter management",
    ],
    serviceArea: {
      "@type": "GeoShape",
      addressCountry: "IN",
    },
  });

export const WebSiteJsonLd = () =>
  ldScript("hoizr-website-jsonld", {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: ORG_NAME,
    url: SITE_URL,
    inLanguage: "en-IN",
    publisher: {
      "@type": "Organization",
      name: LEGAL_NAME,
      url: SITE_URL,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  });

export const BreadcrumbJsonLd = ({
  items,
}: {
  items: { name: string; href: string }[];
}) =>
  ldScript("hoizr-breadcrumb-jsonld", {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  });

export const ProductJsonLd = ({ content }: { content: ProductContent }) =>
  ldScript(`hoizr-product-${content.slug}-jsonld`, {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${content.label} — Hoizr`,
    description: content.hero.body,
    provider: {
      "@type": "Organization",
      name: ORG_NAME,
      url: SITE_URL,
    },
    areaServed: { "@type": "Country", name: "India" },
    serviceType: content.pillarLabel,
    url: `${SITE_URL}/product/${content.slug}`,
    audience: {
      "@type": "BusinessAudience",
      audienceType:
        "Indian event organizers, venues, promoters, festival hosts, comedy promoters, nightclub operators",
      geographicArea: { "@type": "Country", name: "India" },
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${content.label} — Capabilities`,
      itemListElement: content.hero.bullets.map((b) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: b },
      })),
    },
  });

export const FaqJsonLd = ({
  items,
}: {
  items: { q: string; a: string }[];
}) =>
  ldScript("hoizr-faq-jsonld", {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  });
