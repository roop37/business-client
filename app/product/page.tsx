import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ALL_PRODUCTS, MARKETING_PILLARS } from "@/components/marketing/data/nav-products";
import {
  BreadcrumbJsonLd,
  JsonLdScript,
} from "@/components/marketing/seo/SchemaJsonLd";

const SITE_URL = "https://business.hoizr.com";

export const metadata: Metadata = {
  // Brand-led title; opt out of the "%s · Hoizr" template so the
  // brand is not repeated.
  title: {
    absolute: "Hoizr products for event organizers, venues & promoters",
  },
  description:
    "Hoizr products for Indian event organizers: ticketing, fan CRM, marketing campaigns, door scanning, guestlist, analytics, and AI event evaluation.",
  keywords: [
    "Hoizr products",
    "event ticketing platform India",
    "event marketing platform India",
    "fan CRM for events",
    "door scanning India",
    "guestlist management India",
    "AI event evaluation",
    "event analytics India",
  ],
  alternates: {
    canonical: "/product",
    languages: { "en-IN": "/product", "x-default": "/product" },
  },
  openGraph: {
    title: "Hoizr products for event organizers, venues & promoters",
    description:
      "Ticketing, fan CRM, marketing, discovery, door ops, and analytics for India's live-event operators.",
    url: "/product",
    type: "website",
    siteName: "Hoizr",
    locale: "en_IN",
    images: [
      {
        url: "/opengraph-image.webp",
        width: 1200,
        height: 630,
        alt: "Hoizr products for Indian event organizers and venues",
      },
    ],
  },
};

const productHubJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${SITE_URL}/product`,
  url: `${SITE_URL}/product`,
  name: "Hoizr products for event organizers, venues & promoters",
  description:
    "Every Hoizr product, grouped by Discovery, Sales, Repeat, and Ops — for Indian event organizers, venues, and promoters.",
  inLanguage: "en-IN",
  isPartOf: { "@type": "WebSite", name: "Hoizr", url: SITE_URL },
  mainEntity: {
    "@type": "ItemList",
    name: "All Hoizr products",
    numberOfItems: ALL_PRODUCTS.length,
    itemListElement: ALL_PRODUCTS.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/product/${p.slug}`,
      name: p.label,
      description: p.blurb,
    })),
  },
};

export default function ProductIndexPage() {
  return (
    <MarketingShell>
      <JsonLdScript id="hoizr-products-hub-jsonld" data={productHubJsonLd} />
      <BreadcrumbJsonLd
        items={[
          { name: "Hoizr", href: "/" },
          { name: "Products", href: "/product" },
        ]}
      />
      <section className="hm-section">
        <div className="hm-container">
          <div className="max-w-[820px]">
            <div className="hm-eyebrow">Hoizr products</div>
            <h1 className="hm-h1 mt-4">
              The operating stack for Indian live nights.
            </h1>
            <p className="hm-lead mt-5">
              Ticketing, discovery, owned fan CRM, campaign tooling, door
              operations, and reporting in one system built for event
              organizers, venues, and promoters.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {MARKETING_PILLARS.map((pillar) => (
              <section
                key={pillar.id}
                className="rounded-[var(--m-r-lg)] border border-[var(--m-border)] bg-[var(--m-surface)] p-5 md:p-6"
              >
                <div className="hm-eyebrow">{pillar.label}</div>
                <h2 className="mt-3 text-[24px] font-semibold tracking-[-0.02em] text-[var(--m-ink-1)]">
                  {pillar.tagline}
                </h2>
                <div className="mt-5 grid gap-2">
                  {pillar.products.map((product) => (
                    <Link
                      key={product.slug}
                      href={`/product/${product.slug}`}
                      className="group rounded-[var(--m-r-sm)] border border-transparent px-3 py-3 transition hover:border-[var(--m-border)] hover:bg-[var(--m-canvas-2)]"
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span>
                          <span className="block text-[15px] font-semibold text-[var(--m-ink-1)]">
                            {product.label}
                          </span>
                          <span className="mt-1 block text-[13px] leading-snug text-[var(--m-ink-3)]">
                            {product.blurb}
                          </span>
                        </span>
                        <span
                          aria-hidden
                          className="text-[var(--m-ink-4)] transition group-hover:translate-x-0.5 group-hover:text-[var(--m-ink-1)]"
                        >
                          <ArrowRight size={17} />
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
