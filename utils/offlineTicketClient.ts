import { GraphQLClient } from "@/utils/demo/gqlClient";

/**
 * Self-contained client for the offline-ticketing flow. Works before
 * `yarn codegen` exposes these on the generated sdk. Ops match the
 * main-server offlineTicket resolver.
 */

const resolveEndpoint = (): string => {
  const base = process.env.NEXT_PUBLIC_SERVER_BASE_URL?.replace(/\/+$/, "");
  if (!base) return "http://localhost:4000/graphql";
  return base.endsWith("/graphql") ? base : `${base}/graphql`;
};

const client = new GraphQLClient(resolveEndpoint(), {
  credentials: "include",
  fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
    let res = await fetch(input, init);
    if (res.status === 401) {
      try {
        const refresher = new GraphQLClient(resolveEndpoint(), {
          credentials: "include",
        });
        await refresher.request(
          "mutation TokenRefresh { tokensRefresh }",
          {},
          init?.headers
        );
        res = await fetch(input, init);
      } catch {
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== "/login"
        ) {
          window.location.href = "/login";
        }
      }
    }
    return res;
  },
});

export type OfflineEventTicket = {
  _id: string;
  ticketName: string;
  ticketPrice: number;
  ticketVisible?: boolean | null;
  // Multi-day: the day this ticket admits ("ALL_DAYS" or an EventDay.dayId);
  // null on single-day events.
  dayId?: string | null;
};
export type OfflineEventDay = {
  dayId: string;
  title: string;
};
export type OfflineEventExtra = {
  _id: string;
  name: string;
  price: number;
};
export type OfflineEvent = {
  _id: string;
  title: string;
  eventFlyer?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
  markSeparateDays?: boolean | null;
  days?: OfflineEventDay[] | null;
  tickets?: OfflineEventTicket[] | null;
  extras?: OfflineEventExtra[] | null;
};

export type OfflineTicketLineInput = {
  itemId: string;
  name: string;
  // Per-day tag copied from the selected ticket so an offline multi-day ticket
  // scans valid only on its day (null/all-days behave as before).
  dayId?: string;
  quantity: number;
  unitPrice?: number;
  isExtra?: boolean;
};

export type OfflineOrderInput = {
  eventId: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerEmail?: string;
  customerPhone: string;
  lines: OfflineTicketLineInput[];
  notes?: string;
};

export type OfflinePaymentLinkResponse = {
  offlineOrderId: string;
  shortUrl: string;
  whatsappQueued: boolean;
  emailQueued: boolean;
};

/**
 * Events the host can issue offline tickets for RIGHT NOW — owned + events
 * they collaborate on with the allowIssuingOfflineTickets permission, gated
 * to PUBLISHED + not-ended on the server. (Was getMyEvents, which returned
 * owned-only and included drafts/ended events.)
 */
export const fetchMyEventsForOffline = async (): Promise<OfflineEvent[]> => {
  const data = await client.request<{ eventsForOfflineIssuing: OfflineEvent[] }>(
    `query {
      eventsForOfflineIssuing {
        _id
        title
        eventFlyer
        startDate
        endDate
        status
        markSeparateDays
        days { dayId title }
        tickets { _id ticketName ticketPrice ticketVisible dayId }
        extras { _id name price }
      }
    }`
  );
  return data.eventsForOfflineIssuing ?? [];
};

export const issueOfflineTicket = async (
  input: OfflineOrderInput
): Promise<{ _id: string; status: string }> => {
  const data = await client.request<{
    issueOfflineTicket: { _id: string; status: string };
  }>(
    `mutation ($input: OfflineOrderInput!) {
      issueOfflineTicket(input: $input) { _id status }
    }`,
    { input }
  );
  return data.issueOfflineTicket;
};

export type HostOrderRow = {
  orderId: string;
  eventId: string;
  eventTitle?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  ticketCount: number;
  totalAmount: number;
  status: string;
  checkedIn: boolean;
  source: string;
  createdAt?: string | null;
};

export type OfflineOrderRow = {
  _id: string;
  eventId: string;
  customerFirstName?: string | null;
  customerLastName?: string | null;
  customerEmail?: string | null;
  customerPhone: string;
  amountTotal: number;
  mode: string;
  status: string;
  createdByName?: string | null;
  createdByCollaborator: boolean;
  shortCode?: string | null;
  issuedOrderId?: string | null;
  linkedOrderId?: string | null;
  openedAt?: string | null;
  createdAt?: string | null;
};

export type HostCustomerRow = {
  customerId: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  showsAttended: number;
  orderCount: number;
  totalSpent: number;
  aov: number;
  customerSince?: string | null;
};

/** Customers who follow the host, with spend aggregates. */
export const fetchHostCustomers = async (
  page = 1,
  pageSize = 50
): Promise<{ items: HostCustomerRow[]; total: number }> => {
  const data = await client.request<{
    hostCustomers: { items: HostCustomerRow[]; total: number };
  }>(
    `query ($page: Int, $pageSize: Int) {
      hostCustomers(page: $page, pageSize: $pageSize) {
        total
        items {
          customerId name email phone
          showsAttended orderCount totalSpent aov customerSince
        }
      }
    }`,
    { page, pageSize }
  );
  return data.hostCustomers;
};

/** Confirmed orders across all the host's events, latest first. */
export const fetchHostOrders = async (
  eventId?: string,
  page = 1,
  pageSize = 50
): Promise<{ items: HostOrderRow[]; total: number }> => {
  const data = await client.request<{
    hostOrders: { items: HostOrderRow[]; total: number };
  }>(
    `query ($eventId: String, $page: Int, $pageSize: Int) {
      hostOrders(eventId: $eventId, page: $page, pageSize: $pageSize) {
        total
        items {
          orderId eventId eventTitle customerName customerEmail customerPhone
          ticketCount totalAmount status checkedIn source createdAt
        }
      }
    }`,
    { eventId, page, pageSize }
  );
  return data.hostOrders;
};

/** Offline orders (issued + payment-link) the host can see. */
export const fetchMyOfflineOrders = async (
  eventId?: string,
  page = 1,
  pageSize = 50
): Promise<{ items: OfflineOrderRow[]; total: number }> => {
  const data = await client.request<{
    myOfflineOrders: { items: OfflineOrderRow[]; total: number };
  }>(
    `query ($eventId: String, $page: Int, $pageSize: Int) {
      myOfflineOrders(eventId: $eventId, page: $page, pageSize: $pageSize) {
        total
        items {
          _id eventId customerFirstName customerLastName customerEmail customerPhone
          amountTotal mode status createdByName createdByCollaborator
          shortCode issuedOrderId linkedOrderId openedAt createdAt
        }
      }
    }`,
    { eventId, page, pageSize }
  );
  return data.myOfflineOrders;
};

export const createOfflinePaymentLink = async (
  input: OfflineOrderInput
): Promise<OfflinePaymentLinkResponse> => {
  const data = await client.request<{
    createOfflinePaymentLink: OfflinePaymentLinkResponse;
  }>(
    `mutation ($input: OfflineOrderInput!) {
      createOfflinePaymentLink(input: $input) {
        offlineOrderId shortUrl whatsappQueued emailQueued
      }
    }`,
    { input }
  );
  return data.createOfflinePaymentLink;
};
