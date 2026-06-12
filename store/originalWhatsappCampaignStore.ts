import { create } from "zustand";
import type { WhatsAppCampaign } from "@/utils/whatsappCampaignClient";
import type { WhatsAppCampaignVariable } from "@/utils/whatsappCampaignClient";
import type {
  WhatsAppPublicationStatus,
  WhatsAppScheduleType,
} from "./whatsappCampaignStore";

/**
 * Snapshot of the WhatsApp campaign as it currently exists on the server.
 * Mirrors originalCampaignStore — the journey layout diffs the working store
 * against this snapshot so each PATCH sends only the fields the host changed.
 * Re-synced after every successful save.
 */

interface OriginalWhatsAppCampaignState {
  campaignId: string | null;
  campaignName: string;
  objectiveTag: string;
  templateId: string;
  templateSlugSnapshot: string;
  templateName: string;
  templateVariables: WhatsAppCampaignVariable[];
  headerMediaUrl: string;
  target: string;
  eventId: string;
  filters: string[];
  targetCount: number;
  scheduleType: WhatsAppScheduleType;
  scheduleDate: Date | null;
  publicationStatus: WhatsAppPublicationStatus;

  setOriginalCampaign: (campaign: WhatsAppCampaign) => void;
  resetOriginalState: () => void;
}

const initialState = {
  campaignId: null as string | null,
  campaignName: "",
  objectiveTag: "",
  templateId: "",
  templateSlugSnapshot: "",
  templateName: "",
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

const useOriginalWhatsappCampaignStore = create<OriginalWhatsAppCampaignState>(
  (set) => ({
    ...initialState,

    setOriginalCampaign: (campaign) =>
      set({
        campaignId: campaign._id,
        campaignName: campaign.campaignName ?? "",
        objectiveTag: campaign.objectiveTag ?? "",
        templateId: campaign.templateId ?? "",
        templateSlugSnapshot: campaign.templateSlugSnapshot ?? "",
        templateName: "",
        templateVariables: campaign.templateVariables ?? [],
        headerMediaUrl: campaign.headerMediaUrl ?? "",
        target: campaign.target ?? "AllAttendees",
        eventId: campaign.eventId ?? "",
        filters: campaign.filters ?? [],
        targetCount: campaign.targetCount ?? 0,
        scheduleType:
          (campaign.scheduleType as WhatsAppScheduleType) ?? "Now",
        scheduleDate: campaign.scheduleTime
          ? new Date(campaign.scheduleTime)
          : null,
        publicationStatus:
          (campaign.publicationStatus as WhatsAppPublicationStatus) ??
          "Drafted",
      }),

    resetOriginalState: () => set({ ...initialState }),
  })
);

export default useOriginalWhatsappCampaignStore;
