import { GraphQLClient } from "@/utils/demo/gqlClient";

/** Self-contained client for host-facing feedback (pre-codegen). */

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

export type HostEventFeedbackRow = {
  _id: string;
  eventId?: string | null;
  eventTitle?: string | null;
  customerName?: string | null;
  rating?: number | null;
  comment?: string | null;
  createdAt?: string | null;
};

export const fetchHostEventFeedback = async (
  eventId?: string,
  page = 1,
  pageSize = 50
): Promise<{ items: HostEventFeedbackRow[]; total: number; averageRating?: number | null }> => {
  const data = await client.request<{
    hostEventFeedback: {
      items: HostEventFeedbackRow[];
      total: number;
      averageRating?: number | null;
    };
  }>(
    `query ($eventId: String, $page: Int, $pageSize: Int) {
      hostEventFeedback(eventId: $eventId, page: $page, pageSize: $pageSize) {
        total
        averageRating
        items { _id eventId eventTitle customerName rating comment createdAt }
      }
    }`,
    { eventId, page, pageSize }
  );
  return data.hostEventFeedback;
};

export const submitHostFeedback = async (input: {
  rating?: number;
  comment?: string;
  context: string;
  eventId?: string;
}): Promise<boolean> => {
  const data = await client.request<{ submitHostFeedback: boolean }>(
    `mutation ($rating: Int, $comment: String, $context: HostFeedbackContext!, $eventId: String) {
      submitHostFeedback(rating: $rating, comment: $comment, context: $context, eventId: $eventId)
    }`,
    input
  );
  return data.submitHostFeedback;
};
