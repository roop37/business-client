import type { MetadataRoute } from "next";
import { blogs } from "@/components/marketing/blog/blog-data";
import { ALL_PRODUCTS } from "@/components/marketing/data/nav-products";
import { ALL_LEGAL_SLUGS } from "@/components/marketing/legal/content";

/**
 * Sitemap. Auto-generates from product + legal data + the live blog
 * slug list (queried from main-server). Adding a product, legal page,
 * or publishing a new blog automatically picks up here without a
 * code change. Update `siteUrl` for prod once the domain is locked.
 */
const siteUrl = "https://business.hoizr.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified, changeFrequency: "weekly", priority: 1.0 },
    { url: `${siteUrl}/pricing`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/how-it-works`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/about`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/contact`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/blog`, lastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/product`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/resources`, lastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/help`, lastModified, changeFrequency: "monthly", priority: 0.4 },
  ];

  const productRoutes: MetadataRoute.Sitemap = ALL_PRODUCTS.map((p) => ({
    url: `${siteUrl}/product/${p.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const legalRoutes: MetadataRoute.Sitemap = ALL_LEGAL_SLUGS.map((slug) => ({
    url: `${siteUrl}/legal/${slug}`,
    lastModified,
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  // Blog routes — driven by the local JSON-style data file.
  const blogRoutes: MetadataRoute.Sitemap = blogs.map((b) => ({
    url: `${siteUrl}/blog/${b.id}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...legalRoutes, ...blogRoutes];
}
