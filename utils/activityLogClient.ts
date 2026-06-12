import { GraphQLClient } from "graphql-request";

/**
 * Self-contained client for the host Activity Log query.
 *
 * The generated `sdk` only gains `getActivityLogs` after `yarn codegen` runs
 * against a live main-server. To keep the Activity Log UI working BEFORE that
 * codegen pass, this module issues the operation as raw GraphQL with
 * hand-written types. The op + variable shapes here match
 * `ActivityLogPaginatedResponse` / `getActivityLogs` in main-server 1:1.
 *
 * Mirrors the env-resolving GraphQLClient + 401-refresh pattern used by
 * `utils/whatsappCampaignClient.ts` (we intentionally do NOT touch
 * `utils/graphqlClient.ts`).
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

// ── Types (mirror ActivityLogResponse / ActivityLogPaginatedResponse) ──────

export type ActivityLogRow = {
  _id: string;
  description: string;
  performedOn: string;
  actionType: string;
  performedBy: string;
  createdAt: string;
  updatedAt: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type ActivityLogPage = {
  activityLogs: ActivityLogRow[];
  total: number;
};

export type ActivityLogPaginationInput = {
  pageNumber?: number;
  /** Must be one of RowsPerPageEnum numeric values (10, 25, 30, 50, 100). */
  rowsPerPage?: number;
};

export type ActivityLogFilterInput = {
  key: string;
  operation: "Contains" | "Equals" | "NotEquals" | "GreaterThan" | "LessThan";
  value?: string;
  valueArr?: string[];
};

export type ActivityLogSortInput = {
  key: string;
  sortType: "Asc" | "Desc" | "None";
};

// ── Operations ─────────────────────────────────────────────────────────────

const ACTIVITY_LOG_FIELDS = `
  _id description performedOn actionType performedBy
  createdAt updatedAt ipAddress userAgent
`;

export const fetchActivityLogs = async (
  pagination?: ActivityLogPaginationInput,
  filter?: ActivityLogFilterInput[],
  sort?: ActivityLogSortInput,
  search?: string
): Promise<ActivityLogPage> => {
  const data = await client.request<{
    getActivityLogs: ActivityLogPage;
  }>(
    `query GetActivityLogs(
       $pagination: PaginationInput
       $filter: [FilterDataInput!]
       $sort: SortDataInput
       $search: String
     ) {
       getActivityLogs(
         pagination: $pagination
         filter: $filter
         sort: $sort
         search: $search
       ) {
         total
         activityLogs { ${ACTIVITY_LOG_FIELDS} }
       }
     }`,
    { pagination, filter, sort, search }
  );
  return data.getActivityLogs ?? { activityLogs: [], total: 0 };
};
