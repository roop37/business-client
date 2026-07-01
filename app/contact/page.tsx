import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import {
  ContactClient,
  ContactSidePanel,
} from "@/components/marketing/contact/ContactClient";
import {
  BreadcrumbJsonLd,
  JsonLdScript,
} from "@/components/marketing/seo/SchemaJsonLd";

const SITE_URL = "https://business.hoizr.com";

export const metadata: Metadata = {
  // Brand-led title; opt out of the "%s · Hoizr" template so the
  // brand is not repeated.
  title: {
    absolute: "Contact Hoizr — for Indian event organizers, venues & promoters",
  },
  description:
    "Talk to Hoizr about your next event. Publish directly, keep your fan CRM, and run the night from one stack. Same-day reply for organizers across India.",
  keywords: [
    "Contact Hoizr",
    "Hoizr support India",
    "ticketing platform contact India",
    "event organizer sales contact",
    "Hoizr partnerships",
    "Hoizr press",
  ],
  alternates: {
    canonical: "/contact",
    languages: { "en-IN": "/contact", "x-default": "/contact" },
  },
  openGraph: {
    title: "Contact Hoizr — Indian event ticketing & marketing platform",
    description:
      "Bring your next event onto Hoizr, publish directly, and get help with setup. Email contact@hoizr.com or fill the form.",
    url: "/contact",
    type: "website",
    siteName: "Hoizr",
    locale: "en_IN",
    images: [
      {
        url: "/opengraph-image.webp",
        width: 1200,
        height: 630,
        alt: "Contact Hoizr — Indian event ticketing and marketing platform",
      },
    ],
  },
};

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": `${SITE_URL}/contact`,
  url: `${SITE_URL}/contact`,
  inLanguage: "en-IN",
  name: "Contact Hoizr",
  description:
    "Reach Hoizr to bring your next event onto the platform. Same-day reply for Indian event organizers, venues, and promoters.",
  isPartOf: { "@type": "WebSite", name: "Hoizr", url: SITE_URL },
  mainEntity: {
    "@type": "Organization",
    name: "Hoizr Business",
    legalName: "Hoizr Technologies Pvt. Ltd.",
    url: SITE_URL,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: "contact@hoizr.com",
        telephone: "+91-83695-72945",
        areaServed: "IN",
        availableLanguage: ["en", "hi"],
      },
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
  },
};

export default function ContactPage() {
  return (
    <MarketingShell>
      <JsonLdScript id="hoizr-contact-jsonld" data={contactJsonLd} />
      <BreadcrumbJsonLd
        items={[
          { name: "Hoizr", href: "/" },
          { name: "Contact", href: "/contact" },
        ]}
      />
      <section className="hm-section pt-12 md:pt-16">
        <div className="max-w-[680px]">
          <div className="hm-eyebrow">Contact Hoizr</div>
          <h1
            className="mt-3 font-bold leading-[1.04] tracking-[-0.03em] text-[var(--m-ink-1)]"
            style={{
              fontFamily: "var(--m-font-display)",
              fontSize: "clamp(40px, 6vw, 72px)",
            }}
          >
            Tell us about
            <br />
            <span className="text-[var(--m-forest-600)]">your next night.</span>
          </h1>
          <p className="mt-6 text-[17px] leading-relaxed text-[var(--m-ink-3)] max-w-[560px]">
            A real human will follow up within one working day with the fastest
            path to bringing your event onto Hoizr and publishing directly.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-[1.6fr,1fr] md:gap-8">
          <ContactClient />
          <ContactSidePanel />
        </div>
      </section>
    </MarketingShell>
  );
}
