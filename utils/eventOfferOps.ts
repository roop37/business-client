/**
 * Hand-rolled wrappers for the AI offer + eventEval GraphQL operations.
 *
 * The mutations + queries are also defined in graphql/event-offer.graphql
 * for codegen to pick up later. Until `yarn codegen` is re-run against a
 * main-server that exposes the new schema fields, the generated SDK
 * doesn't have these methods — so calling sdk.generateAiBoostsForEvent
 * at runtime would throw. These wrappers use the underlying
 * GraphQLClient.request directly, so they work today and the host
 * publish flow doesn't have to wait for the codegen step.
 *
 * When codegen catches up, callers can be migrated to `sdk.xxx` and
 * this file deleted.
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

export type AiBoostCard = {
  offerCode: string;
  label: string;
  description?: string;
  shortReason?: string;
  confidenceScore: number;
  commissionPct: number;
  extraAmount: number;
  marketingCreditAmount?: number;
  marketingCreditDiscountPct?: number;
  customerViewingMessage?: string;
  hoizrAdminSummary?: string;
  totalSavingsForHosts?: { value?: number };
  howMuchDifferentFromBasicOffer?: { deltaPct?: number };
  computed?: {
    expectedGrossSales?: number;
    hoizrCommission?: number;
    hostPayout?: number;
    hoizrNetContribution?: number;
    hoizrEstimatedLoss?: number;
  };
};

export type AiBoostGeneration = {
  _id: string;
  eventId: string;
  hostId: string;
  modelName?: string;
  recommendedOfferCode?: string;
  selectedOfferCode?: string;
  selectedAt?: string;
  offers: AiBoostCard[];
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

const AI_BOOST_FRAGMENT = `
fragment AiBoostFields on AiBoost {
  offerCode
  label
  description
  shortReason
  confidenceScore
  commissionPct
  extraAmount
  marketingCreditAmount
  marketingCreditDiscountPct
  customerViewingMessage
  hoizrAdminSummary
  totalSavingsForHosts { value }
  howMuchDifferentFromBasicOffer { deltaPct }
  computed {
    expectedGrossSales
    hoizrCommission
    hostPayout
    hoizrNetContribution
    hoizrEstimatedLoss
  }
}

fragment EventOfferGenerationFields on EventOfferGeneration {
  _id
  eventId
  hostId
  modelName
  recommendedOfferCode
  selectedOfferCode
  selectedAt
  offers { ...AiBoostFields }
}
`;

export const generateAiBoostsForEvent = async (
  eventId: string
): Promise<AiBoostGeneration> => {
  const client = buildClient();
  const query = `${AI_BOOST_FRAGMENT}
mutation GenerateAiBoostsForEvent($input: GenerateAiBoostsInput!) {
  generateAiBoostsForEvent(input: $input) { ...EventOfferGenerationFields }
}`;
  const data = await client.request<{
    generateAiBoostsForEvent: AiBoostGeneration;
  }>(query, { input: { eventId } });
  return data.generateAiBoostsForEvent;
};

export const getLatestAiBoostGeneration = async (
  eventId: string
): Promise<AiBoostGeneration | null> => {
  const client = buildClient();
  const query = `${AI_BOOST_FRAGMENT}
query GetLatestAiBoostGeneration($eventId: String!) {
  getLatestAiBoostGeneration(eventId: $eventId) { ...EventOfferGenerationFields }
}`;
  const data = await client.request<{
    getLatestAiBoostGeneration: AiBoostGeneration | null;
  }>(query, { eventId });
  return data.getLatestAiBoostGeneration ?? null;
};

export const selectAiBoost = async (input: {
  generationId: string;
  offerCode: string;
  feeSettlementMode?: "DEDUCT_FROM_PAYOUT" | "PAY_AFTER_EVENT";
}): Promise<AiBoostGeneration> => {
  const client = buildClient();
  const query = `${AI_BOOST_FRAGMENT}
mutation SelectAiBoost($input: SelectAiBoostInput!) {
  selectAiBoost(input: $input) { ...EventOfferGenerationFields }
}`;
  const data = await client.request<{ selectAiBoost: AiBoostGeneration }>(
    query,
    { input }
  );
  return data.selectAiBoost;
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
