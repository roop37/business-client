import { GraphQLClient } from "@/utils/demo/gqlClient";

/**
 * Self-contained client for the WhatsApp campaign + template GraphQL ops.
 *
 * The generated `sdk` only gains the WhatsApp methods after `yarn codegen`
 * runs against a live main-server. To keep the WhatsApp UI working BEFORE
 * that codegen pass, this module issues the operations as raw GraphQL with
 * hand-written types. Once codegen is run, callers can migrate to
 * `sdk.createHostWhatsAppCampaign(...)` etc. — the op + variable shapes
 * here match `graphql/whatsapp-campaign.graphql` 1:1.
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

// ── Types (mirror the shared schema's GraphQL-exposed fields) ──────────────

export type WhatsAppTemplateVariableDef = {
  position: number;
  label?: string | null;
  hint?: string | null;
  example?: string | null;
};

export type WhatsAppTemplate = {
  _id: string;
  slug: string;
  name: string;
  category: string;
  language: string;
  headerType: string;
  headerText?: string | null;
  headerSampleMediaUrl?: string | null;
  bodyText: string;
  footerText?: string | null;
  buttonType: string;
  buttonLabel?: string | null;
  buttonUrl?: string | null;
  metaStatus: string;
  isActive: boolean;
  variables: WhatsAppTemplateVariableDef[];
};

export type WhatsAppCampaignVariable = { position: number; value: string };

export type WhatsAppCampaign = {
  _id: string;
  campaignName: string;
  objectiveTag?: string | null;
  templateId: string;
  templateSlugSnapshot?: string | null;
  templateLanguageSnapshot?: string | null;
  headerMediaUrl?: string | null;
  ctaSlug?: string | null;
  target?: string | null;
  eventId?: string | null;
  filters?: string[] | null;
  targetCount?: number | null;
  status?: string | null;
  publicationStatus?: string | null;
  scheduleType?: string | null;
  scheduleTime?: string | null;
  templateVariables?: WhatsAppCampaignVariable[] | null;
  stats?: {
    messagesSent: number;
    messagesSyncFailed: number;
    messagesDelivered: number;
    messagesRead: number;
    messagesFailed: number;
  } | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type AddWhatsAppCampaignInput = {
  campaignName: string;
  // Optional: the journey creates the Drafted campaign with just a name at
  // step 1 (so it gets a persisted id), then attaches the template at Content.
  templateId?: string;
  templateVariables?: WhatsAppCampaignVariable[];
  headerMediaUrl?: string;
  ctaSlug?: string;
  objectiveTag?: string;
};

export type UpdateWhatsAppCampaignInput = {
  campaignId: string;
  campaignName?: string;
  templateId?: string;
  templateVariables?: WhatsAppCampaignVariable[];
  headerMediaUrl?: string;
  ctaSlug?: string;
  target?: string;
  eventId?: string;
  targetCount?: number;
  csvDataUrl?: string;
  scheduleType?: string;
  scheduleTime?: string;
  publicationStatus?: string;
  filters?: string[];
  objectiveTag?: string;
};

// ── Operations ─────────────────────────────────────────────────────────────

const TEMPLATE_FIELDS = `
  _id slug name category language headerType headerText headerSampleMediaUrl
  bodyText footerText buttonType buttonLabel buttonUrl metaStatus isActive
  variables { position label hint example }
`;

const CAMPAIGN_FIELDS = `
  _id campaignName objectiveTag templateId templateSlugSnapshot
  templateLanguageSnapshot headerMediaUrl ctaSlug target eventId filters
  targetCount status publicationStatus scheduleType scheduleTime
  templateVariables { position value }
  stats { messagesSent messagesSyncFailed messagesDelivered messagesRead messagesFailed }
  createdAt updatedAt
`;

export const fetchApprovedWhatsAppTemplates = async (): Promise<
  WhatsAppTemplate[]
> => {
  const data = await client.request<{
    approvedWhatsAppTemplates: { items: WhatsAppTemplate[]; total: number };
  }>(`query { approvedWhatsAppTemplates { total items { ${TEMPLATE_FIELDS} } } }`);
  return data.approvedWhatsAppTemplates?.items ?? [];
};

export const fetchWhatsAppCampaigns = async (): Promise<{
  items: WhatsAppCampaign[];
  total: number;
}> => {
  const data = await client.request<{
    getAllHostWhatsAppCampaigns: { items: WhatsAppCampaign[]; total: number };
  }>(
    `query { getAllHostWhatsAppCampaigns { total items { ${CAMPAIGN_FIELDS} } } }`
  );
  return data.getAllHostWhatsAppCampaigns ?? { items: [], total: 0 };
};

export const fetchWhatsAppCampaignById = async (
  campaignId: string
): Promise<WhatsAppCampaign | null> => {
  const data = await client.request<{
    fetchHostWhatsAppCampaignById: WhatsAppCampaign | null;
  }>(
    `query ($campaignId: String!) { fetchHostWhatsAppCampaignById(campaignId: $campaignId) { ${CAMPAIGN_FIELDS} } }`,
    { campaignId }
  );
  return data.fetchHostWhatsAppCampaignById ?? null;
};

export const createWhatsAppCampaign = async (
  input: AddWhatsAppCampaignInput
): Promise<string> => {
  const data = await client.request<{ createHostWhatsAppCampaign: string }>(
    `mutation ($input: AddHostWhatsAppCampaignInput!) { createHostWhatsAppCampaign(input: $input) }`,
    { input }
  );
  return data.createHostWhatsAppCampaign;
};

export const updateWhatsAppCampaign = async (
  input: UpdateWhatsAppCampaignInput
): Promise<boolean> => {
  const data = await client.request<{ updateHostWhatsAppCampaign: boolean }>(
    `mutation ($input: UpdateHostWhatsAppCampaignInput!) { updateHostWhatsAppCampaign(input: $input) }`,
    { input }
  );
  return data.updateHostWhatsAppCampaign;
};

export const duplicateWhatsAppCampaign = async (
  campaignId: string
): Promise<string> => {
  const data = await client.request<{ duplicateHostWhatsAppCampaign: string }>(
    `mutation ($campaignId: String!) { duplicateHostWhatsAppCampaign(campaignId: $campaignId) }`,
    { campaignId }
  );
  return data.duplicateHostWhatsAppCampaign;
};

export const deleteWhatsAppCampaign = async (
  campaignId: string
): Promise<boolean> => {
  const data = await client.request<{ deleteHostWhatsAppCampaign: boolean }>(
    `mutation ($campaignId: String!) { deleteHostWhatsAppCampaign(campaignId: $campaignId) }`,
    { campaignId }
  );
  return data.deleteHostWhatsAppCampaign;
};

export const resumeWhatsAppCampaign = async (
  campaignId: string
): Promise<boolean> => {
  const data = await client.request<{ resumeHostWhatsAppCampaign: boolean }>(
    `mutation ($campaignId: String!) { resumeHostWhatsAppCampaign(campaignId: $campaignId) }`,
    { campaignId }
  );
  return data.resumeHostWhatsAppCampaign;
};

export const fetchWhatsAppTargetCount = async (vars: {
  target?: string;
  eventId?: string;
  filters?: string[];
}): Promise<number> => {
  const data = await client.request<{
    getHostWhatsAppAttendeesTargetCount: number;
  }>(
    `query ($target: HostEmailTargetType, $eventId: String, $filters: [HostCampaignAudienceFilter!]) {
       getHostWhatsAppAttendeesTargetCount(target: $target, eventId: $eventId, filters: $filters)
     }`,
    vars
  );
  return data.getHostWhatsAppAttendeesTargetCount ?? 0;
};
