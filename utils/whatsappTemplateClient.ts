import { GraphQLClient } from "@/utils/demo/gqlClient";

/**
 * Self-contained client for the host WhatsApp TEMPLATE + BOOKMARK GraphQL ops
 * (the 3-source template picker, author/request flows, and bookmarks used by
 * the new email-style WhatsApp campaign journey).
 *
 * Like utils/whatsappCampaignClient.ts, the generated `sdk` only gains these
 * methods after `yarn codegen` runs against a live main-server. To keep the
 * UI working BEFORE codegen, this module issues the operations as raw GraphQL
 * with hand-written types. Op + variable shapes match the backend resolvers
 * (selectableWhatsAppTemplates / myWhatsAppTemplates / createMyWhatsAppTemplate
 * / updateMyWhatsAppTemplate / submitMyWhatsAppTemplateForReview /
 * requestWhatsAppTemplate / myWhatsAppTemplateBookmarks(+Ids) /
 * bookmarkWhatsAppTemplate / unbookmarkWhatsAppTemplate) 1:1.
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

// ── Enums (string unions mirroring the shared schema) ──────────────────────

export type WhatsAppTemplateCategory =
  | "MARKETING"
  | "UTILITY"
  | "AUTHENTICATION";
export type WhatsAppTemplateHeaderType =
  | "NONE"
  | "TEXT"
  | "IMAGE"
  | "VIDEO"
  | "DOCUMENT";
export type WhatsAppTemplateButtonType =
  | "NONE"
  | "URL"
  | "QUICK_REPLY"
  | "PHONE";
export type WhatsAppTemplateReviewStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED_INTERNAL"
  | "REJECTED_INTERNAL";
export type WhatsAppTemplateMetaStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "DISABLED"
  | "IN_APPEAL"
  | "PAUSED";
// Backend enum is ADMIN (global) | HOST. Existing global rows read as ADMIN.
export type WhatsAppTemplateSource = "ADMIN" | "HOST";

// ── Types ──────────────────────────────────────────────────────────────────

export type WhatsAppTemplateVariableDef = {
  position: number;
  label?: string | null;
  hint?: string | null;
  example?: string | null;
};

/**
 * Richer template shape than utils/whatsappCampaignClient.ts#WhatsAppTemplate:
 * adds source / reviewStatus / reviewRejectionReason / requestNote / button
 * extras so the picker can show review/meta state and the author/request
 * flows can round-trip their fields.
 */
export type WhatsAppMessageTemplate = {
  _id: string;
  slug: string;
  name: string;
  description?: string | null;
  category: WhatsAppTemplateCategory;
  language: string;
  metaStatus: WhatsAppTemplateMetaStatus;
  headerType: WhatsAppTemplateHeaderType;
  headerText?: string | null;
  headerSampleMediaUrl?: string | null;
  bodyText: string;
  footerText?: string | null;
  buttonType: WhatsAppTemplateButtonType;
  buttonUrl?: string | null;
  buttonLabel?: string | null;
  buttonPhone?: string | null;
  isActive: boolean;
  source: WhatsAppTemplateSource;
  reviewStatus: WhatsAppTemplateReviewStatus;
  reviewRejectionReason?: string | null;
  requestNote?: string | null;
  variables: WhatsAppTemplateVariableDef[];
};

export type WhatsAppTemplatesPaginatedResponse = {
  items: WhatsAppMessageTemplate[];
  total: number;
};

export type TemplatePaginationInput = {
  pageNumber?: number;
  rowsPerPage?: string; // RowsPerPageEnum value e.g. "FIFTY"
};

export type CreateMyWhatsAppTemplateVariableInput = {
  position: number;
  label: string;
  hint?: string;
  example?: string;
};

export type CreateMyWhatsAppTemplateInput = {
  name: string;
  slugHint?: string;
  description?: string;
  category: WhatsAppTemplateCategory;
  language?: string;
  headerType: WhatsAppTemplateHeaderType;
  headerText?: string;
  headerSampleMediaUrl?: string;
  bodyText: string;
  variables?: CreateMyWhatsAppTemplateVariableInput[];
  footerText?: string;
  buttonType: WhatsAppTemplateButtonType;
  buttonUrl?: string;
  buttonLabel?: string;
  buttonPhone?: string;
};

export type UpdateMyWhatsAppTemplateInput = {
  templateId: string;
  name?: string;
  description?: string;
  headerType?: WhatsAppTemplateHeaderType;
  headerText?: string;
  headerSampleMediaUrl?: string;
  bodyText?: string;
  variables?: CreateMyWhatsAppTemplateVariableInput[];
  footerText?: string;
  buttonType?: WhatsAppTemplateButtonType;
  buttonUrl?: string;
  buttonLabel?: string;
  buttonPhone?: string;
};

export type RequestWhatsAppTemplateInput = {
  name: string;
  category?: WhatsAppTemplateCategory;
  requestNote: string;
  bodyText?: string;
};

// ── Selection set ────────────────────────────────────────────────────────────

const TEMPLATE_FIELDS = `
  _id slug name description category language metaStatus headerType headerText
  headerSampleMediaUrl bodyText footerText buttonType buttonUrl buttonLabel
  buttonPhone isActive source reviewStatus reviewRejectionReason requestNote
  variables { position label hint example }
`;

const DEFAULT_PAGINATION: TemplatePaginationInput = {
  pageNumber: 1,
  rowsPerPage: "FIFTY",
};

// ── Template pickers ─────────────────────────────────────────────────────────

export const fetchSelectableWhatsAppTemplates = async (
  pagination: TemplatePaginationInput = DEFAULT_PAGINATION
): Promise<WhatsAppTemplatesPaginatedResponse> => {
  const data = await client.request<{
    selectableWhatsAppTemplates: WhatsAppTemplatesPaginatedResponse;
  }>(
    `query ($pagination: PaginationInput) {
       selectableWhatsAppTemplates(pagination: $pagination) {
         total items { ${TEMPLATE_FIELDS} }
       }
     }`,
    { pagination }
  );
  return data.selectableWhatsAppTemplates ?? { items: [], total: 0 };
};

export const fetchMyWhatsAppTemplates = async (
  pagination: TemplatePaginationInput = DEFAULT_PAGINATION
): Promise<WhatsAppTemplatesPaginatedResponse> => {
  const data = await client.request<{
    myWhatsAppTemplates: WhatsAppTemplatesPaginatedResponse;
  }>(
    `query ($pagination: PaginationInput) {
       myWhatsAppTemplates(pagination: $pagination) {
         total items { ${TEMPLATE_FIELDS} }
       }
     }`,
    { pagination }
  );
  return data.myWhatsAppTemplates ?? { items: [], total: 0 };
};

export const fetchMyWhatsAppTemplateBookmarks = async (
  pagination: TemplatePaginationInput = DEFAULT_PAGINATION
): Promise<WhatsAppTemplatesPaginatedResponse> => {
  const data = await client.request<{
    myWhatsAppTemplateBookmarks: WhatsAppTemplatesPaginatedResponse;
  }>(
    `query ($pagination: PaginationInput) {
       myWhatsAppTemplateBookmarks(pagination: $pagination) {
         total items { ${TEMPLATE_FIELDS} }
       }
     }`,
    { pagination }
  );
  return data.myWhatsAppTemplateBookmarks ?? { items: [], total: 0 };
};

export const fetchMyWhatsAppTemplateBookmarkIds = async (): Promise<
  string[]
> => {
  const data = await client.request<{
    myWhatsAppTemplateBookmarkIds: string[];
  }>(`query { myWhatsAppTemplateBookmarkIds }`);
  return data.myWhatsAppTemplateBookmarkIds ?? [];
};

export const fetchWhatsAppTemplateById = async (
  templateId: string
): Promise<WhatsAppMessageTemplate | null> => {
  const data = await client.request<{
    whatsAppTemplateById: WhatsAppMessageTemplate | null;
  }>(
    `query ($templateId: String!) {
       whatsAppTemplateById(templateId: $templateId) { ${TEMPLATE_FIELDS} }
     }`,
    { templateId }
  );
  return data.whatsAppTemplateById ?? null;
};

// ── Published events (for the merge-tag prefill picker) ───────────────────────

export type WhatsAppPrefillEvent = {
  _id: string;
  title?: string | null;
  slug?: string | null;
  status?: string | null;
  startDate?: string | null;
  city?: string | null;
  location?: {
    formattedAddress?: string | null;
    city?: string | null;
  } | null;
};

export const fetchMyPublishedEvents = async (): Promise<
  WhatsAppPrefillEvent[]
> => {
  const data = await client.request<{ getMyEvents: WhatsAppPrefillEvent[] }>(
    `query {
       getMyEvents {
         _id title slug status startDate city
         location { formattedAddress city }
       }
     }`
  );
  return (data.getMyEvents ?? []).filter((e) => e.status === "PUBLISHED");
};

// ── Authoring + request ──────────────────────────────────────────────────────

export const createMyWhatsAppTemplate = async (
  input: CreateMyWhatsAppTemplateInput
): Promise<WhatsAppMessageTemplate> => {
  const data = await client.request<{
    createMyWhatsAppTemplate: WhatsAppMessageTemplate;
  }>(
    `mutation ($input: CreateMyWhatsAppTemplateInput!) {
       createMyWhatsAppTemplate(input: $input) { ${TEMPLATE_FIELDS} }
     }`,
    { input }
  );
  return data.createMyWhatsAppTemplate;
};

export const updateMyWhatsAppTemplate = async (
  input: UpdateMyWhatsAppTemplateInput
): Promise<WhatsAppMessageTemplate> => {
  const data = await client.request<{
    updateMyWhatsAppTemplate: WhatsAppMessageTemplate;
  }>(
    `mutation ($input: UpdateMyWhatsAppTemplateInput!) {
       updateMyWhatsAppTemplate(input: $input) { ${TEMPLATE_FIELDS} }
     }`,
    { input }
  );
  return data.updateMyWhatsAppTemplate;
};

export const submitMyWhatsAppTemplateForReview = async (
  templateId: string
): Promise<WhatsAppMessageTemplate> => {
  const data = await client.request<{
    submitMyWhatsAppTemplateForReview: WhatsAppMessageTemplate;
  }>(
    `mutation ($templateId: String!) {
       submitMyWhatsAppTemplateForReview(templateId: $templateId) { ${TEMPLATE_FIELDS} }
     }`,
    { templateId }
  );
  return data.submitMyWhatsAppTemplateForReview;
};

export const requestWhatsAppTemplate = async (
  input: RequestWhatsAppTemplateInput
): Promise<WhatsAppMessageTemplate> => {
  const data = await client.request<{
    requestWhatsAppTemplate: WhatsAppMessageTemplate;
  }>(
    `mutation ($input: RequestWhatsAppTemplateInput!) {
       requestWhatsAppTemplate(input: $input) { ${TEMPLATE_FIELDS} }
     }`,
    { input }
  );
  return data.requestWhatsAppTemplate;
};

// ── Bookmarks ────────────────────────────────────────────────────────────────

export const bookmarkWhatsAppTemplate = async (
  templateId: string
): Promise<boolean> => {
  const data = await client.request<{ bookmarkWhatsAppTemplate: boolean }>(
    `mutation ($templateId: String!) { bookmarkWhatsAppTemplate(templateId: $templateId) }`,
    { templateId }
  );
  return data.bookmarkWhatsAppTemplate;
};

export const unbookmarkWhatsAppTemplate = async (
  templateId: string
): Promise<boolean> => {
  const data = await client.request<{ unbookmarkWhatsAppTemplate: boolean }>(
    `mutation ($templateId: String!) { unbookmarkWhatsAppTemplate(templateId: $templateId) }`,
    { templateId }
  );
  return data.unbookmarkWhatsAppTemplate;
};
