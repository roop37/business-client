import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const sliceBetween = (source, startMarker, endMarker) => {
  const start = source.indexOf(startMarker);
  assert.ok(start >= 0, `Missing start marker: ${startMarker}`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.ok(end >= 0, `Missing end marker: ${endMarker}`);
  return source.slice(start, end);
};

test("marketing catalogue exposes eight current products and a separate coming-soon list", () => {
  const source = read("components/marketing/data/nav-products.ts");
  const currentCatalogue = sliceBetween(
    source,
    "export const MARKETING_PILLARS: MarketingPillar[] = [",
    "export const ALL_PRODUCTS = MARKETING_PILLARS.flatMap("
  );
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

  const actualSlugs = [
    ...currentCatalogue.matchAll(/slug:\s*["']([^"']+)["']/g),
  ].map(([_, slug]) => slug);

  assert.deepStrictEqual(actualSlugs, currentSlugs);

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

test("marketing nav uses the approved public routes and CTA labels", () => {
  const source = read("components/marketing/MarketingNav.tsx");

  const desktopHeader = sliceBetween(
    source,
    '<nav className="hidden lg:flex items-center gap-1 lg:ml-10 xl:ml-16">',
    'className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-[rgba(0,0,0,0.05)]"'
  );

  const desktopOrder = [
    "Products",
    'href="/how-it-works"',
    "How It Works",
    'href="/about"',
    "About",
    'href="/book-a-demo"',
    "Book a Demo",
    'href="/login"',
    "Log in",
    'href="/signup"',
    "Get Started",
  ];

  let previousIndex = -1;
  for (const snippet of desktopOrder) {
    const index = desktopHeader.indexOf(snippet);
    assert.ok(index >= 0, `Missing desktop header snippet: ${snippet}`);
    assert.ok(index > previousIndex, `Desktop header snippet out of order: ${snippet}`);
    previousIndex = index;
  }

  assert.doesNotMatch(desktopHeader, /Find Event/);
  assert.doesNotMatch(desktopHeader, /Resources/);
  assert.doesNotMatch(desktopHeader, /Get started/);

  const mobileMenu = sliceBetween(
    source,
    '<div className="px-6 py-6 space-y-8">',
    "document.body,"
  );
  const mobileOrder = [
    'href="/how-it-works"',
    "How It Works",
    'href="/about"',
    "About",
    'href="/book-a-demo"',
    "Book a Demo",
    'href="/login"',
    "Log in",
    'href="/signup"',
    "Get Started",
  ];

  previousIndex = -1;
  for (const snippet of mobileOrder) {
    const index = mobileMenu.indexOf(snippet);
    assert.ok(index >= 0, `Missing mobile menu snippet: ${snippet}`);
    assert.ok(index > previousIndex, `Mobile menu snippet out of order: ${snippet}`);
    previousIndex = index;
  }

  assert.doesNotMatch(mobileMenu, /Find Event/);
  assert.doesNotMatch(mobileMenu, /Resources/);
  assert.doesNotMatch(mobileMenu, /Get started/);

  assert.match(source, /usePathname\(\)/);
  assert.match(source, /setMobileOpen\(false\);/);
  assert.match(source, /onClick=\{closeNow\}/);
  assert.match(source, /onClick=\{\(\) => setMobileOpen\(false\)\}/);
});

test("marketing footer uses the approved public routes and labels", () => {
  const source = read("components/marketing/MarketingFooter.tsx");

  assert.match(source, /MARKETING_PILLARS\.map/);
  assert.match(source, /<div className="hm-eyebrow mb-3 !text-white\/45">Company<\/div>/);
  assert.match(source, /label: "About", href: "\/about"/);
  assert.match(source, /label: "How It Works", href: "\/how-it-works"/);
  assert.match(source, /label: "Book a Demo", href: "\/book-a-demo"/);
  assert.match(source, /label: "Get Started", href: "\/signup"/);
  assert.match(source, /Get Started/);
  assert.match(source, /label: "Log in", href: "\/login"/);
  assert.match(source, /label: "Contact", href: "\/contact"/);
  assert.match(source, /label: "contact@hoizr\.com", href: "mailto:contact@hoizr\.com"/);
  assert.match(source, /label: "tech@hoizr\.com", href: "mailto:tech@hoizr\.com"/);
  assert.match(source, /https:\/\/business\.hoizr\.com\/legal\/privacy/);
  assert.match(source, /https:\/\/business\.hoizr\.com\/legal\/terms/);
  assert.match(source, /https:\/\/business\.hoizr\.com\/legal\/cookies/);
  assert.match(source, /https:\/\/business\.hoizr\.com\/legal\/entity/);
  assert.doesNotMatch(source, /label: "Resources", href: "\/resources"/);
  assert.doesNotMatch(source, /Explore/);
});

test("demo page embeds Zcal and does not reference Calendly", () => {
  const source = read("app/book-a-demo/page.tsx");

  assert.match(source, /title:\s*"Book a Hoizr guided tour"/);
  assert.match(
    source,
    /description:\s*"Book a guided tour of Hoizr's ticketing, audience, campaigns and event operations platform for Indian event organisers\."/
  );
  assert.match(source, /alternates:\s*\{\s*canonical:\s*"\/book-a-demo"\s*\}/);
  assert.match(source, /title="Book a Hoizr guided product tour"/);
  assert.match(source, /id="zcal-invite"/);
  assert.match(
    source,
    /className="block min-h-\[544px\] h-\[544px\] w-full min-w-\[320px\] border-0 md:h-\[779px\]"/
  );
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

test("task 6 beliefs and faq use the approved organiser copy", () => {
  const beliefsSource = read("components/marketing/sections/Beliefs.tsx");
  const faqSource = read("components/marketing/sections/FAQ.tsx");
  const source = [beliefsSource, faqSource].join("\n");

  const beliefs = [
    {
      n: "01",
      title: "Independent organisers should have serious operating tools.",
      body:
        "Modern ticketing, audience, campaign and event-night systems should not be limited to the largest event companies. Hoizr is built to put those capabilities into one practical organiser workflow.",
    },
    {
      n: "02",
      title: "Every event should make the next one stronger.",
      body:
        "A sale, campaign, guestlist entry or door scan should add useful context to the organiser's audience and event history instead of disappearing when the night ends.",
    },
    {
      n: "03",
      title: "Indian events deserve technology built around how they run.",
      body:
        "Free and RSVP events, guestlists, collaborators, offline sales, multi-day access and fast-changing event operations are not edge cases. They are part of the product model.",
    },
  ];

  for (const belief of beliefs) {
    assert.match(source, new RegExp(belief.n));
    assert.match(source, new RegExp(belief.title.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(source, new RegExp(belief.body.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  const items = [
    {
      q: "Who is Hoizr built for?",
      a: "Hoizr is built for Indian event organisers running parties, club nights, concerts, festivals, comedy, free and RSVP events, and exclusive or non-exclusive experiences.",
    },
    {
      q: "What can I use today?",
      a: "Current capabilities include event publishing, ticketing, add-ons, promo codes, offline issuing, payment links, customer records, email and WhatsApp campaigns, guestlists, collaborators, teams, scanners, reports, payouts, settlements, selected automations and event evaluation.",
    },
    {
      q: "What does Coming Soon mean?",
      a: "Coming Soon capabilities are part of the product roadmap but are not currently available as complete organiser workflows. They are always labelled separately on this site.",
    },
    {
      q: "Does it cost anything to create an account?",
      a: "Signup is free. Hoizr does not require a setup fee, subscription or card details to create the organisation and begin building events.",
    },
    {
      q: "How do paid-event payouts work?",
      a: "Paid events require an active verified payout profile before publishing. The organiser workspace shows payout-account status, settlement history and available settlement statements.",
    },
    {
      q: "Can collaborators and team members use the workspace?",
      a: "Yes. Organisers can invite team members with roles and permissions, and event collaborators can receive event-specific access such as metrics, campaigns, customers or offline ticket issuing.",
    },
    {
      q: "Can I run free or RSVP events?",
      a: "Yes. Hoizr supports free and RSVP events alongside exclusive and non-exclusive paid event formats.",
    },
    {
      q: "Can I see the platform before signing up?",
      a: "Yes. Book a guided tour and the Hoizr team will walk through the current platform around your event format and operating needs.",
    },
  ];

  for (const item of items) {
    assert.match(source, new RegExp(item.q.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(source, new RegExp(item.a.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(source, /href="\/book-a-demo"/);
  assert.doesNotMatch(source, /Founder/i);
  assert.doesNotMatch(source, /Sanbedan/);
  assert.doesNotMatch(source, /lowered commission/i);
  assert.doesNotMatch(source, /best possible offer/i);
  assert.doesNotMatch(source, /pricing/i);
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

  const pillarBlock = sliceBetween(
    navProducts,
    "export const MARKETING_PILLARS: MarketingPillar[] = [",
    "export const ALL_PRODUCTS = MARKETING_PILLARS.flatMap("
  );
  const pillarIds = [...pillarBlock.matchAll(/id:\s*["']([^"']+)["']/g)].map(
    ([_, id]) => id
  );

  assert.deepStrictEqual(pillarIds, ["discovery", "sales", "repeat", "ops"]);
  assert.match(outcomePillars, /MARKETING_PILLARS/);

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

  const currentSlugs = [
    ...pillarBlock.matchAll(/slug:\s*["']([^"']+)["']/g),
  ].map(([_, slug]) => slug);

  assert.deepStrictEqual(
    currentSlugs,
    currentProducts.map(([slug]) => slug)
  );
  assert.match(currentPlatform, /ALL_PRODUCTS/);

  const journeyBlock = sliceBetween(
    siteCopy,
    "export const ORGANISER_JOURNEY = [",
    "export const FREE_ACCESS_POINTS = ["
  );
  const journeyTitles = [
    "Create your organisation",
    "Build the event",
    "Publish and start selling",
    "Reach your audience",
    "Manage guestlists and entry",
    "Review performance and settlements",
    "Build the next event from the last one",
  ];
  const actualJourneyTitles = [
    ...journeyBlock.matchAll(/title:\s*["']([^"']+)["']/g),
  ].map(([_, title]) => title);
  assert.deepStrictEqual(actualJourneyTitles, journeyTitles);
  assert.match(howItWorks, /ORGANISER_JOURNEY/);

  const aiItems = [
    "Event evaluation before publishing",
    "Event-specific offer context where the current evaluation returns it",
    "Event-description generation",
    "Listing-quality, spelling and SEO suggestions",
    "Safe fallback when the configured AI service is unavailable",
  ];
  const aiBlock = sliceBetween(
    aiSupport,
    "const AI_SUPPORT_POINTS = [",
    "] as const;"
  );
  const actualAiItems = [...aiBlock.matchAll(/"([^"]+)"/g)].map(([_, item]) => item);

  assert.deepStrictEqual(actualAiItems, aiItems);
});

test("task 9 how-it-works uses the approved seven-step organiser journey", () => {
  const source = read("app/how-it-works/page.tsx");
  const siteCopy = read("components/marketing/data/site-copy.ts");

  assert.match(
    source,
    /import \{\s*ORGANISER_JOURNEY\s*\} from "@\/components\/marketing\/data\/site-copy";/
  );

  const journeyIconsBlock = sliceBetween(
    source,
    "const journeyIcons = [",
    "] as const;"
  );
  const actualIcons = [
    ...journeyIconsBlock.matchAll(/^\s*([A-Z][A-Za-z0-9]+),/gm),
  ].map(([_, icon]) => icon);
  assert.deepStrictEqual(actualIcons, [
    "Building2",
    "CalendarPlus2",
    "BadgeCheck",
    "Send",
    "ScanLine",
    "ChartNoAxesCombined",
    "RefreshCw",
  ]);

  assert.match(source, /ORGANISER_JOURNEY\.map/);
  assert.doesNotMatch(source, /OPERATING_FLOW/);
  assert.match(
    source,
    /From the first event draft to the report after doors close\./
  );
  assert.match(
    source,
    /Hoizr keeps event setup, ticket sales, audience engagement, guestlists, entry and reporting connected so the next decision starts with the context from the last one\./
  );
  assert.match(source, /Get Started/);
  assert.match(source, /Book a Demo/);
  assert.doesNotMatch(source, /Get started/);
  assert.doesNotMatch(source, /See the flow/);
  assert.doesNotMatch(source, /title:\s*"Finance"/);
  assert.doesNotMatch(source, /title:\s*"Door staff"/);
  assert.doesNotMatch(source, /creates cross-channel audience filters/i);
  assert.doesNotMatch(source, /allocates campaign budgets/i);
  assert.doesNotMatch(source, /chooses channels/i);
  assert.doesNotMatch(source, /builds complete campaigns/i);
  assert.doesNotMatch(source, /promoter code/i);

  const teamRolesBlock = sliceBetween(
    source,
    "const TEAM_ROLES:",
    "const FAQS:"
  );
  const actualRoleTitles = [
    ...teamRolesBlock.matchAll(/title:\s*["']([^"']+)["']/g),
  ].map(([_, title]) => title);
  assert.deepStrictEqual(actualRoleTitles, [
    "Owner",
    "Manager",
    "Marketing",
    "Staff",
  ]);
  assert.doesNotMatch(teamRolesBlock, /Finance/);
  assert.doesNotMatch(teamRolesBlock, /Door staff/);

  const journeyBlock = sliceBetween(
    siteCopy,
    "export const ORGANISER_JOURNEY = [",
    "export const FREE_ACCESS_POINTS = ["
  );
  const journeyTitles = [
    "Create your organisation",
    "Build the event",
    "Publish and start selling",
    "Reach your audience",
    "Manage guestlists and entry",
    "Review performance and settlements",
    "Build the next event from the last one",
  ];
  const actualJourneyTitles = [
    ...journeyBlock.matchAll(/title:\s*["']([^"']+)["']/g),
  ].map(([_, title]) => title);
  assert.deepStrictEqual(actualJourneyTitles, journeyTitles);

  const howToJsonLdBlock = sliceBetween(
    source,
    "const howToJsonLd = {",
    "export default function HowItWorksPage()"
  );
  assert.match(howToJsonLdBlock, /ORGANISER_JOURNEY\.map/);
  assert.doesNotMatch(howToJsonLdBlock, /SMS|push|loyalty/i);
});
