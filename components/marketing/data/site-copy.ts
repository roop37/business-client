/**
 * Homepage + shared marketing copy. Single source so the voice stays
 * consistent and every claim maps to a live feature
 * (docs/HOIZR_FEATURE_INVENTORY.md). Voice: owner.com-grade — short,
 * direct, names the enemy (the marketplace that keeps your fans),
 * grounded in how Indian nights actually run. No commission %, no
 * fabricated stats, no SaaS filler.
 */

export const EVENT_FORMATS = [
  "Club nights",
  "Festivals",
  "Concerts & gigs",
  "Comedy",
  "House parties",
  "Free & RSVP",
] as const;

/** Problem section — written in the organizer's own words (VOC). */
export const ORGANISER_PROBLEMS = [
  {
    title: "You sold the tickets. They kept the buyers.",
    body: "Sell out on a marketplace and you walk away with cash and nothing else — no numbers, no emails, no way to bring the same crowd back. You re-buy your own audience every single show.",
  },
  {
    title: "Your money sits for weeks.",
    body: "The night's over but the payout isn't. You're paying the artist and the vendors out of your own pocket while a platform sits on what you earned.",
  },
  {
    title: "The door is held together with screenshots.",
    body: "A WhatsApp broadcast, three screenshots, a Google Sheet, and the bouncer's memory. The one night you need the list, the names don't match and the line backs up.",
  },
] as const;

/** "Stop renting. Start owning." — marketplace vs Hoizr, honest. */
export const SHIFT_ROWS = [
  { marketplace: "Keeps your buyer as their customer", hoizr: "Every buyer becomes your customer" },
  { marketplace: "Holds your money for weeks", hoizr: "Itemised settlement, on a clear timeline" },
  { marketplace: "Marketing runs to their audience", hoizr: "Personalized campaigns to your own audience" },
  { marketplace: "Guest list lives in a chat", hoizr: "Caps, golden-pass QR, live arrivals" },
  { marketplace: "You list and hope to get found", hoizr: "You sell direct from channels you own" },
] as const;

/**
 * The four deep-dive blocks (alternating image + copy). Each maps to
 * live products and reuses existing art.
 */
export const FEATURE_BLOCKS = [
  {
    id: "own",
    eyebrow: "Own your audience",
    headline: "Every fan you make is yours to keep.",
    body: "The moment someone buys, RSVPs, or joins a guest list, they land in your CRM — name, spend, what they came to. Yours forever, even off Hoizr.",
    bullets: [
      "Buyers, RSVPs, and followers in one list",
      "Ready-made segments: repeat, dormant, top-spend",
      "Export it anytime — no ransom on your own crowd",
    ],
    image: "/images/home/guestlist-home.png",
    cta: { label: "See the Fan CRM", slug: "fan-crm" },
  },
  {
    id: "sell",
    eyebrow: "Sell every kind of ticket",
    headline: "Online, cash, or free — one clean flow.",
    body: "Sell paid tickets with a UPI-first checkout, issue real QR tickets for cash at the door, and run free or RSVP nights for nothing. Online and offline finally sit in one view.",
    bullets: [
      "UPI checkout with a cart lock that holds stock",
      "Cash tickets and payment links at the door",
      "Free, RSVP, and invite-only nights, first-class",
    ],
    image: "/images/home/offline-ticket-hero.png",
    cta: { label: "See Ticketing", slug: "event-ticketing" },
  },
  {
    id: "grow",
    eyebrow: "Grow repeat fans",
    headline: "Turn last night's crowd into next month's sellout.",
    body: "Send personalized WhatsApp and email campaigns to your own segments, and let automations chase the carts people left behind. Every send ties back to real ticket sales — so you see the ROI, not just opens.",
    bullets: [
      "Personalized campaigns to your own segments",
      "Abandoned-cart recovery and sell-out nudges",
      "Revenue attributed to each send — real ROI",
    ],
    image: "/images/home/marketing-hero.png",
    cta: { label: "See Marketing", slug: "whatsapp-marketing" },
  },
  {
    id: "ops",
    eyebrow: "Run the night",
    headline: "Run the door even when the WiFi drops.",
    body: "Hand promoters their own lists with caps, scan paid, cash, and guestlist QRs at the gate, and watch arrivals live. The scanner keeps working offline and syncs after.",
    bullets: [
      "Per-promoter caps and golden-pass QR",
      "No reused screenshots, no double entries",
      "Works offline, syncs when signal returns",
    ],
    image: "/images/home/manage-event-home.png",
    cta: { label: "See Door & Guestlist", slug: "door-scanning" },
  },
] as const;

/** "Get paid" short block. */
export const GET_PAID = {
  eyebrow: "Get paid & decide",
  headline: "See what you made. Get it without chasing support.",
  body: "Every event closes with an itemised settlement statement — gross, deductions, refunds, and your net payout. Pair it with sell-through, sources, and a booking funnel in plain English.",
  bullets: [
    "Itemised settlement per event",
    "Sell-through, sources, and refunds in one place",
    "Export anything for your accountant",
  ],
} as const;

/** AI block. */
export const AI_BLOCK = {
  eyebrow: "AI in your corner",
  headline: "AI reads your event and finds a better rate.",
  body: "Before you publish, Hoizr's AI checks the listing, drafts your description and SEO, and looks for a Boost offer — lower commission where your event qualifies. It explains the why, so you decide.",
} as const;

/** Free-to-start stance. Never a commission %. */
export const FREE_ACCESS_POINTS = [
  "Free signup",
  "No setup fee",
  "No subscription",
  "No card required",
] as const;

export const FREE_ACCESS = {
  eyebrow: "Free to start",
  headline: "Start free. Pay when you sell a ticket.",
  body: "No setup fee, no subscription, no card to get started. Free and RSVP nights cost you nothing, ever. Eligible events can earn a Boost that lowers your rate further.",
} as const;

/** Homepage FAQ — straight from real organizer objections. */
export const HOME_FAQ = [
  {
    q: "Why Hoizr when BookMyShow and District exist?",
    a: "Because your audience should be yours, not theirs. You already pull a crowd on Instagram and WhatsApp — Hoizr turns that into direct ticketing, a fan CRM you own, and door control, so you sell without renting your fans back. List on the big platforms for reach if you want, but every fan who buys through Hoizr is one you keep and grow. That's how you stop supplying a marketplace and start building an audience that competes with one.",
  },
  {
    q: "What's your cut?",
    a: "Signup is free — no setup fee, no subscription, no card. You only pay when you actually sell a ticket, so publishing and running free or RSVP nights costs nothing. Eligible events can qualify for a Boost that lowers your rate further. Either way, you keep your customer and your data.",
  },
  {
    q: "We run on cash and WhatsApp. Will my door team actually use this?",
    a: "It's built for exactly that. Issue cash tickets in seconds, send a payment link when someone hasn't paid, and check people in by scanning a QR. The scanner even works when the venue WiFi drops and syncs later. Online and offline sales finally sit in one view.",
  },
  {
    q: "My events are free or invite-only. Is this for me?",
    a: "Yes, and they cost nothing. You get gated public or private guest lists with caps, a clean QR door, and every guest captured into your own CRM — so even a free night builds the audience you market to for the next one.",
  },
  {
    q: "My money gets stuck for weeks elsewhere. Why is this different?",
    a: "Every event gets a clear settlement statement — gross collection, deductions, refunds, and your net payout, itemised — with a defined release workflow instead of a black box. You see what you earned and when it's coming.",
  },
  {
    q: "I already pay for a ticketing tool, a WhatsApp tool, and a CRM. Another one?",
    a: "The opposite — Hoizr replaces the stack. Direct ticketing, an owned fan CRM, email and WhatsApp campaigns, guest lists with caps, door scanning, and settlement reports in one platform, with no subscription. Stop paying five tools that don't talk to each other.",
  },
  {
    q: "Can I still sell on other platforms?",
    a: "Keep your events wherever you get reach. But the best deals, the customers you actually own, and a clear read on what's working all live on Hoizr. After every event you see what sold and what didn't, so each night builds on the last — and your audience compounds with you, not with a marketplace.",
  },
] as const;
