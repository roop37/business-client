/**
 * Single source of truth for the marketing nav mega-menu, homepage
 * pillar grid, and footer product columns. Slugs match `/product/[slug]`
 * so every entry gets a working product page and inbound link.
 *
 * GROUND RULE (2026-06-24 rebuild): every product listed here is LIVE
 * for organizers today, backed by docs/HOIZR_FEATURE_INVENTORY.md.
 * Roadmap items live in COMING_SOON_PRODUCTS and are never sold as live.
 * Fabricated products (reviews engine, listings sync, ranked promoter/
 * artist discovery) were removed. Never state a commission %.
 */
export type PillarId = "sell" | "own" | "grow" | "ops" | "decide" | "artists";

export type MarketingProduct = {
  slug: string;
  label: string;
  blurb: string;
};

export type MarketingPillar = {
  id: PillarId;
  label: string;
  tagline: string;
  products: MarketingProduct[];
};

export type ComingSoonProduct = {
  title: string;
  body: string;
};

export const MARKETING_PILLARS: MarketingPillar[] = [
  {
    id: "sell",
    label: "Sell tickets",
    tagline: "Sell every kind of ticket, your way.",
    products: [
      {
        slug: "event-ticketing",
        label: "Event Ticketing",
        blurb: "Conversion-built event pages, UPI checkout, and a cart lock that holds stock through payment.",
      },
      {
        slug: "offline-ticketing",
        label: "Offline & Cash Ticketing",
        blurb: "Issue a real QR ticket for cash at the door, or send a payment link. Online and offline in one view.",
      },
      {
        slug: "free-rsvp-events",
        label: "Free & RSVP Events",
        blurb: "Free, RSVP, and invite-only nights are first-class — and cost you nothing.",
      },
      {
        slug: "smart-upsells",
        label: "Add-ons & Upsells",
        blurb: "Sell VIP upgrades, tables, and merch at checkout to lift the average order.",
      },
      {
        slug: "coupons",
        label: "Promo Codes",
        blurb: "Public or private codes with caps, windows, and usage you can actually track.",
      },
    ],
  },
  {
    id: "own",
    label: "Own your audience",
    tagline: "Keep every fan you make.",
    products: [
      {
        slug: "fan-crm",
        label: "Fan CRM",
        blurb: "Every buyer becomes your customer — name, spend, history, segments. Yours, not the marketplace's.",
      },
      {
        slug: "organisation-page",
        label: "Organization Page",
        blurb: "One branded home for your brand, lineup, and every event you've run.",
      },
      {
        slug: "event-discovery",
        label: "Discovery & SEO",
        blurb: "Every show ships search-ready and listed across Hoizr's city and venue surfaces.",
      },
    ],
  },
  {
    id: "grow",
    label: "Grow repeat fans",
    tagline: "Turn one night's crowd into the next.",
    products: [
      {
        slug: "email-marketing",
        label: "Email Campaigns",
        blurb: "Email your list with test sends, scheduling, and ticket sales tied back to the send.",
      },
      {
        slug: "whatsapp-marketing",
        label: "WhatsApp Campaigns",
        blurb: "Reach fans where they actually read — approved templates, delivered/read tracking.",
      },
      {
        slug: "automations",
        label: "Automations",
        blurb: "Abandoned-cart recovery and sell-out nudges that bring in sales while you sleep.",
      },
    ],
  },
  {
    id: "ops",
    label: "Run the night",
    tagline: "Run the door without the chaos.",
    products: [
      {
        slug: "guestlist-management",
        label: "Guestlist Management",
        blurb: "Per-promoter caps, golden-pass QR, and live arrivals — instead of three screenshots.",
      },
      {
        slug: "door-scanning",
        label: "Door Scanning",
        blurb: "Scan paid, offline, and guestlist QRs. Works when the venue WiFi drops, syncs after.",
      },
      {
        slug: "teams-permissions",
        label: "Teams & Permissions",
        blurb: "Add your team with exactly the access they need, and a log of who did what.",
      },
    ],
  },
  {
    id: "decide",
    label: "Get paid & decide",
    tagline: "Know what you made. Get it fast.",
    products: [
      {
        slug: "payouts-settlements",
        label: "Payouts & Settlements",
        blurb: "An itemised settlement statement per event — what sold, what was deducted, what's yours.",
      },
      {
        slug: "reporting-analytics",
        label: "Reports & Analytics",
        blurb: "Sell-through, sources, and a booking funnel in plain English. Export anything.",
      },
      {
        slug: "orders-refunds",
        label: "Orders & Refunds",
        blurb: "Every order with full detail, plus refunds that kill the QR and free the seat.",
      },
      {
        slug: "ai-event-assistant",
        label: "AI Event Assistant",
        blurb: "AI checks your event before publish and finds a Boost offer — lower commission where eligible.",
      },
    ],
  },
  {
    id: "artists",
    label: "For artists",
    tagline: "One link: profile, tickets, guestlist, merch.",
    products: [
      {
        slug: "artist-vertical",
        label: "Artist Profiles & Merch",
        blurb: "A public Hoizr page with your shows, guestlist, merch, and riders — fans flow back to you.",
      },
    ],
  },
];

export const ALL_PRODUCTS: MarketingProduct[] = MARKETING_PILLARS.flatMap(
  (pillar) => pillar.products
);

/**
 * Roadmap. Shown in the homepage "Coming soon" strip and labelled
 * clearly so nothing here reads as available today. Every item maps to
 * an Upcoming/In-Progress entry in the feature inventory.
 */
export const COMING_SOON_PRODUCTS: ComingSoonProduct[] = [
  {
    title: "Loyalty & Rewards",
    body: "Attendance-based tiers, early access, and skip-the-line perks for the fans who keep showing up.",
  },
  {
    title: "SMS Campaigns",
    body: "Add SMS to your owned marketing mix, alongside the email and WhatsApp you already send today.",
  },
  {
    title: "AI Marketing Co-pilot",
    body: "AI proposes how to split your budget across channels and segments — you approve, it sends.",
  },
  {
    title: "Peer Benchmarks",
    body: "See how shows like yours — same city, format, and price band — really performed. Anonymous, never named.",
  },
  {
    title: "Journey Builder",
    body: "Multi-step flows: on-sale, last-call, event-tomorrow, post-event, win-back — wired once, run forever.",
  },
  {
    title: "Split Settlements",
    body: "Auto-split a night's takings across collaborators, artists, and promoters at payout time.",
  },
];
