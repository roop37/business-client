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

export type ComingSoonProduct = {
  title: string;
  body: string;
};

export const MARKETING_PILLARS: MarketingPillar[] = [
  {
    id: "discovery",
    label: "Grow Discovery",
    tagline: "Help more people find the event worth leaving home for.",
    products: [
      {
        slug: "event-discovery",
        label: "Event Discovery & Organisation Pages",
        blurb:
          "Publish search-ready event pages and keep your organisation visible between events.",
      },
    ],
  },
  {
    id: "sales",
    label: "Grow Sales",
    tagline: "Turn interest into paid, free or RSVP attendance.",
    products: [
      {
        slug: "event-ticketing",
        label: "Event Ticketing & Checkout",
        blurb:
          "Run ticket tiers, multi-day access, add-ons, promo codes and checkout from one event setup.",
      },
      {
        slug: "offline-ticketing",
        label: "Offline Sales & Payment Links",
        blurb:
          "Issue real tickets at the door or send a payment link without breaking order and inventory records.",
      },
    ],
  },
  {
    id: "repeat",
    label: "Grow Repeat Audience",
    tagline: "Use every event to build the audience for the next one.",
    products: [
      {
        slug: "audience-management",
        label: "Audience & Customer Management",
        blurb:
          "Understand who bought, attended and returned, with customer history tied to your events.",
      },
      {
        slug: "marketing-campaigns",
        label: "Email & WhatsApp Campaigns",
        blurb:
          "Reach relevant audiences with scheduled campaigns and connect engagement to ticket sales.",
      },
    ],
  },
  {
    id: "ops",
    label: "Run Events",
    tagline: "Keep the team, guestlist, door and event numbers connected.",
    products: [
      {
        slug: "guestlists-collaboration",
        label: "Guestlists, Collaborators & Teams",
        blurb:
          "Control invite links, approvals, collaborator access and team permissions without spreadsheet hand-offs.",
      },
      {
        slug: "door-scanning",
        label: "Door Scanning & Event Operations",
        blurb:
          "Give door staff secure scanner access and validate paid, offline and guestlist tickets.",
      },
      {
        slug: "reports-settlements",
        label: "Reports, Settlements & Event Intelligence",
        blurb:
          "Review sales, attendance, campaigns, settlements, automations and event feedback in one reporting layer.",
      },
    ],
  },
];

export const ALL_PRODUCTS = MARKETING_PILLARS.flatMap(
  (pillar) => pillar.products
);

export const COMING_SOON_PRODUCTS: ComingSoonProduct[] = [
  {
    title: "House Parties + Instagram Attendee Filtering",
    body:
      "Create private house-party experiences and use Instagram-connected attendee context to shape who sees and joins them.",
  },
  {
    title: "Push Campaigns",
    body:
      "Send timely on-sale, last-call and event updates to opted-in audiences.",
  },
  {
    title: "SMS Campaigns",
    body:
      "Reach customer segments with campaign reporting connected to event sales.",
  },
  {
    title: "Loyalty & Rewards",
    body:
      "Recognise repeat attendance with early access, priority entry and organiser-defined benefits.",
  },
  {
    title: "Expanded Automation Journeys",
    body:
      "Build multi-step event journeys with timing, conditions and channel fallback.",
  },
  {
    title: "AI Marketing Intelligence",
    body:
      "Get explainable recommendations for audience, channel mix, budget and timing.",
  },
  {
    title: "Competitive Event Benchmarks",
    body:
      "Compare event performance with anonymised, relevant market cohorts.",
  },
  {
    title: "Advanced Audience Segmentation",
    body:
      "Create reusable segments using customer, purchase and attendance behaviour.",
  },
  {
    title: "Guestlist Invitations, Waitlists and +1s",
    body:
      "Send invitations directly, promote waitlisted guests and manage group arrivals.",
  },
];
