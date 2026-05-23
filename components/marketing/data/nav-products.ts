/**
 * Single source of truth for the marketing nav mega-menu + footer
 * product columns. Slugs match `/product/[slug]` so any new entry
 * automatically gets a working product page and inbound link.
 */
export type MarketingProduct = {
  slug: string;
  label: string;
  blurb: string;
};

export type MarketingPillar = {
  id: "discovery" | "sales" | "repeat" | "ops";
  label: string;
  tagline: string;
  products: MarketingProduct[];
};

export const MARKETING_PILLARS: MarketingPillar[] = [
  {
    id: "discovery",
    label: "Grow online discovery",
    tagline: "Get found by fans who don't know you yet.",
    products: [
      {
        slug: "event-marketplace",
        label: "Event Marketplace",
        blurb: "Featured placement across Hoizr's discovery surfaces.",
      },
      {
        slug: "event-seo",
        label: "Event SEO",
        blurb: "Auto-tuned schema, city pages, and meta for every show.",
      },
      {
        slug: "organisation-page",
        label: "Organisation page",
        blurb: "A polished home for your brand, lineup, and history.",
      },
      {
        slug: "reviews-engine",
        label: "Reviews Engine",
        blurb: "Turn happy attendees into Google reviews on autopilot.",
      },
      {
        slug: "listings-management",
        label: "Listings Management",
        blurb: "One inbox for Google, Maps, and discovery sites.",
      },
    ],
  },
  {
    id: "sales",
    label: "Grow online sales",
    tagline: "Convert visitors into ticket buyers.",
    products: [
      {
        slug: "event-listing",
        label: "Event Listing",
        blurb: "Fast, conversion-optimised event pages with cart locks.",
      },
      {
        slug: "smart-upsells",
        label: "Smart Upsells",
        blurb: "Add-ons that lift average order without nagging fans.",
      },
      {
        slug: "find-best-promoters",
        label: "Find Best Promoters",
        blurb: "A vetted promoter network ranked by actual sell-through.",
      },
      {
        slug: "find-trending-artists",
        label: "Find Trending Artists",
        blurb: "Book lineups that already pull in your city.",
      },
    ],
  },
  {
    id: "repeat",
    label: "Grow repeat fans",
    tagline: "Bring last night's crowd back next weekend.",
    products: [
      {
        slug: "marketing-campaigns",
        label: "Marketing Campaigns",
        blurb: "Plan, schedule, and ship multi-channel drops.",
      },
      {
        slug: "email-sms-marketing",
        label: "Email & SMS Marketing",
        blurb: "Owned-channel outreach to your CRM, not a marketplace's.",
      },
      {
        slug: "push-notifications",
        label: "Push Notifications",
        blurb: "Door-drops, on-sale alerts, and last-call nudges.",
      },
      {
        slug: "conversation-marketing",
        label: "Conversation Marketing",
        blurb: "High-intent chat campaigns without exposing vendor plumbing.",
      },
      {
        slug: "loyalty-rewards",
        label: "Loyalty & Rewards",
        blurb: "Tier perks that turn a fan into a regular.",
      },
    ],
  },
  {
    id: "ops",
    label: "Run your events",
    tagline: "Pull off the night without the chaos.",
    products: [
      {
        slug: "reporting-analytics",
        label: "Reporting & Analytics",
        blurb: "Sell-through, sources, and settlement — in plain English.",
      },
      {
        slug: "door-scanning",
        label: "Door Scanning",
        blurb: "Door staff, QR scanning, instant guestlist visibility.",
      },
      {
        slug: "automations",
        label: "Automations",
        blurb: "Recipes that handle marketing, refunds, and follow-ups.",
      },
      {
        slug: "ai-event-assistant",
        label: "AI Event Assistant",
        blurb: "Pricing, copywriting, and audience picks tuned by AI.",
      },
      {
        slug: "guestlist-management",
        label: "Guestlist Management",
        blurb: "Promoter caps, invite QR, live arrivals at the door.",
      },
    ],
  },
];

export const ALL_PRODUCTS: MarketingProduct[] = MARKETING_PILLARS.flatMap(
  (pillar) => pillar.products
);
