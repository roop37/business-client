import { blogs } from "@/components/marketing/blog/blog-data";

const SITE_URL = "https://business.hoizr.com";

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const pubDate = (date: string): string => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? new Date().toUTCString()
    : parsed.toUTCString();
};

export const buildBlogRss = (selfPath = "/rss.xml") => {
  const items = blogs
    .map((blog) => {
      const url = `${SITE_URL}/blog/${blog.id}`;
      return [
        "<item>",
        `<title>${escapeXml(blog.title)}</title>`,
        `<link>${url}</link>`,
        `<guid isPermaLink="true">${url}</guid>`,
        `<description>${escapeXml(blog.excerpt)}</description>`,
        `<pubDate>${pubDate(blog.date)}</pubDate>`,
        `<category>${escapeXml(blog.category)}</category>`,
        blog.image
          ? `<enclosure url="${SITE_URL}${blog.image}" type="image/png" />`
          : "",
        "</item>",
      ]
        .filter(Boolean)
        .join("");
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Hoizr Business Blog</title>
    <link>${SITE_URL}/blog</link>
    <atom:link href="${SITE_URL}${selfPath}" rel="self" type="application/rss+xml" />
    <description>Playbooks and operator notes for Indian event organizers, venues, and promoters.</description>
    <language>en-IN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;
};

export const blogRssResponse = (selfPath = "/rss.xml") =>
  new Response(buildBlogRss(selfPath), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
