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
  /** Long-form storytelling block (ProductNarrative). Falls back to a
   *  label-aware narrative so every product has substantial copy. */
  narrative: {
    pullQuote: string;
    paragraphs: string[];
  };
  /** Product FAQ (ProductFAQ). Falls back to 5 evergreen pairs. */
  faq: {
    q: string;
    a: string;
  }[];
};

/**
 * Per-slug content overrides. Voice rules (Roop, 2026-06):
 *   - owner.com-grade sales voice: short, direct, names the enemy
 *     (the marketplace that keeps your fans), grounded in real Indian
 *     nights. No AI filler (seamless/elevate/unlock), no "not just X".
 *   - Never expose a commission %; platform access is free to start.
 *   - Never name third-party vendors (payments, messaging, scanner SDKs).
 *   - Every claim maps to a LIVE feature in docs/HOIZR_FEATURE_INVENTORY.md.
 *   - No fabricated testimonials, logos, or stats.
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
  // PILLAR — SELL TICKETS
  // ============================================================
  "event-ticketing": {
    heroHeadline: "Tickets that sell themselves. Money that's actually yours.",
    heroBody:
      "A fast, UPI-first checkout on a page built to convert, with a cart lock that holds stock while fans pay. And every buyer lands in your CRM — not a marketplace's.",
    bullets: [
      "UPI-first checkout, built for the phone",
      "Cart lock holds inventory through payment",
      "Ticket tiers, group/table types, and per-customer limits",
      "Every buyer becomes your customer",
    ],
    benefits: [
      {
        title: "Built to close.",
        body: "The page, the buttons, the order of decisions — sequenced the way a fan on their phone actually thinks: pick, confirm, pay, done.",
      },
      {
        title: "No oversells, no scrambling.",
        body: "Stock locks the second checkout starts. If they bail, it comes back. You never sell the same seat twice.",
      },
      {
        title: "The buyer is yours.",
        body: "Name, phone, and spend captured on every sale. Your next show starts with an audience instead of a blank page.",
      },
    ],
    howItWorks: [
      { title: "Build the event", body: "Lineup, tiers, add-ons, and refund policy — all in one screen." },
      { title: "Share your link", body: "Post it on Instagram, WhatsApp, anywhere. Fans check out in a few taps." },
      { title: "Watch sales land", body: "Real-time sell-through, source attribution, and every buyer in your CRM." },
    ],
    narrative: {
      pullQuote:
        "A ticket page should do two jobs: convert the fan, and hand you the fan. Most marketplaces only do the first — and keep the second.",
      paragraphs: [
        "On a marketplace, the checkout is theirs. The buyer is theirs. You get a payout and a thank-you, and the next time you throw a night, you start from zero again. Hoizr flips that. The checkout is fast and built to convert, but the buyer that comes through it is yours — captured into your own CRM on the way past.",
        "The flow is shaped around how an Indian fan actually buys: UPI-first, OTP-light, no surprise pop-ups at the wrong moment. The cart lock removes the 'will tickets disappear' panic by holding stock while they pay, and releasing it if they don't. Tiers, group and table types, cover charges, and per-customer limits are all there when you need them and out of the way when you don't.",
        "Underneath, the listing auto-tunes its own SEO and share cards so it ranks and travels well in search and WhatsApp. You don't write any of it. You build the event once, share the link, and watch sell-through, sources, and your growing fan list update in real time.",
      ],
    },
    faq: [
      {
        q: "How do fans pay?",
        a: "A fast, UPI-first checkout designed for mobile, with cards and other common Indian methods supported. The cart locks the selected tickets while the fan pays, so inventory is never oversold.",
      },
      {
        q: "What ticket types can I sell?",
        a: "Single, couple, group, and table admissions across tiers like general, VIP, backstage, and guestlist-style products — each with its own price, inventory, sale window, and per-customer limit.",
      },
      {
        q: "Do I keep the buyer's details?",
        a: "Yes. Every buyer is captured into your own fan CRM with contact and spend history. That list is yours to market to and to export — it isn't locked inside a marketplace.",
      },
    ],
  },
  "offline-ticketing": {
    heroHeadline: "Cash at the door is still a real ticket.",
    heroBody:
      "Take cash or UPI on the ground and issue a proper QR ticket on the spot — or send a prefilled payment link when they haven't paid yet. Online and offline sales finally reconcile themselves.",
    bullets: [
      "Issue a real QR ticket for cash in seconds",
      "Send a prefilled payment link to collect later",
      "Online and offline sales in one clean view",
      "Let trusted collaborators issue tickets too",
    ],
    benefits: [
      {
        title: "The ground game, handled.",
        body: "A walk-up with cash gets the same valid QR as an online buyer — scanned at the door, counted in your numbers, no side spreadsheet.",
      },
      {
        title: "Collect later without losing the sale.",
        body: "Not paid yet? Send a prefilled payment link. The order tracks itself from issued to paid to checked-in.",
      },
      {
        title: "One reconciliation, not three.",
        body: "Online, cash, and payment-link sales all show up separately in the same reports — so the end of the night isn't a maths problem.",
      },
    ],
    howItWorks: [
      { title: "Pick tickets + add-ons", body: "Choose what they're buying and add the customer's details." },
      { title: "Take cash or send a link", body: "Issue the QR on the spot, or send a payment link to collect." },
      { title: "Scan at the door", body: "The offline ticket validates like any other — and lands in your reports." },
    ],
  },
  "free-rsvp-events": {
    heroHeadline: "Free and RSVP nights, done right — for nothing.",
    heroBody:
      "Run free, RSVP, and invite-only events with gated lists, capacity caps, and a clean QR door. Every guest still lands in your CRM, so even a free night builds the audience you sell to next time.",
    bullets: [
      "Free, RSVP, and invite-only events, first-class",
      "Public or private gated guest lists with caps",
      "Clean QR check-in at the door",
      "Every guest captured into your CRM",
    ],
    benefits: [
      {
        title: "Free events that cost you nothing.",
        body: "No setup fee, no per-ticket charge on a free night. Run the door properly without paying for the privilege.",
      },
      {
        title: "Control the room.",
        body: "Gated lists, capacity caps, and approval modes mean the right crowd gets in — not whoever screenshotted the link.",
      },
      {
        title: "A free night still grows you.",
        body: "Every RSVP becomes a fan in your CRM. The free night you throw today fills the paid night you throw next.",
      },
    ],
    howItWorks: [
      { title: "Set the type", body: "Free, RSVP, or invite-only — public or private." },
      { title: "Cap and share", body: "Set capacity, then share the link or send private invites." },
      { title: "Run a clean door", body: "Approve guests, scan QRs, and keep every name in your CRM." },
    ],
  },
  "smart-upsells": {
    heroHeadline: "Sell the table, the bottle, the upgrade.",
    heroBody:
      "Offer VIP upgrades, tables, merch, and drink packages right in checkout — to fans who are already buying. More from every order, without spending another rupee on reach.",
    bullets: [
      "Add-ons per event with caps and pricing",
      "Surfaced at the right moment in checkout",
      "Per-add-on sell-through reporting",
      "Add-on revenue in the same settlement",
    ],
    benefits: [
      {
        title: "Lift the order, not the ad spend.",
        body: "The fan at checkout is already sold. A well-placed add-on captures more of the wallet you already won.",
      },
      {
        title: "Capped by stock, not hope.",
        body: "Set how many tables or packages exist. Hoizr handles the cut-off so you don't oversell the cabana.",
      },
      {
        title: "Sold, scanned, settled as one.",
        body: "Add-on revenue rolls into the same settlement statement as tickets. One reconciliation, not two.",
      },
    ],
    howItWorks: [
      { title: "Configure add-ons", body: "Name, price, cap, and which tiers can buy each one." },
      { title: "Hoizr places them", body: "They surface at the right step in checkout for the right buyer." },
      { title: "Settle together", body: "Add-on and ticket revenue land in one statement." },
    ],
  },
  coupons: {
    heroHeadline: "Promo codes you can actually control.",
    heroBody:
      "Run early-bird, partner, and influencer drops with public or private codes — caps, date windows, per-customer limits, and usage you can see. No more guessing which code worked.",
    bullets: [
      "Fixed or percentage discounts, with a max cap",
      "Validity windows, applicable days, and ticket types",
      "Global and per-customer usage limits",
      "Usage reporting and customer drill-down",
    ],
    benefits: [
      {
        title: "Drops that don't leak.",
        body: "Set a usage cap and a window so an influencer code can't get screenshotted into oblivion.",
      },
      {
        title: "Know what actually worked.",
        body: "See redemptions per code and who used them, so next time you back the partner that moved tickets.",
      },
      {
        title: "Public or private, your call.",
        body: "Show a code on the event page to create urgency, or keep it private for a specific list.",
      },
    ],
    howItWorks: [
      { title: "Create the code", body: "Discount, cap, window, and which tickets it applies to." },
      { title: "Share it", body: "Publicly on the event, or privately to a partner or list." },
      { title: "Track redemptions", body: "Watch usage and see exactly which code drove sales." },
    ],
  },

  // ============================================================
  // PILLAR — OWN YOUR AUDIENCE
  // ============================================================
  "fan-crm": {
    heroHeadline: "Your fans. Your list. Your business.",
    heroBody:
      "Every buyer, RSVP, and follower becomes a record you own — contact, spend, and history. Not locked inside a marketplace that rents them back to you one event at a time.",
    bullets: [
      "Built automatically from buyers and followers",
      "Spend, order history, first and last seen",
      "Ready-made segments: active, dormant, repeat, top-spend",
      "Export it anytime — it's yours",
    ],
    benefits: [
      {
        title: "Own the relationship, not just the sale.",
        body: "Every ticket buyer joins a list you control. No marketplace gatekeeper standing between you and the people who pay you.",
      },
      {
        title: "Segments that mean something.",
        body: "Filter by who actually attended, who spends the most, who's gone quiet — and message that exact slice, not a vague blast.",
      },
      {
        title: "Yours to keep, yours to leave with.",
        body: "Export your audience whenever you want. No contract, no exclusivity, no ransom on a crowd you earned.",
      },
    ],
    howItWorks: [
      { title: "Sell or run a night", body: "Every buyer and RSVP flows into your CRM automatically." },
      { title: "See the whole fan", body: "Contact, spend, events attended, first and last seen — in one profile." },
      { title: "Market to the right slice", body: "Build a segment and send it straight to email or WhatsApp." },
    ],
    narrative: {
      pullQuote:
        "Ask any organizer who sold out on a marketplace to name ten people who came. They can't. The platform kept them.",
      paragraphs: [
        "This is the quiet tax of selling on a marketplace: you do the work of filling the room, and the platform keeps the relationship. The buyer is their customer, not yours. So every new event, you start marketing from scratch — re-buying an audience you already earned once.",
        "Hoizr's CRM is the opposite deal. The moment someone buys a ticket, RSVPs, or follows you, they become a record you own: contact details, total spend, every event they came to, when they first showed up and when they last did. It builds itself as you run nights — no imports, no manual entry.",
        "And because it's a real CRM, it's already sliced into the segments you'd actually use — active, dormant, repeat, top-spending. Pick one, push it straight to an email or WhatsApp campaign, and watch the sales attribute back. The list is yours to keep and yours to export. Each event you run makes the next one easier to fill, because the audience compounds in your account instead of someone else's.",
      ],
    },
    faq: [
      {
        q: "Where do the contacts come from?",
        a: "Automatically from everyone who buys a ticket, RSVPs to a guest list, or follows your organization. You don't import or enter anything by hand — the list builds itself as you run events.",
      },
      {
        q: "Can I really export my audience?",
        a: "Yes. Your fan CRM, event history, and payout records are exportable at any time. There's no lock-in and no exclusivity on your own crowd.",
      },
      {
        q: "What segments do I get?",
        a: "Ready-made segments like active, dormant, new, repeat, top-spending, and gender-based, plus the ability to filter by attendance and event. You can send any segment straight to an email or WhatsApp campaign.",
      },
    ],
  },
  "organisation-page": {
    heroHeadline: "One link that is your whole brand.",
    heroBody:
      "A branded public home with your story, your lineup, and every event you've run. The page fans land on when they Google you — already showing the next ticket on sale.",
    bullets: [
      "Permanent URL with past and upcoming events",
      "Your logo, social links, and brand in one place",
      "Search-ready out of the box",
      "New events appear here automatically",
    ],
    benefits: [
      {
        title: "One link to send anywhere.",
        body: "Bio links, posters, partner decks — point everything at one canonical home instead of scattering across listings.",
      },
      {
        title: "Built for the fan returning later.",
        body: "When last night's crowd looks you up the next morning, the page they find already has the next ticket live.",
      },
      {
        title: "Owned, not rented.",
        body: "Your history, your lineup, your brand — under your account, and it stays current as you publish.",
      },
    ],
    howItWorks: [
      { title: "Set it up once", body: "Logo, story, socials, and brand details in onboarding." },
      { title: "Run your events", body: "Each event you publish appears on the page automatically." },
      { title: "Send fans there", body: "One URL that's always current, always selling." },
    ],
  },
  "event-discovery": {
    heroHeadline: "AI does the SEO. You do the show.",
    heroBody:
      "Every event ships search-ready — structured data, clean city and venue pages, share cards — and gets listed across Hoizr's discovery surfaces. Edit the event and the signals refresh themselves.",
    bullets: [
      "Search-ready structured data on every event",
      "City, neighbourhood, venue, and artist pages",
      "Share cards tuned for WhatsApp and Instagram",
      "Listed across Hoizr's discovery surfaces",
    ],
    benefits: [
      {
        title: "Found without doing the SEO.",
        body: "Every event ships with the structure search engines and discovery surfaces need to understand what it is, where, when, and why it matters.",
      },
      {
        title: "Part of a local graph.",
        body: "Your event connects to city, genre, and venue pages, so it isn't a lonely listing — it's woven into how fans search their city.",
      },
      {
        title: "Edits don't break the signal.",
        body: "Change a date, venue, or poster and the metadata, share cards, and listings refresh automatically. No stale links left behind.",
      },
    ],
    howItWorks: [
      { title: "Publish the event", body: "Hoizr validates venue, geo, date, and ticket data for search-readiness." },
      { title: "The signals go live", body: "Structured data, city pages, and share cards generate from one source." },
      { title: "Every edit re-syncs", body: "Update the event and the discovery signals update with it." },
    ],
  },

  // ============================================================
  // PILLAR — GROW REPEAT FANS
  // ============================================================
  "email-marketing": {
    heroHeadline: "Email your crowd. Not a marketplace's.",
    heroBody:
      "Send to your own list with a rich editor, test sends, scheduling, and ticket sales tied back to each campaign. The relationship stays between you and the people who pay you.",
    bullets: [
      "Rich email composer with test sends",
      "Schedule, duplicate, and resume sends",
      "Audience filters built on attendance",
      "Opens, clicks, and attributed ticket sales",
    ],
    benefits: [
      {
        title: "Own the channel, not just the send.",
        body: "Your list is yours. Email the people who came last time without a marketplace standing in the middle.",
      },
      {
        title: "Target the right slice.",
        body: "Filter by who attended, who spends, who's gone quiet — so the message feels timely, not spammy.",
      },
      {
        title: "Measured in tickets, not opens.",
        body: "Opens and clicks are nice. Attributed ticket sales tell you whether the campaign actually paid for itself.",
      },
    ],
    howItWorks: [
      { title: "Pick the audience", body: "A segment from your CRM, one event's buyers, or a custom filter." },
      { title: "Compose and test", body: "Write it, send yourself a test, schedule or send now." },
      { title: "See the sales", body: "Delivery, opens, clicks, and tickets attributed to the send." },
    ],
  },
  "whatsapp-marketing": {
    heroHeadline: "Land in the one inbox they actually read.",
    heroBody:
      "Reach your fans on WhatsApp with approved templates, scheduled or instant sends, and delivered/read tracking — from the same composer as your email. Where Indian fans actually decide.",
    bullets: [
      "Approved templates with variable mapping",
      "Immediate or scheduled delivery",
      "Sent, delivered, read, and failed tracking",
      "Consent and opt-out handled in flow",
    ],
    benefits: [
      {
        title: "The inbox they open.",
        body: "For Indian events, the final decision happens in chat. WhatsApp puts your on-sale alert where the fan actually looks.",
      },
      {
        title: "Compliant by default.",
        body: "Templates, consent, and opt-out handling are built into the flow, so your team ships fast without guessing the rules.",
      },
      {
        title: "Same list, same composer.",
        body: "WhatsApp runs off the same CRM segments and the same campaign builder as your email. One audience, every channel.",
      },
    ],
    howItWorks: [
      { title: "Pick a template", body: "Choose an approved template and map your variables." },
      { title: "Choose the audience", body: "A CRM segment, an event's buyers, or a custom list." },
      { title: "Send and track", body: "Immediate or scheduled, with delivered and read reporting per message." },
    ],
    narrative: {
      pullQuote:
        "In India, the ticket gets bought in chat. The group waits for one person to confirm, someone checks the lineup, and then it happens.",
      paragraphs: [
        "Most platforms hand you an email tool and call it marketing. But for Indian nights, the real conversation happens on WhatsApp — that's where the group chat decides, where the 'are we going?' gets answered, where a last-call nudge actually lands. Hoizr puts that channel in your hands, run off your own fan list.",
        "It stays disciplined on purpose. Approved templates, variable mapping, consent, and opt-out handling are built into the composer, so you move fast without tripping over the rules. You send to the same CRM segments you'd email — repeat buyers, last event's crowd, the fans who went quiet — and you see delivered, read, and failed for every message.",
        "Because it sits in the same campaign builder as email, you're not juggling tools or lists. One audience, one place, every channel — and ticket sales attributed back to the send, so you know which nudge filled the room.",
      ],
    },
    faq: [
      {
        q: "Do I need my own WhatsApp setup?",
        a: "Hoizr handles the messaging plumbing. You pick an approved template, map your variables, choose the audience, and send — immediately or scheduled.",
      },
      {
        q: "How is spam and consent handled?",
        a: "Consent and opt-out (STOP) handling are built into the flow, and templates go through an approval workflow before they can send. The guardrails are on by default.",
      },
      {
        q: "Is WhatsApp free like email?",
        a: "Email sends are free. Charged channels like WhatsApp draw from a marketing-credit wallet you top up, with a full transaction ledger so you always see what a campaign cost.",
      },
    ],
  },
  automations: {
    heroHeadline: "Sales that come in while you sleep.",
    heroBody:
      "Two always-on automations do the chasing for you: recover the carts fans leave behind, and nudge the right followers the moment a show crosses 80% sold. Every recovered sale is attributed.",
    bullets: [
      "Abandoned-cart recovery for identified fans",
      "Selling-fast nudge at 80% capacity",
      "Per-channel switches and opt-out handling",
      "Attributed orders and revenue per automation",
    ],
    benefits: [
      {
        title: "Catch the carts that slip.",
        body: "A fan picked tickets and didn't finish. Hoizr nudges them back before the show sells out — automatically, no babysitting.",
      },
      {
        title: "Ride the momentum.",
        body: "When a night crosses 80% sold, Hoizr nudges the right followers who haven't bought yet, turning heat into a sellout.",
      },
      {
        title: "You see the lift.",
        body: "Each automation reports attributed orders and revenue, so you know exactly what it brought in.",
      },
    ],
    howItWorks: [
      { title: "Switch it on", body: "Enable abandoned-cart and selling-fast per organization, per channel." },
      { title: "Hoizr watches", body: "It tracks carts and capacity and fires at the right moment." },
      { title: "Sales attribute back", body: "Recovered orders and revenue show up against each automation." },
    ],
    narrative: {
      pullQuote:
        "The boring, repetitive nudges are the ones that actually move tickets — and the ones a busy team always forgets to send.",
      paragraphs: [
        "Two things reliably leave money on the table: the fan who picks tickets and gets distracted before paying, and the show that's clearly heating up while half your followers don't know yet. Both need a nudge at exactly the right moment — and both are the first thing to slip when you're running a night.",
        "Hoizr runs them for you. Abandoned-cart recovery reaches identified fans who selected tickets but didn't finish, before the event sells out. Selling-fast fires when a show crosses 80% of capacity, nudging the relevant followers who haven't bought. Both respect opt-outs and your per-channel switches, and both draw from your marketing credit only when they actually send.",
        "This is where Hoizr is honest with you: these two automations are live and working today. More triggers and a full journey builder are on the roadmap — but we'd rather ship two that reliably bring in attributed revenue than promise ten that don't.",
      ],
    },
    faq: [
      {
        q: "Which automations are live right now?",
        a: "Two: abandoned-cart recovery (for identified fans who selected tickets but didn't buy) and selling-fast (when an event crosses 80% of capacity). More triggers and a visual journey builder are on the roadmap.",
      },
      {
        q: "What does it cost to run them?",
        a: "Free email is enabled by default. Charged channels draw from your marketing-credit wallet only when a message actually sends, and degrade gracefully if you're out of credit.",
      },
      {
        q: "Will it message people who opted out?",
        a: "No. Opt-in checks, STOP-list handling, and per-channel idempotency are built in, so the right people get nudged and the rest are left alone.",
      },
    ],
  },

  // ============================================================
  // PILLAR — RUN THE NIGHT
  // ============================================================
  "guestlist-management": {
    heroHeadline: "Guest lists that finally aren't a mess.",
    heroBody:
      "Hand each promoter and artist their own list with a cap and a shareable invite link. Golden-pass QRs at the door, live arrivals on every device, and no more 11 PM spreadsheet fights.",
    bullets: [
      "Per-promoter and per-artist caps",
      "Shareable invite links and golden-pass QR",
      "Approve, revoke, search, and CSV export",
      "Live arrivals synced to every door scanner",
    ],
    benefits: [
      {
        title: "Promoter accountability, finally.",
        body: "Each promoter gets their own list, their own cap, and their own arrivals. No more 'I sent it on WhatsApp last Tuesday'.",
      },
      {
        title: "The door runs itself.",
        body: "Caps stop over-comping. Golden-pass QRs can't be a forwarded screenshot. Door staff see the same live list as the office.",
      },
      {
        title: "Clean every Monday.",
        body: "Every invite is logged — who sent it, who used it, who didn't show. Search, filter, and export the whole thing.",
      },
    ],
    howItWorks: [
      { title: "Assign caps", body: "Give each promoter and lineup artist their own list and limit." },
      { title: "They invite their crowd", body: "Each shares their link; guests join and get a golden-pass QR." },
      { title: "Watch arrivals live", body: "Approvals, revokes, and check-ins update across every door device." },
    ],
    narrative: {
      pullQuote:
        "Half my PRs pad the list and don't show. I'm filling the door on promises, not heads. Every organizer has said it.",
      paragraphs: [
        "The guest list is where a good night quietly turns into chaos. It lives across a WhatsApp broadcast, a few screenshots, a Google Sheet, and the door guy's memory. Promoters over-promise heads and there's no honest way to see who actually walked in. The one night you need it to work, the names don't match and the line backs up.",
        "Hoizr gives every contributor — owner, collaborator, or lineup artist — their own list with its own cap and its own shareable invite link. Guests join through the link, get a golden pass with a signed QR that can't be faked by a screenshot, and check in at the door like any ticket. You can approve, revoke, search, filter by status, and export the whole list.",
        "At the gate, every device sees the same live arrival count — who's in, who's pending, who never showed. No double entries, no manual reconciliation the next morning. The list stops being a liability and becomes something you can actually run a door on.",
      ],
    },
    faq: [
      {
        q: "Can promoters and artists manage their own lists?",
        a: "Yes. The event owner sees every list, while approved collaborators and lineup artists manage their own — each with a cap and a unique invite link. Owners keep full visibility across all of them.",
      },
      {
        q: "How do golden passes stop screenshot fraud?",
        a: "Accepted guests get a golden pass with a dedicated signed QR. The door scanner validates it and rejects reused, revoked, pending, or invalid passes — so a forwarded screenshot doesn't get someone in.",
      },
      {
        q: "Can I export the guest list?",
        a: "Yes. You get search, status filters, an activity timeline, public/private toggles, and CSV export for the full list.",
      },
    ],
  },
  "door-scanning": {
    heroHeadline: "Scan fast. Even when the WiFi dies.",
    heroBody:
      "Add unlimited door staff with one-tap codes. Scan paid, cash, and guestlist QRs, block reused and refunded tickets, and keep checking people in offline — it syncs the moment signal returns.",
    bullets: [
      "Unlimited scanner staff with one-tap codes",
      "Validates paid, offline, and guestlist QRs",
      "Blocks duplicate, refunded, wrong-event, wrong-day",
      "Works fully offline, syncs on reconnect",
    ],
    benefits: [
      {
        title: "Set up in seconds.",
        body: "Generate access codes from the dashboard. Staff log in on their phones, scan to validate, done. Revoke a code anytime.",
      },
      {
        title: "Built for Indian venues.",
        body: "Flaky reception, borrowed phones, dim light. The scanner caches the manifest locally and keeps working when the WiFi drops, then syncs.",
      },
      {
        title: "No free riders.",
        body: "Reused screenshots, refunded tickets, wrong-event and wrong-day entries are all blocked at the gate — so you stop losing cover and table money.",
      },
    ],
    howItWorks: [
      { title: "Generate codes", body: "One-tap access codes for every door-team member." },
      { title: "Scan at the gate", body: "Tap, scan, validate. Bad tickets are rejected automatically." },
      { title: "Stay in sync", body: "Live arrival counts on every device; offline scans sync on reconnect." },
    ],
    narrative: {
      pullQuote:
        "The WiFi dropped at the door and the whole check-in died on us. It only has to happen once to cost you the night.",
      paragraphs: [
        "Door tech that only works with a strong signal isn't door tech — it's a liability waiting for the one night the venue WiFi buckles under a full room. Hoizr's scanner is built for the real conditions of an Indian venue: borrowed phones, dim light, and reception you can't count on.",
        "You add as many door staff as you need with one-tap access codes, and revoke them just as fast. The app validates paid tickets, offline-issued tickets, and guestlist golden passes, and it blocks the things that quietly bleed money — a reused QR screenshot, a refunded ticket, someone at the wrong event or the wrong day of a festival.",
        "When connectivity drops, it keeps scanning against a cached manifest and queues everything locally, then syncs the moment signal returns. Every device shows the same live arrival count, so the office and the gate are always looking at the same room.",
      ],
    },
    faq: [
      {
        q: "Does it really work without internet?",
        a: "Yes. Door staff download the event manifest, then scan fully offline. Check-ins queue locally and sync automatically when connectivity returns, so a WiFi drop never stops the line.",
      },
      {
        q: "What does it stop at the gate?",
        a: "Duplicate entries, refunded tickets, wrong-event scans, wrong-day scans on multi-day passes, and revoked guestlist passes are all rejected with a clear reason.",
      },
      {
        q: "How many scanners can I add?",
        a: "As many as you need. Create named scanner users with one-time access codes, and enable, disable, regenerate, or revoke them at any time.",
      },
    ],
  },
  "teams-permissions": {
    heroHeadline: "Your team, exactly the access they need.",
    heroBody:
      "Invite managers, finance, and door staff with granular permissions across events, payouts, customers, and marketing. Sensitive actions are logged, so nothing happens in the dark.",
    bullets: [
      "Invite by email with role-based access",
      "Granular control across every module",
      "Members can't grant access they don't hold",
      "Activity logging on sensitive actions",
    ],
    benefits: [
      {
        title: "Right access, nothing more.",
        body: "Your door lead doesn't need payout access; your finance person doesn't need the marketing composer. Give each exactly their slice.",
      },
      {
        title: "No accidental power-ups.",
        body: "A member can't grant permissions they don't hold themselves, so access doesn't quietly escalate across your team.",
      },
      {
        title: "A clear paper trail.",
        body: "Sensitive operations — like issuing offline tickets — are logged, so a busy night stays accountable.",
      },
    ],
    howItWorks: [
      { title: "Invite by email", body: "Add a member and pick their role." },
      { title: "Tune permissions", body: "Set access across events, tickets, payouts, customers, reports, and marketing." },
      { title: "Stay accountable", body: "Edit roles anytime; sensitive actions are logged." },
    ],
  },

  // ============================================================
  // PILLAR — GET PAID & DECIDE
  // ============================================================
  "payouts-settlements": {
    heroHeadline: "Know what you made. Get it without chasing.",
    heroBody:
      "Every event closes with an itemised settlement statement — gross, deductions, refunds, and your net payout. Set up bank or UPI payout once, GSTIN handled, and stop chasing support for your own money.",
    bullets: [
      "Itemised settlement statement per event",
      "Gross, deductions, refunds, and net payout",
      "Bank or UPI payout with GSTIN validation",
      "Settlement history and downloadable statements",
    ],
    benefits: [
      {
        title: "No more black box.",
        body: "See exactly what sold, what was deducted, what was refunded, and what's yours — itemised, not a mystery transfer two weeks later.",
      },
      {
        title: "Pay your people on time.",
        body: "A defined release workflow and clear statement mean you can pay the artist and vendors without waiting on a support reply.",
      },
      {
        title: "Set up once.",
        body: "Add your bank or UPI payout details with GSTIN validation, get verified, and you're cleared to publish paid events.",
      },
    ],
    howItWorks: [
      { title: "Add payout details", body: "Bank or UPI, with GSTIN validation, verified once." },
      { title: "Run your event", body: "Hoizr calculates the settlement as sales and refunds happen." },
      { title: "Get your statement", body: "An itemised statement and a defined release — download anytime." },
    ],
    narrative: {
      pullQuote:
        "The money's stuck for two or three weeks and I still have to pay the artist out of my own pocket. That's the part that breaks trust.",
      paragraphs: [
        "Late, unexplained payouts are the fastest way a platform loses an organizer. The night went well, but the cash is trapped somewhere, and you're floating the artist and the vendors out of your own pocket while a support queue decides when you get paid.",
        "Hoizr makes the money legible. Every event produces an itemised settlement statement — gross collection, commission and GST deductions, refunds, and your net payout, line by line — with a defined release workflow instead of a transfer that shows up whenever. You see what you earned and when it's coming.",
        "Setup is a one-time job: add bank or UPI payout details with GSTIN validation, get verified, and you're cleared to publish paid events. Settlement history and downloadable statements stay on file, so handing numbers to your accountant is a download, not a reconstruction.",
      ],
    },
    faq: [
      {
        q: "How fast do I get paid?",
        a: "Each event has a defined settlement and release workflow, and your statement shows gross, deductions, refunds, and net payout. You see what you earned and when it releases — not a black box.",
      },
      {
        q: "What do I need to receive payouts?",
        a: "A bank or optional UPI payout account with IFSC lookup, plus GST/GSTIN details (or a non-GST declaration). The account is verified once, and a verified payout profile is required to publish paid events.",
      },
      {
        q: "Can I get statements for accounting?",
        a: "Yes. Settlement history and downloadable settlement statements are available per event, with gross collection, deductions, refunds, and net payout itemised.",
      },
    ],
  },
  "reporting-analytics": {
    heroHeadline: "The Monday-morning answer, in one screen.",
    heroBody:
      "What sold, what drove it, what's owed. Sell-through, sources, refunds, promo usage, check-in, and a booking funnel — all in plain English, all exportable. No BI degree required.",
    bullets: [
      "Sales, ticket types, refunds, and promo usage",
      "Source attribution and a booking funnel",
      "Check-in, guestlist, and door/offline reports",
      "KPI cards, charts, and CSV export",
    ],
    benefits: [
      {
        title: "The answer, not a query builder.",
        body: "Open Hoizr after a Saturday and see what sold, what drove it, and what's owed — without exporting a single CSV.",
      },
      {
        title: "Attribution that's accurate.",
        body: "Every ticket carries its source — campaign, promoter, organic — locked at purchase. No after-the-fact guessing.",
      },
      {
        title: "Same numbers everywhere.",
        body: "Dashboard and reports share one definition of sales, refunds, fees, GST, and payout, so the figures always agree.",
      },
    ],
    howItWorks: [
      { title: "Run your event", body: "Hoizr captures source, payment, and scan data automatically." },
      { title: "Open the report", body: "Sell-through, attribution, refunds, and check-in on one page." },
      { title: "Export and hand off", body: "Send any report to your team or accountant in one click." },
    ],
  },
  "orders-refunds": {
    heroHeadline: "Every order, every refund, under control.",
    heroBody:
      "A full order list with customer, ticket, tax, and source detail. Refund in a couple of taps — the QR dies, the seat frees, and the statement updates. No more handling it on the fly.",
    bullets: [
      "Full order list with customer and ticket detail",
      "Discounts, tax, source, and payment status",
      "Owner-initiated refunds that invalidate the QR",
      "Order receipts and customer drill-down",
    ],
    benefits: [
      {
        title: "Find any order fast.",
        body: "Filter by event, search by customer, and open the full receipt — tickets, add-ons, discounts, tax, and source all in one place.",
      },
      {
        title: "Refunds that close the loop.",
        body: "Refund an order and the ticket QR is invalidated and the seat freed, so a refunded fan can't still walk through the door.",
      },
      {
        title: "No more chaos at cancellation.",
        body: "When a night moves or cancels, you have a real system for refunds instead of a flood of DMs answered one by one.",
      },
    ],
    howItWorks: [
      { title: "Open orders", body: "Filter by event and search by customer." },
      { title: "See the detail", body: "Tickets, extras, discounts, tax, source, and payment status." },
      { title: "Refund cleanly", body: "The QR is invalidated, the seat frees, the statement updates." },
    ],
  },
  "ai-event-assistant": {
    heroHeadline: "AI studies your event and finds a better rate.",
    heroBody:
      "Before you publish, the AI reads your event — format, city, scale, ticket mix, listing quality — drafts your description and SEO, and surfaces a Boost offer with lower commission where you qualify. And it shows the why.",
    bullets: [
      "Pre-publish event evaluation with feedback",
      "Drafts descriptions and SEO suggestions",
      "Boost offer: lower commission where eligible",
      "Explains the signals behind the offer",
    ],
    benefits: [
      {
        title: "Tuned to your night.",
        body: "A 200-cap club night and a 5,000-cap festival shouldn't be judged the same way. The AI reads each event on its own terms.",
      },
      {
        title: "A better rate where you earn it.",
        body: "The AI's job is to study the event honestly and surface the best offer it can — including lower commission where your event qualifies.",
      },
      {
        title: "Transparent, not magic.",
        body: "Every recommendation explains the signals behind it, so you see why the offer looks the way it does before you publish.",
      },
    ],
    howItWorks: [
      { title: "Build the event", body: "Format, city, capacity, ticket mix, and listing." },
      { title: "AI studies it", body: "It checks the listing, drafts copy and SEO, and reads demand signals." },
      { title: "Get your offer", body: "The best offer for that show, including lower commission where eligible." },
    ],
    narrative: {
      pullQuote:
        "Most platforms ask you to accept generic terms before they understand your night. This one starts with the event.",
      paragraphs: [
        "Generic terms are lazy. A first-time comedy night in Pune and a returning festival in Goa are completely different risks and completely different opportunities — and treating them the same helps no one. Hoizr's AI starts from the event itself: format, city, scale, ticket mix, and how complete the listing is.",
        "Before you publish, it does real work for you. It evaluates the event and gives structured feedback on what would make it stronger, drafts a description and SEO suggestions you can keep or tweak, and reads demand signals to surface a Boost offer — lower commission where the event qualifies. When the AI provider isn't available, a safe heuristic fallback still gives you a sensible result.",
        "Crucially, it explains itself. Every recommendation comes with the signals behind it, so you're never staring at a number you can't question. You stay the operator — the AI just makes sure you walk into publish with the best version of your event and the best offer it can find.",
      ],
    },
    faq: [
      {
        q: "What does the AI actually do today?",
        a: "It evaluates your event before publishing, drafts descriptions and SEO/listing suggestions, and generates a Boost offer with lower commission where the event qualifies. A fuller AI content and campaign suite is on the roadmap.",
      },
      {
        q: "How does the Boost offer affect my rate?",
        a: "Eligible events can qualify for a Boost that lowers your commission. The offer is based on the event's signals, and the AI explains the reasoning — there's no fixed public rate to quote.",
      },
      {
        q: "What if the AI is unavailable?",
        a: "There's a safe heuristic fallback, so you still get a sensible evaluation and offer even when the configured AI provider can't be reached.",
      },
    ],
  },

  // ============================================================
  // PILLAR — FOR ARTISTS
  // ============================================================
  "artist-vertical": {
    heroHeadline: "One link: profile, tickets, guest list, merch.",
    heroBody:
      "A public Hoizr page that's your shows, your guest list, your merch, and your riders in one place — and the fans who buy flow straight back to you, not a label or a promoter.",
    bullets: [
      "Linktree-style public profile and links",
      "Merch store and rider sharing",
      "Your own event guest lists with golden passes",
      "Accept or reject lineup invites",
    ],
    benefits: [
      {
        title: "Your fans flow back to you.",
        body: "When you sell your own shows and merch through your page, the buyer is yours — not a cut taken by a label or a marketplace.",
      },
      {
        title: "One link does everything.",
        body: "Profile, upcoming shows, guest list, merch, and riders live on a single public page you send everywhere.",
      },
      {
        title: "Run your own guest list.",
        body: "Per-event artist guest lists with golden passes, approvals, and CSV export — and accept or reject lineup invites in a tap.",
      },
    ],
    howItWorks: [
      { title: "Build your page", body: "Profile, links, photos, merch, and riders in one place." },
      { title: "Get added to lineups", body: "Accept or reject events you're booked for." },
      { title: "Sell and keep fans", body: "Merch, guest lists, and tickets — with fans flowing back to you." },
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
    headline: `${p.label}, the way Indian nights actually run.`,
    body: p.blurb,
    bullets: [
      "Lives inside the Hoizr platform you already use",
      "Set it up per event, per city, per night",
      "Reports back so the next show is sharper",
      "Included on every account — no add-on fee",
    ],
  },
  benefits: [
    {
      title: "Less friction for fans.",
      body: `${p.label} removes a step your fans don't want to think about, and pushes more of them across the line.`,
    },
    {
      title: "Less admin for you.",
      body: `One workspace, one place to check. ${p.label} replaces a spreadsheet you've been propping up for too long.`,
    },
    {
      title: "Sharper every weekend.",
      body: "Each event teaches Hoizr what works in your city, so your defaults get tighter over time.",
    },
  ],
  howItWorks: [
    { title: "Set up fast", body: "Get your account, organization page, and first event live in a single guided pass." },
    { title: "Run your nights", body: `Use ${p.label} alongside the rest of the platform on every show.` },
    { title: "Watch it compound", body: "Every event feeds the next — your audience and your defaults get sharper." },
  ],
  narrative: {
    pullQuote: `${p.label} does one job inside Hoizr, and does it without making your team repeat themselves.`,
    paragraphs: [
      `${p.label} solves one clear job: ${p.blurb.toLowerCase()} The point isn't another dashboard — it's removing the manual gap that slows a team down before, during, or after the night.`,
      `Because it shares data with the rest of Hoizr — the event page, buyer history, campaigns, door scans, guest lists, and settlements — a change in one place is understood everywhere else. You don't enter the same thing five times.`,
      `The belief is simple: every tool should leave the next event stronger. ${p.label} does its job for the show in front of you, and feeds the operating memory that makes the next one easier.`,
    ],
  },
  faq: [
    {
      q: `Is ${p.label} included on every account?`,
      a: `Yes. ${p.label} ships inside the Hoizr workspace with no subscription, setup fee, or starter-tier limit.`,
    },
    {
      q: `How fast can I get ${p.label.toLowerCase()} live?`,
      a: "Setup is quick — signup, organization page, first event, payout profile, and team access in one guided pass. Verification runs in parallel, and the product is active the moment you publish.",
    },
    {
      q: "Do I need to plug in other tools to use it?",
      a: "No. Ticketing, marketing, scanning, settlement, and CRM all live in one workspace. You don't wire up third-party services to make Hoizr work.",
    },
    {
      q: "Does it work for free and RSVP nights?",
      a: "Yes. Free and RSVP events are first-class on Hoizr, with full access to this and every other product.",
    },
    {
      q: "Can I take my data with me?",
      a: "Yes. Your event history, fan CRM, and payout records are exportable anytime. No long-term contract, no lock-in on your own audience.",
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
