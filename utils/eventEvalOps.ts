/**
 * Hand-rolled wrappers for the eventEval (Layer 1) GraphQL operations.
 *
 * These use the underlying GraphQLClient.request directly so the host
 * event-health panel works without waiting for a codegen run. When
 * codegen catches up, callers can migrate to `sdk.xxx` and this file
 * can be deleted.
 */
import { GraphQLClient } from "graphql-request";

const TOKEN_REFRESH_QUERY = "mutation TokenRefresh { tokensRefresh }";

const buildClient = (): GraphQLClient => {
  const endpoint = process.env.NEXT_PUBLIC_SERVER_BASE_URL + "/graphql";
  return new GraphQLClient(endpoint, {
    credentials: "include",
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      let response = await fetch(input, init);
      if (response.status === 401) {
        try {
          const refresh = new GraphQLClient(endpoint, {
            credentials: "include",
          });
          await refresh.request(TOKEN_REFRESH_QUERY);
          response = await fetch(input, init);
        } catch {
          if (
            typeof window !== "undefined" &&
            window.location.pathname !== "/login"
          ) {
            window.location.href = "/login";
          }
        }
      }
      return response;
    },
  });
};

export type EventEvalResultClient = {
  ranThroughAi: boolean;
  eventScore: number;
  aiShortSummary: string;
  expectedAudience?: number;
  assignedTagIds: string[];
  spellingMistakes: Array<{
    field: string;
    word: string;
    suggestion?: string;
    context?: string;
  }>;
  seoSuggestions: Array<{
    field: string;
    suggestion: string;
    severity: "Critical" | "High" | "Medium" | "Low";
  }>;
  aiEvalAdminSummary: string;
  suggestedDescription?: string;
};

export const runEventEval = async (
  eventId: string
): Promise<EventEvalResultClient> => {
  const client = buildClient();
  const query = `
mutation RunEventEval($eventId: String!) {
  runEventEval(eventId: $eventId) {
    ranThroughAi
    eventScore
    aiShortSummary
    expectedAudience
    assignedTagIds
    spellingMistakes { field word suggestion context }
    seoSuggestions { field suggestion severity }
    aiEvalAdminSummary
  }
}`;
  const data = await client.request<{ runEventEval: EventEvalResultClient }>(
    query,
    { eventId }
  );
  return data.runEventEval;
};

export const autoGenerateEventDescription = async (
  eventId: string
): Promise<EventEvalResultClient> => {
  const client = buildClient();
  const query = `
mutation AutoGenerateEventDescription($eventId: String!) {
  autoGenerateEventDescription(eventId: $eventId) {
    ranThroughAi
    eventScore
    aiShortSummary
    expectedAudience
    assignedTagIds
    spellingMistakes { field word suggestion context }
    seoSuggestions { field suggestion severity }
    aiEvalAdminSummary
    suggestedDescription
  }
}`;
  const data = await client.request<{
    autoGenerateEventDescription: EventEvalResultClient;
  }>(query, { eventId });
  return data.autoGenerateEventDescription;
};
