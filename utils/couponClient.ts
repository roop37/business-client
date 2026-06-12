import { GraphQLClient } from "graphql-request";

/**
 * Self-contained client for the host coupon module (raw GraphQL until codegen
 * catches up). Mirrors utils/whatsappCampaignClient.ts.
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

export type PromoDiscountType = "Percentage" | "FixedAmount" | "Free";
export type CouponUsageType = "EntireSale" | "FirstSignedOrder";
export type Day =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export type CouponUsageRow = {
  usedAt: string;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  orderId?: string | null;
  discountApplied?: number | null;
  saleAmount?: number | null;
};

export type Coupon = {
  _id: string;
  code: string;
  description?: string | null;
  /** Event scope — set ⇒ this event only; null ⇒ global host promo. */
  eventId?: string | null;
  isActive: boolean;
  startDate: string;
  endDate: string;
  promoCodeDiscountType: PromoDiscountType;
  couponUsageType: CouponUsageType;
  discountValue?: number | null;
  uptoAmount?: number | null;
  applicableDays?: Day[] | null;
  applicableTickets?: string[] | null;
  showToCustomers: boolean;
  maxUsage?: number | null;
  maxUsagePerCustomer?: number | null;
  minCartValue?: number | null;
  couponUsageSalesLimit?: number | null;
  totalSalesUsed: number;
  usage: CouponUsageRow[];
  createdAt?: string | null;
};

export type CreateCouponInput = {
  code: string;
  description?: string;
  /** Optional — omit for a host-level global promo. */
  eventId?: string;
  startDate: string;
  endDate: string;
  promoCodeDiscountType: PromoDiscountType;
  discountValue?: number;
  uptoAmount?: number;
  applicableDays?: Day[];
  applicableTickets?: string[];
  showToCustomers?: boolean;
  couponUsageType?: CouponUsageType;
  maxUsage?: number;
  maxUsagePerCustomer?: number;
  minCartValue?: number;
  couponUsageSalesLimit?: number;
};

export type UpdateCouponInput = Partial<CreateCouponInput> & {
  couponId: string;
  isActive?: boolean;
};

const FIELDS = `
  _id code description eventId isActive startDate endDate
  promoCodeDiscountType couponUsageType discountValue uptoAmount
  applicableDays applicableTickets showToCustomers
  maxUsage maxUsagePerCustomer minCartValue couponUsageSalesLimit
  totalSalesUsed
  usage { usedAt name email phone orderId discountApplied saleAmount }
  createdAt
`;

export type CouponEventOption = { _id: string; title: string };

/** Host's events for the optional coupon scope picker (id + title only). */
export const fetchEventsForCoupons = async (): Promise<CouponEventOption[]> => {
  const data = await client.request<{
    getMyEvents: { _id: string; title?: string | null }[];
  }>(`query { getMyEvents { _id title } }`);
  return (data.getMyEvents ?? []).map((e) => ({
    _id: e._id,
    title: e.title?.trim() || "Untitled event",
  }));
};

export const fetchMyCoupons = async (): Promise<Coupon[]> => {
  const data = await client.request<{
    myCoupons: { items: Coupon[]; total: number };
  }>(`query { myCoupons { total items { ${FIELDS} } } }`);
  return data.myCoupons?.items ?? [];
};

export const fetchCouponById = async (couponId: string): Promise<Coupon | null> => {
  const data = await client.request<{ couponById: Coupon | null }>(
    `query ($couponId: String!) { couponById(couponId: $couponId) { ${FIELDS} } }`,
    { couponId }
  );
  return data.couponById ?? null;
};

export const createCoupon = async (input: CreateCouponInput): Promise<Coupon> => {
  const data = await client.request<{ createCoupon: Coupon }>(
    `mutation ($input: CreateCouponInput!) { createCoupon(input: $input) { ${FIELDS} } }`,
    { input }
  );
  return data.createCoupon;
};

export const updateCoupon = async (input: UpdateCouponInput): Promise<Coupon> => {
  const data = await client.request<{ updateCoupon: Coupon }>(
    `mutation ($input: UpdateCouponInput!) { updateCoupon(input: $input) { ${FIELDS} } }`,
    { input }
  );
  return data.updateCoupon;
};

export const toggleCouponActive = async (
  couponId: string,
  active: boolean
): Promise<Coupon> => {
  const data = await client.request<{ toggleCouponActive: Coupon }>(
    `mutation ($couponId: String!, $active: Boolean!) {
       toggleCouponActive(couponId: $couponId, active: $active) { ${FIELDS} }
     }`,
    { couponId, active }
  );
  return data.toggleCouponActive;
};

export const deleteCoupon = async (couponId: string): Promise<boolean> => {
  const data = await client.request<{ deleteCoupon: boolean }>(
    `mutation ($couponId: String!) { deleteCoupon(couponId: $couponId) }`,
    { couponId }
  );
  return data.deleteCoupon;
};
