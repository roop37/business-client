import { GraphQLClient } from "@/utils/demo/gqlClient";

/**
 * Self-contained client for the per-event ops queries (`eventCustomers`,
 * `eventOrders`) used by the event hub page. These aren't in the generated
 * `sdk` (the host/event-ops queries are issued as raw GraphQL throughout this
 * codebase — see `TicketOrdersModal` + `utils/activityLogClient.ts`). Mirrors
 * the env-resolving GraphQLClient + 401-refresh pattern; matches
 * `EventCustomersResponse` / `EventOrdersResponse` in main-server 1:1.
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

export type EventCustomerRow = {
  customerId: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  isGuest: boolean;
  ticketCount: number;
  orderCount: number;
  checkedInOrders: number;
  totalSpent: number;
  lastPurchaseAt?: string | null;
};

export type EventOrderRow = {
  orderId: string;
  shortId: string;
  customerId?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  isGuest: boolean;
  ticketSummary: string;
  ticketCount: number;
  totalAmount: number;
  status: string;
  checkedIn: boolean;
  createdAt?: string | null;
};

export type Paged<T> = { items: T[]; total: number };

export const fetchEventCustomers = async (
  eventId: string,
  page = 1,
  pageSize = 25
): Promise<Paged<EventCustomerRow>> => {
  const data = await client.request<{ eventCustomers: Paged<EventCustomerRow> }>(
    `query EventCustomers($eventId: String!, $page: Int, $pageSize: Int) {
       eventCustomers(eventId: $eventId, page: $page, pageSize: $pageSize) {
         total
         items {
           customerId name email phone isGuest
           ticketCount orderCount checkedInOrders totalSpent lastPurchaseAt
         }
       }
     }`,
    { eventId, page, pageSize }
  );
  return data.eventCustomers ?? { items: [], total: 0 };
};

export const fetchEventOrders = async (
  eventId: string,
  opts: {
    page?: number;
    pageSize?: number;
    ticketTypeId?: string;
    customerId?: string;
  } = {}
): Promise<Paged<EventOrderRow>> => {
  const data = await client.request<{ eventOrders: Paged<EventOrderRow> }>(
    `query EventOrders(
       $eventId: String!
       $page: Int
       $pageSize: Int
       $ticketTypeId: String
       $customerId: String
     ) {
       eventOrders(
         eventId: $eventId
         page: $page
         pageSize: $pageSize
         ticketTypeId: $ticketTypeId
         customerId: $customerId
       ) {
         total
         items {
           orderId shortId customerId customerName customerPhone isGuest
           ticketSummary ticketCount totalAmount status checkedIn createdAt
         }
       }
     }`,
    {
      eventId,
      page: opts.page ?? 1,
      pageSize: opts.pageSize ?? 25,
      ticketTypeId: opts.ticketTypeId,
      customerId: opts.customerId,
    }
  );
  return data.eventOrders ?? { items: [], total: 0 };
};
