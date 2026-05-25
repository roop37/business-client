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
 *   - Never expose public pricing tables; platform access is free.
 *   - Never name third-party integrations (payments, messaging,
 *     scanner SDKs, etc.).
 *   - Never claim AI capability we don't ship — event evaluation and
 *     offer context are the AI features in scope today.
 *   - No testimonials or unsupported social-proof claims.
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
      "Hoizr checks every listing the way search engines, Maps surfaces, and discovery integrations read it: venue, geo, category, date, tickets, canonical URL, structured data, and share previews. Then it builds and refreshes the signals that give your event the strongest possible path to the top surfaces.",
    bullets: [
      "Pre-publish checks for venue, geo, category, ticket, and organizer data",
      "Event + Organization JSON-LD, canonical metadata, link cards, and sitemap entries",
      "City, genre, and venue landing pages tuned for local search intent",
      "Search, Maps, social preview, and integration data refreshed after every edit",
    ],
    benefits: [
      {
        title: "Built for machine discovery.",
        body:
          "Every event ships with the structured fields search engines and discovery systems need to understand what it is, where it is, when it happens, and why it matters.",
      },
      {
        title: "Local intent from every angle.",
        body:
          "Hoizr connects your event to city, genre, venue, and weekend pages so the listing is not floating alone. It becomes part of a local search graph.",
      },
      {
        title: "Edits do not break the signal.",
        body:
          "Change a date, venue, image, ticket tier, or headline and Hoizr refreshes the metadata, social cards, sitemap entry, and integration payloads automatically.",
      },
    ],
    howItWorks: [
      { title: "Hoizr validates the listing", body: "Before publish, the system checks venue, geo, category, dates, ticket state, images, and organizer details for search-readiness." },
      { title: "The discovery graph goes live", body: "Structured data, canonical metadata, city pages, genre pages, sitemap entries, and share cards are generated from the same source of truth." },
      { title: "Every edit re-syncs the signal", body: "Updates flow back into search-ready pages, Maps-facing fields, social previews, and downstream integration payloads without manual cleanup." },
    ],
    narrative: {
      pullQuote:
        "Event SEO turns one published show into a search-ready network of signals across search engines, Maps surfaces, social previews, and discovery integrations.",
      paragraphs: [
        "Most event pages stop at a title, poster, and buy button. That is not enough for machine discovery. Search engines need structure, Maps surfaces need clean venue and geo signals, social apps need fresh link cards, and city intent pages need enough context to understand why this night belongs in the result.",
        "Hoizr treats the event listing as the source of truth. When you publish, the platform confirms the venue, city, category, date, ticket state, organizer identity, canonical URL, image metadata, and structured data before the listing goes live. Then it generates the technical layer around it: Event and Organization JSON-LD, canonical tags, sitemap entries, OpenGraph/Twitter cards, city pages, genre surfaces, and integration-ready payloads.",
        "The goal is straightforward: give every event the strongest possible path into the places fans already search. If you update a venue, poster, time, ticket tier, or headline, Hoizr refreshes the surrounding signals instead of leaving stale metadata behind. Your team focuses on the night; the platform keeps the event understandable to search engines, Maps, social apps, and the rest of the discovery graph.",
      ],
    },
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
    heroHeadline: "A listing engineered to sell. A marketplace engineered around your flyer.",
    heroBody:
      "Every Hoizr event lives on a page designed to convert — and inside a consumer marketplace at hoizr.com built around your show, not against it. No competing ads, no distractions, no pop-ups. Just your flyer, your lineup, and a swift, India-tuned checkout.",
    bullets: [
      "Mobile-first listing with India-tuned checkout",
      "Marketplace environment with zero ads, zero distractions",
      "Layout engineered to enhance your flyer, not bury it",
      "Phase pricing, add-ons, and capacity caps per tier",
      "Cart lock holds inventory while fans complete payment",
      "Frictionless flow from discovery to QR ticket",
    ],
    benefits: [
      {
        title: "Designed to close.",
        body:
          "Layout, button hierarchy, and form flow are tuned for the fan who's on their phone, in a rush, deciding right now. Every interaction was rebuilt against measured drop-off points.",
      },
      {
        title: "Zero distractions, zero ads.",
        body:
          "hoizr.com runs no banner ads, no third-party retargeting pixels stalking your fans, no 'sponsored shows' pushing your flyer down the page. Your event is the page.",
      },
      {
        title: "Your flyer, treated like art.",
        body:
          "The marketplace surfaces your cover art at the scale and aspect a fan actually reads. Typography, contrast, and breathing room are built around the poster — not the platform's brand.",
      },
      {
        title: "Swift, psychological checkout.",
        body:
          "Decision points are sequenced the way buyers naturally think: pick → confirm → pay. Cart locks remove the panic of stock disappearing. UPI-first checkout, OTP-light auth, no surprise upsell pop-ups at the wrong moment.",
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
      { title: "Marketplace places it", body: "Your event lands on hoizr.com inside a curated, ad-free environment built to enhance how the flyer reads." },
      { title: "Hoizr handles checkout", body: "Cart locks, UPI payments, and confirmations run in the background." },
      { title: "Watch sales land", body: "Real-time sell-through, source attribution, and order detail." },
    ],
    narrative: {
      pullQuote:
        "The marketplace is not a billboard. It is a quiet, distraction-free room that hands your flyer the microphone.",
      paragraphs: [
        "Most ticketing marketplaces are noisy. Banner ads compete for the eye, sponsored cards push your event down the page, retargeting pixels chase your fans across the internet, and the platform brand demands more visual real estate than the show itself. Hoizr was built against this. The consumer marketplace at hoizr.com runs no banner ads, no sponsored placement, no third-party pixels — by design. Every pixel that isn't yours is either functional or removed.",
        "The visual system is engineered around the flyer. Cover art surfaces at the aspect and scale fans actually read; the page typography sits in a deliberate hierarchy so the lineup, venue, and ticket ladder read in the same order a buyer naturally considers them. The result is a listing that feels less like a marketplace cell and more like a microsite — without the cost or work of building one.",
        "The checkout flow is shaped by behavioral science as much as engineering. Decision points are short, payment options are India-first, the cart lock removes the 'will tickets disappear' panic, and confirmation lands on the device a fan will actually scan with. The whole flow is sequenced to match how the buyer is already thinking — pick the night, confirm the tier, pay, done — rather than what would be operationally convenient for us.",
        "Underneath the marketplace surface, the platform also auto-tunes the SEO, schema, and share previews so the event ranks and travels well in WhatsApp, Instagram, and search. You don't write any of it. Hoizr handles the technical layer, and you focus on the show. The listing module and the marketplace it lives in are not two products — they are one engineered surface, and every choice in it is in service of one outcome: more of the right fans converting on the first visit.",
      ],
    },
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
      "Your fan list is yours. Hoizr's email and SMS marketing keeps the relationship between you and your fans — with templates, audience filters, and reporting built for nightlife drops, not for generic e-commerce.",
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
    narrative: {
      pullQuote:
        "Conversation Marketing turns high-intent replies into a controlled campaign channel, not another inbox your team has to babysit.",
      paragraphs: [
        "For Indian events, the final buying decision often happens in chat: a friend asks about the lineup, someone checks entry rules, a group waits for one person to confirm. Conversation Marketing is built around that reality. The goal is not to spam every contact; it is to send the right prompt when a fan is close enough to answer.",
        "Hoizr keeps the workflow disciplined. Templates, consent, opt-outs, audience filters, and reporting stay inside the campaign composer, so the team can run launch alerts, last-call nudges, and post-event loops without exposing vendor plumbing or losing control of the customer relationship.",
        "The belief is simple: chat should reduce uncertainty, not create chaos. When a campaign produces replies, clicks, and sales, Hoizr ties that signal back to the event and the fan profile. The next message becomes sharper because the last conversation taught the system who actually cared.",
      ],
    },
  },
  "push-notifications": {
    heroHeadline: "On-sale alerts. Last calls. Lineup drops.",
    heroBody:
      "Push notifications hit the lockscreen with no per-message cost — perfect for the moments that need to land now. Hoizr targets pushes by attendance history so the right fan gets the right nudge.",
    bullets: [
      "No SMS or chat carrier costs per message",
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
        title: "Built for live-night moments.",
        body:
          "Playbooks for on-sale go-live, door-time reminders, and after-party drops — not generic e-commerce push templates.",
      },
    ],
    howItWorks: [
      { title: "Fans opt in once", body: "Push permission is captured during their first event with you." },
      { title: "Pick the playbook", body: "On-sale, last-call, lineup-drop, or a custom send." },
      { title: "Hoizr delivers", body: "Push lands on the lockscreen — instant, measurable, and native to the Hoizr stack." },
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
          "Early ticket access, skip-the-line at the door, lineup leaks before the public drop — perks built around real nights out, not gift card balances.",
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
      "Hoizr's reporting answers the three questions every event organizer actually asks Monday morning: what sold, what drove it, and what's owed. Plain-English numbers — not a BI tool you need a degree to operate.",
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
      "Hoizr automations let you ship the repetitive parts of a nightlife business once — Phase 2 opens when Phase 1 sells out, reminder sends 24 hours before doors, refunds recycle back to the waitlist — and forget about them.",
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
    heroHeadline: "AI studies your event and returns the best possible offer.",
    heroBody:
      "Hoizr's AI Event Assistant reads your event — format, city, scale, ticket mix, listing quality — and provides the best possible offer with lowered commission where the event qualifies. One AI feature, scoped tightly, done well.",
    bullets: [
      "Reads format, city, scale, ticket mix, and listing quality",
      "Provides the best possible offer for that specific show",
      "Explains the event signals behind the recommendation",
      "Full workspace access without a subscription wall",
    ],
    benefits: [
      {
        title: "Offer tuned to your night.",
        body:
          "A 200-capacity club night and a 5,000-capacity festival should not be evaluated the same way. AI Event Assistant gives each event its own context.",
      },
      {
        title: "Lowered commission where eligible.",
        body:
          "The AI's job is to study the event honestly and surface the best possible offer, including lowered commission where the event qualifies.",
      },
      {
        title: "Transparent, not magic.",
        body:
          "Every recommendation explains the signals that informed it, so you can see why the offer looks the way it does before you publish.",
      },
    ],
    howItWorks: [
      { title: "Tell us about the event", body: "Format, city, capacity, ticket mix." },
      { title: "AI studies the event", body: "Comparable nights, reach signals, and listing quality inform the model." },
      { title: "Get your offer", body: "The best possible offer for that show, including lowered commission where eligible." },
    ],
  },
  "ai-marketing-intelligence": {
    heroHeadline: "AI splits your marketing budget across the right channels — with reasoning, not vibes.",
    heroBody:
      "Hoizr reads your CRM and your event, then proposes how to spend your next budget — SMS to repeat buyers, push to new-fan acquisition, email for the post-event flow — and tells you why. Every recommendation comes with the data behind it, so you stay the operator, not the spectator.",
    bullets: [
      "Splits budget across SMS, push, WhatsApp, email, and in-app",
      "Segment-aware: repeat buyers vs lookalike new fans vs lapsed",
      "Reasoning attached to every rupee — no black-box recommendations",
      "Generates the audience filters automatically, ready to send",
      "Upcoming: filter-builder campaigns end-to-end across all channels",
    ],
    benefits: [
      {
        title: "60/40, not a flat blast.",
        body:
          "Instead of a uniform send to your whole list, AI suggests a real split — example: 60% of this budget on SMS to 1,400 repeat buyers because they convert at ~3x, 40% on push to lookalike new fans in your top two micro-markets. You get reasoning, then approve or override.",
      },
      {
        title: "Filters built for you.",
        body:
          "AI proposes the audience filters worth sending to — 'attended in last 90 days', 'opened but didn't buy', 'genre + city + price tolerance' — already wired into the campaign builder. No more building segments by hand from scratch.",
      },
      {
        title: "Channels picked by behaviour, not habit.",
        body:
          "Push is great for new-customer acquisition; SMS is great for repeat buyers who've shown up before; email is great for the post-event loyalty loop. The model knows the difference and routes accordingly.",
      },
      {
        title: "You stay in control.",
        body:
          "Recommendations, never silent auto-pilot. Every send needs your approval. Override the split anytime — the next recommendation learns from what you actually shipped.",
      },
      {
        title: "Compounds across events.",
        body:
          "Each campaign you ship feeds the next one. Response rates, opt-in mix, conversion-by-channel — all of it sharpens the next budget split.",
      },
    ],
    howItWorks: [
      { title: "Pick the event + budget", body: "Tell Hoizr the event you're promoting and how much you have to spend." },
      { title: "AI proposes the split", body: "Channels, segments, and rupee allocation, with the reasoning behind each line." },
      { title: "You approve or edit", body: "Adjust the mix, lock segments out, or accept as-is. The campaign builder is pre-filled." },
      { title: "Ship and learn", body: "Hoizr tracks response and conversion per channel so the next event's allocation is sharper." },
    ],
    narrative: {
      pullQuote:
        "Spend smart, not loud. AI Marketing Intelligence reads your fans and your event, then tells you exactly where each rupee should go.",
      paragraphs: [
        "Most event marketing is still a flat blast to a single list with a single message. It is fast, easy to operate, and quietly wasteful — the SMS that lands with a fan who already bought is a missed opportunity, the push to a long-lapsed fan is noise, and the WhatsApp template that fits one segment annoys another. Hoizr's AI Marketing Intelligence is built to replace the flat blast with a sequenced, segment-aware plan.",
        "The model reads two inputs that most platforms cannot reason about together: your CRM (who has bought from you, who has shown up, who has opened but not converted, who is dormant) and the event (format, city, lineup, price band, expected scale). From those, it proposes a channel-and-segment split — for example, the bulk of the budget routed to SMS for the 1,400 fans who attended your last comedy night, the rest routed to push for lookalike new fans in Bandra and Andheri, with email reserved for the post-event flow.",
        "Every recommendation is annotated. You see the historical conversion rate of each segment, the response rate of each channel for your account, and the assumed cost. You can lock segments out, adjust the split, or run the AI's plan as-is. Nothing ships without your approval — the model proposes, you operate.",
        "The next release extends the same filter logic into a full campaign builder: pick a hypothesis (e.g. 'bring back fans who attended once but never returned'), and AI composes the multi-channel send end-to-end. The roadmap is to make complex audience composition feel as simple as email-builder filters do today — but spanning SMS, push, WhatsApp, email, and in-app from a single canvas.",
      ],
    },
    faq: [
      {
        q: "Does the AI send messages without me reviewing them?",
        a: "No. Every recommendation needs your explicit approval before it ships. The AI proposes, you operate. Nothing leaves Hoizr without an explicit send action from a real person on your team.",
      },
      {
        q: "What channels does it cover?",
        a: "SMS, push notifications, WhatsApp, email, and in-app surfaces. The model picks the channel mix based on which one a given segment actually responds to in your account history.",
      },
      {
        q: "How does it know which segments will convert?",
        a: "It reads your CRM history — past purchases, attendance, opens, clicks, and event-level conversion — and combines that with the current event's format, city, price band, and lineup. The result is a per-segment expectation that gets sharper every time you ship.",
      },
      {
        q: "Can I override the split if I disagree with the model?",
        a: "Yes. The split, the segments, the channel mix, and the message templates are all editable before send. The next recommendation learns from what you actually shipped, so overrides are not penalised — they are training signal.",
      },
      {
        q: "Is this included in the Hoizr workspace?",
        a: "Yes. AI Marketing Intelligence ships inside the Hoizr workspace without a separate add-on subscription or starter-tier limitation.",
      },
    ],
  },
  "competitive-analysis": {
    heroHeadline: "See how peer event organizers in your city actually perform — and what the top quartile does differently.",
    heroBody:
      "Competitive Analysis turns the platform's anonymised event history into a private benchmark for your account. See sell-through, on-sale curves, refund rates, and average ticket price for event organizers running shows similar to yours — same city, format, capacity, and price band — and surface the operating patterns the strongest performers share.",
    bullets: [
      "Anonymised peer benchmarks by city, format, capacity, and price band",
      "Compare your sell-through curve to the top quartile of similar shows",
      "See what top performers do differently on-sale, mid-funnel, and at the door",
      "Identify pricing, ladder, and timing gaps before you publish",
      "All peer data is aggregate and anonymised — never identifiable",
    ],
    benefits: [
      {
        title: "A real benchmark, not a guess.",
        body:
          "Stop comparing your event to nothing. Hoizr can show you how similar shows — same city, same format, same price band — actually performed across the platform, and where your current run sits in that distribution.",
      },
      {
        title: "Patterns from the top quartile.",
        body:
          "When the top 25% of similar events consistently launch tickets two weeks earlier, ladder pricing more aggressively, or run a particular campaign cadence, Hoizr surfaces that pattern. You see what high performers actually do — without anyone naming the venue.",
      },
      {
        title: "Gap analysis before you publish.",
        body:
          "Before an event goes live, Hoizr can flag where your listing, pricing, or campaign plan diverges from the patterns that correlate with strong sell-through. You get a chance to fix it before launch, not after.",
      },
      {
        title: "Healthy competition, not a leaderboard.",
        body:
          "The point is not to shame an event organizer. The product never identifies individual venues or organisers. You see ranges, distributions, and patterns — never names. The competition is against the median, not your friends.",
      },
      {
        title: "Clearer picture of performance.",
        body:
          "Across your own portfolio, see how each event ranks relative to its peers — not just last weekend's number. A 70% sold-out night in a soft format may be a stronger performance than a 90% sold-out night in a saturated one.",
      },
    ],
    howItWorks: [
      { title: "Hoizr picks the peer set", body: "For any event you run, the platform selects the cohort of similar shows — same city, format, capacity band, and price tier." },
      { title: "Benchmarks are computed", body: "Sell-through curve, on-sale velocity, refund rate, average ticket, and door arrival rate are aggregated across the cohort." },
      { title: "Patterns are surfaced", body: "The platform highlights what the top quartile of the cohort does differently — pricing, ladder, timing, campaign cadence." },
      { title: "Gaps are flagged", body: "Where your event diverges from the high-performer pattern, Hoizr suggests where to look first." },
    ],
    narrative: {
      pullQuote:
        "You can't get sharper without something to measure against. Competitive Analysis gives you a real, anonymous benchmark — and the patterns that separate top performers from the median.",
      paragraphs: [
        "Operating an event business without peer data is operating with one eye closed. You know what your numbers were last weekend, but you don't know if 1,800 tickets at ₹600 in Bandra on a Friday is a strong result or a soft one, because you can't see what a similar room in a similar slot actually did. Competitive Analysis closes that gap. The platform takes the events you run and silently builds a peer cohort — same city, same format, same capacity band, same price band — and shows you where your run sits in that distribution.",
        "The data is anonymised by construction. No event organizer, venue, or organisation is named. You see ranges, percentiles, and trend lines — never a leaderboard with names attached. The goal is not to shame an event organizer but to give every operator on Hoizr a real, honest mirror. The platform protects the privacy of every event organizer's individual numbers while pooling enough signal across the market to make those numbers meaningful.",
        "The most valuable layer is the pattern detection. When the top quartile of similar events consistently launches tickets two weeks earlier than the median, or runs a tighter ladder, or shifts more spend to SMS in the final week, that pattern surfaces in the report — with the implied lift attached. You don't have to guess what high performers do; the platform shows you, and you decide whether that pattern fits your room.",
        "Before any new event goes live, Hoizr will also run a pre-publish check that compares the draft against the high-performer pattern in its cohort and flags the soft points — a too-flat pricing ladder, a too-late on-sale date, a too-short campaign window. You get the chance to tighten the event before it ships, not after the post-mortem. The product turns the platform's collective experience into a quiet, private advantage for every event organizer who uses it.",
      ],
    },
    faq: [
      {
        q: "Will other event organizers see my numbers?",
        a: "No. All peer comparisons are anonymous and aggregate. The platform never exposes individual venues, organisers, or shows. You see ranges and distributions — never names.",
      },
      {
        q: "What counts as a peer for my event?",
        a: "The platform selects events on the same city, format (e.g. club night, comedy, festival), capacity band, and price band. If no statistically meaningful cohort exists for an exotic event, the report says so rather than fudge the data.",
      },
      {
        q: "Does this require sharing my own data?",
        a: "Your data is already on Hoizr because that's where you run your events. Competitive Analysis uses your own numbers to place you in a cohort but never exposes them to anyone outside your account. Aggregate cohort data is computed in a way that no single event organizer can be reconstructed from it.",
      },
      {
        q: "Can I opt out of being part of peer benchmarks?",
        a: "Yes. Event organizers can opt out of being included in the aggregate cohort with a single setting. Opting out means your data is not used in any benchmark — including in the benchmarks you yourself see.",
      },
      {
        q: "Is this a paid add-on?",
        a: "No. It ships with every Hoizr account. No subscription, no setup fee, no card details required.",
      },
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
    pullQuote: `${p.label} turns ${p.blurb.toLowerCase()} into a repeatable operating advantage.`,
    paragraphs: [
      `${p.label} solves one clear job inside the Hoizr stack: ${p.blurb.toLowerCase()} The point is not to add another dashboard. The point is to remove the manual gap that slows an event team down before, during, or after the night.`,
      `That is why ${p.label.toLowerCase()} shares data with the rest of Hoizr: the event page, buyer history, campaign activity, door scans, guestlist records, and settlement trail. When one part of the night changes, the surrounding tools already understand the change instead of forcing your team to repeat it five times.`,
      `The belief behind the product is simple: every tool should leave the next event stronger. ${p.label} does its job for the current show, but it also feeds the operating memory that makes the next listing, campaign, door plan, and report sharper.`,
    ],
  },
  faq: [
    {
      q: `Is ${p.label} included on every Hoizr account?`,
      a: `Yes. ${p.label} ships inside the Hoizr workspace without a subscription wall, setup fee, listing fee, or starter-tier limitation.`,
    },
    {
      q: `How long does it take to get ${p.label.toLowerCase()} live for my events?`,
      a: "Onboarding is quick — signup, organisation page, first event, payout profile, and team access in a single guided pass. Verification (KYC, bank, GSTIN if applicable) runs in parallel. The product is active the moment you publish your first event.",
    },
    {
      q: "Do I need to integrate with any other tool to use it?",
      a: "No. Hoizr is a closed-loop platform. Ticketing, marketing, scanning, settlement, and CRM all live in the same workspace. You do not configure third-party services to make Hoizr work.",
    },
    {
      q: "Does it work for free events and guestlist-only nights?",
      a: "Yes. Free events and guestlist-only nights are first-class on Hoizr, with full access to every product including this one.",
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
