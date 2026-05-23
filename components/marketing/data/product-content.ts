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
  /**
   * Long-form storytelling block. Rendered by ProductNarrative.
   * Falls back to a generic, label-aware narrative if no override
   * is provided so every product still has substantial copy.
   */
  narrative: {
    pullQuote: string;
    paragraphs: string[];
  };
  /**
   * Frequently asked questions for this product. Rendered by
   * ProductFAQ. Fallback supplies 5 evergreen Q/A pairs derived
   * from the product label so the section is never empty.
   */
  faq: {
    q: string;
    a: string;
  }[];
};

/**
 * Per-slug content overrides. Every Hoizr product has a rich page;
 * any new product added to `nav-products.ts` falls back to a polished
 * template generated from its nav blurb.
 *
 * Copy rules baked in (per Roop, 2026-05):
 *   - Never expose commission percentages (we quote per event).
 *   - Never name third-party integrations (payments, messaging,
 *     scanner SDKs, etc.).
 *   - Never claim AI capability we don't ship — AI Offer (commission
 *     pricing) is the only AI feature in scope today.
 *   - No testimonials or "social proof" claims — Hoizr is pre-launch.
 */
type Override = Partial<{
  heroHeadline: string;
  heroBody: string;
  bullets: string[];
  benefits: { title: string; body: string }[];
  howItWorks: { title: string; body: string }[];
  narrative: { pullQuote: string; paragraphs: string[] };
  faq: { q: string; a: string }[];
}>;

const OVERRIDES: Record<string, Override> = {
  // ============================================================
  // PILLAR 1 — DISCOVERY
  // ============================================================
  "event-marketplace": {
    heroHeadline: "Get the featured slot fans actually browse.",
    heroBody:
      "Event Marketplace puts your night into Hoizr's discovery feed, city surfaces, and similar-fan recommendations — so the right people see it before they start searching somewhere else.",
    bullets: [
      "Featured placement in Hoizr's curated discovery feed",
      "City + genre + weekend surfaces tuned to how India goes out",
      "Similar-fan recommendations based on real attendance patterns",
      "Every view ties back to ticket sales and CRM growth",
    ],
    benefits: [
      {
        title: "Placement, not another listing.",
        body:
          "Your event lives inside curated discovery surfaces where fans already browse for the next night out — not buried in a generic events directory.",
      },
      {
        title: "Matched to nearby fans.",
        body:
          "Hoizr uses city, genre, time of night, and attendance history to place the right show in front of the right crowd.",
      },
      {
        title: "Discovery that feeds your CRM.",
        body:
          "Every save, click, and ticket buyer becomes a first-party fan signal you can use for your next launch — not data the marketplace keeps.",
      },
    ],
    howItWorks: [
      { title: "Publish once", body: "Add the lineup, venue, ticket tiers, and cover art inside Hoizr." },
      { title: "Hoizr places it", body: "The event appears across the marketplace feed, city pages, genre surfaces, and similar-fan slots." },
      { title: "Learn who responds", body: "Track saves, clicks, and buyers so your next launch starts with a warmer audience." },
    ],
  },
  "event-seo": {
    heroHeadline: "AI does the SEO. You do the show.",
    heroBody:
      "Hoizr writes the schema, the city pages, the meta tags, and the search snippets for every show — and keeps them fresh whenever you update the listing. Your event lands the top result while you focus on the room.",
    bullets: [
      "Auto-generated Event + Organisation JSON-LD per show",
      "City + genre landing pages tuned for local search intent",
      "Meta, OpenGraph, and link-share cards refreshed on every edit",
      "Continuous monitoring of how each page is performing",
    ],
    benefits: [
      {
        title: "Top-of-page from day one.",
        body:
          "Your show ships with the rich-result schema search engines reserve for the best-tagged page in its category.",
      },
      {
        title: "Local-first by default.",
        body:
          "City-by-city, neighbourhood-by-neighbourhood, Hoizr produces the pages that match how Indian fans actually search.",
      },
      {
        title: "Quiet upkeep, always on.",
        body:
          "Tags, snippets, and structured data refresh automatically every time you edit the listing — no migration call, no extra invoice.",
      },
    ],
    howItWorks: [
      { title: "Publish your event", body: "Drop title, venue, date, and lineup. Hoizr handles the tagging." },
      { title: "Hoizr ships search-ready", body: "Schema, city pages, and meta tags go live the moment you publish." },
      { title: "Stay on top", body: "Edits to your listing flow through to every search-ready surface automatically." },
    ],
  },
  "organisation-page": {
    heroHeadline: "Your brand's permanent home.",
    heroBody:
      "Your Hoizr organisation page is where fans land when they Google you, where promoters check your past line-ups, and where talent decides whether to play your next room. One URL. Your story. Direct tickets.",
    bullets: [
      "Permanent URL with your past, present, and upcoming events",
      "Lineup history, venue details, and ticket buttons in one place",
      "Search-ready out of the box — fans find you without a marketplace",
      "Update once; the page stays current across every surface",
    ],
    benefits: [
      {
        title: "One link to send anywhere.",
        body:
          "Bio links, posters, partner decks — point everywhere at the same canonical Hoizr URL instead of scattering across third-party listings.",
      },
      {
        title: "Built for fans returning later.",
        body:
          "When last night's crowd looks you up the next morning, the page they find already shows the next ticket on sale.",
      },
      {
        title: "Owned, not rented.",
        body:
          "Your audience signals, your lineup history, your brand — all under your account, exportable, and yours to keep.",
      },
    ],
    howItWorks: [
      { title: "Claim your URL", body: "Hoizr provisions your organisation page during onboarding." },
      { title: "Add your lineage", body: "Past events, venue details, and brand assets flow in once." },
      { title: "Stay current", body: "Every new event you publish appears here automatically." },
    ],
  },
  "reviews-engine": {
    heroHeadline: "Turn attendees into reviewers.",
    heroBody:
      "Reviews Engine prompts the people who actually showed up to leave you a review the morning after. Verified attendance, opt-out handling, and reporting all live inside Hoizr — no chasing, no fake reviews.",
    bullets: [
      "Post-event review prompts to verified attendees only",
      "Configurable send window, channel, and copy per event",
      "Surface negatives privately so you can fix them before they go public",
      "Per-event response rates and rating distribution",
    ],
    benefits: [
      {
        title: "Reviews from real attendees.",
        body:
          "Only fans who actually scanned in get prompted. No bots, no review-farming — only authentic feedback.",
      },
      {
        title: "Catch problems before they're public.",
        body:
          "Low-rated responses route to your team privately first so you have a chance to make it right before anything goes online.",
      },
      {
        title: "Build a reputation that compounds.",
        body:
          "Every event sharpens your average. Over a season the page that talent and venues check looks materially better.",
      },
    ],
    howItWorks: [
      { title: "Pick the send window", body: "Configure how soon after the event the prompt goes out." },
      { title: "Hoizr sends to attendees", body: "Verified ticket holders get the prompt, no one else." },
      { title: "Triage and respond", body: "Manage negatives privately. Surface positives on your organisation page." },
    ],
  },
  "listings-management": {
    heroHeadline: "One inbox for every listing surface.",
    heroBody:
      "Hoizr keeps your event details, venue address, hours, and brand information consistent across every surface fans use to find you — so a venue change updates everywhere at once.",
    bullets: [
      "Central source of truth for venue, hours, contact, and lineup",
      "One edit propagates across Hoizr discovery surfaces",
      "Audit log of every change so you can roll back a bad edit",
      "Alerts when a listing surface needs your input",
    ],
    benefits: [
      {
        title: "Change once, ship everywhere.",
        body:
          "A new venue address, a moved show time, or a corrected genre tag updates across every Hoizr-controlled surface automatically.",
      },
      {
        title: "Fewer Saturday-night scrambles.",
        body:
          "When the wrong address is sitting on a high-traffic page, you don't want to chase three platforms. Hoizr keeps every Hoizr surface in sync.",
      },
      {
        title: "Audit trail you can trust.",
        body:
          "Every edit is logged with who, when, and what changed — so a junior team member's typo can be rolled back in one click.",
      },
    ],
    howItWorks: [
      { title: "Set your canonical details", body: "One screen captures your venue, brand, contact, and hours." },
      { title: "Hoizr keeps them current", body: "Surfaces under Hoizr's control update automatically on edit." },
      { title: "Stay informed", body: "Alerts flag anything that needs your attention before fans see it stale." },
    ],
  },

  // ============================================================
  // PILLAR 2 — SALES
  // ============================================================
  "event-listing": {
    heroHeadline: "Listings built to convert. Not just describe.",
    heroBody:
      "Hoizr event listings are designed to move a curious browser into a paid ticket buyer in under a minute. Sharp pricing tiers, mobile-first checkout, and a cart lock that holds your stock while fans pay.",
    bullets: [
      "Mobile-first listing with India-tuned checkout",
      "Phase pricing, add-ons, and capacity caps per tier",
      "Cart lock holds inventory while fans complete payment",
      "Built-in fraud and chargeback safeguards",
    ],
    benefits: [
      {
        title: "Designed to close.",
        body:
          "The listing layout, button hierarchy, and form flow are tuned for the fan who's on their phone, in a rush, deciding right now.",
      },
      {
        title: "No oversells, no scrambling.",
        body:
          "Inventory is locked the moment a fan starts checkout. If they abandon, the stock returns automatically.",
      },
      {
        title: "Safer payments by default.",
        body:
          "Suspicious orders surface for review, refunds and chargebacks have a clean workflow, and your settlement statement is reconciled the next morning.",
      },
    ],
    howItWorks: [
      { title: "Compose the listing", body: "Lineup, tiers, add-ons, refund policy — all in one screen." },
      { title: "Hoizr handles checkout", body: "Cart locks, payments, and confirmations run in the background." },
      { title: "Watch sales land", body: "Real-time sell-through, source attribution, and order detail." },
    ],
  },
  "smart-upsells": {
    heroHeadline: "Add-ons that lift your average order.",
    heroBody:
      "Hoizr surfaces relevant add-ons — cabanas, drink packages, merch, shuttle passes — at the right moment in checkout, so the fans who would have paid for them actually see them.",
    bullets: [
      "Configurable add-ons per event, with caps and pricing tiers",
      "Smart placement in the checkout flow — not nagging pop-ups",
      "Per-add-on sell-through reporting",
      "Roll add-on revenue into the same settlement statement",
    ],
    benefits: [
      {
        title: "Lift average order without lifting CAC.",
        body:
          "The fans converting at the cart are already qualified buyers. A well-placed add-on captures more of their wallet without spending another rupee on acquisition.",
      },
      {
        title: "Capped by inventory, not by hope.",
        body:
          "Set how many cabanas, drink packs, or shuttle seats are available. Hoizr handles cut-off and waitlist.",
      },
      {
        title: "Sold, scanned, settled.",
        body:
          "Add-on revenue rolls into the event settlement statement alongside ticket sales — one reconciliation, not two.",
      },
    ],
    howItWorks: [
      { title: "Configure the add-ons", body: "Name, price, cap, and which ticket tiers can buy each one." },
      { title: "Hoizr places them in flow", body: "Add-ons surface at the right step in checkout for the right buyer." },
      { title: "Settle as one", body: "Add-on revenue + ticket revenue land in the same settlement statement." },
    ],
  },
  "find-best-promoters": {
    heroHeadline: "Promoters ranked by what they actually sell.",
    heroBody:
      "Hoizr surfaces promoter performance across your past events — who genuinely drove sales versus who claimed the credit. Bring the right ones back. Cap the ones that aren't pulling.",
    bullets: [
      "Per-promoter attribution across ticket sales and guestlist",
      "Performance leaderboard with cap utilisation and conversion",
      "Onboard new promoters with one-tap invite codes",
      "Pay the right rate based on actual contribution, not guesses",
    ],
    benefits: [
      {
        title: "End the spreadsheet war.",
        body:
          "Stop arguing on Saturday morning about who sold what. Hoizr's attribution is automatic and locked to actual ticket buyers.",
      },
      {
        title: "Reward the ones who deliver.",
        body:
          "When you can see exactly who sold what across a season, your promoter pay structure aligns with reality instead of relationships.",
      },
      {
        title: "Spot rising promoters early.",
        body:
          "Hoizr surfaces under-utilised promoters who are quietly converting at high rates — so you can give them bigger lists next time.",
      },
    ],
    howItWorks: [
      { title: "Invite your promoter list", body: "One-tap codes per promoter, with per-event caps." },
      { title: "Hoizr attributes sales", body: "Every code-driven ticket is locked to that promoter automatically." },
      { title: "Pay accurately", body: "See actual sell-through and cap usage in one dashboard before payout." },
    ],
  },
  "find-trending-artists": {
    heroHeadline: "Book lineups that already pull in your city.",
    heroBody:
      "Hoizr aggregates real attendance and search demand data across Indian cities so you can see which artists are quietly building heat — before they're priced out of your room.",
    bullets: [
      "City-level demand signal for artists from Hoizr discovery surfaces",
      "Genre and weekend trending lists, refreshed weekly",
      "Comparable-show analytics — what their last gig in your city did",
      "Direct line to artist managers via the Hoizr artist app",
    ],
    benefits: [
      {
        title: "Find the next headliner before the bidding war.",
        body:
          "Hoizr surfaces artists whose Hoizr search volume and ticket activity have been quietly climbing — six weeks ahead of the next obvious booker.",
      },
      {
        title: "Book by city, not by hype.",
        body:
          "An artist that sold out Bengaluru last month may not move in Goa. Hoizr's data is city-specific, not blanket.",
      },
      {
        title: "Negotiate with real numbers.",
        body:
          "Walk into the booking conversation with the artist's actual last-show performance, not a rumour from Instagram.",
      },
    ],
    howItWorks: [
      { title: "Open the trending list", body: "City + genre filters surface artists with real momentum." },
      { title: "See their last comparable show", body: "Hoizr displays attendance and sell-through for similar nights." },
      { title: "Reach out through Hoizr", body: "Connect with the artist or their team directly inside the platform." },
    ],
  },

  // ============================================================
  // PILLAR 3 — REPEAT FANS
  // ============================================================
  "marketing-campaigns": {
    heroHeadline: "Multi-channel drops, one composer.",
    heroBody:
      "Plan email, chat, SMS, and push from a single calendar. Schedule, audience-target, and ship — Hoizr handles the sequencing so the same fan doesn't get the same message twice across channels.",
    bullets: [
      "One composer for every channel, one calendar across the team",
      "Audience filters built around real attendance history",
      "Cross-channel deduplication so fans aren't hammered",
      "Per-campaign delivery, click, and attributed-sale reporting",
    ],
    benefits: [
      {
        title: "Stop reinventing the drop.",
        body:
          "Templated playbooks for on-sale day, last-call, and post-event flows let your team ship in minutes instead of a half-day.",
      },
      {
        title: "Reach the right slice, every time.",
        body:
          "Filters built on what fans actually attended — not vague segments — so your messages feel timely instead of spammy.",
      },
      {
        title: "Measured to the rupee.",
        body:
          "Each campaign reports attributed ticket sales alongside opens and clicks, so you know which drops paid for themselves.",
      },
    ],
    howItWorks: [
      { title: "Pick a playbook", body: "On-sale, last-call, post-event, or a custom flow." },
      { title: "Set the audience", body: "Filter by city, attendance history, ticket tier, and more." },
      { title: "Schedule and ship", body: "Hoizr handles channel sequencing and reports back on lift." },
    ],
  },
  "email-sms-marketing": {
    heroHeadline: "Owned-channel outreach. Not a marketplace rental.",
    heroBody:
      "Your fan list is yours. Hoizr's email and SMS marketing keeps the relationship between you and your fans — with templates, audience filters, and reporting built for live-music drops, not for generic e-commerce.",
    bullets: [
      "Email and SMS playbooks tuned for on-sale and last-call moments",
      "Audience filters built on attendance history",
      "Delivery, open, click, and attributed-sale reporting",
      "Owned subscriber list — exportable, yours to keep",
    ],
    benefits: [
      {
        title: "Own the relationship, not just the transaction.",
        body:
          "Every Hoizr ticket buyer is added to a list you control. No marketplace gatekeeper between you and the people who pay you.",
      },
      {
        title: "Templates that fit the moment.",
        body:
          "Hoizr ships playbooks for on-sale day, last-call urgency, post-event recap, and weekly newsletters — not generic e-commerce templates.",
      },
      {
        title: "Measured impact, not vanity.",
        body:
          "Open rates and click rates are nice; attributed ticket sales tell you whether the drop actually paid for itself.",
      },
    ],
    howItWorks: [
      { title: "Your CRM is already growing", body: "Every ticket buyer enters your owned list automatically." },
      { title: "Pick a template", body: "On-sale, last-call, post-event, or a custom send." },
      { title: "Ship and measure", body: "Real-time delivery + attributed-sale reporting after every campaign." },
    ],
  },
  "conversation-marketing": {
    heroHeadline: "Where fans actually reply.",
    heroBody:
      "Hoizr's conversation marketing is built for the high-attention channels Indian fans live in — for launch alerts, last-call nudges, and post-event loops. Templates, opt-out handling, and reporting stay inside one campaign composer.",
    bullets: [
      "Approved templates for on-sale, last-call, post-event",
      "Opt-in and opt-out handled inside the flow",
      "Per-message delivery and read reporting",
      "Composed alongside email, SMS, and push in one calendar",
    ],
    benefits: [
      {
        title: "Inbox where they actually look.",
        body:
          "Your drop lands in a high-attention channel with the same audience controls you use everywhere else in Hoizr.",
      },
      {
        title: "Compliant by default.",
        body:
          "Templates, consent, and opt-out handling are built into the workflow so your team can ship quickly without guessing.",
      },
      {
        title: "Measured in real numbers.",
        body:
          "Per-message delivery, read, and click reports — so the next drop is sharper than the last.",
      },
    ],
    howItWorks: [
      { title: "Compose once", body: "Pick the template, set the audience, write the message." },
      { title: "Hoizr ships with rules", body: "Consent, opt-outs, and template approval all handled in flow." },
      { title: "Watch fans reply", body: "Real-time delivery and engagement reporting per message." },
    ],
  },
  "push-notifications": {
    heroHeadline: "On-sale alerts. Last calls. Lineup drops.",
    heroBody:
      "Push notifications hit the lockscreen with no per-message cost — perfect for the moments that need to land now. Hoizr targets pushes by attendance history so the right fan gets the right nudge.",
    bullets: [
      "Free per-message — no SMS or chat carrier costs",
      "Targeted by city, attendance history, and ticket type",
      "Per-event push playbooks ready to ship",
      "Delivery and open-rate reporting per send",
    ],
    benefits: [
      {
        title: "Reach without the carrier bill.",
        body:
          "Push hits the lockscreen instantly without a per-message rupee cost. Use it for last-call urgency without watching the meter.",
      },
      {
        title: "The right fan, the right nudge.",
        body:
          "Target by who attended the last comparable show, who lives in the right city, or who's already bought a Phase 1 ticket.",
      },
      {
        title: "Built for live-music moments.",
        body:
          "Playbooks for on-sale go-live, door-time reminders, and after-party drops — not generic e-commerce push templates.",
      },
    ],
    howItWorks: [
      { title: "Fans opt in once", body: "Push permission is captured during their first event with you." },
      { title: "Pick the playbook", body: "On-sale, last-call, lineup-drop, or a custom send." },
      { title: "Hoizr delivers", body: "Push lands on the lockscreen — instant, free, measurable." },
    ],
  },
  "loyalty-rewards": {
    heroHeadline: "Turn a fan into a regular.",
    heroBody:
      "Hoizr's loyalty programme tracks the fans who keep showing up and rewards them with the perks they actually want — early access, skip-the-line, lineup leaks. Tiers earned by attendance, not points farming.",
    bullets: [
      "Tier progression based on real attendance, not point arithmetic",
      "Configurable perks per tier (early access, skip-line, leaks)",
      "Automatic tier-up notifications when a fan crosses a threshold",
      "Per-tier conversion and retention reporting",
    ],
    benefits: [
      {
        title: "Reward people who show up.",
        body:
          "Tiers are earned by actually attending, not by gaming a points system. The loyalty status means something.",
      },
      {
        title: "Perks fans actually want.",
        body:
          "Early ticket access, skip-the-line at the door, lineup leaks before the public drop — perks built around live music, not gift card balances.",
      },
      {
        title: "Repeat business that compounds.",
        body:
          "Each event sharpens the tier ladder. Your most loyal fans bring more friends, and Hoizr surfaces who's worth doubling down on.",
      },
    ],
    howItWorks: [
      { title: "Set your tier ladder", body: "Define what counts as a regular, an insider, and a VIP for your brand." },
      { title: "Hoizr tracks attendance", body: "Every scan increments the right fan's tier automatically." },
      { title: "Reward at the right moment", body: "Perks unlock the instant a fan crosses a threshold." },
    ],
  },

  // ============================================================
  // PILLAR 4 — OPERATIONS
  // ============================================================
  "reporting-analytics": {
    heroHeadline: "Sell-through. Sources. Settlement.",
    heroBody:
      "Hoizr's reporting answers the three questions every host actually asks Monday morning: what sold, what drove it, and what's owed. Plain-English numbers — not a BI tool you need a degree to operate.",
    bullets: [
      "Sell-through curve per event, with phase-by-phase breakdown",
      "Channel + source attribution for every ticket",
      "Per-event settlement statement, ready the morning after",
      "Year-over-year and venue-over-venue comparisons",
    ],
    benefits: [
      {
        title: "The Monday-morning answer in one screen.",
        body:
          "Open Hoizr after a Saturday night and the dashboard tells you what sold, what drove it, and what's owed — without exporting a single CSV.",
      },
      {
        title: "Attribution that's actually accurate.",
        body:
          "Every ticket carries its source — campaign, promoter, organic, or referral — locked at purchase. No after-the-fact guessing.",
      },
      {
        title: "Settle without spreadsheet anxiety.",
        body:
          "The settlement statement is itemised, GST-correct, and ready to feed your accountant the next business day.",
      },
    ],
    howItWorks: [
      { title: "Run your event", body: "Hoizr captures source, payment, and scan data automatically." },
      { title: "Open the report", body: "Sell-through, attribution, and settlement on one page." },
      { title: "Send it onwards", body: "Export, print, or hand off to your finance team in one click." },
    ],
  },
  "door-scanning": {
    heroHeadline: "Door staff, QR scanning, live arrivals.",
    heroBody:
      "Set up multiple scanners per event in seconds. Door teams see live arrivals, who's still en route, and which entry gate is busiest — no walkie-talkies needed.",
    bullets: [
      "Add unlimited scanner staff with one-tap access codes",
      "Live arrivals counter visible to every device",
      "Refunded tickets blocked automatically at the gate",
      "Works offline — syncs the moment signal returns",
    ],
    benefits: [
      {
        title: "Set up in 30 seconds.",
        body:
          "Generate access codes from the dashboard. Staff log in on their phone, scan to validate, done.",
      },
      {
        title: "One source of truth at the door.",
        body:
          "Every device sees the same live arrival list — no double-entries, no manual reconciliation Monday morning.",
      },
      {
        title: "Built for Indian venues.",
        body:
          "Works under flaky reception, on borrowed devices, in dim light. Cached locally and syncs cleanly when signal returns.",
      },
    ],
    howItWorks: [
      { title: "Generate codes", body: "One-tap access codes for every door-team member." },
      { title: "Scan at the gate", body: "Tap, scan, validate. Refunded tickets blocked automatically." },
      { title: "Live counters update", body: "Every device sees the same arrival count in real time." },
    ],
  },
  "automations": {
    heroHeadline: "Recipes that run the boring stuff.",
    heroBody:
      "Hoizr automations let you ship the repetitive parts of a live-music business once — Phase 2 opens when Phase 1 sells out, reminder sends 24 hours before doors, refunds recycle back to the waitlist — and forget about them.",
    bullets: [
      "Pre-built recipes for the most common operator workflows",
      "Triggers on sales, scans, refunds, and time-based events",
      "Cross-channel actions (push, email, internal alert, slack)",
      "Per-recipe activity log for auditability",
    ],
    benefits: [
      {
        title: "Set once, never again.",
        body:
          "The boring stuff that eats half your Saturdays — phase rollovers, reminder sends, refund handling — runs in the background after a one-time setup.",
      },
      {
        title: "No more dropped balls.",
        body:
          "When the team forgets to open Phase 2 at sell-out, Hoizr does it for you. The fan who refunds gets their seat recycled to the waitlist automatically.",
      },
      {
        title: "Custom-fit your operation.",
        body:
          "Start with Hoizr's built-in recipes, edit them to match your team's rhythm, or build new ones from scratch.",
      },
    ],
    howItWorks: [
      { title: "Pick a recipe", body: "Phase-rollover, reminder, refund-recycle, or build your own." },
      { title: "Wire the trigger", body: "Define what kicks it off — a sale, a scan, a date, a metric." },
      { title: "Hoizr runs it for you", body: "Every trigger fires the action automatically, with a clear log." },
    ],
  },
  "ai-event-assistant": {
    heroHeadline: "AI quotes your event's best commission rate.",
    heroBody:
      "Hoizr's AI Event Assistant reads your event — format, city, scale, ticket mix — and proposes the lowest commission we can offer for that specific show. One AI feature, scoped tightly, done well.",
    bullets: [
      "Reads format, city, scale, and ticket mix per event",
      "Proposes the lowest commission Hoizr can quote for that show",
      "Explainable recommendation — see the comparable events behind the rate",
      "Approve in one tap, commission locks in for that event",
    ],
    benefits: [
      {
        title: "Commission tuned to your night.",
        body:
          "A 200-capacity club night and a 5,000-capacity festival shouldn't pay the same rate. AI Event Assistant gives each event its own offer.",
      },
      {
        title: "Lowest in India for your category.",
        body:
          "The AI's job is to find the lowest rate Hoizr can defensibly offer for your format and city — backed by our lowest-commission guarantee.",
      },
      {
        title: "Transparent, not magic.",
        body:
          "Every quote ships with the comparable events that informed it. You can see why your rate is what it is, and override the model if you disagree.",
      },
    ],
    howItWorks: [
      { title: "Tell us about the event", body: "Format, city, capacity, ticket mix." },
      { title: "AI scores your event", body: "Comparable nights, reach signals, and risk inform the model." },
      { title: "Get your rate", body: "The lowest commission Hoizr can offer for that show — locked in on approval." },
    ],
  },
  "guestlist-management": {
    heroHeadline: "Guest lists, finally not a mess.",
    heroBody:
      "Hand promoters their own invite codes with caps. See who's actually arrived, who's en route, who didn't show. No more spreadsheet bickering at 11 PM on Saturday night.",
    bullets: [
      "Per-promoter invite codes with cap limits",
      "Live arrival status synced across every door scanner",
      "Automatic cap enforcement — no over-comping",
      "Per-event audit log of who invited whom",
    ],
    benefits: [
      {
        title: "Promoter accountability, finally.",
        body:
          "Each promoter sees their own list, their own cap, and their own arrivals. No more 'I sent it to you on WhatsApp last Tuesday'.",
      },
      {
        title: "Doors run themselves.",
        body:
          "Hoizr enforces caps so a promoter can't over-comp by accident. Door staff see the same live list as the office.",
      },
      {
        title: "Audit-clean every Monday.",
        body:
          "Every invite is logged with who sent it, who used it, and who didn't show — for clean post-event reviews.",
      },
    ],
    howItWorks: [
      { title: "Assign promoter caps", body: "One-tap codes with per-promoter limits." },
      { title: "Promoters invite their list", body: "They send their own people, Hoizr tracks usage." },
      { title: "Watch arrivals live", body: "Live counter across every door scanner." },
    ],
  },
};

const fallbackContent = (p: MarketingProduct, pillarLabel: string): ProductContent => ({
  slug: p.slug,
  label: p.label,
  pillarId: MARKETING_PILLARS.find((pl) => pl.products.some((x) => x.slug === p.slug))!.id,
  pillarLabel,
  hero: {
    eyebrow: pillarLabel,
    headline: `${p.label}, the way Indian live nights actually run.`,
    body: p.blurb,
    bullets: [
      "Lives inside the Hoizr platform you already use",
      "Configurable per event, per city, per category",
      "Reports back so the next show is sharper than the last",
      "Included on every Hoizr account — no add-on fee",
    ],
  },
  benefits: [
    {
      title: "Less friction for fans.",
      body: `${p.label} removes a step your fans don't want to think about — and pushes more of them across the line.`,
    },
    {
      title: "Less admin for you.",
      body: `One workspace, one inbox, one place to check. ${p.label} replaces the spreadsheet you've been propping up for too long.`,
    },
    {
      title: "Sharper every weekend.",
      body: "Each event teaches Hoizr what works in your city. Recommendations and defaults get tighter over time.",
    },
  ],
  howItWorks: [
    { title: "Onboard in days", body: "Hoizr ships your account, organisation page, and first event live within 4 business days." },
    { title: "Run your nights", body: `Use ${p.label} alongside the rest of the platform on every show you publish.` },
    { title: "Watch it compound", body: "Each event feeds the next — recommendations and defaults get sharper." },
  ],
  narrative: {
    pullQuote: `${p.label} is built so the night runs itself — and your team gets their Sundays back.`,
    paragraphs: [
      `Indian live events are not a copy of the US. The crowd is local, the genres are layered, the ticket mix is unique, and the people deciding to come out tonight do it on WhatsApp at 7 PM. Most platforms were not built for this. They were built for ticket-only resale in a market that already trusts the buying funnel. ${p.label} starts from the opposite premise — that the platform should adapt to how India already goes out, not the other way around.`,
      `Inside Hoizr, ${p.label.toLowerCase()} is not a standalone tool. It sits next to your discovery surface, your fan CRM, your marketing campaigns, your scanners, and your payout settlement — so every signal it gathers gets reused everywhere else. Add another event to the dashboard and ${p.label.toLowerCase()} is already configured. Update your lineup and the change propagates without a single re-publish click.`,
      `The result is a stack that compounds. The first ticket sold for your next night is informed by the last three nights you ran. The campaigns you send tomorrow inherit the fans you converted last weekend. ${p.label} is part of that loop — it does its job tonight, and quietly makes the next ten weekends easier.`,
    ],
  },
  faq: [
    {
      q: `Is ${p.label} included on every Hoizr plan?`,
      a: `Yes. ${p.label} ships with every active Hoizr account at no extra charge. Hoizr earns on per-event commission only — never on add-on platform fees.`,
    },
    {
      q: `How long does it take to get ${p.label.toLowerCase()} live for my events?`,
      a: "Onboarding is quick — signup, organisation page, first event, payout profile, and team access in a single guided pass. Verification (KYC, bank, GSTIN if applicable) runs in parallel and clears for most hosts within hours. The product is active the moment you publish your first event.",
    },
    {
      q: "Do I need to integrate with any other tool to use it?",
      a: "No. Hoizr is a closed-loop platform. Ticketing, marketing, scanning, settlement, and CRM all live in the same workspace. You do not configure third-party services to make Hoizr work.",
    },
    {
      q: "Does it work for free events and guestlist-only nights?",
      a: "Yes. Free events and guestlist-only nights are first-class on Hoizr — no commission, no platform fee, full access to every product including this one.",
    },
    {
      q: "Can I export my data if I leave?",
      a: "Yes. Your event history, fan CRM, and payout records are exportable at any time. There is no long-term contract, no exclusivity lock-in, and no ransom on your own audience.",
    },
  ],
});

export const getProductContent = (slug: string): ProductContent | null => {
  const product = ALL_PRODUCTS.find((p) => p.slug === slug);
  if (!product) return null;
  const pillar = MARKETING_PILLARS.find((pl) =>
    pl.products.some((p) => p.slug === slug)
  )!;
  const base = fallbackContent(product, pillar.label);
  const ovr = OVERRIDES[slug];
  if (!ovr) return base;
  return {
    ...base,
    hero: {
      ...base.hero,
      headline: ovr.heroHeadline ?? base.hero.headline,
      body: ovr.heroBody ?? base.hero.body,
      bullets: ovr.bullets ?? base.hero.bullets,
    },
    benefits: ovr.benefits ?? base.benefits,
    howItWorks: ovr.howItWorks ?? base.howItWorks,
    narrative: ovr.narrative ?? base.narrative,
    faq: ovr.faq ?? base.faq,
  };
};

export const getRelatedProducts = (slug: string, limit = 3): MarketingProduct[] => {
  const pillar = MARKETING_PILLARS.find((pl) =>
    pl.products.some((p) => p.slug === slug)
  );
  if (!pillar) return [];
  return pillar.products.filter((p) => p.slug !== slug).slice(0, limit);
};
