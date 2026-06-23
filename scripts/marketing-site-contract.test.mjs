import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

test("homepage composes the approved outcome-led journey order", () => {
  const source = read("app/page.tsx");
  const orderedSnippets = [
    "<Hero />",
    "<EventFormats />",
    "<ProblemStatement />",
    "<OutcomePillars />",
    "<PlatformComparison />",
    "<HowHoizrWorks />",
    "<CurrentPlatform />",
    "<AiSupport />",
    "<FreeAccess />",
    "<ComingSoonBento />",
    "<Beliefs />",
    "<FAQ />",
    "<FinalCTA />",
  ];

  let previousIndex = -1;
  for (const snippet of orderedSnippets) {
    const index = source.indexOf(snippet);
    assert.ok(index >= 0, `Missing ${snippet}`);
    assert.ok(index > previousIndex, `${snippet} is out of order`);
    previousIndex = index;
  }

  assert.doesNotMatch(source, /FounderQuoteBanner/);
  assert.doesNotMatch(source, /FounderCard/);
  assert.doesNotMatch(source, /PricingTeaserCards/);
  assert.doesNotMatch(source, /PillarGrid/);
  assert.doesNotMatch(source, /ProductStoryGallery/);
  assert.doesNotMatch(source, /DiscoveryBento/);
  assert.doesNotMatch(source, /RepeatFansBento/);
  assert.doesNotMatch(source, /OperationsBento/);
  assert.doesNotMatch(source, /AiOfferSpotlight/);
  assert.doesNotMatch(source, /AiSeoPanel/);
  assert.doesNotMatch(source, /Playbooks/);
});

test("homepage sections use the approved copy and separate current products from coming soon", () => {
  const source = [
    read("components/marketing/sections/Hero.tsx"),
    read("components/marketing/sections/EventFormats.tsx"),
    read("components/marketing/sections/ProblemStatement.tsx"),
    read("components/marketing/sections/OutcomePillars.tsx"),
    read("components/marketing/sections/PlatformComparison.tsx"),
    read("components/marketing/sections/HowHoizrWorks.tsx"),
    read("components/marketing/sections/CurrentPlatform.tsx"),
    read("components/marketing/sections/AiSupport.tsx"),
    read("components/marketing/sections/FreeAccess.tsx"),
    read("components/marketing/sections/FinalCTA.tsx"),
    read("components/marketing/data/nav-products.ts"),
    read("components/marketing/data/site-copy.ts"),
  ].join("\n");

  const currentPlatformSource = read(
    "components/marketing/sections/CurrentPlatform.tsx"
  );

  assert.match(
    source,
    /Sell tickets, understand your audience and bring them back for the\s+next event\./
  );
  assert.match(source, /Free signup\. No setup fee\. No subscription\. No card details required\./);
  assert.match(source, /The event is one business\. The tools should work like one\./);
  assert.match(
    source,
    /When ticketing,\s+campaigns,\s+customer records,\s+guestlists and door\s+operations/
  );
  assert.match(source, /Built for the events India goes out for/);
  assert.match(source, /Listing-only or ticketing-only tools/);
  assert.match(source, /Before a paid event is published, Hoizr can evaluate the event context and surface the available event-specific options\./);
  assert.match(source, /AI where it removes work — not where it invents promises\./);
  assert.match(source, /Start building the event before a sales call\./);
  assert.match(source, /Build the audience for this event — and the next one\./);
  assert.match(source, /Eight live products, no coming-soon haze\./);

  assert.match(currentPlatformSource, /ALL_PRODUCTS/);
  assert.doesNotMatch(currentPlatformSource, /COMING_SOON_PRODUCTS/);
  assert.doesNotMatch(currentPlatformSource, /House Parties \+ Instagram Attendee Filtering/);
  assert.doesNotMatch(currentPlatformSource, /Coming Soon/);
});

test("homepage contract covers the approved pillars, products, journey, and ai support", () => {
  const navProducts = read("components/marketing/data/nav-products.ts");
  const siteCopy = read("components/marketing/data/site-copy.ts");
  const outcomePillars = read("components/marketing/sections/OutcomePillars.tsx");
  const currentPlatform = read("components/marketing/sections/CurrentPlatform.tsx");
  const howItWorks = read("components/marketing/sections/HowHoizrWorks.tsx");
  const aiSupport = read("components/marketing/sections/AiSupport.tsx");

  const pillarLabels = [
    "Grow Discovery",
    "Grow Sales",
    "Grow Repeat Audience",
    "Run Events",
  ];
  for (const label of pillarLabels) {
    assert.match(navProducts, new RegExp(`label:\\s*[\"']${escapeRegExp(label)}[\"']`));
    assert.match(outcomePillars, /MARKETING_PILLARS/);
  }

  const currentProducts = [
    ["event-discovery", "Event Discovery & Organisation Pages"],
    ["event-ticketing", "Event Ticketing & Checkout"],
    ["offline-ticketing", "Offline Sales & Payment Links"],
    ["audience-management", "Audience & Customer Management"],
    ["marketing-campaigns", "Email & WhatsApp Campaigns"],
    ["guestlists-collaboration", "Guestlists, Collaborators & Teams"],
    ["door-scanning", "Door Scanning & Event Operations"],
    ["reports-settlements", "Reports, Settlements & Event Intelligence"],
  ];

  for (const [slug, label] of currentProducts) {
    assert.match(navProducts, new RegExp(`slug:\\s*[\"']${escapeRegExp(slug)}[\"']`));
    assert.match(navProducts, new RegExp(`label:\\s*[\"']${escapeRegExp(label)}[\"']`));
    assert.match(currentPlatform, /ALL_PRODUCTS/);
  }

  const journeyTitles = [
    "Create your organisation",
    "Build the event",
    "Publish and start selling",
    "Reach your audience",
    "Manage guestlists and entry",
    "Review performance and settlements",
    "Build the next event from the last one",
  ];
  for (const title of journeyTitles) {
    assert.match(siteCopy, new RegExp(`title:\\s*[\"']${escapeRegExp(title)}[\"']`));
    assert.match(howItWorks, /ORGANISER_JOURNEY/);
  }

  const aiItems = [
    "Event evaluation before publishing",
    "Event-specific offer context where the current evaluation returns it",
    "Event-description generation",
    "Listing-quality, spelling and SEO suggestions",
    "Safe fallback when the configured AI service is unavailable",
  ];
  for (const item of aiItems) {
    assert.match(aiSupport, new RegExp(escapeRegExp(item)));
  }
});
