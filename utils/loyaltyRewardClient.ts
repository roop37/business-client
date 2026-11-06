import { GraphQLClient } from "@/utils/demo/gqlClient";

/**
 * Self-contained client for the host loyalty-reward module (raw GraphQL until
 * codegen catches up). Mirrors utils/couponClient.ts.
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
        await refresher.request("mutation TokenRefresh { tokensRefresh }", {}, init?.headers);
        res = await fetch(input, init);
      } catch {
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return res;
  },
});

export type PromoDiscountType = "Percentage" | "FixedAmount" | "Free";

export type LoyaltyCouponTemplate = {
  discountType: PromoDiscountType;
  discountValue?: number | null;
  uptoAmount?: number | null;
  minCartValue?: number | null;
  validityDays?: number | null;
  eventId?: string | null;
};

export type LoyaltyReward = {
  _id: string;
  title: string;
  description?: string | null;
  pointsCost: number;
  couponTemplate: LoyaltyCouponTemplate;
  active: boolean;
  perCustomerLimit?: number | null;
  totalStock?: number | null;
  redeemedCount: number;
  createdAt?: string | null;
};

export type LoyaltyCouponTemplateInput = {
  discountType: PromoDiscountType;
  discountValue?: number;
  uptoAmount?: number;
  minCartValue?: number;
  validityDays?: number;
  eventId?: string;
};

export type CreateLoyaltyRewardInput = {
  title: string;
  description?: string;
  pointsCost: number;
  couponTemplate: LoyaltyCouponTemplateInput;
  perCustomerLimit?: number;
  totalStock?: number;
};

export type UpdateLoyaltyRewardInput = Partial<CreateLoyaltyRewardInput> & {
  rewardId: string;
  active?: boolean;
};

const FIELDS = `
  _id title description pointsCost active perCustomerLimit totalStock redeemedCount
  couponTemplate { discountType discountValue uptoAmount minCartValue validityDays eventId }
  createdAt
`;

export const fetchMyRewards = async (): Promise<LoyaltyReward[]> => {
  const data = await client.request<{
    myLoyaltyRewards: { items: LoyaltyReward[]; total: number };
  }>(`query { myLoyaltyRewards { total items { ${FIELDS} } } }`);
  return data.myLoyaltyRewards?.items ?? [];
};

export const createLoyaltyReward = async (
  input: CreateLoyaltyRewardInput
): Promise<LoyaltyReward> => {
  const data = await client.request<{ createLoyaltyReward: LoyaltyReward }>(
    `mutation ($input: CreateLoyaltyRewardInput!) { createLoyaltyReward(input: $input) { ${FIELDS} } }`,
    { input }
  );
  return data.createLoyaltyReward;
};

export const updateLoyaltyReward = async (
  input: UpdateLoyaltyRewardInput
): Promise<LoyaltyReward> => {
  const data = await client.request<{ updateLoyaltyReward: LoyaltyReward }>(
    `mutation ($input: UpdateLoyaltyRewardInput!) { updateLoyaltyReward(input: $input) { ${FIELDS} } }`,
    { input }
  );
  return data.updateLoyaltyReward;
};

export const toggleLoyaltyRewardActive = async (
  rewardId: string,
  active: boolean
): Promise<LoyaltyReward> => {
  const data = await client.request<{ toggleLoyaltyRewardActive: LoyaltyReward }>(
    `mutation ($rewardId: String!, $active: Boolean!) {
       toggleLoyaltyRewardActive(rewardId: $rewardId, active: $active) { ${FIELDS} }
     }`,
    { rewardId, active }
  );
  return data.toggleLoyaltyRewardActive;
};

export const deleteLoyaltyReward = async (rewardId: string): Promise<boolean> => {
  const data = await client.request<{ deleteLoyaltyReward: boolean }>(
    `mutation ($rewardId: String!) { deleteLoyaltyReward(rewardId: $rewardId) }`,
    { rewardId }
  );
  return data.deleteLoyaltyReward;
};

/** Host's events for the optional reward event-scope picker (id + title only). */
export type RewardEventOption = { _id: string; title: string };
export const fetchEventsForRewards = async (): Promise<RewardEventOption[]> => {
  const data = await client.request<{
    getMyEvents: { _id: string; title?: string | null }[];
  }>(`query { getMyEvents { _id title } }`);
  return (data.getMyEvents ?? []).map((e) => ({
    _id: e._id,
    title: e.title?.trim() || "Untitled event",
  }));
};
