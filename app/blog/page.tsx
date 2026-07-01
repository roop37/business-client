import type { Metadata } from "next";
import { BlogIndex } from "@/components/marketing/blog/BlogIndex";
import { blogs } from "@/components/marketing/blog/blog-data";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import {
  BreadcrumbJsonLd,
  JsonLdScript,
} from "@/components/marketing/seo/SchemaJsonLd";

export const metadata: Metadata = {
  title: "Blog for Indian event organizers, venues & promoters",
  description:
    "Insights and playbooks for Indian event organizers and venues: migration guides, AI event strategy, fan-CRM tactics, and door-ops field notes.",
  keywords: [
    "event organizer blog India",
    "venue marketing tips India",
    "ticketing platform comparison India",
    "fan CRM for live events",
    "AI event evaluation India",
    "comedy promoter playbook",
    "festival operations India",
    "nightclub marketing India",
    "live music venue blog India",
    "event promoter resources India",
  ],
  alternates: {
    canonical: "/blog",
    languages: { "en-IN": "/blog", "x-default": "/blog" },
  },
  openGraph: {
    title: "Hoizr Blog — insights for India's event organizers & venues",
    description:
      "Migration playbooks, AI event strategy, fan-CRM tactics, and operator field notes — written for Indian event organizers, venues, and promoters.",
    type: "website",
    url: "/blog",
    locale: "en_IN",
    siteName: "Hoizr",
    images: [
      {
        url: "/opengraph-image.webp",
        width: 1200,
        height: 630,
        alt: "Hoizr Blog for Indian event organizers and venues",
      },
    ],
  },
};

const SITE_URL = "https://business.hoizr.com";

export default function BlogPage() {
  // Blog + CollectionPage JSON-LD. Lists every post so AI engines
  // can crawl the full corpus in one pass. blogPost items use the
  // BlogPosting type with author/date/category, matching what the
  // detail pages emit so the graph stays consistent.
  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/blog`,
    name: "Hoizr Blog",
    description:
      "Insights and playbooks for Indian event organizers, venues, comedy promoters, nightlife organizers, and party crews.",
    url: `${SITE_URL}/blog`,
    inLanguage: "en-IN",
    publisher: {
      "@type": "Organization",
      name: "Hoizr Technologies Pvt. Ltd.",
      url: SITE_URL,
    },
    audience: {
      "@type": "BusinessAudience",
      audienceType:
        "Indian event organizers, venues, promoters, festival organizers, comedy promoters, nightclub operators",
      geographicArea: { "@type": "Country", name: "India" },
    },
    blogPost: blogs.map((b) => ({
      "@type": "BlogPosting",
      headline: b.title,
      description: b.excerpt,
      url: `${SITE_URL}/blog/${b.id}`,
      datePublished: b.date,
      dateModified: b.date,
      articleSection: b.category,
      image: b.image,
      author: { "@type": "Person", name: b.author.name },
      inLanguage: "en-IN",
    })),
  };

  return (
    <MarketingShell>
      <JsonLdScript
        id="hoizr-blog-collection-jsonld"
        data={blogJsonLd}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Hoizr", href: "/" },
          { name: "Blog", href: "/blog" },
        ]}
      />
      <BlogIndex />
    </MarketingShell>
  );
}
