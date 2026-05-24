import type { MetadataRoute } from "next";

const siteUrl = "https://business.hoizr.com";

/**
 * Allow public crawl of the marketing surface; explicitly block the
 * authenticated dashboard, onboarding, and auth flows so search
 * engines don't index private routes.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/about", "/contact", "/how-it-works", "/blog", "/product", "/product/", "/legal/", "/rss.xml", "/feed.xml", "/llms.txt"],
        disallow: [
          "/dashboard",
          "/account/",
          "/onboarding/",
          "/onboarding-host/",
          "/campaigns/",
          "/customer/",
          "/email-verification/",
          "/events/",
          "/org-settings/",
          "/payment/",
          "/profile",
          "/reports",
          "/scanners",
          "/teams",
          "/tickets",
          "/blocker/",
          "/login",
          "/signup",
          "/select-host",
          "/api/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
