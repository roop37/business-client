import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPost } from "@/components/marketing/blog/BlogPost";
import {
  blogs,
  getBlogById,
  getRelatedBlogs,
} from "@/components/marketing/blog/blog-data";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import {
  BreadcrumbJsonLd,
  JsonLdScript,
} from "@/components/marketing/seo/SchemaJsonLd";

type PageParams = { params: { slug: string } };

export function generateStaticParams() {
  return blogs.map((b) => ({ slug: b.id }));
}

// Cheap HTML → plain text + word count + ISO 8601 duration from
// readTime ("6 min read" → "PT6M"). Used for BlogPosting JSON-LD
// articleBody + wordCount + timeRequired.
const stripHtml = (html: string): string =>
  html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const wordCountOf = (html: string): number =>
  stripHtml(html)
    .split(/\s+/)
    .filter(Boolean).length;
const isoDurationFromReadTime = (readTime: string): string => {
  const match = readTime.match(/(\d+)\s*min/i);
  return match ? `PT${match[1]}M` : "PT5M";
};
// Category → topical keyword cluster. Boosts AI search engines'
// confidence when classifying the post.
const KEYWORDS_BY_CATEGORY: Record<string, string[]> = {
  "Artist Strategy": [
    "artist booking platform India",
    "DJ booking dashboard India",
    "indie artist career India",
  ],
  "Agency Innovation": [
    "talent agency India",
    "artist agency software India",
    "roster management India",
  ],
  "Venue Technology": [
    "venue booking platform India",
    "nightclub technology India",
    "live music venue management India",
  ],
  "Artist Economics": [
    "artist fees India",
    "booking fee benchmarks India",
    "artist pricing strategy",
  ],
  "Competitive Intelligence": [
    "event pricing intelligence India",
    "ticket price benchmarking India",
  ],
  "Gamification & Engagement": [
    "artist gamification India",
    "booking leaderboards India",
  ],
  "Data Forecasting": [
    "event demand forecasting India",
    "seasonal event analytics India",
  ],
  Migration: [
    "migrate to Hoizr",
    "switch event ticketing platform India",
    "Indian event ticketing alternatives",
    "owned fan CRM India",
  ],
};

export function generateMetadata({ params }: PageParams): Metadata {
  const blog = getBlogById(params.slug);
  if (!blog) return { title: "Not found" };

  const canonical = `/blog/${blog.id}`;
  const keywords = [
    blog.category,
    ...(KEYWORDS_BY_CATEGORY[blog.category] ?? []),
    "Hoizr",
    "Indian event organizers",
    "event ticketing India",
    "event marketing India",
  ];

  return {
    title: `${blog.title} · Hoizr`,
    description: blog.excerpt,
    keywords,
    authors: [{ name: blog.author.name }],
    alternates: {
      canonical,
      languages: { "en-IN": canonical, "x-default": canonical },
    },
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      url: canonical,
      type: "article",
      publishedTime: blog.date,
      modifiedTime: blog.date,
      authors: [blog.author.name],
      section: blog.category,
      tags: keywords,
      siteName: "Hoizr",
      locale: "en_IN",
      images: blog.image
        ? [
            {
              url: blog.image,
              width: 1200,
              height: 800,
              alt: blog.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      site: "@hoizr",
      creator: "@hoizr",
      title: blog.title,
      description: blog.excerpt,
      images: blog.image ? [blog.image] : undefined,
    },
    other: {
      "article:published_time": blog.date,
      "article:section": blog.category,
      "article:tag": keywords.join(", "),
      "DC.creator": blog.author.name,
      "DC.subject": blog.category,
      "DC.language": "en-IN",
    },
  };
}

const SITE_URL = "https://business.hoizr.com";

export default function BlogPostPage({ params }: PageParams) {
  const blog = getBlogById(params.slug);
  if (!blog) notFound();

  const related = getRelatedBlogs(blog.id, 3);
  const wordCount = wordCountOf(blog.content);
  const articleBody = stripHtml(blog.content).slice(0, 5000);
  const keywords = [
    blog.category,
    ...(KEYWORDS_BY_CATEGORY[blog.category] ?? []),
    "Hoizr",
    "Indian event organizers",
  ];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    alternativeHeadline: blog.excerpt,
    description: blog.excerpt,
    articleSection: blog.category,
    articleBody,
    keywords: keywords.join(", "),
    wordCount,
    timeRequired: isoDurationFromReadTime(blog.readTime),
    inLanguage: "en-IN",
    isAccessibleForFree: true,
    datePublished: blog.date,
    dateModified: blog.date,
    image: {
      "@type": "ImageObject",
      url: blog.image,
      width: 1200,
      height: 800,
    },
    author: {
      "@type": "Person",
      "@id": `${SITE_URL}/about#sanbedan-paul`,
      name: blog.author.name,
      jobTitle: blog.author.role,
      image: blog.author.image,
      description: blog.author.description,
      worksFor: {
        "@type": "Organization",
        name: "Hoizr Technologies Pvt. Ltd.",
        url: SITE_URL,
      },
    },
    publisher: {
      "@type": "Organization",
      name: "Hoizr Technologies Pvt. Ltd.",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/opengraph-image.webp` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${blog.id}`,
    },
    audience: {
      "@type": "BusinessAudience",
      audienceType:
        "Indian event organizers, venues, promoters, festival hosts, comedy promoters, nightclub operators",
      geographicArea: { "@type": "Country", name: "India" },
    },
    // Cluster signal — related posts in the same category boost
    // topical authority for AI search engines.
    isPartOf: {
      "@type": "Blog",
      "@id": `${SITE_URL}/blog`,
      name: "Hoizr Blog",
      inLanguage: "en-IN",
    },
    mentions: related.map((r) => ({
      "@type": "Article",
      url: `${SITE_URL}/blog/${r.id}`,
      headline: r.title,
    })),
  };

  return (
    <MarketingShell>
      <JsonLdScript
        id={`hoizr-blog-${blog.id}-jsonld`}
        data={articleJsonLd}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Hoizr", href: "/" },
          { name: "Blog", href: "/blog" },
          { name: blog.title, href: `/blog/${blog.id}` },
        ]}
      />
      <BlogPost blog={blog} />
    </MarketingShell>
  );
}
