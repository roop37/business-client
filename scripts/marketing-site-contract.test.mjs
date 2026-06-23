import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("marketing catalogue exposes eight current products and a separate coming-soon list", () => {
  const source = read("components/marketing/data/nav-products.ts");
  const currentSlugs = [
    "event-discovery",
    "event-ticketing",
    "offline-ticketing",
    "audience-management",
    "marketing-campaigns",
    "guestlists-collaboration",
    "door-scanning",
    "reports-settlements",
  ];

  for (const slug of currentSlugs) {
    assert.match(source, new RegExp(`slug:\\s*[\"']${slug}[\"']`));
  }

  assert.match(source, /COMING_SOON_PRODUCTS/);
  assert.match(source, /House Parties \+ Instagram Attendee Filtering/);
});

test("public CTA language uses Get Started and Book a Demo", () => {
  const files = [
    "components/marketing/MarketingNav.tsx",
    "components/marketing/MarketingFooter.tsx",
    "components/marketing/sections/Hero.tsx",
    "components/marketing/sections/FinalCTA.tsx",
  ];
  const source = files.map(read).join("\n");

  assert.match(source, /Get Started/);
  assert.match(source, /Book a Demo/);
  assert.doesNotMatch(source, /Start for free/i);
  assert.doesNotMatch(source, /Get started free/i);
});

test("demo page embeds Zcal and does not reference Calendly", () => {
  const source = read("app/book-a-demo/page.tsx");

  assert.match(source, /Take a Guided Tour\./);
  assert.match(source, /ticket sales and customer engagement/);
  assert.match(source, /https:\/\/zcal\.co\/i\/2wlfsHdI\?embed=1&embedType=iframe/);
  assert.doesNotMatch(source, /Calendly/i);
});

test("marketing metadata only enumerates current products", () => {
  const sitemap = read("app/sitemap.ts");
  const products = read("components/marketing/data/nav-products.ts");

  assert.match(sitemap, /ALL_PRODUCTS/);
  assert.match(products, /COMING_SOON_PRODUCTS/);
  assert.doesNotMatch(sitemap, /COMING_SOON_PRODUCTS/);
});

test("product hub uses the new current-products metadata and coming-soon section", () => {
  const source = read("app/product/page.tsx");

  assert.match(source, /title:\s*"Hoizr products for Indian event organisers"/);
  assert.match(
    source,
    /description:\s*"Explore Hoizr ticketing, audience, campaign, guestlist, scanning, reporting and settlement tools for Indian event organisers\."/
  );
  assert.match(source, /alternates:\s*\{\s*canonical:\s*"\/product"\s*\}/);
  assert.match(source, /ComingSoonBento/);
  assert.match(source, /MARKETING_PILLARS\.map/);
});

test("product hero uses Get Started and Book a Demo CTAs", () => {
  const source = read("components/marketing/product/ProductHero.tsx");

  assert.match(source, /href="\/signup"/);
  assert.match(source, /<span>Get Started<\/span>/);
  assert.match(source, /href="\/book-a-demo"/);
  assert.match(source, /Book a Demo/);
  assert.doesNotMatch(source, /Why Hoizr/);
  assert.doesNotMatch(source, /Get started<\/span>/);
});

test("coming soon bento is a reusable marketing section", () => {
  const source = read("components/marketing/sections/ComingSoonBento.tsx");

  assert.match(source, /"use client";/);
  assert.match(source, /COMING_SOON_PRODUCTS/);
  assert.match(source, /The next layer of audience and event tools\./);
  assert.match(source, /Book a Demo/);
  assert.match(source, /href="\/book-a-demo"/);
});

test("legacy product URLs are represented in redirect configuration", () => {
  const config = read("next.config.mjs");
  const legacyPaths = [
    "/product/event-marketplace",
    "/product/event-listing",
    "/product/push-notifications",
    "/product/competitive-analysis",
  ];

  for (const path of legacyPaths) {
    assert.match(config, new RegExp(path.replaceAll("/", "\\/")));
  }
});

test("public marketing copy avoids prohibited claims", () => {
  const files = [
    "app/page.tsx",
    "app/how-it-works/page.tsx",
    "app/product/page.tsx",
    "components/marketing/data/product-content.ts",
    "components/marketing/sections/Beliefs.tsx",
    "components/marketing/sections/FAQ.tsx",
  ];
  const source = files.map(read).join("\n");

  assert.doesNotMatch(source, /lowest ticket commission/i);
  assert.doesNotMatch(source, /lowered commission/i);
  assert.doesNotMatch(source, /marketing credit/i);
  assert.doesNotMatch(source, /India['’]s leading/i);
  assert.doesNotMatch(source, /the best event platform/i);
});
