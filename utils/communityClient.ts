import { GraphQLClient } from "@/utils/demo/gqlClient";

/**
 * Hand-rolled GraphQL client for the Community module (mirrors couponClient /
 * the Customers table). Own client + 401→tokensRefresh retry + inline queries;
 * NOT the generated codegen SDK (new host features bypass it).
 */

export type LoyaltyLeaderboardRow = {
  rank: number;
  customerId: string;
  name?: string | null;
  lifetimePoints: number;
  balance: number;
  lastEarnedAt?: string | null;
};

const resolveEndpoint = (): string => {
  const base = process.env.NEXT_PUBLIC_SERVER_BASE_URL?.replace(/\/+$/, "");
  if (!base) return "http://localhost:4000/graphql";
  return base.endsWith("/graphql") ? base : `${base}/graphql`;
};

const gql = new GraphQLClient(resolveEndpoint(), {
  credentials: "include",
  fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
    let res = await fetch(input, init);
    if (res.status === 401) {
      try {
        const refresher = new GraphQLClient(resolveEndpoint(), {
          credentials: "include",
        });
        await refresher.request("mutation { tokensRefresh }");
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

const HOST_LOYALTY_LEADERBOARD_QUERY = `
  query HostLoyaltyLeaderboard($page: Int, $pageSize: Int) {
    hostLoyaltyLeaderboard(page: $page, pageSize: $pageSize) {
      total
      items {
        rank customerId name lifetimePoints balance lastEarnedAt
      }
    }
  }
`;

export const fetchLoyaltyLeaderboard = async (
  page: number,
  pageSize: number
): Promise<{ items: LoyaltyLeaderboardRow[]; total: number }> => {
  const resp = await gql.request<{
    hostLoyaltyLeaderboard: { items: LoyaltyLeaderboardRow[]; total: number };
  }>(HOST_LOYALTY_LEADERBOARD_QUERY, { page, pageSize });
  return {
    items: resp.hostLoyaltyLeaderboard.items ?? [],
    total: resp.hostLoyaltyLeaderboard.total ?? 0,
  };
};
