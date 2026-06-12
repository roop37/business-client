import { GraphQLClient } from "graphql-request";

/**
 * Self-contained client for the host order-receipt modal. Mirrors
 * `whatsappCampaignClient.ts` / `offlineTicketClient.ts`: own GraphQLClient
 * with 401-refresh, hand-written types. Works before `yarn codegen` exposes
 * `hostOrderDetail` / `hostRefundOrder` on the generated sdk. Ops match the
 * main-server hostOrders resolver 1:1.
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

// ── Types (mirror the hostOrders detail @ObjectType) ───────────────────────

export type HostOrderDetailEvent = {
  id: string;
  title?: string | null;
  startDate?: string | null;
  location?: string | null;
  city?: string | null;
  flyer?: string | null;
};

export type HostOrderDetailCustomer = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  isGuest: boolean;
};

export type HostOrderDetailTicketLine = {
  name: string;
  qty: number;
  price: number;
  lineTotal: number;
};

export type HostOrderDetailMoney = {
  subtotal: number;
  discount?: number | null;
  taxes: number;
  platformFee: number;
  platformFeeGst: number;
  taxesAndFees: number;
  totalAmount: number;
  refundAmount?: number | null;
};

export type HostOrderDetail = {
  orderId: string;
  event: HostOrderDetailEvent;
  customer: HostOrderDetailCustomer;
  tickets: HostOrderDetailTicketLine[];
  money: HostOrderDetailMoney;
  couponCode?: string | null;
  status: string;
  source: string;
  checkedIn: boolean;
  refundable: boolean;
  createdAt?: string | null;
  refundedAt?: string | null;
};

export type HostRefundResult = {
  orderId: string;
  status: string;
  refundAmount: number;
  refundedAt?: string | null;
};

// ── Operations ─────────────────────────────────────────────────────────────

const DETAIL_FIELDS = `
  orderId
  event { id title startDate location city flyer }
  customer { name email phone isGuest }
  tickets { name qty price lineTotal }
  money {
    subtotal discount taxes platformFee platformFeeGst taxesAndFees totalAmount refundAmount
  }
  couponCode
  status source checkedIn refundable createdAt refundedAt
`;

export const fetchHostOrderDetail = async (
  orderId: string
): Promise<HostOrderDetail> => {
  const data = await client.request<{ hostOrderDetail: HostOrderDetail }>(
    `query ($orderId: String!) {
      hostOrderDetail(orderId: $orderId) { ${DETAIL_FIELDS} }
    }`,
    { orderId }
  );
  return data.hostOrderDetail;
};

export const refundHostOrder = async (
  orderId: string
): Promise<HostRefundResult> => {
  const data = await client.request<{ hostRefundOrder: HostRefundResult }>(
    `mutation ($orderId: String!) {
      hostRefundOrder(orderId: $orderId) {
        orderId status refundAmount refundedAt
      }
    }`,
    { orderId }
  );
  return data.hostRefundOrder;
};
