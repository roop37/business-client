import { ALL_PRODUCTS, MARKETING_PILLARS, MarketingProduct } from "./nav-products";

export type ProductContent = {
  slug: string;
  label: string;
  pillarId: string;
  pillarLabel: string;
  hero: {
    eyebrow: string;
    headline: string;
    body: string;
    bullets: string[];
  };
  benefits: {
    title: string;
    body: string;
  }[];
  howItWorks: {
    title: string;
    body: string;
  }[];
  narrative: {
    pullQuote: string;
    paragraphs: string[];
  };
  faq: {
    q: string;
    a: string;
  }[];
};

const PRODUCT_CONTENT: Record<string, ProductContent> = {
  "event-discovery": {
    slug: "event-discovery",
    label: "Event Discovery & Organisation Pages",
    pillarId: "discovery",
    pillarLabel: "Grow Discovery",
    hero: {
      eyebrow: "Grow Discovery",
      headline: "Give every event a place people can find — and trust.",
      body:
        "Scattered event details make discovery harder and weaken confidence at the point of purchase. Hoizr turns your event and organisation information into consistent, customer-facing pages that stay connected as the event changes.",
      bullets: [
        "Public organisation page with upcoming and past events",
        "Event pages connected to city, category and relevant discovery surfaces",
        "Search-ready metadata, structured event information and share previews",
        "One source of truth for venue, lineup, policies, tickets and event media",
      ],
    },
    benefits: [
      {
        title: "Stop rebuilding the same event story.",
        body:
          "Dates, venue details, media, lineup and ticket information come from the event record instead of separate landing-page edits.",
      },
      {
        title: "Stay visible between launches.",
        body:
          "Your organisation page gives returning customers a stable place to find current and previous events.",
      },
      {
        title: "Support discovery without giving up control.",
        body:
          "Hoizr discovery surfaces can support reach while the event and audience relationship remain connected to your organisation.",
      },
    ],
    howItWorks: [
      {
        title: "Complete the organisation profile",
        body: "Add the brand, address, contact details and operating information.",
      },
      {
        title: "Build the event record",
        body: "Add event media, venue, lineup, policies, categories and tickets once.",
      },
      {
        title: "Publish connected pages",
        body: "The public event and organisation surfaces update from the same source.",
      },
    ],
    narrative: {
      pullQuote:
        "Discovery works better when every public surface tells the same event story.",
      paragraphs: [
        "An event becomes harder to sell when its date, venue, lineup and entry rules drift across links. Hoizr keeps the customer-facing event page tied to the organiser's actual event setup.",
        "The organisation page then carries that context beyond one launch. Customers can see what is upcoming, understand who is behind the event and return when the next listing goes live.",
      ],
    },
    faq: [
      {
        q: "Does Hoizr guarantee search rankings?",
        a: "No. Hoizr provides structured, search-ready event and organisation pages, but no platform can guarantee a search position.",
      },
      {
        q: "Can I update an event after publishing?",
        a: "Yes. Supported event details can be edited from the organiser workspace and reflected on the customer-facing event.",
      },
    ],
  },
  "event-ticketing": {
    slug: "event-ticketing",
    label: "Event Ticketing & Checkout",
    pillarId: "sales",
    pillarLabel: "Grow Sales",
    hero: {
      eyebrow: "Grow Sales",
      headline: "Sell the event the way it is actually designed.",
      body:
        "Generic ticket forms flatten free, RSVP, exclusive, multi-day and tiered events into the same flow. Hoizr lets you configure the format, ticket ladder, access rules, extras and checkout from one event record.",
      bullets: [
        "Free, RSVP, exclusive and non-exclusive event formats",
        "Ticket tiers, categories, admission types and sale windows",
        "Single-day, multi-day, day-specific and all-days access",
        "Add-ons, promo codes, payment recovery and publish-time event evaluation",
      ],
    },
    benefits: [
      {
        title: "Match the ticket setup to the event.",
        body:
          "Build ticket categories, inventory limits and access rules around how the event will actually run.",
      },
      {
        title: "Protect inventory while customers decide.",
        body:
          "Temporary cart reservation and defined sale windows reduce avoidable overselling and checkout confusion.",
      },
      {
        title: "Make readiness visible before launch.",
        body:
          "Publishing controls and event evaluation help the team catch incomplete event context before customers see it.",
      },
    ],
    howItWorks: [
      {
        title: "Choose the event format",
        body: "Set whether the event is free, RSVP, exclusive or open to the public.",
      },
      {
        title: "Build the ticket ladder",
        body: "Configure tiers, dates, quantities, limits, add-ons and promo codes.",
      },
      {
        title: "Publish and manage checkout",
        body: "Open sales, monitor orders and recover supported incomplete-payment journeys.",
      },
    ],
    narrative: {
      pullQuote:
        "The checkout should reflect the event — not force the event into a generic checkout.",
      paragraphs: [
        "A weekend festival, a members-only party and a free RSVP night do not need the same ticket structure. Hoizr keeps format, access and inventory decisions inside the event setup.",
        "That same record powers the customer-facing offer and the order created after checkout, reducing the gaps that appear when ticket rules are rebuilt across tools.",
      ],
    },
    faq: [
      {
        q: "Can I run free or RSVP events?",
        a: "Yes. Hoizr supports free and RSVP formats alongside paid events.",
      },
      {
        q: "Can a multi-day event have day-specific tickets?",
        a: "Yes. Supported setups can include day-specific access and all-days passes.",
      },
      {
        q: "Does Hoizr support promo codes and add-ons?",
        a: "Yes. Current event setup includes promo-code and add-on controls.",
      },
    ],
  },
  "offline-ticketing": {
    slug: "offline-ticketing",
    label: "Offline Sales & Payment Links",
    pillarId: "sales",
    pillarLabel: "Grow Sales",
    hero: {
      eyebrow: "Grow Sales",
      headline: "Keep door sales and payment links inside the real order book.",
      body:
        "Cash sales and manual payment collection often create inventory and reporting gaps. Hoizr creates real orders for offline issuing and payment links, with the same ticket, QR and customer communication path used by online sales.",
      bullets: [
        "Cash and other supported offline-payment issuing",
        "Payment links with ticket and add-on selection",
        "Customer details and collaborator issuing permissions",
        "Order, inventory, QR, communication and reporting parity",
      ],
    },
    benefits: [
      {
        title: "Stop reconciling door sales by hand.",
        body:
          "Offline-issued tickets update the event's order and inventory records instead of living in a separate sheet.",
      },
      {
        title: "Collect remote payments without creating fake orders.",
        body:
          "Payment links preserve the selected tickets, extras and customer details in the Hoizr order flow.",
      },
      {
        title: "Delegate issuing without opening the whole workspace.",
        body:
          "Collaborator permissions control who can create supported offline orders.",
      },
    ],
    howItWorks: [
      {
        title: "Select the event inventory",
        body: "Choose the ticket types and add-ons being sold.",
      },
      {
        title: "Record the customer and payment route",
        body: "Issue against an offline method or create a payment link.",
      },
      {
        title: "Track the real order",
        body: "Use the resulting order, QR, status and reporting alongside online sales.",
      },
    ],
    narrative: {
      pullQuote:
        "A sale at the door is still an event sale. Its data should not disappear at the door.",
      paragraphs: [
        "Manual sales become expensive later when the organiser has to rebuild customer records, remaining inventory and event totals. Hoizr keeps supported offline sales inside the event system.",
        "The customer receives a real ticket path, while the organiser keeps the order status and event reporting needed after doors close.",
      ],
    },
    faq: [
      {
        q: "Can collaborators issue offline tickets?",
        a: "Yes, when the organiser grants the relevant issuing permission.",
      },
      {
        q: "Do offline-issued tickets receive QR codes?",
        a: "Yes. Supported offline orders follow the event's ticket and QR flow.",
      },
      {
        q: "Can I see offline orders in reports?",
        a: "Yes. Offline-order status and sales reporting are part of the current scope.",
      },
    ],
  },
  "audience-management": {
    slug: "audience-management",
    label: "Audience & Customer Management",
    pillarId: "repeat",
    pillarLabel: "Grow Repeat Audience",
    hero: {
      eyebrow: "Grow Repeat Audience",
      headline: "Know who bought, who attended and who came back.",
      body:
        "A ticket transaction without customer context does not help the next event. Hoizr connects contact, purchase, attendance and spending history to an organiser-owned customer record.",
      bullets: [
        "Organiser-owned customer list with contact context",
        "Purchase, attendance and spending history",
        "Customer order drill-down and campaign audiences",
        "Consent, unsubscribe handling and supported CSV audience input",
      ],
    },
    benefits: [
      {
        title: "Keep the relationship after checkout.",
        body:
          "Customer records remain useful after one order, giving the organiser context for the next event.",
      },
      {
        title: "Move from totals to people.",
        body:
          "Order and attendance drill-down shows the customer activity behind headline sales numbers.",
      },
      {
        title: "Build campaigns from current data.",
        body:
          "Supported campaign audiences use customer and event context without claiming unavailable tags or saved segments.",
      },
    ],
    howItWorks: [
      {
        title: "Capture customer activity",
        body: "Orders, attendance and supported campaign activity contribute to the organiser view.",
      },
      {
        title: "Review the customer record",
        body: "Inspect contact information, order history and attendance context.",
      },
      {
        title: "Use the audience responsibly",
        body: "Select supported audiences while respecting consent and unsubscribe state.",
      },
    ],
    narrative: {
      pullQuote:
        "The value of an event audience starts after the first transaction.",
      paragraphs: [
        "Most organisers can see how many tickets sold. The harder question is who bought, who arrived and whether the same customer returned. Hoizr connects those signals to the organiser's event history.",
        "That record gives campaigns and event reviews more useful context without presenting manual CRM records, customer tags, saved segments or lifetime-value modelling as current.",
      ],
    },
    faq: [
      {
        q: "Who owns the customer relationship?",
        a: "The organiser can access the customer records generated through their Hoizr events, subject to consent and platform terms.",
      },
      {
        q: "Can I inspect a customer's orders?",
        a: "Yes. Current customer management includes order drill-down.",
      },
      {
        q: "Does Hoizr currently provide CRM tags or lifetime-value scoring?",
        a: "No. Those capabilities must not be presented as current.",
      },
    ],
  },
  "marketing-campaigns": {
    slug: "marketing-campaigns",
    label: "Email & WhatsApp Campaigns",
    pillarId: "repeat",
    pillarLabel: "Grow Repeat Audience",
    hero: {
      eyebrow: "Grow Repeat Audience",
      headline: "Reach the audience with context, not another flat blast.",
      body:
        "Disconnected campaign tools cannot easily use event, purchase and attendance context. Hoizr lets organisers build email and WhatsApp campaigns around current customer and event data, then review engagement and attributed sales.",
      bullets: [
        "Rich email creation plus approved-template WhatsApp campaigns",
        "Immediate and scheduled delivery",
        "Event, customer-filter and supported CSV audiences",
        "Delivery, engagement and attributed-sales reporting",
      ],
    },
    benefits: [
      {
        title: "Start from the event context.",
        body:
          "Campaign creation stays close to the event and customer records the organiser is already using.",
      },
      {
        title: "Use the right supported channel.",
        body:
          "Email and approved WhatsApp templates cover current outreach without advertising SMS or push as live.",
      },
      {
        title: "Connect response to sales.",
        body:
          "Delivery, engagement and attributed-order reporting show more than send volume alone.",
      },
    ],
    howItWorks: [
      {
        title: "Choose the audience",
        body: "Use an event audience, current customer filters or supported CSV input.",
      },
      {
        title: "Create and review",
        body: "Build rich email content or submit the required WhatsApp template workflow.",
      },
      {
        title: "Send and measure",
        body: "Deliver immediately or on a schedule, then review engagement and attributed sales.",
      },
    ],
    narrative: {
      pullQuote:
        "A campaign is more useful when the event, audience and result stay connected.",
      paragraphs: [
        "Exporting customer data into a separate campaign tool removes the context that made the audience useful. Hoizr keeps supported outreach connected to the organiser's event workflow.",
        "The current product covers email and WhatsApp. SMS, push and advanced reusable segmentation remain clearly labelled Coming Soon.",
      ],
    },
    faq: [
      {
        q: "Which campaign channels are current?",
        a: "Email and WhatsApp campaigns are current. SMS and push must be shown only as Coming Soon.",
      },
      {
        q: "Can campaigns be scheduled?",
        a: "Yes. Current flows support immediate and scheduled delivery.",
      },
      {
        q: "Can I see sales attributed to a campaign?",
        a: "Yes, where the current attribution flow connects resulting orders to the campaign.",
      },
    ],
  },
  "guestlists-collaboration": {
    slug: "guestlists-collaboration",
    label: "Guestlists, Collaborators & Teams",
    pillarId: "ops",
    pillarLabel: "Run Events",
    hero: {
      eyebrow: "Run Events",
      headline: "Give every contributor control without losing oversight.",
      body:
        "Guestlists, collaborators and team permissions become difficult to audit when they live in chats and sheets. Hoizr uses defined lists, invite links, approvals, roles and event-level capabilities.",
      bullets: [
        "Owner, collaborator and lineup-artist guestlists",
        "Private and public invite links with contributor caps",
        "Approvals, revocation, golden passes, search and export",
        "Collaborator permissions plus organisation team roles",
      ],
    },
    benefits: [
      {
        title: "Replace chat-based guestlist hand-offs.",
        body:
          "Defined contributors and invite links keep guest access connected to the event.",
      },
      {
        title: "Control who can add and approve.",
        body:
          "Caps, approvals, revocation and permissions preserve organiser oversight.",
      },
      {
        title: "Give teams access by responsibility.",
        body:
          "Organisation roles and granular permissions reduce the need to share one account.",
      },
    ],
    howItWorks: [
      {
        title: "Create the contributor structure",
        body: "Choose owner, collaborator or lineup-artist guestlist responsibility.",
      },
      {
        title: "Set access and limits",
        body: "Configure invite visibility, caps, approvals and relevant permissions.",
      },
      {
        title: "Review the live list",
        body: "Search, filter, inspect history, revoke access or export supported guest data.",
      },
    ],
    narrative: {
      pullQuote:
        "Collaboration should widen the team, not widen the risk.",
      paragraphs: [
        "An event can involve promoters, artists, managers and door staff before a customer arrives. Hoizr separates their responsibilities through guestlist and permission controls.",
        "The current product does not promise direct invitation sending, waitlists or +1 management. Those remain part of the clearly labelled future roadmap.",
      ],
    },
    faq: [
      {
        q: "Can collaborators manage their own guestlists?",
        a: "Yes, within the permissions and caps configured by the organiser.",
      },
      {
        q: "Can I approve or revoke guest entries?",
        a: "Yes. Current guestlist controls include approval and revocation.",
      },
      {
        q: "Does Hoizr currently send guest invitations or manage +1s?",
        a: "No. Direct invitation sending, waitlists and +1s are Coming Soon.",
      },
    ],
  },
  "door-scanning": {
    slug: "door-scanning",
    label: "Door Scanning & Event Operations",
    pillarId: "ops",
    pillarLabel: "Run Events",
    hero: {
      eyebrow: "Run Events",
      headline: "Keep the queue moving without losing control of entry.",
      body:
        "Door teams need fast validation even when connectivity is weak and several scanners are active. Hoizr provisions named scanner access and validates paid, offline-issued and guestlist tickets online or offline.",
      bullets: [
        "Named scanner users with controlled access codes",
        "Online and offline QR validation",
        "Duplicate, refunded, invalid, wrong-event and wrong-day protection",
        "Multi-day entry, scan history, attribution and check-in reversal",
      ],
    },
    benefits: [
      {
        title: "Give each scanner accountable access.",
        body:
          "Named users and revocable codes avoid one shared credential across the door team.",
      },
      {
        title: "Keep validating through weak connectivity.",
        body:
          "Offline validation supports the door workflow when the network is unreliable.",
      },
      {
        title: "See what happened at entry.",
        body:
          "Scan history, scanner attribution and reversal controls provide an operational record.",
      },
    ],
    howItWorks: [
      {
        title: "Provision the scanner team",
        body: "Create named scanner users and issue controlled access codes.",
      },
      {
        title: "Validate every supported ticket route",
        body: "Scan paid, offline-issued and guestlist QR codes online or offline.",
      },
      {
        title: "Review arrivals and exceptions",
        body: "Monitor live arrival context, duplicates, invalid attempts and check-in history.",
      },
    ],
    narrative: {
      pullQuote:
        "Fast entry still needs a clear record of who scanned what and when.",
      paragraphs: [
        "A door team works under time pressure, and validation rules must stay consistent across devices. Hoizr applies event, ticket-status and day checks to supported QR routes.",
        "When an exception happens, organisers can review scanner attribution and check-in history instead of relying on memory at the end of the night.",
      ],
    },
    faq: [
      {
        q: "Can scanners work offline?",
        a: "Yes. The current scanner flow supports offline QR validation.",
      },
      {
        q: "Which tickets can be validated?",
        a: "Current validation covers paid, supported offline-issued and guestlist tickets.",
      },
      {
        q: "Can a check-in be reversed?",
        a: "Yes, with the current reversal control and resulting scan history.",
      },
    ],
  },
  "reports-settlements": {
    slug: "reports-settlements",
    label: "Reports, Settlements & Event Intelligence",
    pillarId: "ops",
    pillarLabel: "Run Events",
    hero: {
      eyebrow: "Run Events",
      headline: "Understand the event before the next one starts.",
      body:
        "Sales, attendance, campaigns, refunds and payouts lose value when reviewed in separate reports. Hoizr brings event performance, operations, automations, feedback and settlement history into one reporting layer.",
      bullets: [
        "Sales, orders, tickets, refunds, discounts and add-on reporting",
        "Campaign, audience, automation, guestlist and check-in reporting",
        "Event comparison, booking-funnel context and rule-based insights",
        "Payout verification, settlement history and downloadable statements",
      ],
    },
    benefits: [
      {
        title: "Review the whole event, not one department.",
        body:
          "Commercial, campaign and door activity can be read together after the event.",
      },
      {
        title: "Turn live signals into action.",
        body:
          "Current selling-fast and abandoned-cart automations use event activity without claiming unavailable predictive AI.",
      },
      {
        title: "Keep payout history visible.",
        body:
          "Verification status, settlement records and downloadable statements support finance follow-up.",
      },
    ],
    howItWorks: [
      {
        title: "Track performance while sales are live",
        body: "Review sales, funnel, audience and supported operational signals.",
      },
      {
        title: "Close the event with complete context",
        body: "Compare orders, attendance, guestlists, refunds, campaigns and feedback.",
      },
      {
        title: "Review settlement history",
        body: "Inspect payout-account status, settlements and downloadable statements.",
      },
    ],
    narrative: {
      pullQuote:
        "The post-event report should make the next decision easier.",
      paragraphs: [
        "A sales report alone cannot explain whether customers arrived, which campaign contributed or how guestlist activity affected the room. Hoizr connects the current reporting surfaces around the event.",
        "Predicted sellout and rule-based insights must be described conservatively. The unavailable payout-invoice library must not appear as a current feature.",
      ],
    },
    faq: [
      {
        q: "Can I download settlement statements?",
        a: "Yes. Current settlement history includes downloadable statements.",
      },
      {
        q: "Does reporting include campaigns and check-ins?",
        a: "Yes. Current reporting covers supported campaign, audience, check-in, guestlist and offline-sales activity.",
      },
      {
        q: "Is the payout-invoice library available?",
        a: "No. It must not be presented as current.",
      },
    ],
  },
};

const missingContent = ALL_PRODUCTS.filter((product) => !PRODUCT_CONTENT[product.slug]);

if (missingContent.length > 0) {
  throw new Error(
    `Missing marketing content for: ${missingContent.map((product) => product.slug).join(", ")}`
  );
}

export const getProductContent = (slug: string): ProductContent | null =>
  PRODUCT_CONTENT[slug] ?? null;

export const getRelatedProducts = (
  slug: string,
  limit = 3
): MarketingProduct[] => {
  const pillar = MARKETING_PILLARS.find((pl) =>
    pl.products.some((p) => p.slug === slug)
  );
  if (!pillar) return [];
  return pillar.products.filter((p) => p.slug !== slug).slice(0, limit);
};
