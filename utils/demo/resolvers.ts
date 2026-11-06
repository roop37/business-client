/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Root-field resolvers for the demo engine. Keyed by GraphQL ROOT FIELD name.
 * Anything not listed falls back to auto-generated values (queries) or `true`
 * (leaf mutations), so the UI never breaks on an unknown operation.
 */
import { DEMO_STORAGE_KEY, HOST_ID, ALL_PERMISSIONS, getDb, persistDb, resetDb, iso, uid } from "./db";

type A = Record<string, any>;
const paged = <T,>(items: T[], a: A) => {
  const pageSize = a.pageSize ?? a.pagination?.rowsPerPage ?? 25;
  const page = a.page ?? a.pagination?.pageNumber ?? 1;
  const size = typeof pageSize === "number" ? pageSize : 25;
  return { total: items.length, items: items.slice((page - 1) * size, page * size) };
};
const eventById = (id: string) => getDb().events.find((e) => e._id === id);
const save = <T,>(v: T): T => (persistDb(), v);
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

const CITIES = [
  ["Bengaluru", "Karnataka"], ["Mumbai", "Maharashtra"], ["Delhi", "Delhi"], ["Pune", "Maharashtra"],
  ["Hyderabad", "Telangana"], ["Chennai", "Tamil Nadu"], ["Goa", "Goa"], ["Kolkata", "West Bengal"],
  ["Jaipur", "Rajasthan"], ["Ahmedabad", "Gujarat"], ["Kochi", "Kerala"], ["Chandigarh", "Chandigarh"],
];

const totals = () => {
  const { orders } = getDb();
  const paid = orders.filter((o) => o.status !== "REFUNDED");
  return { paid, gross: paid.reduce((s, o) => s + o.total, 0), tickets: paid.reduce((s, o) => s + o.qty, 0) };
};

const dashboardSummary = () => {
  const db = getDb();
  const { paid, gross, tickets } = totals();
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 86400000);
    const sales = Math.round(2500 + 3000 * Math.abs(Math.sin(i / 3.1)) + (i % 5) * 700);
    const t = Math.max(2, Math.round(sales / 850));
    return { date: d.toISOString().slice(0, 10), label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), sales, tickets: t, orderCount: Math.max(1, Math.round(t / 2.2)) };
  });
  const sum30 = days.reduce((s, d) => s + d.sales, 0);
  const t30 = days.reduce((s, d) => s + d.tickets, 0);
  const o30 = days.reduce((s, d) => s + d.orderCount, 0);
  const mix = (rows: [string, number, number][]) => {
    const tot = rows.reduce((s, r) => s + r[1], 0);
    return rows.map(([label, amount, count]) => ({ label, amount, count, percent: Math.round((amount / tot) * 100) }));
  };
  return {
    upcomingEventsCount: db.events.filter((e) => e.status === "PUBLISHED").length,
    publishedEventsCount: db.events.filter((e) => e.status === "PUBLISHED").length,
    draftEventsCount: db.events.filter((e) => e.status === "DRAFT").length,
    salesToday: days[29].sales, ticketsSoldToday: days[29].tickets,
    salesLast30Days: sum30, ticketsSoldLast30Days: t30, orderCountLast30Days: o30,
    averageOrderValueLast30Days: Math.round(sum30 / o30), pendingSettlementsCount: 2, paidOutLifetime: Math.round(gross * 0.9),
    marketingSubscribersCount: 4820, lifetimeCampaignMessagesSent: 7180, netTicketSales: Math.round(sum30 * 0.92), totalCollected: sum30,
    salesSeries: days,
    salesBySource: mix([["Hoizr marketplace", Math.round(sum30 * 0.52), 210], ["Direct link", Math.round(sum30 * 0.23), 96], ["Campaigns", Math.round(sum30 * 0.17), 71], ["Door / offline", Math.round(sum30 * 0.08), 33]]),
    ticketMix: mix([["General Admission", Math.round(sum30 * 0.45), 190], ["Early Bird", Math.round(sum30 * 0.2), 130], ["VIP", Math.round(sum30 * 0.25), 48], ["Table for 6", Math.round(sum30 * 0.1), 6]]),
    topItems: mix([["Neon Nights: Synthwave Rave", 182000, 240], ["Sunset Rooftop Sessions", 121000, 160], ["Comedy Cellar Night", 64000, 90], ["Indie Folk Evening", 41000, 70]]),
    upcomingCampaigns: db.emailCampaigns.filter((c) => c.status === "scheduled").map((c) => ({ id: c._id, name: c.campaignName, status: c.status, scheduledFor: c.scheduleTime, recipientCount: c.targetCount })),
  };
};

const hostReport = (a: A) => {
  const type: string = a.input?.type ?? "SALES_SUMMARY";
  const db = getDb();
  const { gross, tickets } = totals();
  const money = (n: number) => String(Math.round(n));
  const cols = (...c: [string, string, string?, string?][]) => c.map(([key, header, valueType = "Text", align = "left"]) => ({ key, header, valueType, align }));
  const rows = (items: Record<string, any>[]) => items.map((it) => ({ cells: Object.entries(it).map(([key, value]) => ({ key, value: String(value) })) }));
  const trend = (n = 10) => Array.from({ length: n }, (_, i) => ({ x: new Date(Date.now() - (n - 1 - i) * 86400000 * 3).toLocaleDateString("en-IN", { day: "numeric", month: "short" }), values: [{ key: "sales", value: String(Math.round(8000 + 9000 * Math.abs(Math.sin(i / 2)))) }, { key: "tickets", value: String(10 + ((i * 7) % 25)) }] }));
  const metrics = [
    { key: "net", label: "Net ticket sales", value: money(gross * 0.92), valueType: "Amount", helpText: "After refunds and discounts", trendValue: "12.4%", trendDirection: "up" },
    { key: "col", label: "Total collected", value: money(gross), valueType: "Amount", helpText: null, trendValue: "9.1%", trendDirection: "up" },
    { key: "tix", label: "Tickets sold", value: String(tickets), valueType: "Number", helpText: null, trendValue: "6.3%", trendDirection: "up" },
    { key: "aov", label: "Average order value", value: money(gross / Math.max(1, db.orders.length)), valueType: "Amount", helpText: null, trendValue: "1.8%", trendDirection: "down" },
  ];
  const chart = { key: "trend", title: "Daily trend", type: "Area", xKey: "date", seriesKeys: ["sales", "tickets"], points: trend() };
  const eventRows = db.events.filter((e) => e.status !== "DRAFT").map((e) => {
    const sold = e.tickets.reduce((s: number, t: any) => s + t.ticketSold, 0);
    const rev = e.tickets.reduce((s: number, t: any) => s + t.ticketSold * t.ticketPrice, 0);
    return { event: e.title, tickets: sold, gross: rev, net: Math.round(rev * 0.92), status: e.status };
  });
  const base = { type, freshnessLabel: "Updated just now", generatedAt: new Date().toISOString(), metrics, charts: [chart] };
  const eventTable = { title: "By event", columns: cols(["event", "Event"], ["tickets", "Tickets", "Number", "right"], ["gross", "Gross", "Amount", "right"], ["net", "Net", "Amount", "right"], ["status", "Status"]), rows: rows(eventRows) };
  switch (type) {
    case "ORDERS":
    case "REFUNDS":
      return { ...base, tables: [{ title: type === "REFUNDS" ? "Refunds & cancellations" : "Orders", columns: cols(["order", "Order"], ["event", "Event"], ["customer", "Customer"], ["tickets", "Tickets", "Number", "right"], ["total", "Total", "Amount", "right"], ["status", "Status"]),
        rows: rows(db.orders.filter((o) => (type === "REFUNDS" ? o.status === "REFUNDED" : true)).slice(0, 40).map((o) => ({ order: o.shortId, event: o.eventTitle, customer: o.customerName, tickets: o.qty, total: o.total, status: o.status }))) }] };
    case "TICKET_SALES_BY_TYPE":
      return { ...base, tables: [{ title: "Ticket types", columns: cols(["type", "Ticket type"], ["units", "Units", "Number", "right"], ["gross", "Gross", "Amount", "right"]), rows: rows(["Early Bird", "General Admission", "VIP", "Table for 6"].map((n, i) => ({ type: n, units: [420, 880, 190, 22][i], gross: [209580, 703120, 379810, 219978][i] }))) }] };
    case "DISCOUNTS":
      return { ...base, tables: [{ title: "Promo codes", columns: cols(["code", "Code"], ["uses", "Uses", "Number", "right"], ["discounted", "Discounted", "Amount", "right"], ["net", "Net sales", "Amount", "right"]), rows: rows(db.coupons.map((c) => ({ code: c.code, uses: c.usage.length * 4, discounted: c.usage.length * 640, net: c.totalSalesUsed }))) }] };
    case "CUSTOMERS_FANS":
      return { ...base, tables: [{ title: "Top fans", columns: cols(["name", "Fan"], ["orders", "Orders", "Number", "right"], ["spend", "Net spend", "Amount", "right"]), rows: rows([...db.customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 12).map((c) => ({ name: c.name, orders: c.orderCount, spend: c.totalSpent }))) }] };
    case "PAYOUTS_SETTLEMENT":
      return { ...base, tables: [{ title: "Settlements", columns: cols(["event", "Event"], ["gross", "Gross", "Amount", "right"], ["commission", "Commission", "Amount", "right"], ["net", "Net payout", "Amount", "right"], ["status", "Status"]), rows: rows(eventRows.map((r, i) => ({ event: r.event, gross: r.gross, commission: Math.round(r.gross * 0.05), net: Math.round(r.gross * 0.9), status: i % 3 === 0 ? "PENDING" : "PAID" }))) }] };
    default:
      return { ...base, tables: [eventTable] };
  }
};

const mkOrderDetail = (orderId: string) => {
  const db = getDb();
  const o = db.orders.find((x) => x.orderId === orderId) ?? db.orders[0];
  const ev = eventById(o.eventId);
  const taxes = Math.round(o.subtotal * 0.0);
  return {
    orderId: o.orderId, event: { id: o.eventId, title: o.eventTitle, startDate: o.eventDate, location: ev?.location?.formattedAddress, city: ev?.city, flyer: ev?.eventFlyer },
    customer: { name: o.customerName, email: o.customerEmail, phone: o.customerPhone, isGuest: o.isGuest },
    tickets: [{ name: o.ticketName, qty: o.qty, price: o.price, lineTotal: o.subtotal }],
    money: { subtotal: o.subtotal, discount: 0, taxes, platformFee: o.fee, platformFeeGst: Math.round(o.fee * 0.18), taxesAndFees: o.total - o.subtotal, totalAmount: o.total, refundAmount: o.status === "REFUNDED" ? o.total : null },
    couponCode: null, status: o.status, source: "ONLINE", checkedIn: o.checkedIn, refundable: o.status === "PAYMENT_SUCCESS", createdAt: o.createdAt, refundedAt: o.refundedAt,
  };
};

const updateById = (list: any[], id: string, patch: A) => {
  const item = list.find((x) => x._id === id);
  if (item) Object.assign(item, patch);
  return item;
};
const stripUndef = (o: A) => Object.fromEntries(Object.entries(o ?? {}).filter(([, v]) => v !== undefined));

export const resolvers: Record<string, (a: A) => any> = {
  // ── Auth / session ───────────────────────────────────────────────────────
  userLogout: () => { resetDb(); return true; },
  userLogoutFromEverywhere: () => { resetDb(); return true; },
  userLogin: () => true, userLoginVerification: () => true, userSignup: () => true, userSignupVerification: () => true,
  tokensRefresh: () => true,
  meUser: () => clone(getDb().user),
  meContactDetails: () => ({ email: getDb().user.email, phone: getDb().user.phone }),
  meUserJourney: () => ({ userStatus: "ACTIVE", hostStatus: "ACTIVE", hostOnboardingCompleted: true, isAdminVerified: true, canPublish: true, suggestedRoute: "/dashboard", hostId: HOST_ID }),
  markWalkthroughDone: () => true,
  updateUserDetails: (a) => { Object.assign(getDb().user, stripUndef(a.input)); return save(true); },
  enable2FA: () => "otpauth://totp/Hoizr:demo?secret=DEMODEMODEMODEMO&issuer=Hoizr",
  disable2FA: () => true, verify2FASetup: () => true, isMultiAccountUser: () => false, setHostIdAsCookie: () => true,
  // ── Host ─────────────────────────────────────────────────────────────────
  getHostsByBusiness: () => [clone(getDb().host)],
  getHost: () => clone(getDb().host),
  getCurrentHostOnboarding: () => clone(getDb().host),
  createHost: () => HOST_ID,
  updateHost: (a) => { Object.assign(getDb().host, stripUndef(a.input)); return save(true); },
  uploadHostLogo: (a) => { getDb().host.logo = a.logo || getDb().host.logo; return save(getDb().host.logo); },
  completeHostOnboarding: () => true, startNewHostOnboarding: () => true,
  getHostDashboardSummary: () => dashboardSummary(),
  getPlacesList: (a) => [{ placeId: "demo-p1", displayName: `${a.input || "Demo"} Arena, Bengaluru` }, { placeId: "demo-p2", displayName: `${a.input || "Demo"} Club, Mumbai` }, { placeId: "demo-p3", displayName: `${a.input || "Demo"} Hall, Delhi` }],
  getPlaceDetails: () => ({ latitude: 12.9716, longitude: 77.5946, city: "Bengaluru", state: "Karnataka", address: "Demo Arena, Main Road, Bengaluru", zipcode: "560001" }),
  eventOnboardingChecklist: () => ({ logo: true, adminverification: true, payout: true, event: true, Scanner: true, nextSteps: [] }),
  // ── Masters ──────────────────────────────────────────────────────────────
  getActiveIndianCities: () => CITIES.map(([value, state], i) => ({ _id: `city-${i}`, value, state })),
  getActiveStates: () => Array.from(new Set(CITIES.map((c) => c[1]))).map((s) => ({ _id: s, value: s })),
  getActiveEventCategories: () => ["Music", "Comedy", "Nightlife", "Workshops", "Food & Drink", "Sports"].map((v, i) => ({ _id: `cat-${i}`, value: v, description: `${v} events` })),
  getActiveGenreTags: () => ["Electronic", "Techno", "Indie", "Folk", "Jazz", "Hip-hop", "Stand-up", "Bollywood"].map((v, i) => ({ _id: i < 2 ? `demo-genre-${i + 1}` : `genre-${i}`, value: v })),
  getActiveLanguages: () => [["English", "en", "English"], ["Hindi", "hi", "हिन्दी"], ["Kannada", "kn", "ಕನ್ನಡ"], ["Tamil", "ta", "தமிழ்"]].map(([value, code, nativeName], i) => ({ _id: i === 0 ? "demo-lang-1" : `lang-${i}`, code, value, nativeName, isIndian: i > 0, order: i })),
  getActiveProhibitedItems: () => ["Outside food & drink", "Weapons", "Professional cameras", "Drugs"].map((value, i) => ({ _id: `pi-${i}`, slug: value.toLowerCase().replace(/\W+/g, "-"), value, description: null, order: i })),
  getConfig: () => ({ _id: "cfg", type: "DEMO", valueType: "TEXT", textVal: "", numVal: 0, boolVal: true, createdBy: { firstName: "Demo", lastName: "Admin" }, updatedBy: { firstName: "Demo", lastName: "Admin" }, createdAt: iso(-100), updatedAt: iso(-10) }),
  getMarketingPricing: () => ({ emailRate: 0.5, smsRate: 0.25, whatsappRate: 0.9, pushRate: 0.1, gstPercent: 18, platformFeePercent: 2, currency: "INR" }),
  getAllPermissions: () => ALL_PERMISSIONS.map((type, i) => ({ _id: `perm-${i}`, type, preselect: ["OWNER", "MANAGER"], isFunction: false })),
  // ── Events ───────────────────────────────────────────────────────────────
  getMyEvents: () => clone(getDb().events),
  getMyCollaboratedEvents: () => [],
  respondToEventCollaboration: () => true,
  getEvent: (a) => clone(eventById(a.id) ?? getDb().events[0]),
  getEventManageOverview: (a) => {
    const e = clone(eventById(a.id) ?? getDb().events[0]);
    e.totals = { capacity: e.tickets.reduce((s: number, t: any) => s + t.ticketCapacity, 0), sold: e.tickets.reduce((s: number, t: any) => s + t.ticketSold, 0), grossRevenue: e.tickets.reduce((s: number, t: any) => s + t.ticketSold * t.ticketPrice, 0) };
    return e;
  },
  createEvent: (a) => {
    const db = getDb();
    const title = a.input?.title || "Untitled event";
    const e = { ...clone(db.events[0]), _id: uid("demo-event"), title, status: "DRAFT", slug: title.toLowerCase().replace(/\W+/g, "-"), isVisible: false, ticketingEnabled: false, tickets: [], ...stripUndef(a.input) };
    db.events.unshift(e); return save(e);
  },
  updateEventStep: (a) => save(Object.assign(eventById(a.id) ?? {}, stripUndef(a.stepInput))),
  updateEvent: (a) => save(Object.assign(eventById(a.id) ?? {}, stripUndef(a.input))),
  duplicateEvent: (a) => { const db = getDb(); const src = eventById(a.id) ?? db.events[0]; const e = { ...clone(src), _id: uid("demo-event"), title: `${src.title} (Copy)`, status: "DRAFT", slug: `${src.slug}-copy` }; db.events.unshift(e); return save(e); },
  deleteEvent: (a) => { const db = getDb(); db.events = db.events.filter((e) => e._id !== a.id); return save(true); },
  publishEvent: (a) => { const e = eventById(a.id); if (e) { e.status = "PUBLISHED"; e.isVisible = true; e.ticketingEnabled = true; } return save(true); },
  setEventTicketVisibility: (a) => { const t = eventById(a.id)?.tickets.find((x: any) => x._id === a.ticketId); if (t) t.ticketVisible = a.visible; return save(true); },
  setEventGuestlistSettings: (a) => { const e = eventById(a.input?.eventId); if (e) Object.assign(e, { guestlistEnabled: a.input.guestlistEnabled, guestlistAutoAccept: a.input.guestlistAutoAccept, guestlistMaxCapacity: a.input.guestlistMaxCapacity }); return save(true); },
  searchEventArtists: (a) => ["DJ Aurora", "The Midnight Echo", "Luna Rao", "Kabir & The Keys", "Neon Fox"].filter((n) => n.toLowerCase().includes((a.search || "").toLowerCase())).map((name, i) => ({ id: `artist-${i}`, source: "HOIZR", name, picture: `/demo/avatar-${(i % 2) + 1}.svg`, artistLinkId: `artist-${i}` })),
  searchCollaboratorHosts: (a) => ["Pulse Collective", "Skyline Events", "Echo Venues"].filter((n) => n.toLowerCase().includes((a.search || "").toLowerCase())).map((name, i) => ({ _id: `collab-${i}`, businessLinkId: `collab-${i}`, name, logo: "/demo/logo.svg" })),
  // Guestlists
  eventGuestlists: (a) => {
    const db = getDb();
    if (!db.guestlists.some((g) => g.eventId === a.eventId)) {
      db.guestlists.push({ _id: uid("gl"), eventId: a.eventId, contributorType: "HOST", contributorId: HOST_ID, contributorName: "Neon Nights Collective", cap: 50, isPublic: true, code: "NEON50", isActive: true, manageEnabled: true, isOpen: true });
      const gl = db.guestlists[db.guestlists.length - 1];
      ["Aarav Sharma", "Diya Iyer", "Rohan Reddy", "Meera Nair", "Kabir Patel"].forEach((n, i) => db.guestlistEntries.push({ _id: uid("gle"), guestlistId: gl._id, eventId: a.eventId, guestName: n, guestEmail: `${n.split(" ")[0].toLowerCase()}@example.com`, guestPhone: "+919800000000", status: i < 3 ? "ACCEPTED" : "PENDING", checkedIn: i === 0, checkedInAt: i === 0 ? iso(-1) : null, createdAt: iso(-3), revokedAt: null }));
    }
    return db.guestlists.filter((g) => g.eventId === a.eventId);
  },
  upsertGuestlist: (a) => { const db = getDb(); const i = a.input; const ex = db.guestlists.find((g) => g.eventId === i.eventId && g.contributorId === i.contributorId); if (ex) return save(Object.assign(ex, stripUndef(i))); const g = { _id: uid("gl"), code: uid("GL").toUpperCase().slice(0, 8), isActive: true, manageEnabled: true, isOpen: true, isPublic: true, ...stripUndef(i) }; db.guestlists.push(g); return save(g); },
  guestlistEntries: (a) => { const db = getDb(); resolvers.eventGuestlists({ eventId: a.eventId }); return db.guestlistEntries.filter((e) => e.eventId === a.eventId && (!a.guestlistId || e.guestlistId === a.guestlistId)); },
  guestlistEntriesCsv: () => "name,email,phone,status\nAarav Sharma,aarav@example.com,+919800000000,ACCEPTED\n",
  approveGuestlistEntry: (a) => { updateById(getDb().guestlistEntries, a.entryId, { status: "ACCEPTED" }); return save(true); },
  revokeGuestlistEntry: (a) => { updateById(getDb().guestlistEntries, a.entryId, { status: "REVOKED", revokedAt: iso(0) }); return save(true); },
  // Scanners
  listScannersForEvent: (a) => getDb().scanners.filter((s) => s.eventId === a.eventId),
  createScanner: (a) => { const s = { _id: uid("demo-scanner"), name: a.input?.scannerName, scannerName: a.input?.scannerName, scannerType: "STAFF", email: null, phone: a.input?.phone ?? null, eventId: a.input?.eventId, totalScanned: 0, lastLoginAt: null, isActive: true, createdAt: iso(0) }; getDb().scanners.push(s); return save({ scanner: s, accessCode: "DEMO-4821" }); },
  updateScanner: (a) => save(updateById(getDb().scanners, a.input?._id ?? a.input?.scannerId, stripUndef(a.input))),
  regenerateScannerAccessCode: (a) => ({ scanner: { _id: a.scannerId }, accessCode: `DEMO-${Math.floor(1000 + Math.random() * 9000)}` }),
  deleteScanner: (a) => { const db = getDb(); db.scanners = db.scanners.filter((s) => s._id !== a.scannerId); return save(true); },
  hostRevokeAllScannersForEvent: (a) => { getDb().scanners.filter((s) => s.eventId === a.eventId).forEach((s) => (s.isActive = false)); return save(true); },
  hostListEventScans: (a) => paged(getDb().orders.filter((o) => o.eventId === a.eventId && o.checkedIn).map((o) => ({ orderId: o.orderId, customerName: o.customerName, customerPhone: o.customerPhone, ticketCount: o.qty, ticketNames: [o.ticketName], checkedInAt: o.createdAt, scannerId: "demo-scanner-1", scannerName: "Main Gate" })), a),
  hostReverseCheckIn: (a) => { const o = getDb().orders.find((x) => x.orderId === a.orderId); if (o) { o.checkedIn = false; o.status = "PAYMENT_SUCCESS"; } return save(true); },
  // Orders / customers
  eventCustomers: (a) => paged(getDb().customers.filter((c) => c.orderCount > 0).map((c) => ({ ...c })), a),
  eventOrders: (a) => paged(getDb().orders.filter((o) => (!a.eventId || o.eventId === a.eventId) && (!a.customerId || o.customerId === a.customerId) && (!a.ticketTypeId || o.ticketId === a.ticketTypeId)), a),
  eventTicketOrders: (a) => paged(getDb().orders.filter((o) => o.eventId === a.eventId && o.ticketId === a.ticketId), a),
  hostCustomers: (a) => paged(getDb().customers, a),
  hostCustomerOrders: (a) => paged(getDb().orders.filter((o) => o.customerId === a.customerId), a),
  hostOrders: (a) => paged(getDb().orders.filter((o) => !a.eventId || o.eventId === a.eventId).map((o) => ({ ...o, source: "ONLINE" })), a),
  hostOrderDetail: (a) => mkOrderDetail(a.orderId),
  hostRefundOrder: (a) => { const o = getDb().orders.find((x) => x.orderId === a.orderId); if (o) { o.status = "REFUNDED"; o.refundedAt = iso(0); } save(0); return { orderId: a.orderId, status: "REFUNDED", refundAmount: o?.total ?? 0, refundedAt: iso(0) }; },
  // Offline tickets
  eventsForOfflineIssuing: () => getDb().events.filter((e) => e.status === "PUBLISHED").map((e) => ({ _id: e._id, title: e.title, startDate: e.startDate, city: e.city, tickets: e.tickets })),
  myOfflineOrders: (a) => paged(getDb().offlineOrders.filter((o: any) => !a.eventId || o.eventId === a.eventId), a),
  // ── Reports / analytics ──────────────────────────────────────────────────
  getHostReport: (a) => hostReport(a),
  getHostPromoUsage: (a) => ({ title: `Usage of ${a.input?.code ?? "promo"}`, columns: [{ key: "name", header: "Customer", align: "left", valueType: "Text" }, { key: "saleAmount", header: "Sale", align: "right", valueType: "Amount" }], rows: getDb().customers.slice(0, 6).map((c) => ({ cells: [{ key: "name", value: c.name }, { key: "saleAmount", value: "1800" }] })) }),
  getActivityLogs: (a) => { const l = getDb().activity; const size = typeof a.pagination?.rowsPerPage === "string" ? ({ TEN: 10, TWENTY_FIVE: 25, THIRTY: 30, FIFTY: 50, HUNDRED: 100 } as any)[a.pagination.rowsPerPage] ?? 25 : 25; const page = a.pagination?.pageNumber ?? 1; const q = (a.search ?? "").toLowerCase(); const f = q ? l.filter((x) => JSON.stringify(x).toLowerCase().includes(q)) : l; return { total: f.length, activityLogs: f.slice((page - 1) * size, page * size) }; },
  hostLoyaltyLeaderboard: (a) => paged([...getDb().customers].sort((x, y) => y.lifetimePoints - x.lifetimePoints).map((c, i) => ({ rank: i + 1, customerId: c.customerId, name: c.name, lifetimePoints: c.lifetimePoints, balance: Math.round(c.lifetimePoints * 0.6), lastEarnedAt: c.lastPurchaseAt })), a),
  hostEventFeedback: (a) => { const l = getDb().feedback.filter((f) => !a.eventId || f.eventId === a.eventId); return { total: l.length, averageRating: l.reduce((s, f) => s + f.rating, 0) / Math.max(1, l.length), items: l }; },
  submitHostFeedback: () => true, submitAutomationSuggestion: () => true,
  // ── Coupons / loyalty / automations ─────────────────────────────────────
  myCoupons: () => ({ total: getDb().coupons.length, items: clone(getDb().coupons) }),
  couponById: (a) => clone(getDb().coupons.find((c) => c._id === a.couponId) ?? null),
  createCoupon: (a) => { const c = { _id: uid("demo-coupon"), isActive: true, totalSalesUsed: 0, usage: [], showToCustomers: true, couponUsageType: "EntireSale", createdAt: iso(0), ...stripUndef(a.input) }; getDb().coupons.unshift(c); return save(c); },
  updateCoupon: (a) => save(updateById(getDb().coupons, a.input?.couponId, stripUndef({ ...a.input, couponId: undefined }))),
  toggleCouponActive: (a) => save(updateById(getDb().coupons, a.couponId, { isActive: a.active })),
  deleteCoupon: (a) => { const db = getDb(); db.coupons = db.coupons.filter((c) => c._id !== a.couponId); return save(true); },
  myLoyaltyRewards: () => ({ total: getDb().rewards.length, items: clone(getDb().rewards) }),
  createLoyaltyReward: (a) => { const r = { _id: uid("demo-reward"), active: true, redeemedCount: 0, createdAt: iso(0), ...stripUndef(a.input) }; getDb().rewards.unshift(r); return save(r); },
  updateLoyaltyReward: (a) => save(updateById(getDb().rewards, a.input?.rewardId, stripUndef({ ...a.input, rewardId: undefined }))),
  toggleLoyaltyRewardActive: (a) => save(updateById(getDb().rewards, a.rewardId, { active: a.active })),
  deleteLoyaltyReward: (a) => { const db = getDb(); db.rewards = db.rewards.filter((r) => r._id !== a.rewardId); return save(true); },
  myAutomations: () => ({ items: clone(getDb().automations), total: getDb().automations.length }),
  automation: (a) => clone(getDb().automations.find((x) => x.key === a.key) ?? getDb().automations[0]),
  setAutomationActive: (a) => { const x = getDb().automations.find((y) => y.key === a.key); if (x) { x.active = a.active; x.emailEnabled = a.active; } return save(clone(x)); },
  setAutomationChannel: (a) => { const x: any = getDb().automations.find((y) => y.key === a.key); if (x) x[`${a.channel.toLowerCase()}Enabled`] = a.enabled; return save(clone(x)); },
  automationEventBreakdown: () => getDb().events.filter((e) => e.status !== "DRAFT").slice(0, 4).map((e, i) => ({ eventId: e._id, eventTitle: e.title, emailsSent: 300 - i * 50, whatsappSent: 140 - i * 20, conversions: 24 - i * 4, attributedRevenue: 18000 - i * 3000 })),
  // ── Campaigns ────────────────────────────────────────────────────────────
  getAllHostEmailCampaigns: () => paged(clone(getDb().emailCampaigns), {}),
  fetchHostCampaignById: (a) => clone(getDb().emailCampaigns.find((c) => c._id === a.campaignId) ?? getDb().emailCampaigns[0]),
  createHostEmailCampaign: (a) => { const c = { ...getDb().emailCampaigns[2], _id: uid("demo-camp"), status: "draft", campaignName: a.input?.campaignName ?? "New campaign", emailSubject: a.input?.emailSubject ?? "", createdAt: iso(0), updatedAt: iso(0), ...stripUndef(a.input) }; getDb().emailCampaigns.unshift(c); return save(c._id); },
  updateHostEmailCampaign: (a) => { updateById(getDb().emailCampaigns, a.input?.campaignId ?? a.input?._id, stripUndef({ ...a.input, campaignId: undefined })); return save(true); },
  deleteHostEmailCampaign: (a) => { const db = getDb(); db.emailCampaigns = db.emailCampaigns.filter((c) => c._id !== a.campaignId); return save(true); },
  duplicateHostEmailCampaign: (a) => { const db = getDb(); const s = db.emailCampaigns.find((c) => c._id === a.campaignId) ?? db.emailCampaigns[0]; const c = { ...clone(s), _id: uid("demo-camp"), campaignName: `${s.campaignName} (Copy)`, status: "draft" }; db.emailCampaigns.unshift(c); return save(c._id); },
  resumeHostEmailCampaign: (a) => { updateById(getDb().emailCampaigns, a.campaignId, { status: "scheduled" }); return save(true); },
  getHostAttendeesTargetCount: () => 1842, getHostWhatsAppAttendeesTargetCount: () => 1380, hostEmailCampaignCsvExport: () => "email\naarav@example.com\n", sendTestHostCampaignEmail: () => true,
  getAllHostWhatsAppCampaigns: () => paged(clone(getDb().waCampaigns), {}),
  fetchHostWhatsAppCampaignById: (a) => clone(getDb().waCampaigns.find((c) => c._id === a.campaignId) ?? getDb().waCampaigns[0]),
  createHostWhatsAppCampaign: (a) => { const c = { ...clone(getDb().waCampaigns[1]), _id: uid("demo-wa"), status: "draft", ...stripUndef(a.input), createdAt: iso(0) }; getDb().waCampaigns.unshift(c); return save(c._id); },
  updateHostWhatsAppCampaign: (a) => { updateById(getDb().waCampaigns, a.input?.campaignId ?? a.input?._id, stripUndef({ ...a.input, campaignId: undefined })); return save(true); },
  deleteHostWhatsAppCampaign: (a) => { const db = getDb(); db.waCampaigns = db.waCampaigns.filter((c) => c._id !== a.campaignId); return save(true); },
  duplicateHostWhatsAppCampaign: (a) => { const db = getDb(); const s = db.waCampaigns.find((c) => c._id === a.campaignId) ?? db.waCampaigns[0]; const c = { ...clone(s), _id: uid("demo-wa"), campaignName: `${s.campaignName} (Copy)`, status: "draft" }; db.waCampaigns.unshift(c); return save(c._id); },
  resumeHostWhatsAppCampaign: (a) => { updateById(getDb().waCampaigns, a.campaignId, { status: "scheduled" }); return save(true); },
  getAllHostPushCampaigns: () => paged(clone(getDb().pushCampaigns), {}),
  fetchHostPushCampaignById: (a) => clone(getDb().pushCampaigns.find((c) => c._id === a.campaignId) ?? getDb().pushCampaigns[0]),
  createHostPushCampaign: (a) => { const c = { ...clone(getDb().pushCampaigns[1]), _id: uid("demo-push"), ...stripUndef(a.input), createdAt: iso(0) }; getDb().pushCampaigns.unshift(c); return save(c._id); },
  updateHostPushCampaign: (a) => { updateById(getDb().pushCampaigns, a.input?.campaignId ?? a.input?._id, stripUndef({ ...a.input, campaignId: undefined })); return save(true); },
  deleteHostPushCampaign: (a) => { const db = getDb(); db.pushCampaigns = db.pushCampaigns.filter((c) => c._id !== a.campaignId); return save(true); },
  publishHostPushCampaign: (a) => { updateById(getDb().pushCampaigns, a.campaignId, { status: "scheduled", publicationStatus: "Active" }); return save(true); },
  approvedWhatsAppTemplates: () => { const l = getDb().templates.map((t) => ({ ...t, slug: t.name, metaStatus: "APPROVED", variables: [{ position: 1, example: "Aarav" }, { position: 2, example: "Neon Nights" }] })); return { total: l.length, items: l }; },
  selectableWhatsAppTemplates: () => ({ total: getDb().templates.length, items: clone(getDb().templates) }),
  myWhatsAppTemplates: () => ({ total: 1, items: [clone(getDb().templates[0])] }),
  myWhatsAppTemplateBookmarks: () => ({ total: getDb().bookmarks.length, items: getDb().templates.filter((t) => getDb().bookmarks.includes(t._id)) }),
  myWhatsAppTemplateBookmarkIds: () => getDb().bookmarks,
  whatsAppTemplateById: (a) => clone(getDb().templates.find((t) => t._id === a.templateId) ?? getDb().templates[0]),
  bookmarkWhatsAppTemplate: (a) => { const b = getDb().bookmarks; if (!b.includes(a.templateId)) b.push(a.templateId); return save(true); },
  unbookmarkWhatsAppTemplate: (a) => { const db = getDb(); db.bookmarks = db.bookmarks.filter((x) => x !== a.templateId); return save(true); },
  // Marketing credits
  myMarketingCreditLedger: (a) => ({ balance: getDb().marketingBalance, total: getDb().ledger.length, items: getDb().ledger.map((l) => ({ ...l, businessId: HOST_ID, hostId: HOST_ID })), ...(a ? {} : {}) }),
  myMarketingReputation: () => ({ tier: "GROWING", effectiveTier: "GROWING", tierLabel: "Growing", tierTagline: "Your sender reputation is healthy", maxRecipients: 5000, unlimited: false, source: "AUTO", lifetimeRecipientsSent: 7180, verifiedCustomerCount: 4820, lifetimeCampaignCount: 9, nextTier: "ESTABLISHED", nextTierLabel: "Established", recipientsToNextTier: 2820, progressPercentToNextTier: 72, benefits: ["Up to 5,000 recipients per campaign", "Priority email delivery", "WhatsApp broadcast access"], channels: [{ channel: "EMAIL", maxRecipients: 5000, unlimited: false, status: "ACTIVE" }, { channel: "WHATSAPP", maxRecipients: 2500, unlimited: false, status: "ACTIVE" }] }),
  createMarketingCreditTopUpOrder: (a) => ({ razorpayOrderId: "order_demo", razorpayKeyId: "rzp_demo", creditsAmount: a.input?.amount ?? 1000, gstAmount: 180, platformFeeAmount: 20, payableAmount: (a.input?.amount ?? 1000) + 200, currency: "INR", receipt: "demo_receipt" }),
  verifyMarketingCreditTopUp: (a) => { const db = getDb(); const amt = 1000; db.marketingBalance += amt; const entry = { _id: uid("led"), type: "CREDIT", amount: amt, balance: db.marketingBalance, activity: "Top-up", recipients: null, channel: null, campaignId: null, paymentReference: "pay_demo", createdAt: iso(0), updatedAt: iso(0) }; db.ledger.unshift(entry); void a; return save({ balance: db.marketingBalance, entry }); },
  // ── Payouts ──────────────────────────────────────────────────────────────
  hostPayoutAccounts: () => clone(getDb().payoutAccounts),
  hostListPayoutSettlements: () => { const evs = getDb().events.filter((e) => e.status !== "DRAFT"); const items = evs.map((e, i) => { const gross = e.tickets.reduce((s: number, t: any) => s + t.ticketSold * t.ticketPrice, 0); const comm = Math.round(gross * 0.05); return { _id: `demo-settle-${i}`, eventId: e._id, grossAmount: gross, hoizrCommissionTotal: comm, hoizrCommissionGstTotal: Math.round(comm * 0.18), ticketGstFlowThroughTotal: 0, razorpayFeeTotal: Math.round(gross * 0.02), netPayoutAmount: Math.round(gross * 0.92 - comm * 0.18), refundsTotal: Math.round(gross * 0.01), chargebacksTotal: 0, orderCount: 10 + i * 3, status: e.status === "COMPLETED" ? "PAID" : "PENDING", scheduledFor: iso(i - 6), paidAt: e.status === "COMPLETED" ? iso(-5 - i) : null, settlementNote: null, createdAt: iso(-20 + i), updatedAt: iso(-5) }; }); return { total: items.length, items }; },
  addPayout: () => save({ _id: uid("demo-payout"), verificationStatus: "PENDING" }),
  addHostPayoutAccount: (a) => { const acc = { ...clone(getDb().payoutAccounts[0]), _id: uid("demo-payout"), isPrimary: false, verificationStatus: "PENDING", ...stripUndef(a.input), last4: String(a.input?.accountNumber ?? "0000").slice(-4) }; getDb().payoutAccounts.push(acc); return save(acc); },
  setPrimaryPayout: (a) => { getDb().payoutAccounts.forEach((p) => (p.isPrimary = p._id === a.id)); return save({ _id: a.id, isPrimary: true }); },
  setPrimaryHostPayoutAccount: (a) => { getDb().payoutAccounts.forEach((p) => (p.isPrimary = p._id === a.id)); return save({ _id: a.id, isPrimary: true }); },
  // ── Team ─────────────────────────────────────────────────────────────────
  getTeamMembers: () => clone(getDb().team),
  getUser: (a) => { const m = getDb().team.find((t) => t._id._id === a.id); return { _id: a.id, permissions: ALL_PERMISSIONS.map((type) => ({ type, status: true, id: `perm-${type}` })), role: "HOST", teamRole: m?.role ?? "MANAGER", hosts: [{ _id: HOST_ID }] }; },
  addTeamMember: (a) => { const i = a.AddTeamMemberInput ?? a.input ?? {}; getDb().team.push({ _id: { _id: uid("demo-user") }, firstName: i.firstName ?? "New", lastName: i.lastName ?? "Member", email: i.email ?? "new@example.com", phone: i.phone ?? "", role: i.role ?? "Staff", status: "SUB_USER_EMAIL_VERIFICATION_PENDING" }); return save(true); },
  deleteTeamMember: (a) => { const db = getDb(); db.team = db.team.filter((t) => t._id._id !== a.id); return save(true); },
  updateSubuserRole: (a) => { const m = getDb().team.find((t) => t._id._id === a.input?.id || t._id._id === a.input?.userId); if (m) m.role = a.input?.role ?? m.role; return save(true); },
  updateSubuserPermissions: () => true, verifyTeamEmail: () => true,
  // ── Developers ───────────────────────────────────────────────────────────
  hostApiKeys: () => clone(getDb().apiKeys),
  createHostApiKey: (a) => { const k = { _id: uid("demo-key"), keyType: a.keyType, prefix: a.keyType === "SECRET" ? "sk_demo" : "pk_demo", last4: Math.random().toString(16).slice(2, 6), allowedDomains: a.allowedDomains ?? [], label: a.label ?? null, lastUsedAt: null, revoked: false, createdAt: iso(0) }; getDb().apiKeys.unshift(k); return save({ raw: `${k.prefix}_${Math.random().toString(36).slice(2)}${k.last4}`, key: k }); },
  revokeHostApiKey: (a) => { updateById(getDb().apiKeys, a.id, { revoked: true }); return save(true); },
  updateHostApiKeyDomains: (a) => save(updateById(getDb().apiKeys, a.id, { allowedDomains: a.allowedDomains })),
  hostWebhooks: () => clone(getDb().webhooks),
  hostWebhookDeliveries: () => Array.from({ length: 8 }, (_, i) => ({ _id: `demo-del-${i}`, eventType: ["ORDER_PAID", "ORDER_REFUNDED"][i % 2], status: i === 3 ? "FAILED" : "SUCCEEDED", attempts: i === 3 ? 3 : 1, lastResponseCode: i === 3 ? 500 : 200, lastError: i === 3 ? "Upstream returned 500" : null, deliveredAt: i === 3 ? null : iso(-i), createdAt: iso(-i) })),
  createHostWebhook: (a) => { const w = { _id: uid("demo-wh"), url: a.input?.url, secretLast6: "d3m0s3", enabledEvents: a.input?.enabledEvents ?? ["ORDER_PAID"], active: true, label: a.input?.label ?? null, lastDeliveryAt: null, createdAt: iso(0) }; getDb().webhooks.unshift(w); return save({ secret: "whsec_demo_secret_d3m0s3", webhook: w }); },
  updateHostWebhook: (a) => save(updateById(getDb().webhooks, a.input?.id ?? a.input?._id, stripUndef({ ...a.input, id: undefined }))),
  rotateHostWebhookSecret: (a) => ({ secret: "whsec_demo_rotated_r0t4t3", webhook: { _id: a.id, secretLast6: "r0t4t3" } }),
  deleteHostWebhook: (a) => { const db = getDb(); db.webhooks = db.webhooks.filter((w) => w._id !== a.id); return save(true); },
  // ── Settings / misc ──────────────────────────────────────────────────────
  getMyHostContentDefaults: () => clone(getDb().contentDefaults),
  saveMyHostContentDefaults: (a) => save(Object.assign(getDb().contentDefaults, stripUndef(a.input))),
  deleteHostCloudinaryAsset: () => true,
  createWhitelabelRequest: () => ({ _id: "demo-wl-1", status: "PENDING" }), submitWhitelabelRequest: () => true,
  // Run-eval / AI helpers
  runEventEval: () => ({ score: 86, suggestions: [] }),
  autoGenerateEventDescription: (a) => ({ description: eventById(a.eventId)?.description ?? "A great night out." }),
};

export const DEMO_RESOLVER_KEYS = Object.keys(resolvers);
void DEMO_STORAGE_KEY;
