import { create } from "zustand";
import type { WhatsAppCampaignVariable } from "@/utils/whatsappCampaignClient";
import type { WhatsAppMessageTemplate } from "@/utils/whatsappTemplateClient";

/**
 * Working store for the email-style WhatsApp campaign journey (Basics →
 * Content → Audience → When to send). Mirrors customCampaignStore but for
 * WhatsApp's template-select + variable-fill model instead of an email body.
 *
 * Audience target reuses the email HostEmailTargetType member NAMES as string
 * literals (AllAttendees | EventSpecific | CustomCustomer | CSV) — the raw
 * whatsapp client sends them as-is to the HostEmailTargetType GraphQL enum.
 */

export type WhatsAppScheduleType = "Now" | "Later";
export type WhatsAppPublicationStatus = "Drafted" | "Active";

interface WhatsAppCampaignState {
  campaignId: string | null;
  campaignName: string;
  objectiveTag: string;

  // Content
  templateId: string;
  templateSlugSnapshot: string;
  templateName: string; // display only
  selectedTemplate: WhatsAppMessageTemplate | null; // full object for live preview
  templateVariables: WhatsAppCampaignVariable[];
  headerMediaUrl: string;

  // Audience
  target: string; // HostEmailTargetType member name
  eventId: string;
  filters: string[];
  targetCount: number;

  // Schedule
  scheduleType: WhatsAppScheduleType;
  scheduleDate: Date | null;
  publicationStatus: WhatsAppPublicationStatus;

  setCampaignId: (id: string | null) => void;
  setCampaignName: (name: string) => void;
  setObjectiveTag: (tag: string) => void;

  setSelectedTemplate: (template: WhatsAppMessageTemplate | null) => void;
  setTemplateVariables: (variables: WhatsAppCampaignVariable[]) => void;
  setHeaderMediaUrl: (url: string) => void;

  setTarget: (target: string) => void;
  setEventId: (eventId: string) => void;
  setFilters: (filters: string[]) => void;
  setTargetCount: (count: number) => void;

  setScheduleType: (type: WhatsAppScheduleType) => void;
  setScheduleDate: (date: Date | null) => void;
  setPublicationStatus: (status: WhatsAppPublicationStatus) => void;

  resetState: () => void;
}

const initialState = {
  campaignId: null as string | null,
  campaignName: "",
  objectiveTag: "",
  templateId: "",
  templateSlugSnapshot: "",
  templateName: "",
  selectedTemplate: null as WhatsAppMessageTemplate | null,
  templateVariables: [] as WhatsAppCampaignVariable[],
  headerMediaUrl: "",
  target: "AllAttendees",
  eventId: "",
  filters: [] as string[],
  targetCount: 0,
  scheduleType: "Now" as WhatsAppScheduleType,
  scheduleDate: null as Date | null,
  publicationStatus: "Drafted" as WhatsAppPublicationStatus,
};

const useWhatsappCampaignStore = create<WhatsAppCampaignState>((set) => ({
  ...initialState,

  setCampaignId: (id) => set({ campaignId: id }),
  setCampaignName: (name) => set({ campaignName: name }),
  setObjectiveTag: (tag) => set({ objectiveTag: tag }),

  setSelectedTemplate: (template) =>
    set({
      selectedTemplate: template,
      templateId: template?._id ?? "",
      templateSlugSnapshot: template?.slug ?? "",
      templateName: template?.name ?? "",
    }),
  setTemplateVariables: (variables) => set({ templateVariables: variables }),
  setHeaderMediaUrl: (url) => set({ headerMediaUrl: url }),

  setTarget: (target) => set({ target }),
  setEventId: (eventId) => set({ eventId }),
  setFilters: (filters) => set({ filters }),
  setTargetCount: (count) => set({ targetCount: count }),

  setScheduleType: (type) => set({ scheduleType: type }),
  setScheduleDate: (date) => set({ scheduleDate: date }),
  setPublicationStatus: (status) => set({ publicationStatus: status }),

  resetState: () => set({ ...initialState }),
}));

export default useWhatsappCampaignStore;
