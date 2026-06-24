# Hoizr Public Site Product and Content Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Hoizr's public organiser-site future-state claims with an accurate, outcome-led sales experience covering the homepage, product architecture, How It Works, navigation, Book a Demo, redirects, SEO and production verification.

**Architecture:** Keep the existing App Router marketing shell and visual design system. Replace the marketing catalogue with a typed current-product source of truth plus a separate Coming Soon list, then drive navigation, footer, product hub, product pages, sitemap and structured data from those exports. Build the homepage from focused outcome-based sections, preserve the current hero composition, and update its dashboard image through a temporary screenshot-only data path that is removed before completion.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Framer Motion, Next metadata/redirect APIs, Node test runner, Playwright through the Codex browser plugin, Zcal iframe.

---

## Working-Tree Guardrails

The following deletions pre-exist this plan and belong to the user:

```text
assets/login/cafe.jpg
assets/login/man.jpg
assets/login/pub.jpg
assets/payments/stripe.png
```

Do not restore, stage or commit them. Before every commit, run:

```bash
git status --short
git diff --cached --name-only
```

Only files named in the active task may be staged.

## File Structure

### Marketing data

- `components/marketing/data/nav-products.ts` — current products, four outcome pillars and Coming Soon cards.
- `components/marketing/data/product-content.ts` — complete sales content for the eight current products.
- `components/marketing/data/site-copy.ts` — shared homepage event formats, workflow, comparison, free-access and FAQ copy.
- `components/marketing/data/legacy-product-routes.ts` — old-product redirect map used by tests and mirrored in Next configuration.

### Homepage sections

- `components/marketing/sections/EventFormats.tsx`
- `components/marketing/sections/ProblemStatement.tsx`
- `components/marketing/sections/OutcomePillars.tsx`
- `components/marketing/sections/PlatformComparison.tsx`
- `components/marketing/sections/HowHoizrWorks.tsx`
- `components/marketing/sections/CurrentPlatform.tsx`
- `components/marketing/sections/AiSupport.tsx`
- `components/marketing/sections/FreeAccess.tsx`
- `components/marketing/sections/ComingSoonBento.tsx`

Each section owns one narrative job. `app/page.tsx` only composes sections.

### Shared marketing surfaces

- `components/marketing/MarketingNav.tsx`
- `components/marketing/MarketingFooter.tsx`
- `components/marketing/sections/Hero.tsx`
- `components/marketing/sections/Beliefs.tsx`
- `components/marketing/sections/FAQ.tsx`
- `components/marketing/sections/FinalCTA.tsx`

### Product pages

- `app/product/page.tsx`
- `app/product/[slug]/page.tsx`
- `components/marketing/product/ProductHero.tsx`
- `components/marketing/product/ProductVisual.tsx`
- `components/marketing/product/product-story-images.ts`
- existing product section components, adjusted only where needed for the new content shape.

### Supporting pages and routing

- `app/how-it-works/page.tsx`
- `app/book-a-demo/page.tsx`
- `next.config.mjs`
- `app/sitemap.ts`
- `app/robots.ts`
- `components/marketing/seo/SchemaJsonLd.tsx`

### Verification

- `scripts/marketing-site-contract.test.mjs` — fast source/route/content contract checks.
- `public/images/playbooks/Event-management-dashboard-overview.png` — replacement screenshot.

---

### Task 1: Add the marketing-site contract test

**Files:**
- Create: `scripts/marketing-site-contract.test.mjs`
- Modify: `package.json`
- Test: `scripts/marketing-site-contract.test.mjs`

- [ ] **Step 1: Write the failing source contract**

Create `scripts/marketing-site-contract.test.mjs`:

```js
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
```

- [ ] **Step 2: Add the test command**

Add this script to `package.json`:

```json
"test:marketing": "node --test scripts/marketing-site-contract.test.mjs"
```

The scripts block must include:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "codegen": "graphql-codegen --config codegen.yml",
  "blurhash": "node scripts/generate-blurhashes.mjs",
  "test:marketing": "node --test scripts/marketing-site-contract.test.mjs",
  "prebuild": "node scripts/generate-blurhashes.mjs",
  "predev": "node scripts/generate-blurhashes.mjs"
}
```

- [ ] **Step 3: Run the test and verify it fails**

Run:

```bash
yarn test:marketing
```

Expected: FAIL because the new catalogue, demo page, redirects and CTA language do not exist yet.

- [ ] **Step 4: Commit the test**

```bash
git add package.json scripts/marketing-site-contract.test.mjs
git commit -m "test(marketing): define public site content contract"
```

---

### Task 2: Replace the product catalogue with current and Coming Soon data

**Files:**
- Modify: `components/marketing/data/nav-products.ts`
- Create: `components/marketing/data/site-copy.ts`
- Test: `scripts/marketing-site-contract.test.mjs`

- [ ] **Step 1: Replace the catalogue types**

Use these interfaces in `components/marketing/data/nav-products.ts`:

```ts
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
```

- [ ] **Step 2: Define the four approved pillars**

Replace `MARKETING_PILLARS` with:

```ts
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
```

- [ ] **Step 3: Define the Coming Soon list**

Append:

```ts
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
```

- [ ] **Step 4: Add shared homepage copy**

Create `components/marketing/data/site-copy.ts`:

```ts
export const EVENT_FORMATS = [
  "Parties & club nights",
  "Concerts & live music",
  "Festivals",
  "Comedy",
  "Free & RSVP events",
  "Exclusive & non-exclusive events",
] as const;

export const ORGANISER_PROBLEMS = [
  "Ticketing lives in one place while campaigns and customer data live somewhere else.",
  "Guestlists move through chats and sheets, leaving the door team to reconcile the mess.",
  "The event ends, but the audience insight needed for the next event is scattered or lost.",
] as const;

export const PLATFORM_COMPARISON = [
  {
    alternative: "Focuses on publishing inventory",
    hoizr: "Connects publishing, sales, audience and operations",
  },
  {
    alternative: "Customer data ends at the transaction",
    hoizr: "Builds an organiser-owned audience record",
  },
  {
    alternative: "Marketing runs in a disconnected tool",
    hoizr: "Campaigns use event and customer context",
  },
  {
    alternative: "Door activity stays separate",
    hoizr: "Guestlists, scanning and event reporting connect",
  },
] as const;

export const ORGANISER_JOURNEY = [
  {
    title: "Create your organisation",
    body: "Set up the public brand, operating details, team access and payout profile once.",
  },
  {
    title: "Build the event",
    body: "Add the format, venue, dates, lineup, tickets, extras, policies and collaborators.",
  },
  {
    title: "Publish and start selling",
    body: "Complete the readiness checks, review event context and publish the customer-facing page.",
  },
  {
    title: "Reach your audience",
    body: "Run email and WhatsApp campaigns using event and customer context.",
  },
  {
    title: "Manage guestlists and entry",
    body: "Control guest approvals, scanner access and ticket validation from the same event.",
  },
  {
    title: "Review performance and settlements",
    body: "See sales, attendance, campaigns, refunds and settlement-ready numbers.",
  },
  {
    title: "Build the next event from the last one",
    body: "Use customer and event history to start the next campaign with better context.",
  },
] as const;

export const FREE_ACCESS_POINTS = [
  "Free signup",
  "No setup fee",
  "No subscription",
  "No card details required",
] as const;
```

- [ ] **Step 5: Run the focused contract test**

Run:

```bash
yarn test:marketing
```

Expected: the catalogue test passes; CTA, demo, redirects and prohibited-copy tests still fail.

- [ ] **Step 6: Commit**

```bash
git add components/marketing/data/nav-products.ts components/marketing/data/site-copy.ts
git commit -m "refactor(marketing): align product catalogue with current platform"
```

---

### Task 3: Rewrite the eight current product content records

**Files:**
- Modify: `components/marketing/data/product-content.ts`
- Modify: `components/marketing/product/ProductVisual.tsx`
- Modify: `components/marketing/product/product-story-images.ts`
- Test: `scripts/marketing-site-contract.test.mjs`

- [ ] **Step 1: Remove fallback-generated marketing claims**

Delete `fallbackContent` and require explicit content for every `ALL_PRODUCTS`
entry. Use this lookup:

```ts
export const getProductContent = (slug: string): ProductContent | null =>
  PRODUCT_CONTENT[slug] ?? null;
```

Add a module-level consistency assertion usable during development:

```ts
const missingContent = ALL_PRODUCTS.filter(
  (product) => !PRODUCT_CONTENT[product.slug]
);

if (missingContent.length > 0) {
  throw new Error(
    `Missing marketing content for: ${missingContent
      .map((product) => product.slug)
      .join(", ")}`
  );
}
```

- [ ] **Step 2: Use the approved explicit content shape**

Keep `ProductContent`, but define:

```ts
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
};
```

Add the seven remaining records with the following exact content. Preserve the
same `ProductContent` shape used by `event-discovery`.

#### `event-ticketing`

- Hero headline: `Sell the event the way it is actually designed.`
- Hero body: `Generic ticket forms flatten free, RSVP, exclusive, multi-day and tiered events into the same flow. Hoizr lets you configure the format, ticket ladder, access rules, extras and checkout from one event record.`
- Hero bullets:
  - `Free, RSVP, exclusive and non-exclusive event formats`
  - `Ticket tiers, categories, admission types and sale windows`
  - `Single-day, multi-day, day-specific and all-days access`
  - `Add-ons, promo codes, payment recovery and publish-time event evaluation`
- Benefits:
  - `Match the ticket setup to the event.` — `Build ticket categories, inventory limits and access rules around how the event will actually run.`
  - `Protect inventory while customers decide.` — `Temporary cart reservation and defined sale windows reduce avoidable overselling and checkout confusion.`
  - `Make readiness visible before launch.` — `Publishing controls and event evaluation help the team catch incomplete event context before customers see it.`
- Workflow:
  - `Choose the event format` — `Set whether the event is free, RSVP, exclusive or open to the public.`
  - `Build the ticket ladder` — `Configure tiers, dates, quantities, limits, add-ons and promo codes.`
  - `Publish and manage checkout` — `Open sales, monitor orders and recover supported incomplete-payment journeys.`
- Narrative pull quote: `The checkout should reflect the event — not force the event into a generic checkout.`
- Narrative paragraphs:
  - `A weekend festival, a members-only party and a free RSVP night do not need the same ticket structure. Hoizr keeps format, access and inventory decisions inside the event setup.`
  - `That same record powers the customer-facing offer and the order created after checkout, reducing the gaps that appear when ticket rules are rebuilt across tools.`
- FAQs:
  - `Can I run free or RSVP events?` — `Yes. Hoizr supports free and RSVP formats alongside paid events.`
  - `Can a multi-day event have day-specific tickets?` — `Yes. Supported setups can include day-specific access and all-days passes.`
  - `Does Hoizr support promo codes and add-ons?` — `Yes. Current event setup includes promo-code and add-on controls.`

#### `offline-ticketing`

- Hero headline: `Keep door sales and payment links inside the real order book.`
- Hero body: `Cash sales and manual payment collection often create inventory and reporting gaps. Hoizr creates real orders for offline issuing and payment links, with the same ticket, QR and customer communication path used by online sales.`
- Hero bullets:
  - `Cash and other supported offline-payment issuing`
  - `Payment links with ticket and add-on selection`
  - `Customer details and collaborator issuing permissions`
  - `Order, inventory, QR, communication and reporting parity`
- Benefits:
  - `Stop reconciling door sales by hand.` — `Offline-issued tickets update the event's order and inventory records instead of living in a separate sheet.`
  - `Collect remote payments without creating fake orders.` — `Payment links preserve the selected tickets, extras and customer details in the Hoizr order flow.`
  - `Delegate issuing without opening the whole workspace.` — `Collaborator permissions control who can create supported offline orders.`
- Workflow:
  - `Select the event inventory` — `Choose the ticket types and add-ons being sold.`
  - `Record the customer and payment route` — `Issue against an offline method or create a payment link.`
  - `Track the real order` — `Use the resulting order, QR, status and reporting alongside online sales.`
- Narrative pull quote: `A sale at the door is still an event sale. Its data should not disappear at the door.`
- Narrative paragraphs:
  - `Manual sales become expensive later when the organiser has to rebuild customer records, remaining inventory and event totals. Hoizr keeps supported offline sales inside the event system.`
  - `The customer receives a real ticket path, while the organiser keeps the order status and event reporting needed after doors close.`
- FAQs:
  - `Can collaborators issue offline tickets?` — `Yes, when the organiser grants the relevant issuing permission.`
  - `Do offline-issued tickets receive QR codes?` — `Yes. Supported offline orders follow the event's ticket and QR flow.`
  - `Can I see offline orders in reports?` — `Yes. Offline-order status and sales reporting are part of the current scope.`

#### `audience-management`

- Hero headline: `Know who bought, who attended and who came back.`
- Hero body: `A ticket transaction without customer context does not help the next event. Hoizr connects contact, purchase, attendance and spending history to an organiser-owned customer record.`
- Hero bullets:
  - `Organiser-owned customer list with contact context`
  - `Purchase, attendance and spending history`
  - `Customer order drill-down and campaign audiences`
  - `Consent, unsubscribe handling and supported CSV audience input`
- Benefits:
  - `Keep the relationship after checkout.` — `Customer records remain useful after one order, giving the organiser context for the next event.`
  - `Move from totals to people.` — `Order and attendance drill-down shows the customer activity behind headline sales numbers.`
  - `Build campaigns from current data.` — `Supported campaign audiences use customer and event context without claiming unavailable tags or saved segments.`
- Workflow:
  - `Capture customer activity` — `Orders, attendance and supported campaign activity contribute to the organiser view.`
  - `Review the customer record` — `Inspect contact information, order history and attendance context.`
  - `Use the audience responsibly` — `Select supported audiences while respecting consent and unsubscribe state.`
- Narrative pull quote: `The value of an event audience starts after the first transaction.`
- Narrative paragraphs:
  - `Most organisers can see how many tickets sold. The harder question is who bought, who arrived and whether the same customer returned. Hoizr connects those signals to the organiser's event history.`
  - `That record gives campaigns and event reviews more useful context without presenting manual CRM records, customer tags, saved segments or lifetime-value modelling as current.`
- FAQs:
  - `Who owns the customer relationship?` — `The organiser can access the customer records generated through their Hoizr events, subject to consent and platform terms.`
  - `Can I inspect a customer's orders?` — `Yes. Current customer management includes order drill-down.`
  - `Does Hoizr currently provide CRM tags or lifetime-value scoring?` — `No. Those capabilities must not be presented as current.`

#### `marketing-campaigns`

- Hero headline: `Reach the audience with context, not another flat blast.`
- Hero body: `Disconnected campaign tools cannot easily use event, purchase and attendance context. Hoizr lets organisers build email and WhatsApp campaigns around current customer and event data, then review engagement and attributed sales.`
- Hero bullets:
  - `Rich email creation plus approved-template WhatsApp campaigns`
  - `Immediate and scheduled delivery`
  - `Event, customer-filter and supported CSV audiences`
  - `Delivery, engagement and attributed-sales reporting`
- Benefits:
  - `Start from the event context.` — `Campaign creation stays close to the event and customer records the organiser is already using.`
  - `Use the right supported channel.` — `Email and approved WhatsApp templates cover current outreach without advertising SMS or push as live.`
  - `Connect response to sales.` — `Delivery, engagement and attributed-order reporting show more than send volume alone.`
- Workflow:
  - `Choose the audience` — `Use an event audience, current customer filters or supported CSV input.`
  - `Create and review` — `Build rich email content or submit the required WhatsApp template workflow.`
  - `Send and measure` — `Deliver immediately or on a schedule, then review engagement and attributed sales.`
- Narrative pull quote: `A campaign is more useful when the event, audience and result stay connected.`
- Narrative paragraphs:
  - `Exporting customer data into a separate campaign tool removes the context that made the audience useful. Hoizr keeps supported outreach connected to the organiser's event workflow.`
  - `The current product covers email and WhatsApp. SMS, push and advanced reusable segmentation remain clearly labelled Coming Soon.`
- FAQs:
  - `Which campaign channels are current?` — `Email and WhatsApp campaigns are current. SMS and push must be shown only as Coming Soon.`
  - `Can campaigns be scheduled?` — `Yes. Current flows support immediate and scheduled delivery.`
  - `Can I see sales attributed to a campaign?` — `Yes, where the current attribution flow connects resulting orders to the campaign.`

#### `guestlists-collaboration`

- Hero headline: `Give every contributor control without losing oversight.`
- Hero body: `Guestlists, collaborators and team permissions become difficult to audit when they live in chats and sheets. Hoizr uses defined lists, invite links, approvals, roles and event-level capabilities.`
- Hero bullets:
  - `Owner, collaborator and lineup-artist guestlists`
  - `Private and public invite links with contributor caps`
  - `Approvals, revocation, golden passes, search and export`
  - `Collaborator permissions plus organisation team roles`
- Benefits:
  - `Replace chat-based guestlist hand-offs.` — `Defined contributors and invite links keep guest access connected to the event.`
  - `Control who can add and approve.` — `Caps, approvals, revocation and permissions preserve organiser oversight.`
  - `Give teams access by responsibility.` — `Organisation roles and granular permissions reduce the need to share one account.`
- Workflow:
  - `Create the contributor structure` — `Choose owner, collaborator or lineup-artist guestlist responsibility.`
  - `Set access and limits` — `Configure invite visibility, caps, approvals and relevant permissions.`
  - `Review the live list` — `Search, filter, inspect history, revoke access or export supported guest data.`
- Narrative pull quote: `Collaboration should widen the team, not widen the risk.`
- Narrative paragraphs:
  - `An event can involve promoters, artists, managers and door staff before a customer arrives. Hoizr separates their responsibilities through guestlist and permission controls.`
  - `The current product does not promise direct invitation sending, waitlists or +1 management. Those remain part of the clearly labelled future roadmap.`
- FAQs:
  - `Can collaborators manage their own guestlists?` — `Yes, within the permissions and caps configured by the organiser.`
  - `Can I approve or revoke guest entries?` — `Yes. Current guestlist controls include approval and revocation.`
  - `Does Hoizr currently send guest invitations or manage +1s?` — `No. Direct invitation sending, waitlists and +1s are Coming Soon.`

#### `door-scanning`

- Hero headline: `Keep the queue moving without losing control of entry.`
- Hero body: `Door teams need fast validation even when connectivity is weak and several scanners are active. Hoizr provisions named scanner access and validates paid, offline-issued and guestlist tickets online or offline.`
- Hero bullets:
  - `Named scanner users with controlled access codes`
  - `Online and offline QR validation`
  - `Duplicate, refunded, invalid, wrong-event and wrong-day protection`
  - `Multi-day entry, scan history, attribution and check-in reversal`
- Benefits:
  - `Give each scanner accountable access.` — `Named users and revocable codes avoid one shared credential across the door team.`
  - `Keep validating through weak connectivity.` — `Offline validation supports the door workflow when the network is unreliable.`
  - `See what happened at entry.` — `Scan history, scanner attribution and reversal controls provide an operational record.`
- Workflow:
  - `Provision the scanner team` — `Create named scanner users and issue controlled access codes.`
  - `Validate every supported ticket route` — `Scan paid, offline-issued and guestlist QR codes online or offline.`
  - `Review arrivals and exceptions` — `Monitor live arrival context, duplicates, invalid attempts and check-in history.`
- Narrative pull quote: `Fast entry still needs a clear record of who scanned what and when.`
- Narrative paragraphs:
  - `A door team works under time pressure, and validation rules must stay consistent across devices. Hoizr applies event, ticket-status and day checks to supported QR routes.`
  - `When an exception happens, organisers can review scanner attribution and check-in history instead of relying on memory at the end of the night.`
- FAQs:
  - `Can scanners work offline?` — `Yes. The current scanner flow supports offline QR validation.`
  - `Which tickets can be validated?` — `Current validation covers paid, supported offline-issued and guestlist tickets.`
  - `Can a check-in be reversed?` — `Yes, with the current reversal control and resulting scan history.`

#### `reports-settlements`

- Hero headline: `Understand the event before the next one starts.`
- Hero body: `Sales, attendance, campaigns, refunds and payouts lose value when reviewed in separate reports. Hoizr brings event performance, operations, automations, feedback and settlement history into one reporting layer.`
- Hero bullets:
  - `Sales, orders, tickets, refunds, discounts and add-on reporting`
  - `Campaign, audience, automation, guestlist and check-in reporting`
  - `Event comparison, booking-funnel context and rule-based insights`
  - `Payout verification, settlement history and downloadable statements`
- Benefits:
  - `Review the whole event, not one department.` — `Commercial, campaign and door activity can be read together after the event.`
  - `Turn live signals into action.` — `Current selling-fast and abandoned-cart automations use event activity without claiming unavailable predictive AI.`
  - `Keep payout history visible.` — `Verification status, settlement records and downloadable statements support finance follow-up.`
- Workflow:
  - `Track performance while sales are live` — `Review sales, funnel, audience and supported operational signals.`
  - `Close the event with complete context` — `Compare orders, attendance, guestlists, refunds, campaigns and feedback.`
  - `Review settlement history` — `Inspect payout-account status, settlements and downloadable statements.`
- Narrative pull quote: `The post-event report should make the next decision easier.`
- Narrative paragraphs:
  - `A sales report alone cannot explain whether customers arrived, which campaign contributed or how guestlist activity affected the room. Hoizr connects the current reporting surfaces around the event.`
  - `Predicted sellout and rule-based insights must be described conservatively. The unavailable payout-invoice library must not appear as a current feature.`
- FAQs:
  - `Can I download settlement statements?` — `Yes. Current settlement history includes downloadable statements.`
  - `Does reporting include campaigns and check-ins?` — `Yes. Current reporting covers supported campaign, audience, check-in, guestlist and offline-sales activity.`
  - `Is the payout-invoice library available?` — `No. It must not be presented as current.`

- [ ] **Step 3: Map new slugs to accurate visuals**

Replace both visual maps with:

```ts
export const PRODUCT_STORY_IMAGES: Record<string, string> = {
  "event-discovery": "/marketing/product/EventMarketplaceInsta.png",
  "event-ticketing": "/marketing/product/eventListingnew.png",
  "offline-ticketing": "/marketing/brand/hoizr-product-growth-control.png",
  "audience-management": "/marketing/brand/light-fan-network.png",
  "marketing-campaigns": "/marketing/product/Owned-channel-outreach-campaign.png",
  "guestlists-collaboration":
    "/images/hero/%20Guestlist-Management-home-Run-your-events.png",
  "door-scanning": "/images/hero/Door-Scanning-hero-run-your-event.png",
  "reports-settlements":
    "/marketing/brand/hoizr-product-operations-door.png",
};
```

`ProductVisual.tsx` should import and call `getProductStoryImageSrc(slug)`, with
`/marketing/brand/metallic-line-portrait.png` as the only fallback. Remove all
legacy slug maps.

- [ ] **Step 4: Run type and contract checks**

Run:

```bash
yarn test:marketing
yarn tsc --noEmit --pretty false
```

Expected: product consistency compiles; catalogue test passes; later route/CTA tests may still fail.

- [ ] **Step 5: Commit**

```bash
git add components/marketing/data/product-content.ts components/marketing/product/ProductVisual.tsx components/marketing/product/product-story-images.ts
git commit -m "feat(marketing): rewrite current product sales content"
```

---

### Task 4: Update product pages and add the Coming Soon hub

**Files:**
- Modify: `app/product/page.tsx`
- Modify: `app/product/[slug]/page.tsx`
- Modify: `components/marketing/product/ProductHero.tsx`
- Modify: `components/marketing/product/ProductRelated.tsx`
- Create: `components/marketing/sections/ComingSoonBento.tsx`
- Test: `scripts/marketing-site-contract.test.mjs`

- [ ] **Step 1: Build the reusable Coming Soon bento**

Create `components/marketing/sections/ComingSoonBento.tsx`:

```tsx
"use client";

import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { COMING_SOON_PRODUCTS } from "../data/nav-products";

export const ComingSoonBento = () => (
  <section id="coming-soon" className="hm-section scroll-mt-24">
    <div className="max-w-[760px]">
      <div className="hm-eyebrow">Coming Soon</div>
      <h2 className="hm-h2 mt-3">The next layer of audience and event tools.</h2>
      <p className="hm-lead mt-5 max-w-[620px]">
        These capabilities are not available in the organiser workspace yet.
        Book a guided tour if you want to understand the roadmap and where they
        fit.
      </p>
    </div>

    <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {COMING_SOON_PRODUCTS.map((product, index) => (
        <article
          key={product.title}
          className={`rounded-[var(--m-r-lg)] border border-[var(--m-border)] p-6 ${
            index === 0
              ? "bg-[#080808] text-white md:col-span-2"
              : "bg-[var(--m-surface)] text-[var(--m-ink-1)]"
          }`}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-current/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] opacity-75">
            <Clock3 size={12} />
            Coming Soon
          </span>
          <h3 className="mt-5 text-[22px] font-semibold leading-tight">
            {product.title}
          </h3>
          <p className={`mt-3 text-[14px] leading-6 ${index === 0 ? "text-white/72" : "text-[var(--m-ink-3)]"}`}>
            {product.body}
          </p>
          <Link
            href="/book-a-demo"
            className={`mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold ${
              index === 0 ? "text-[var(--m-acid)]" : "text-[var(--m-forest-700)]"
            }`}
          >
            Book a Demo <ArrowUpRight size={14} />
          </Link>
        </article>
      ))}
    </div>
  </section>
);
```

- [ ] **Step 2: Rewrite the product hub**

`app/product/page.tsx` must:

- describe the four outcomes;
- render only `MARKETING_PILLARS` current products;
- link every current card to `/product/${slug}`;
- render `<ComingSoonBento />` after current products;
- use metadata:

```ts
export const metadata: Metadata = {
  title: "Hoizr products for Indian event organisers",
  description:
    "Explore Hoizr ticketing, audience, campaign, guestlist, scanning, reporting and settlement tools for Indian event organisers.",
  alternates: { canonical: "/product" },
};
```

- [ ] **Step 3: Restrict generated product routes to current products**

Keep:

```ts
export function generateStaticParams() {
  return ALL_PRODUCTS.map((product) => ({ slug: product.slug }));
}
```

In `app/product/[slug]/page.tsx`, structured data and breadcrumbs must be created
only after `getProductContent` returns a current product.

- [ ] **Step 4: Update product CTAs**

In `ProductHero.tsx`, replace actions with:

```tsx
<Link href="/signup" className="hm-btn hm-btn-primary">
  <span>Get Started</span>
  <ArrowRight size={16} />
</Link>
<Link
  href="/book-a-demo"
  className="hm-btn hm-btn-ghost border border-[var(--m-border)]"
>
  <PlayCircle size={16} />
  Book a Demo
</Link>
```

- [ ] **Step 5: Verify product routes**

Run:

```bash
yarn test:marketing
yarn tsc --noEmit --pretty false
```

Expected: current product catalogue and CTA tests pass.

- [ ] **Step 6: Commit**

```bash
git add app/product/page.tsx 'app/product/[slug]/page.tsx' components/marketing/product/ProductHero.tsx components/marketing/product/ProductRelated.tsx components/marketing/sections/ComingSoonBento.tsx
git commit -m "feat(marketing): launch current product hub and coming-soon bento"
```

---

### Task 5: Rebuild the homepage as an outcome-led sales journey

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/marketing/sections/Hero.tsx`
- Create: `components/marketing/sections/EventFormats.tsx`
- Create: `components/marketing/sections/ProblemStatement.tsx`
- Create: `components/marketing/sections/OutcomePillars.tsx`
- Create: `components/marketing/sections/PlatformComparison.tsx`
- Create: `components/marketing/sections/HowHoizrWorks.tsx`
- Create: `components/marketing/sections/CurrentPlatform.tsx`
- Create: `components/marketing/sections/AiSupport.tsx`
- Create: `components/marketing/sections/FreeAccess.tsx`
- Modify: `components/marketing/sections/FinalCTA.tsx`
- Test: `scripts/marketing-site-contract.test.mjs`

- [ ] **Step 1: Update the hero copy and actions**

Keep the headline exactly:

```tsx
<span className="block">Fill the room.</span>
<span className="block text-[var(--m-forest-600)]">Keep the room.</span>
```

Use:

```tsx
<p className="hm-lead mx-auto mt-6 max-w-[680px]">
  Sell tickets, understand your audience and bring them back for the next
  event. Hoizr connects event publishing, ticketing, campaigns and event
  operations in one platform built for Indian event organisers.
</p>
```

Use these actions:

```tsx
<Link href="/signup" className="hm-btn hm-btn-primary">
  Get Started
  <ArrowRight size={16} />
</Link>
<Link
  href="/book-a-demo"
  className="hm-btn hm-btn-ghost border border-[var(--m-border)]"
>
  Book a Demo
</Link>
```

Add:

```tsx
<p className="mt-4 text-[13px] font-medium text-[var(--m-ink-3)]">
  Free signup. No setup fee. No subscription. No card details required.
</p>
```

- [ ] **Step 2: Build EventFormats**

Render `EVENT_FORMATS` as a restrained horizontal/wrapping list under the hero:

```tsx
export const EventFormats = () => (
  <section className="hm-section py-8 md:py-10">
    <p className="text-center text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--m-ink-4)]">
      Built for the events India goes out for
    </p>
    <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-3">
      {EVENT_FORMATS.map((format) => (
        <span key={format} className="text-[14px] font-semibold text-[var(--m-ink-2)]">
          {format}
        </span>
      ))}
    </div>
  </section>
);
```

- [ ] **Step 3: Build ProblemStatement**

Use headline:

```text
The event is one business. The tools should work like one.
```

Body:

```text
When ticketing, campaigns, customer records, guestlists and door operations
live in separate systems, organisers lose context between the first sale and
the next event.
```

Render `ORGANISER_PROBLEMS` in three cards.

- [ ] **Step 4: Build OutcomePillars and CurrentPlatform**

`OutcomePillars` renders the four `MARKETING_PILLARS` with outcome-first
headlines. `CurrentPlatform` renders all eight current products with a short
blurb and current-product links. Neither component may render Coming Soon
entries.

- [ ] **Step 5: Build PlatformComparison**

Render `PLATFORM_COMPARISON` with column labels:

```text
Listing-only or ticketing-only tools
Hoizr
```

On mobile, each comparison becomes a stacked card; do not use a horizontally
scrolling table.

- [ ] **Step 6: Build HowHoizrWorks**

Render all seven `ORGANISER_JOURNEY` steps. Use numbered cards and keep AI copy
only in step 3:

```text
Before a paid event is published, Hoizr can evaluate the event context and
surface the available event-specific options.
```

- [ ] **Step 7: Build AiSupport**

Use:

```text
AI where it removes work — not where it invents promises.
```

Current cards:

- Event evaluation before publishing
- Event-specific offer context where the current evaluation returns it
- Event-description generation
- Listing-quality, spelling and SEO suggestions
- Safe fallback when the configured AI service is unavailable

- [ ] **Step 8: Build FreeAccess**

Render `FREE_ACCESS_POINTS` with:

```text
Start building the event before a sales call.
```

Body:

```text
Create your Hoizr account, set up the organisation and begin drafting events
without a setup fee, subscription or card details.
```

CTA: `Get Started`.

- [ ] **Step 9: Update FinalCTA**

Headline:

```text
Build the audience for this event — and the next one.
```

Body:

```text
Publish, sell, engage and operate from one organiser platform built for India.
```

Actions:

- `Get Started` → `/signup`
- `Book a Demo` → `/book-a-demo`

- [ ] **Step 10: Compose the homepage**

`app/page.tsx` must render in this order:

```tsx
<MarketingShell>
  <Hero />
  <EventFormats />
  <ProblemStatement />
  <OutcomePillars />
  <PlatformComparison />
  <HowHoizrWorks />
  <CurrentPlatform />
  <AiSupport />
  <FreeAccess />
  <ComingSoonBento />
  <Beliefs />
  <FAQ />
  <FinalCTA />
</MarketingShell>
```

Remove `FounderQuoteBanner`, `FounderCard`, `PricingTeaserCards` and other
retired homepage-only imports.

- [ ] **Step 11: Run checks**

```bash
yarn test:marketing
yarn tsc --noEmit --pretty false
```

Expected: CTA and prohibited-copy tests pass.

- [ ] **Step 12: Commit**

```bash
git add app/page.tsx components/marketing/sections/Hero.tsx components/marketing/sections/EventFormats.tsx components/marketing/sections/ProblemStatement.tsx components/marketing/sections/OutcomePillars.tsx components/marketing/sections/PlatformComparison.tsx components/marketing/sections/HowHoizrWorks.tsx components/marketing/sections/CurrentPlatform.tsx components/marketing/sections/AiSupport.tsx components/marketing/sections/FreeAccess.tsx components/marketing/sections/FinalCTA.tsx
git commit -m "feat(marketing): rebuild homepage around organiser outcomes"
```

---

### Task 6: Rewrite Beliefs and FAQ without founder or pricing claims

**Files:**
- Modify: `components/marketing/sections/Beliefs.tsx`
- Modify: `components/marketing/sections/FAQ.tsx`
- Test: `scripts/marketing-site-contract.test.mjs`

- [ ] **Step 1: Replace beliefs**

Use three beliefs:

```ts
const BELIEFS = [
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
] as const;
```

Remove `signoff`, founder photo and founder-specific rendering.

- [ ] **Step 2: Replace FAQ items**

Use these eight questions:

```ts
const ITEMS = [
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
] as const;
```

Change the sidebar prompt to link to `/book-a-demo`.

- [ ] **Step 3: Verify**

```bash
yarn test:marketing
yarn tsc --noEmit --pretty false
```

Expected: prohibited claim test passes.

- [ ] **Step 4: Commit**

```bash
git add components/marketing/sections/Beliefs.tsx components/marketing/sections/FAQ.tsx
git commit -m "fix(marketing): align beliefs and faq with current product"
```

---

### Task 7: Update navigation and footer

**Files:**
- Modify: `components/marketing/MarketingNav.tsx`
- Modify: `components/marketing/MarketingFooter.tsx`
- Test: `scripts/marketing-site-contract.test.mjs`

- [ ] **Step 1: Update desktop and mobile header links**

Header order:

```text
Products
How It Works
Resources
Book a Demo
Login
Get Started
```

Remove `Find Event` from the header. Add:

```tsx
<Link href="/book-a-demo">Book a Demo</Link>
```

Keep:

```tsx
<Link href="/signup" className="hm-btn hm-btn-primary">
  Get Started
</Link>
```

- [ ] **Step 2: Restrict the product mega-menu**

Render `MARKETING_PILLARS` current products only. Add one footer row:

```tsx
<Link href="/product#coming-soon">
  See what is Coming Soon
</Link>
```

- [ ] **Step 3: Update footer**

Footer must include:

- all current product links from `MARKETING_PILLARS`;
- `/how-it-works`;
- `/resources`;
- `/book-a-demo`;
- `https://hoizr.com` labelled `Find Events`;
- `/login`;
- `/signup` labelled `Get Started`;
- existing legal and support links.

- [ ] **Step 4: Verify**

```bash
yarn test:marketing
yarn tsc --noEmit --pretty false
```

Expected: public CTA language test passes.

- [ ] **Step 5: Commit**

```bash
git add components/marketing/MarketingNav.tsx components/marketing/MarketingFooter.tsx
git commit -m "feat(marketing): update organiser navigation and ctas"
```

---

### Task 8: Add the Book a Demo page

**Files:**
- Create: `app/book-a-demo/page.tsx`
- Test: `scripts/marketing-site-contract.test.mjs`

- [ ] **Step 1: Create the page**

Use:

```tsx
import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";

const ZCAL_URL = "https://zcal.co/i/2wlfsHdI";
const ZCAL_EMBED_URL =
  "https://zcal.co/i/2wlfsHdI?embed=1&embedType=iframe";

export const metadata: Metadata = {
  title: "Book a Hoizr guided tour",
  description:
    "Book a guided tour of Hoizr's ticketing, audience, campaigns and event operations platform for Indian event organisers.",
  alternates: { canonical: "/book-a-demo" },
  openGraph: {
    title: "Book a Hoizr guided tour",
    description:
      "See how Hoizr supports ticket sales and customer engagement for Indian event organisers.",
    url: "/book-a-demo",
    type: "website",
    images: [
      {
        url: "/opengraph-image.webp",
        width: 1200,
        height: 630,
        alt: "Book a guided tour of Hoizr",
      },
    ],
  },
};

export default function BookADemoPage() {
  return (
    <MarketingShell>
      <section className="hm-section pt-12 md:pt-16">
        <div className="mx-auto max-w-[760px] text-center">
          <div className="hm-eyebrow">Book a Demo</div>
          <h1 className="hm-h1 mt-4">Take a Guided Tour.</h1>
          <p className="hm-lead mx-auto mt-5 max-w-[650px]">
            Take the first step towards boosting your ticket sales and customer
            engagement with Hoizr&apos;s all-in-one event platform.
          </p>
        </div>

        <div className="mx-auto mt-10 w-full max-w-[1096px] overflow-hidden rounded-[var(--m-r-xl)] border border-[var(--m-border)] bg-white shadow-[var(--m-shadow-card)]">
          <iframe
            src={ZCAL_EMBED_URL}
            title="Book a Hoizr guided product tour"
            loading="lazy"
            scrolling="no"
            className="block min-h-[779px] w-full min-w-[320px] border-0"
          />
        </div>

        <p className="mt-5 text-center text-[13px] text-[var(--m-ink-3)]">
          If the scheduler does not load,{" "}
          <a
            href={ZCAL_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-[var(--m-forest-700)]"
          >
            open the booking page <ExternalLink size={13} />
          </a>
          .
        </p>
      </section>
    </MarketingShell>
  );
}
```

- [ ] **Step 2: Run the demo contract**

```bash
yarn test:marketing
yarn tsc --noEmit --pretty false
```

Expected: Zcal test passes.

- [ ] **Step 3: Commit**

```bash
git add app/book-a-demo/page.tsx
git commit -m "feat(marketing): add zcal guided tour page"
```

---

### Task 9: Rewrite How It Works around the current seven-step journey

**Files:**
- Modify: `app/how-it-works/page.tsx`
- Test: `scripts/marketing-site-contract.test.mjs`

- [ ] **Step 1: Replace the workflow data**

Import `ORGANISER_JOURNEY` and map the seven steps to these existing Lucide
icons:

```ts
const journeyIcons = [
  Building2,
  CalendarPlus2,
  BadgeCheck,
  Send,
  ScanLine,
  ChartNoAxesCombined,
  RefreshCw,
] as const;
```

Keep team-role explanation only where it reflects current roles and
permissions.

- [ ] **Step 2: Remove unsupported sections**

Remove claims that AI currently:

- creates cross-channel audience filters;
- allocates campaign budgets;
- chooses channels;
- builds complete campaigns.

Remove promoter-code claims not backed by current collaborator and guestlist
flows.

- [ ] **Step 3: Use the approved page opening**

```text
From the first event draft to the report after doors close.
```

Supporting copy:

```text
Hoizr keeps event setup, ticket sales, audience engagement, guestlists, entry
and reporting connected so the next decision starts with the context from the
last one.
```

Actions:

- Get Started
- Book a Demo

- [ ] **Step 4: Update FAQ and structured data**

The HowTo JSON-LD must contain exactly the seven current `ORGANISER_JOURNEY`
steps. Its description must not mention future AI, SMS, push or loyalty
capabilities.

- [ ] **Step 5: Verify**

```bash
yarn test:marketing
yarn tsc --noEmit --pretty false
```

Expected: no prohibited-copy failures.

- [ ] **Step 6: Commit**

```bash
git add app/how-it-works/page.tsx
git commit -m "fix(marketing): align how-it-works with current organiser flow"
```

---

### Task 10: Add legacy redirects and correct SEO discovery

**Files:**
- Create: `components/marketing/data/legacy-product-routes.ts`
- Modify: `next.config.mjs`
- Modify: `app/sitemap.ts`
- Modify: `app/robots.ts`
- Modify: `components/marketing/seo/SchemaJsonLd.tsx`
- Test: `scripts/marketing-site-contract.test.mjs`

- [ ] **Step 0: Confirm the Next.js 14 APIs from current documentation**

Run outside the default sandbox:

```bash
npx ctx7@latest library Next.js "For Next.js 14.2.4 App Router, confirm the supported next.config.mjs redirects API, Metadata API canonical fields, sitemap.ts MetadataRoute.Sitemap shape, robots.ts MetadataRoute.Robots shape, and JSON-LD guidance."
```

Select the exact official Next.js result, preferring the `v14.2.4` ID when
available, then run `npx ctx7@latest docs` with that returned ID and the same
full question.

Apply the returned version-specific API guidance to this task. If Context7
returns a quota error, stop and ask the user to run `npx ctx7@latest login` or
configure `CONTEXT7_API_KEY`; do not guess from training data.

- [ ] **Step 1: Define the redirect source of truth**

Create:

```ts
export const LEGACY_CURRENT_PRODUCT_REDIRECTS = {
  "/product/event-marketplace": "/product/event-discovery",
  "/product/event-seo": "/product/event-discovery",
  "/product/organisation-page": "/product/event-discovery",
  "/product/listings-management": "/product/event-discovery",
  "/product/event-listing": "/product/event-ticketing",
  "/product/smart-upsells": "/product/event-ticketing",
  "/product/reviews-engine": "/product/reports-settlements",
  "/product/email-sms-marketing": "/product/marketing-campaigns",
  "/product/conversation-marketing": "/product/marketing-campaigns",
  "/product/guestlist-management": "/product/guestlists-collaboration",
  "/product/reporting-analytics": "/product/reports-settlements",
  "/product/automations": "/product/reports-settlements",
  "/product/ai-event-assistant": "/product/event-ticketing",
} as const;

export const LEGACY_COMING_SOON_REDIRECTS = [
  "/product/find-best-promoters",
  "/product/find-trending-artists",
  "/product/push-notifications",
  "/product/loyalty-rewards",
  "/product/ai-marketing-intelligence",
  "/product/competitive-analysis",
] as const;
```

- [ ] **Step 2: Add permanent Next redirects**

Because `next.config.mjs` cannot directly import the TypeScript map, mirror the
approved mappings explicitly:

```js
const currentProductRedirects = {
  "/product/event-marketplace": "/product/event-discovery",
  "/product/event-seo": "/product/event-discovery",
  "/product/organisation-page": "/product/event-discovery",
  "/product/listings-management": "/product/event-discovery",
  "/product/event-listing": "/product/event-ticketing",
  "/product/smart-upsells": "/product/event-ticketing",
  "/product/reviews-engine": "/product/reports-settlements",
  "/product/email-sms-marketing": "/product/marketing-campaigns",
  "/product/conversation-marketing": "/product/marketing-campaigns",
  "/product/guestlist-management": "/product/guestlists-collaboration",
  "/product/reporting-analytics": "/product/reports-settlements",
  "/product/automations": "/product/reports-settlements",
  "/product/ai-event-assistant": "/product/event-ticketing",
};

const comingSoonRedirects = [
  "/product/find-best-promoters",
  "/product/find-trending-artists",
  "/product/push-notifications",
  "/product/loyalty-rewards",
  "/product/ai-marketing-intelligence",
  "/product/competitive-analysis",
];
```

Return:

```js
[
  { source: "/pricing", destination: "/about", permanent: true },
  ...Object.entries(currentProductRedirects).map(([source, destination]) => ({
    source,
    destination,
    permanent: true,
  })),
  ...comingSoonRedirects.map((source) => ({
    source,
    destination: "/product#coming-soon",
    permanent: true,
  })),
]
```

- [ ] **Step 3: Update sitemap and robots**

Add `/book-a-demo` to `staticRoutes` with monthly frequency and `0.8` priority.
Continue generating product routes from `ALL_PRODUCTS` only.

Add `/book-a-demo` to `robots().rules[0].allow`.

- [ ] **Step 4: Restrict product structured data**

`ProductJsonLd` must receive only current `ProductContent`. Remove schema text
that promises fallback-generated availability, fees, unsupported AI or future
capabilities.

- [ ] **Step 5: Run tests**

```bash
yarn test:marketing
yarn tsc --noEmit --pretty false
```

Expected: all contract tests pass.

- [ ] **Step 6: Commit**

```bash
git add components/marketing/data/legacy-product-routes.ts next.config.mjs app/sitemap.ts app/robots.ts components/marketing/seo/SchemaJsonLd.tsx
git commit -m "feat(marketing): add product redirects and seo routes"
```

---

### Task 11: Replace the stale dashboard screenshot safely

**Files:**
- Temporarily modify: `app/(app)/dashboard/DashboardClient.tsx`
- Replace: `public/images/playbooks/Event-management-dashboard-overview.png`
- Do not commit temporary dashboard code

- [ ] **Step 1: Record the dashboard file state**

Run:

```bash
git diff -- 'app/(app)/dashboard/DashboardClient.tsx'
git status --short -- 'app/(app)/dashboard/DashboardClient.tsx'
```

Expected: no existing user changes in this file. If it is already modified,
stop and isolate the screenshot data without overwriting the user's work.

- [ ] **Step 2: Add a temporary screenshot constant**

At module scope, add:

```ts
const SCREENSHOT_MODE = true;

const screenshotSummary: HostDashboardSummary = {
  upcomingEventsCount: 4,
  publishedEventsCount: 3,
  draftEventsCount: 1,
  salesToday: 184500,
  ticketsSoldToday: 286,
  salesLast30Days: 1842600,
  ticketsSoldLast30Days: 1842,
  orderCountLast30Days: 1296,
  averageOrderValueLast30Days: 1421.76,
  pendingSettlementsCount: 2,
  paidOutLifetime: 6240000,
  marketingSubscribersCount: 12840,
  lifetimeCampaignMessagesSent: 58320,
  netTicketSales: 1842600,
  totalCollected: 1948200,
  salesSeries: [
    { date: "2026-06-17", label: "17 Jun", sales: 168000, tickets: 186, orderCount: 132 },
    { date: "2026-06-18", label: "18 Jun", sales: 214000, tickets: 218, orderCount: 154 },
    { date: "2026-06-19", label: "19 Jun", sales: 196000, tickets: 202, orderCount: 143 },
    { date: "2026-06-20", label: "20 Jun", sales: 286000, tickets: 294, orderCount: 207 },
    { date: "2026-06-21", label: "21 Jun", sales: 342000, tickets: 331, orderCount: 232 },
    { date: "2026-06-22", label: "22 Jun", sales: 318000, tickets: 325, orderCount: 229 },
    { date: "2026-06-23", label: "23 Jun", sales: 318600, tickets: 286, orderCount: 199 },
  ],
  salesBySource: [
    { label: "Direct", amount: 812000, count: 542, percent: 44 },
    { label: "Email", amount: 424000, count: 296, percent: 23 },
    { label: "WhatsApp", amount: 350000, count: 251, percent: 19 },
    { label: "Collaborators", amount: 256600, count: 207, percent: 14 },
  ],
  ticketMix: [],
  topItems: [],
  upcomingCampaigns: [
    {
      id: "campaign-1",
      name: "Neon Harbour · Final release",
      status: "SCHEDULED",
      scheduledFor: "2026-06-24T13:30:00.000Z",
      recipientCount: 4210,
    },
    {
      id: "campaign-2",
      name: "After Hours · Guestlist reminder",
      status: "SCHEDULED",
      scheduledFor: "2026-06-25T11:30:00.000Z",
      recipientCount: 1860,
    },
  ],
};

const screenshotEvents: DashboardEvent[] = [
  {
    _id: "event-neon-harbour",
    title: "Neon Harbour",
    eventFlyer: "/images/pexels-wendywei-1190297_jwisnp.jpg",
    status: "PUBLISHED",
    startDate: "2026-06-28T16:30:00.000Z",
    endDate: "2026-06-28T22:30:00.000Z",
    city: "Mumbai",
    tickets: [
      { ticketCapacity: 900, ticketSold: 742, ticketPrice: 1499, ticketVisible: true },
    ],
  },
  {
    _id: "event-after-hours",
    title: "After Hours",
    eventFlyer: "/images/pexels-osvaldo-coelho-jr-388501-1117256_oi210m.jpg",
    status: "PUBLISHED",
    startDate: "2026-07-04T17:30:00.000Z",
    endDate: "2026-07-04T22:30:00.000Z",
    city: "Bengaluru",
    tickets: [
      { ticketCapacity: 650, ticketSold: 418, ticketPrice: 1299, ticketVisible: true },
    ],
  },
  {
    _id: "event-sunset-social",
    title: "Sunset Social",
    eventFlyer: "/images/pexels-maumascaro-801863_st01gd.jpg",
    status: "DRAFT",
    startDate: "2026-07-12T13:30:00.000Z",
    endDate: "2026-07-12T19:30:00.000Z",
    city: "Goa",
    tickets: [
      { ticketCapacity: 500, ticketSold: 0, ticketPrice: 999, ticketVisible: true },
    ],
  },
];
```

- [ ] **Step 3: Bypass dashboard API calls only in screenshot mode**

At the beginning of the dashboard load effect:

```ts
if (SCREENSHOT_MODE) {
  setSummary(screenshotSummary);
  setEvents(screenshotEvents);
  setChecklist({ logo: 1, payout: 1, event: 1, Scanner: 1, nextSteps: [] });
  setPayoutVerified(true);
  setRange("last7");
  setLoading(false);
  return;
}
```

This branch must prevent all four dashboard requests. Do not alter shared API
clients or other pages.

- [ ] **Step 4: Run the application**

Run:

```bash
yarn dev
```

Expected: Next.js dev server starts, normally on `http://localhost:3000`.

- [ ] **Step 5: Use Playwright for login**

Open `/login`, enter:

```text
sanbedan9989@gmail.com
```

Pause and tell the user to complete OTP/authentication. Continue only after the
user confirms the browser is authenticated.

- [ ] **Step 6: Capture the dashboard**

Use a viewport of `1586 × 992` to match the existing image ratio. Navigate to
`/dashboard`, wait for fonts and images, then capture the dashboard canvas
without browser chrome to:

```text
public/images/playbooks/Event-management-dashboard-overview.png
```

Verify visually:

- current sidebar labels;
- current dashboard cards and readiness UI;
- no clipped content;
- no loading skeleton;
- no real customer information;
- realistic but fictional data;
- no stale product navigation.

- [ ] **Step 7: Remove temporary code**

Remove:

- `SCREENSHOT_MODE`;
- `screenshotSummary`;
- `screenshotEvents`;
- the load-effect bypass.

Run:

```bash
git diff -- 'app/(app)/dashboard/DashboardClient.tsx'
```

Expected: no diff.

- [ ] **Step 8: Verify normal dashboard code**

Run:

```bash
rg -n "SCREENSHOT_MODE|screenshotSummary|screenshotEvents|Neon Harbour|After Hours" 'app/(app)/dashboard/DashboardClient.tsx'
```

Expected: no matches.

- [ ] **Step 9: Commit only the screenshot**

```bash
git add public/images/playbooks/Event-management-dashboard-overview.png
git commit -m "chore(marketing): refresh dashboard hero screenshot"
```

---

### Task 12: Run content, accessibility and production verification

**Files:**
- Modify only files required to fix findings from this task
- Test: all public routes

- [ ] **Step 1: Run automated contract and type checks**

```bash
yarn test:marketing
yarn tsc --noEmit --pretty false
```

Expected: PASS.

- [ ] **Step 2: Run focused lint**

Run:

```bash
yarn lint \
  --file app/page.tsx \
  --file app/product/page.tsx \
  --file 'app/product/[slug]/page.tsx' \
  --file app/how-it-works/page.tsx \
  --file app/book-a-demo/page.tsx \
  --file components/marketing/MarketingNav.tsx \
  --file components/marketing/MarketingFooter.tsx \
  --file components/marketing/sections/Hero.tsx \
  --file components/marketing/sections/Beliefs.tsx \
  --file components/marketing/sections/FAQ.tsx \
  --file components/marketing/sections/ComingSoonBento.tsx
```

Expected: no lint errors.

- [ ] **Step 3: Run the production build**

```bash
yarn build
```

Expected: build completes with static pages for the homepage, product hub,
eight product pages, How It Works and Book a Demo.

- [ ] **Step 4: Scan forbidden and stale copy**

```bash
rg -n -i \
  "lowest ticket commission|lowered commission|marketing credit|India.?s leading|the best event platform|Start for free|Calendly|find best promoters|find trending artists" \
  app components/marketing
```

Expected: no public-marketing matches. Internal authenticated marketing-credit
components are outside this scan.

- [ ] **Step 5: Scan CTA consistency**

```bash
rg -n "Get Started|Book a Demo" app components/marketing
```

Expected: current CTA labels appear across header, hero, product pages, demo
links and final CTA.

- [ ] **Step 6: Verify public routes with Playwright**

Desktop viewport: `1440 × 1000`.
Mobile viewport: `390 × 844`.

Verify:

```text
/
/product
/product/event-discovery
/product/event-ticketing
/product/offline-ticketing
/product/audience-management
/product/marketing-campaigns
/product/guestlists-collaboration
/product/door-scanning
/product/reports-settlements
/how-it-works
/book-a-demo
```

For every route check:

- no horizontal overflow;
- one visible `h1`;
- header and footer links work;
- keyboard focus is visible;
- images do not cover copy;
- current and Coming Soon labels are unambiguous;
- Book a Demo opens `/book-a-demo`;
- Get Started opens `/signup`.

- [ ] **Step 7: Verify redirects**

Check:

```text
/product/event-marketplace → /product/event-discovery
/product/event-listing → /product/event-ticketing
/product/push-notifications → /product#coming-soon
/product/competitive-analysis → /product#coming-soon
```

Expected: permanent redirects land on the approved destinations.

- [ ] **Step 8: Verify Zcal**

On `/book-a-demo`:

- iframe has title `Book a Hoizr guided product tour`;
- iframe URL is the approved Zcal embed;
- it is at least 320 px wide without overflow;
- fallback link opens `https://zcal.co/i/2wlfsHdI`;
- no Calendly text exists.

- [ ] **Step 9: Verify SEO output**

Inspect generated HTML/metadata for:

- canonical URLs;
- unique page titles and descriptions;
- Open Graph image;
- current product JSON-LD only;
- FAQ JSON-LD;
- `/book-a-demo` in sitemap;
- no Coming Soon product URLs in sitemap.

- [ ] **Step 10: Verify the dashboard was restored**

```bash
git diff -- 'app/(app)/dashboard/DashboardClient.tsx'
rg -n "SCREENSHOT_MODE|screenshotSummary|screenshotEvents|Neon Harbour|After Hours" 'app/(app)/dashboard/DashboardClient.tsx'
```

Expected: no diff and no matches.

- [ ] **Step 11: Commit verification fixes**

If verification required source fixes:

```bash
git status --short
git diff --check
# Stage each verification fix by its exact path after reviewing the diff.
# Never use `git add .` because the worktree contains user-owned deleted assets.
git commit -m "fix(marketing): complete public site production verification"
```

If no fixes were needed, do not create an empty commit.

- [ ] **Step 12: Final working-tree audit**

```bash
git status --short
git log --oneline -12
```

Expected:

- only the user's pre-existing deleted assets remain unstaged;
- all public-site work is committed in scoped commits;
- no temporary screenshot code remains.
