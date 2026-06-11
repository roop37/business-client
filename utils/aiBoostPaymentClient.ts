import { GraphQLClient } from "graphql-request";

/**
 * Self-contained client for the AI-Boost fee payment-link flow (AUDIT-049).
 * Works before `yarn codegen` exposes these on the generated sdk; migrate
 * later. Ops match the main-server eventOffer resolver.
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

export type AiBoostPaymentInfo = {
  eventId: string;
  eventTitle: string;
  hostName: string;
  offerFeeAmount: number;
  offerFeeGstAmount: number;
  payableAmount: number;
  currency: string;
  alreadyPaid: boolean;
};

export type AiBoostRazorpayOrder = {
  razorpayOrderId: string;
  razorpayKeyId: string;
  offerFeeAmount: number;
  offerFeeGstAmount: number;
  payableAmount: number;
  currency: string;
  receipt: string;
};

export const fetchAiBoostPaymentInfo = async (
  token: string
): Promise<AiBoostPaymentInfo> => {
  const data = await client.request<{ aiBoostPaymentInfo: AiBoostPaymentInfo }>(
    `query ($token: String!) {
       aiBoostPaymentInfo(token: $token) {
         eventId eventTitle hostName offerFeeAmount offerFeeGstAmount
         payableAmount currency alreadyPaid
       }
     }`,
    { token }
  );
  return data.aiBoostPaymentInfo;
};

export const createAiBoostPaymentOrder = async (
  eventId: string
): Promise<AiBoostRazorpayOrder> => {
  const data = await client.request<{
    createAiBoostPaymentOrder: AiBoostRazorpayOrder;
  }>(
    `mutation ($eventId: String!) {
       createAiBoostPaymentOrder(eventId: $eventId) {
         razorpayOrderId razorpayKeyId offerFeeAmount offerFeeGstAmount
         payableAmount currency receipt
       }
     }`,
    { eventId }
  );
  return data.createAiBoostPaymentOrder;
};

// Admin-only: mint the shareable payment link for an event.
export const adminGenerateAiBoostPaymentLink = async (
  eventId: string
): Promise<string> => {
  const data = await client.request<{
    adminGenerateAiBoostPaymentLink: string;
  }>(
    `mutation ($eventId: String!) { adminGenerateAiBoostPaymentLink(eventId: $eventId) }`,
    { eventId }
  );
  return data.adminGenerateAiBoostPaymentLink;
};
