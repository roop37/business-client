import { GraphQLClient } from "graphql-request";

/** Self-contained client for the Automations module (pre-codegen). */

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

export type AutomationView = {
  key: string;
  title: string;
  description: string;
  channels: string[];
  freeChannels: string[];
  active: boolean;
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  pushEnabled: boolean;
  lastSentAt?: string | null;
  totalSent: number;
  attributedOrders: number;
  attributedRevenue: number;
};

const VIEW_FIELDS = `
  key title description channels freeChannels active
  emailEnabled whatsappEnabled pushEnabled
  lastSentAt totalSent attributedOrders attributedRevenue
`;

export const fetchAutomations = async (): Promise<AutomationView[]> => {
  const data = await client.request<{ myAutomations: { items: AutomationView[] } }>(
    `query { myAutomations { items { ${VIEW_FIELDS} } } }`
  );
  return data.myAutomations.items ?? [];
};

export const fetchAutomation = async (key: string): Promise<AutomationView> => {
  const data = await client.request<{ automation: AutomationView }>(
    `query ($key: String!) { automation(key: $key) { ${VIEW_FIELDS} } }`,
    { key }
  );
  return data.automation;
};

export const setAutomationActive = async (
  key: string,
  active: boolean
): Promise<AutomationView> => {
  const data = await client.request<{ setAutomationActive: AutomationView }>(
    `mutation ($key: String!, $active: Boolean!) {
      setAutomationActive(key: $key, active: $active) { ${VIEW_FIELDS} }
    }`,
    { key, active }
  );
  return data.setAutomationActive;
};

export const setAutomationChannel = async (
  key: string,
  channel: string,
  enabled: boolean
): Promise<AutomationView> => {
  const data = await client.request<{ setAutomationChannel: AutomationView }>(
    `mutation ($key: String!, $channel: String!, $enabled: Boolean!) {
      setAutomationChannel(key: $key, channel: $channel, enabled: $enabled) { ${VIEW_FIELDS} }
    }`,
    { key, channel, enabled }
  );
  return data.setAutomationChannel;
};

export type AutomationEventBreakdownRow = {
  eventId: string;
  eventTitle: string;
  emailsSent: number;
  whatsappSent: number;
  conversions: number;
  attributedRevenue: number;
};

export const fetchAutomationEventBreakdown = async (
  key: string
): Promise<AutomationEventBreakdownRow[]> => {
  const data = await client.request<{
    automationEventBreakdown: AutomationEventBreakdownRow[];
  }>(
    `query ($key: String!) {
       automationEventBreakdown(key: $key) {
         eventId eventTitle emailsSent whatsappSent conversions attributedRevenue
       }
     }`,
    { key }
  );
  return data.automationEventBreakdown ?? [];
};

// No DB store yet — a host-scoped suggestion log + admin review needs a
// hoizr-shared schema / INTERNAL_* email-type republish (tracked follow-up).
// For now the idea goes straight to the product team's inbox via the host's
// mail client, which keeps the feature live with zero backend surface.
export const suggestAutomation = async (text: string): Promise<boolean> => {
  if (typeof window !== "undefined") {
    const subject = encodeURIComponent("Automation suggestion from a host");
    const body = encodeURIComponent(text);
    window.location.href = `mailto:tech@hoizr.com?subject=${subject}&body=${body}`;
  }
  return true;
};
