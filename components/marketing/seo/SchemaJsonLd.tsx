/**
 * Hoizr JSON-LD helpers. Render raw script tags in the server HTML so
 * crawlers and AI agents do not need hydration to see structured data.
 */
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

export const JsonLdScript = ({ id, data }: { id: string; data: object }) => (
  <script
    id={id}
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(data).replace(/</g, "\\u003c"),
    }}
  />
);

export const OrganizationJsonLd = () =>
  <JsonLdScript id="hoizr-organization-jsonld" data={{
    "@context": "https://schema.org",
    "@type": ["Organization", "SoftwareApplication"],
    name: ORG_NAME,
    legalName: LEGAL_NAME,
    url: SITE_URL,
    logo: LOGO_URL,
    description:
      "Hoizr Business is the ticketing, marketing, and operations platform for India's live-event industry.",
    parentOrganization: {
      "@type": "Organization",
      name: LEGAL_NAME,
      url: "https://hoizr.com",
    },
    subOrganization: HOIZR_FAMILY,
    sameAs: [
      "https://hoizr.com",
      "https://artist.hoizr.com",
      "https://www.instagram.com/hoizr.technologies",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "contact@hoizr.com",
        telephone: "+91-83695-72945",
        areaServed: "IN",
        availableLanguage: ["en", "hi"],
      },
      {
        "@type": "ContactPoint",
        contactType: "technical support",
        email: "tech@hoizr.com",
        areaServed: "IN",
        availableLanguage: ["en"],
      },
    ],
    areaServed: { "@type": "Country", name: "India" },
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
    },
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Event Ticketing & Marketing Software",
    operatingSystem: "Web, iOS, Android",
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: "0",
    },
    audience: {
      "@type": "BusinessAudience",
      audienceType:
        "Event organizers, venues, promoters, festival organizers, comedy promoters, nightclub operators in India",
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
      "Live event operations India",
      "Door scanning",
      "Guestlist management",
      "Promoter management",
    ],
    serviceArea: {
      "@type": "GeoShape",
      addressCountry: "IN",
    },
  }} />;

export const WebSiteJsonLd = () =>
  <JsonLdScript id="hoizr-website-jsonld" data={{
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
  }} />;

export const BreadcrumbJsonLd = ({
  items,
}: {
  items: { name: string; href: string }[];
}) =>
  <JsonLdScript id="hoizr-breadcrumb-jsonld" data={{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  }} />;

export const ProductJsonLd = ({ content }: { content: ProductContent }) =>
  <JsonLdScript id={`hoizr-product-${content.slug}-jsonld`} data={{
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
        "Indian event organizers, venues, promoters, festival organizers, comedy promoters, nightclub operators",
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
  }} />;

export const FaqJsonLd = ({
  items,
}: {
  items: { q: string; a: string }[];
}) =>
  <JsonLdScript id="hoizr-faq-jsonld" data={{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  }} />;
