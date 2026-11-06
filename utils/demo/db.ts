/**
 * Demo store: a self-contained, internally consistent "organizer" world.
 * Everything is generated deterministically at module load, relative to "now",
 * so the dashboard always looks live. Mutations persist to localStorage in the
 * browser (key below); "Reset demo" / logout clears it.
 */
export const DEMO_STORAGE_KEY = "hoizr-demo-db-v1";
const DAY = 86400000;
const now = () => Date.now();
export const iso = (offsetDays: number, hour = 19) => {
  const d = new Date(now() + offsetDays * DAY);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

// deterministic PRNG
let seed = 20260611;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const pick = <T,>(a: T[]): T => a[Math.floor(rnd() * a.length)];
const int = (min: number, max: number) => Math.floor(min + rnd() * (max - min + 1));

export const uid = (p = "demo") => `${p}-${Math.random().toString(36).slice(2, 10)}`;

export const HOST_ID = "demo-host-1";
export const USER_ID = "demo-user-1";

export const ALL_PERMISSIONS = [
  "Customers", "DownloadReports", "Events", "Marketing", "Offers", "Orders",
  "PayoutManagement", "Reports", "TeamManagement", "Tickets", "UpdateHost",
];

const address = {
  addressLine1: "12 Residency Road",
  addressLine2: "Shanthala Nagar",
  state: "Karnataka",
  city: "Bengaluru",
  pincode: "560025",
  coordinate: { coordinates: [77.6, 12.97] },
  place: { displayName: "Residency Road, Bengaluru", placeId: "demo-place-1" },
};

export type DemoEvent = Record<string, any>;

const EVENT_SEED: Array<[string, string, string, number, string, number]> = [
  // title, city, status, dayOffset, type, flyerIdx
  ["Neon Nights: Synthwave Rave", "Bengaluru", "PUBLISHED", 12, "EXCLUSIVE", 1],
  ["Sunset Rooftop Sessions", "Mumbai", "PUBLISHED", 5, "EXCLUSIVE", 2],
  ["Indie Folk Evening", "Bengaluru", "PUBLISHED", 26, "EXCLUSIVE", 3],
  ["Techno Underground Vol. 7", "Delhi", "PUBLISHED", 40, "EXCLUSIVE", 4],
  ["Comedy Cellar Night", "Pune", "PUBLISHED", 8, "EXCLUSIVE", 5],
  ["Holi Colour Fest", "Bengaluru", "COMPLETED", -45, "EXCLUSIVE", 6],
  ["NYE Mega Countdown", "Goa", "DRAFT", 54, "EXCLUSIVE", 7],
  ["Jazz & Wine Brunch", "Hyderabad", "COMPLETED", -10, "EXCLUSIVE", 8],
];

const makeTickets = (status: string, idx: number) => {
  const done = status === "COMPLETED";
  const mk = (name: string, cat: string, price: number, cap: number, type = "SINGLE", extra = {}) => {
    const sold = status === "DRAFT" ? 0 : done ? Math.floor(cap * (0.82 + rnd() * 0.15)) : Math.floor(cap * (0.25 + rnd() * 0.6));
    return {
      _id: `t-${idx}-${name.replace(/\W+/g, "").toLowerCase()}`,
      ticketCategory: cat, ticketName: name, dayId: null, ticketType: type,
      ticketCapacity: cap, ticketSold: sold, ticketPrice: price,
      ticketInfo: `${name} access`, maxTicketPerUser: 6, coverType: null, coverAmount: 0,
      ticketGST: "NONE", gstRate: 0, ticketExpiryDateTime: null, markAsComingSoon: false,
      markAsOnGroundOnly: false, tableCapacity: type === "TABLE" ? 6 : null,
      groupCapacity: type === "GROUP" ? 4 : null, collectPartialAdvancePayment: false,
      advanceBookingAmount: 0, ticketVisible: true, description: `${name} access`, ...extra,
    };
  };
  return [
    mk("Early Bird", "NORMAL", 499, 100),
    mk("General Admission", "NORMAL", 799, 300),
    mk("VIP", "VIP", 1999, 80),
    mk("Table for 6", "TABLE", 9999, 12, "TABLE"),
  ];
};

const buildEvents = (): DemoEvent[] =>
  EVENT_SEED.map(([title, city, status, off, type, flyer], i) => {
    const start = iso(off, 19);
    const end = iso(off, 23);
    const tickets = makeTickets(status, i + 1);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return {
      _id: `demo-event-${i + 1}`, title,
      description: `${title} — an unforgettable night with live performances, great sound and a crowd that knows how to move. Presented by Neon Nights Collective.`,
      eventFlyer: `/demo/flyer-${flyer}.svg`, horizontalFlyer: `/demo/flyer-${flyer}.svg`,
      videoSneakPeek: null, gallery: [{ url: `/demo/flyer-${flyer}.svg`, type: "IMAGE" }],
      verticalVideo: null, horizontalVideo: null, instagramPost: null, instagramStory: null, tableLayoutImage: null,
      eventType: type, status, firstStepCompleted: true, startDate: start, endDate: end,
      markSeparateDays: false, multiCity: false, days: [], isComingSoon: false, genreTagIds: ["demo-genre-1", "demo-genre-2"],
      city, slug,
      location: { addressLine1: "Demo Arena, Main Road", addressLine2: null, city, state: "Karnataka", pincode: "560001",
        formattedAddress: `Demo Arena, Main Road, ${city}`, coordinate: { coordinates: [77.59, 12.97] },
        place: { displayName: `Demo Arena, ${city}`, placeId: `demo-place-e${i}` } },
      eventLocationDecided: true, isVisible: status === "PUBLISHED", ticketingEnabled: status !== "DRAFT",
      allowWalkIns: true, ticketSalesStartDate: iso(off - 30), ticketSalesEndDate: start, maxCapacity: 500,
      autoConfirmBookings: true, requiresIDVerification: false,
      ticketingTerms: "Tickets are non-transferable. Entry subject to venue policy.",
      refundPolicy: "Refunds are available up to 48 hours before the event.",
      cancellationPolicy: "Full refund if the event is cancelled by the organizer.",
      contactForQueriesTables: "hoizr.tech@gmail.com",
      eventGuide: { languageIds: ["demo-lang-1"], minimumEntryAge: 18, paidEntryAge: 18, venueLayout: "INDOOR",
        seatingArrangement: "STANDING", kidFriendly: "NOT_ALLOWED", petFriendly: "NOT_ALLOWED",
        gatesOpenBeforeEvent: true, gatesOpenLeadHours: 1, gatesOpenLeadMinutes: 0, youtubeLink: null },
      faqs: [{ question: "Is there a dress code?", answer: "Smart casual. Come ready to dance." },
        { question: "Can I get a refund?", answer: "Yes, up to 48 hours before the event." }],
      eventInstructions: "Carry a valid photo ID.", prohibitedItems: [],
      tickets, lineup: [
        { name: "DJ Aurora", picture: "/demo/avatar-1.svg", artistLinkId: null, tempArtistId: null, instagramLink: null, spotifyLink: null, youtubeLink: null },
        { name: "The Midnight Echo", picture: "/demo/avatar-2.svg", artistLinkId: null, tempArtistId: null, instagramLink: null, spotifyLink: null, youtubeLink: null },
      ],
      eventCollaborationBusiness: [], extras: [],
      guestlistEnabled: true, guestlistAutoAccept: false, guestlistMaxCapacity: 50,
      isCollaboratorView: false, canSeeMetrics: true, canRunCampaigns: true, canCreateOffers: true,
      canAccessCustomerList: true, viewerTeamRole: "OWNER", commissionRate: 5, scannersCount: 2,
      collaborators: [],
      createdAt: iso(off - 40), updatedAt: iso(off - 2),
    };
  });

// ── Customers & orders ─────────────────────────────────────────────────────
const FIRST = ["Aarav","Vivaan","Aditya","Ishaan","Kabir","Rohan","Arjun","Ananya","Diya","Meera","Saanvi","Kavya","Riya","Nisha","Priya","Rahul","Karan","Neha","Tanvi","Sameer","Zoya","Dev","Ira","Veer"];
const LAST = ["Sharma","Iyer","Reddy","Nair","Patel","Gupta","Singh","Mehta","Kapoor","Joshi","Menon","Das"];

export const buildCustomers = () =>
  FIRST.map((f, i) => {
    const l = LAST[i % LAST.length];
    return {
      customerId: `demo-cust-${i + 1}`, name: `${f} ${l}`,
      email: `${f.toLowerCase()}.${l.toLowerCase()}@example.com`,
      phone: `+9198${String(10000000 + i * 137531).slice(0, 8)}`,
      isGuest: i % 7 === 6, orderCount: 0, showsAttended: 0, totalSpent: 0, aov: 0,
      lifetimePoints: int(40, 1800), customerSince: iso(-int(20, 400)),
      ticketCount: 0, checkedInOrders: 0, lastPurchaseAt: iso(-int(1, 40)),
    };
  });

export const buildOrders = (events: DemoEvent[], customers: any[]) => {
  const orders: any[] = [];
  let n = 1000;
  events.forEach((ev) => {
    if (ev.status === "DRAFT") return;
    const count = ev.status === "COMPLETED" ? int(14, 20) : int(8, 14);
    for (let i = 0; i < count; i++) {
      const c = pick(customers);
      const t = pick(ev.tickets as any[]);
      const qty = int(1, 4);
      const subtotal = t.ticketPrice * qty;
      const fee = Math.round(subtotal * 0.04);
      const total = subtotal + fee + Math.round(fee * 0.18);
      const refunded = rnd() < 0.05;
      const status = refunded ? "REFUNDED" : ev.status === "COMPLETED" && rnd() < 0.8 ? "CHECKED_IN" : "PAYMENT_SUCCESS";
      n += int(1, 9);
      const created = new Date(new Date(ev.startDate).getTime() - int(2, 28) * DAY).toISOString();
      orders.push({
        orderId: `demo-order-${n}`, shortId: `HZ${n}`, customerId: c.customerId, customerName: c.name,
        customerEmail: c.email, customerPhone: c.phone, isGuest: c.isGuest, eventId: ev._id,
        eventTitle: ev.title, eventDate: ev.startDate, ticketId: t._id, ticketName: t.ticketName, qty, price: t.ticketPrice,
        subtotal, fee, total, ticketSummary: `${qty} × ${t.ticketName}`, ticketCount: qty, totalAmount: total,
        status, checkedIn: status === "CHECKED_IN", createdAt: created, refundedAt: refunded ? iso(-3) : null,
      });
      c.orderCount++; c.totalSpent += refunded ? 0 : total; c.ticketCount += qty;
      if (status === "CHECKED_IN") { c.showsAttended++; c.checkedInOrders++; }
    }
  });
  customers.forEach((c) => (c.aov = c.orderCount ? Math.round(c.totalSpent / c.orderCount) : 0));
  return orders.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
};

// ── Seed ───────────────────────────────────────────────────────────────────
const seedDb = (): Record<string, any> => {
  const events = buildEvents();
  const customers = buildCustomers();
  const orders = buildOrders(events, customers);
  const firstOfEach = (k: string) => events.find((e) => e.status === "PUBLISHED")?.[k];
  void firstOfEach;
  return {
    user: {
      _id: USER_ID, firstName: "Demo", lastName: "Host", status: "ACTIVE", email: "demo@hoizr.example",
      phone: "+919800000001", creatorUser: true, role: "HOST", teamRole: "OWNER", enable2FA: false,
      completedWalkthroughs: ["MAIN", "PAYMENTS", "TEAMS", "CAMPAIGN"],
      accountPreferences: { sms: true, email: true, whatsapp: true },
      permissions: ALL_PERMISSIONS.map((type) => ({ type, status: true, id: `perm-${type}` })),
      hosts: [{ _id: HOST_ID }],
    },
    host: {
      _id: HOST_ID, name: "Neon Nights Collective", email: "hello@neonnights.example", phone: "+919800000001",
      hostType: "EVENT_ORG", venueType: "INDOOR",
      description: "Bengaluru's home for electronic, indie and live-music nights.",
      logo: "/demo/logo.svg", businessRegistrationNumber: "U12345KA2020PTC123456", gstNumber: "29ABCDE1234F1Z5",
      websiteUrl: "https://github.com/roop37/business-client", averageEventSize: "300-500", profileComplete: true,
      status: "ACTIVE", onboardingCompleted: true, isAdminVerified: true, isActive: true, address,
      createdAt: iso(-300), updatedAt: iso(-2),
    },
    events, customers, orders,
    coupons: [
      mkCoupon("EARLYBIRD20", "Percentage", 20, events[0]._id, 14, 12),
      mkCoupon("WELCOME100", "FixedAmount", 100, null, 60, 31),
      mkCoupon("VIPNIGHT", "Percentage", 15, events[1]._id, 6, 4),
    ],
    rewards: [
      { _id: "demo-reward-1", title: "₹100 off your next ticket", description: "Redeem on any event", pointsCost: 500, active: true,
        perCustomerLimit: 2, totalStock: 100, redeemedCount: 23, createdAt: iso(-60),
        couponTemplate: { discountType: "FixedAmount", discountValue: 100, uptoAmount: null, minCartValue: 500, validityDays: 30, eventId: null } },
      { _id: "demo-reward-2", title: "10% off VIP", description: "VIP tickets only", pointsCost: 1200, active: true,
        perCustomerLimit: 1, totalStock: 40, redeemedCount: 7, createdAt: iso(-30),
        couponTemplate: { discountType: "Percentage", discountValue: 10, uptoAmount: 500, minCartValue: 1000, validityDays: 45, eventId: null } },
    ],
    scanners: [
      { _id: "demo-scanner-1", name: "Main Gate", scannerName: "Main Gate", scannerType: "STAFF", email: null, phone: "+919800000010", eventId: events[0]._id, totalScanned: 142, lastLoginAt: iso(-1), isActive: true, createdAt: iso(-20) },
      { _id: "demo-scanner-2", name: "VIP Entry", scannerName: "VIP Entry", scannerType: "STAFF", email: null, phone: "+919800000011", eventId: events[0]._id, totalScanned: 58, lastLoginAt: iso(-1), isActive: true, createdAt: iso(-20) },
    ],
    guestlists: [] as any[],
    guestlistEntries: [] as any[],
    emailCampaigns: [
      mkEmailCampaign("demo-camp-1", "Neon Nights — Early Bird is live", "completed", -9, 1840),
      mkEmailCampaign("demo-camp-2", "Last chance: VIP tables", "scheduled", 3, 2210),
      mkEmailCampaign("demo-camp-3", "Weekend recap + next event", "draft", 0, 0),
    ],
    waCampaigns: [
      mkWaCampaign("demo-wa-1", "Doors open at 7 PM", "completed", -4, 920),
      mkWaCampaign("demo-wa-2", "Bring a friend, get 20% off", "scheduled", 2, 1380),
    ],
    pushCampaigns: [
      mkPushCampaign("demo-push-1", "Tonight: Neon Nights", "completed", -2),
      mkPushCampaign("demo-push-2", "New event announced", "draft", 0),
    ],
    webhooks: [
      { _id: "demo-wh-1", url: "https://example.com/hooks/hoizr", secretLast6: "a1b2c3", enabledEvents: ["ORDER_PAID", "ORDER_REFUNDED"], active: true, label: "CRM sync", lastDeliveryAt: iso(-1), createdAt: iso(-30) },
    ],
    apiKeys: [
      { _id: "demo-key-1", keyType: "PUBLISHABLE", prefix: "pk_demo", last4: "9f2a", allowedDomains: ["neonnights.example"], label: "Website widget", lastUsedAt: iso(-1), revoked: false, createdAt: iso(-45) },
      { _id: "demo-key-2", keyType: "SECRET", prefix: "sk_demo", last4: "71cd", allowedDomains: [], label: "Server", lastUsedAt: iso(-2), revoked: false, createdAt: iso(-45) },
    ],
    team: [
      { _id: { _id: USER_ID }, firstName: "Demo", lastName: "Host", email: "demo@hoizr.example", phone: "+919800000001", role: "OWNER", status: "ACTIVE" },
      { _id: { _id: "demo-user-2" }, firstName: "Meera", lastName: "Nair", email: "meera@neonnights.example", phone: "+919800000002", role: "MANAGER", status: "ACTIVE" },
      { _id: { _id: "demo-user-3" }, firstName: "Kabir", lastName: "Singh", email: "kabir@neonnights.example", phone: "+919800000003", role: "MARKETING", status: "ACTIVE" },
      { _id: { _id: "demo-user-4" }, firstName: "Zoya", lastName: "Patel", email: "zoya@neonnights.example", phone: "+919800000004", role: "Staff", status: "SUB_USER_EMAIL_VERIFICATION_PENDING" },
    ],
    payoutAccounts: [
      { _id: "demo-payout-1", entityName: "Neon Nights Collective LLP", entityType: "LLP", panNumber: "ABCDE1234F", taxDeductionAccountNumber: null,
        contactEmail: "finance@neonnights.example", contactPhone: "+919800000001", accountHolderName: "Neon Nights Collective LLP",
        accountNumber: "XXXXXXXX4321", last4: "4321", ifscCode: "HDFC0000123", bankName: "HDFC Bank", branchName: "Indiranagar",
        accountType: "CURRENT", upiId: null, isActive: true, isPrimary: true, verificationStatus: "VERIFIED", rejectionReason: null,
        isGstRegistered: true, gstin: "29ABCDE1234F1Z5", gstRegistrationType: "REGULAR", registeredBusinessName: "Neon Nights Collective LLP",
        gstRegistrationDate: iso(-400), createdAt: iso(-200), updatedAt: iso(-100) },
    ],
    contentDefaults: { _id: "demo-cd-1", hostId: HOST_ID,
      ticketingTerms: "Tickets are non-transferable. Entry subject to venue policy.",
      refundPolicy: "Refunds are available up to 48 hours before the event." },
    automations: [
      mkAuto("welcome_series", "Welcome series", "Greet first-time buyers with a thank-you and what to expect.", true, 412, 38, 41230),
      mkAuto("abandoned_cart", "Abandoned cart recovery", "Nudge people who left tickets in their cart.", true, 233, 27, 28980),
      mkAuto("event_reminder", "Event reminder", "Remind ticket holders 24 hours before doors open.", true, 1180, 0, 0),
      mkAuto("post_event_feedback", "Post-event feedback", "Ask attendees to rate the night.", false, 0, 0, 0),
      mkAuto("win_back", "Win-back campaign", "Re-engage fans who haven't attended in 90 days.", false, 0, 0, 0),
    ],
    feedback: Array.from({ length: 12 }, (_, i) => ({
      _id: `demo-fb-${i + 1}`, eventId: events[i % 2 === 0 ? 5 : 7]._id, eventTitle: events[i % 2 === 0 ? 5 : 7].title,
      customerName: `${FIRST[i]} ${LAST[i % LAST.length]}`, rating: [5, 5, 4, 5, 4, 3, 5, 4, 5, 5, 4, 2][i],
      comment: ["Amazing sound and vibes!","Loved the lineup.","Great night, a bit crowded at the bar.","Best event this year.","Well organised entry.","Queue was long.","Will be back!","Fantastic production.","Perfect brunch.","10/10","Good value.","Sound was too loud near the stage."][i],
      createdAt: iso(-int(2, 40)),
    })),
    ledger: [
      { _id: "led-1", type: "CREDIT", amount: 5000, balance: 5000, activity: "Top-up", recipients: null, channel: null, campaignId: null, paymentReference: "pay_demo_1", createdAt: iso(-30), updatedAt: iso(-30) },
      { _id: "led-2", type: "DEBIT", amount: 1840, balance: 3160, activity: "Email campaign sent", recipients: 1840, channel: "EMAIL", campaignId: "demo-camp-1", paymentReference: null, createdAt: iso(-9), updatedAt: iso(-9) },
      { _id: "led-3", type: "DEBIT", amount: 920, balance: 2240, activity: "WhatsApp campaign sent", recipients: 920, channel: "WHATSAPP", campaignId: "demo-wa-1", paymentReference: null, createdAt: iso(-4), updatedAt: iso(-4) },
    ],
    marketingBalance: 2240,
    templates: [
      mkTemplate("demo-tpl-1", "event_reminder_24h", "Event reminder", "UTILITY", "Hi {{1}}, {{2}} starts tomorrow at {{3}}. Show your QR at the gate. See you there!"),
      mkTemplate("demo-tpl-2", "early_bird_launch", "Early bird launch", "MARKETING", "🎉 Early-bird tickets for {{1}} are live! Grab yours before they sell out: {{2}}"),
      mkTemplate("demo-tpl-3", "thank_you_attending", "Thank you", "MARKETING", "Thanks for joining us at {{1}}, {{2}}! Tell us how it went: {{3}}"),
    ],
    bookmarks: [] as string[],
    activity: Array.from({ length: 28 }, (_, i) => {
      const types = ["EVENT_CREATED","EVENT_PUBLISHED","EVENT_UPDATED","CAMPAIGN_CREATED","CAMPAIGN_SENT","COUPON_CREATED","USER_LOGIN","TEAM_UPDATED","PAYOUT_VERIFIED","OFFLINE_TICKET_ISSUED"];
      const t = types[i % types.length];
      return { _id: `demo-act-${i + 1}`, description: t.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
        performedOn: i % 2 ? "Neon Nights: Synthwave Rave" : "Workspace", actionType: t,
        performedBy: ["Demo Host", "Meera Nair", "Kabir Singh"][i % 3], createdAt: iso(-i * 1.3), updatedAt: iso(-i * 1.3),
        ipAddress: "103.21.0.1", userAgent: "Chrome on macOS" };
    }),
    offlineOrders: [] as any[],
  };
};

function mkCoupon(code: string, type: string, val: number, eventId: string | null, startOff: number, used: number) {
  return {
    _id: `demo-coupon-${code.toLowerCase()}`, code, description: `${code} promotion`, eventId, isActive: true,
    startDate: iso(-startOff), endDate: iso(30), promoCodeDiscountType: type, couponUsageType: "EntireSale",
    discountValue: val, uptoAmount: type === "Percentage" ? 500 : null, applicableDays: null, applicableTickets: null,
    showToCustomers: true, maxUsage: 200, maxUsagePerCustomer: 2, minCartValue: 500, couponUsageSalesLimit: null,
    totalSalesUsed: used * 900,
    usage: Array.from({ length: Math.min(used, 6) }, (_, i) => ({
      usedAt: iso(-i - 1), name: `${FIRST[i]} ${LAST[i]}`, email: `${FIRST[i].toLowerCase()}@example.com`, phone: "+919800000000",
      orderId: `demo-order-${1000 + i * 7}`, discountApplied: type === "Percentage" ? 160 : val, saleAmount: 900 })),
    createdAt: iso(-startOff),
  };
}
function mkEmailCampaign(id: string, name: string, status: string, off: number, count: number) {
  const sent = status === "completed";
  return {
    _id: id, businessId: HOST_ID, hostId: HOST_ID, campaignName: name, emailSubject: name, status,
    target: "ALL_ATTENDEES", eventId: "demo-event-1", targetCount: count, csvDataUrl: null, filters: [],
    scheduleType: status === "scheduled" ? "SCHEDULED" : "IMMEDIATE", scheduleTime: iso(off), ctaLink: "https://github.com/roop37/business-client",
    emailStatus: status, sentAt: sent ? iso(off) : null, createdAt: iso(off - 2), updatedAt: iso(off),
    emailTemplate: { designJson: null, content: "<p>Hello from Neon Nights!</p>", html: "<html><body><h2>Neon Nights</h2><p>Early bird tickets are live.</p></body></html>" },
    statusChangeHistory: [{ status: "draft", timestamp: iso(off - 2) }, ...(sent ? [{ status: "completed", timestamp: iso(off) }] : [])],
    stats: sent ? { mailsSent: count, mailsDelivered: count - 24, mailsBounced: 24,
      mailsOpened: Array.from({ length: 6 }, (_, i) => ({ email: `${FIRST[i].toLowerCase()}@example.com`, date: iso(off) })),
      mailsClicked: Array.from({ length: 3 }, (_, i) => ({ email: `${FIRST[i].toLowerCase()}@example.com`, date: iso(off) })) }
      : { mailsSent: 0, mailsDelivered: 0, mailsBounced: 0, mailsOpened: [], mailsClicked: [] },
  };
}
function mkWaCampaign(id: string, name: string, status: string, off: number, count: number) {
  return {
    _id: id, hostId: HOST_ID, campaignName: name, name, status, target: "ALL_ATTENDEES", eventId: "demo-event-1",
    targetCount: count, filters: [], scheduleType: status === "scheduled" ? "SCHEDULED" : "IMMEDIATE", scheduleTime: iso(off),
    templateId: "demo-tpl-1", templateName: "event_reminder_24h", sentAt: status === "completed" ? iso(off) : null,
    createdAt: iso(off - 2), updatedAt: iso(off), publicationStatus: status === "draft" ? "Drafted" : "Active",
    objectiveTag: "ANNOUNCEMENT", templateSlugSnapshot: "event_reminder_24h", templateLanguageSnapshot: "en", headerMediaUrl: null, ctaSlug: null,
    templateVariables: [{ position: 1, value: "Aarav" }, { position: 2, value: "Neon Nights" }],
    stats: { messagesSent: status === "completed" ? count : 0, messagesSyncFailed: 0, messagesDelivered: status === "completed" ? count - 18 : 0, messagesRead: status === "completed" ? Math.floor(count * 0.7) : 0, messagesFailed: status === "completed" ? 18 : 0 },
    statusChangeHistory: [{ status: "draft", timestamp: iso(off - 2) }],
  };
}
function mkPushCampaign(id: string, name: string, status: string, off: number) {
  const done = status === "completed";
  return { _id: id, hostId: HOST_ID, businessId: HOST_ID, campaignName: name, pushTitle: name, pushBody: "Don't miss out — tickets are going fast.", deepLink: "/", imageUrl: null, eventId: "demo-event-1", csvDataUrl: null, filters: [],
    stats: { notificationsSent: done ? 1400 : 0, notificationsFailed: done ? 12 : 0, notificationsOpened: done ? [{ customerId: "demo-cust-1", date: iso(off) }] : [], notificationsClicked: done ? [{ customerId: "demo-cust-2", date: iso(off) }] : [] }, status,
    target: "ALL_ATTENDEES", targetCount: 1400, scheduleType: "IMMEDIATE", scheduleTime: iso(off), createdAt: iso(off - 1), updatedAt: iso(off),
    publicationStatus: status === "draft" ? "Drafted" : "Active", sentAt: status === "completed" ? iso(off) : null };
}
function mkAuto(key: string, title: string, description: string, active: boolean, sent: number, orders: number, rev: number) {
  return { key, title, description, channels: ["EMAIL", "WHATSAPP"], freeChannels: ["EMAIL"], active, emailEnabled: active, whatsappEnabled: active && key !== "event_reminder",
    pushEnabled: false, lastSentAt: active ? iso(-1) : null, totalSent: sent, attributedOrders: orders, attributedRevenue: rev };
}
function mkTemplate(id: string, name: string, title: string, category: string, body: string) {
  return { _id: id, name, templateName: name, title, category, language: "en", headerType: "NONE", headerText: null, body, bodyText: body, footer: "Sent via Hoizr",
    buttonType: "NONE", buttonText: null, buttonUrl: null, buttonPhone: null, isActive: true, source: "HOIZR", reviewStatus: "APPROVED_INTERNAL",
    reviewRejectionReason: null, requestNote: null, status: "APPROVED", variables: ["name", "event", "time"], createdAt: iso(-90), updatedAt: iso(-90) };
}

export type DemoDb = Record<string, any>;

let db: DemoDb | null = null;
const hydrate = (): DemoDb => {
  const fresh = seedDb();
  if (typeof window === "undefined") return fresh;
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      return { ...fresh, ...saved };
    }
  } catch {
    /* ignore */
  }
  return fresh;
};
export const getDb = (): DemoDb => (db ??= hydrate());
export const persistDb = () => {
  if (typeof window === "undefined" || !db) return;
  try {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* quota / private mode — keep in memory only */
  }
};
export const resetDb = () => {
  db = null;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(DEMO_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
};
export const dayKey = (d: Date) => d.toISOString().slice(0, 10);
