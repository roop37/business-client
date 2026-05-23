import {
  CustomCampaignFilter,
  CustomEmailTargetType,
  EmailCampaignScheduleTypes,
} from "@/generated/graphql";
import { create } from "zustand";
import {
  ConditionGroup,
  DEFAULT_ROOT_GROUP,
} from "@/components/modules/campaignOnboarding/customFilterBuilder";
import { convertApiCustomFiltersToConditionGroup } from "@/utils/utilFUncs";

interface OriginalCampaignState {
  campaignId: string | null;
  campaignTitle: string;
  campaignSubject: string;
  designJson: any;
  html: any;
  content: any;
  targetCount: number;
  targetType: CustomEmailTargetType | null;
  selectedFilters: CustomCampaignFilter[] | null;
  processedCSVRows: any[] | null;
  // CSV URL that the saved campaign currently references. Tracked here
  // so the cleanup path can compare old vs new and enqueue the old
  // file for deletion (via the cloudinaryDeletion worker) when the
  // host edits the audience rows.
  csvUrl: string;

  ctaLink: string;
  setCtaLink: (link: string) => void;

  scheduleType: EmailCampaignScheduleTypes;
  scheduleDate: Date | null;
  customFilterConditions: ConditionGroup; // Added field
  setProcessedCSVRows: (rows: any[] | null) => void;

  setOriginalCampaign: (campaign: any) => void;
  resetOriginalState: () => void;
}

const useOriginalCampaignStore = create<OriginalCampaignState>((set) => ({
  campaignId: null,
  campaignTitle: "",
  campaignSubject: "",
  designJson: null,
  html: null,
  content: "",
  targetCount: 0,
  targetType: null,
  selectedFilters: null,
  processedCSVRows: null,
  scheduleType: EmailCampaignScheduleTypes.Now,
  scheduleDate: null,
  customFilterConditions: DEFAULT_ROOT_GROUP,
  ctaLink: "",
  csvUrl: "",

  setProcessedCSVRows: (rows) => set({ processedCSVRows: rows }),

  setOriginalCampaign: (campaign) => {
    set({
      campaignId: campaign._id,
      campaignTitle: campaign.campaignName || "",
      campaignSubject: campaign.emailSubject || "",
      designJson: campaign.emailTemplate?.designJson || null,
      html: campaign.emailTemplate?.html || null,
      content: campaign.emailTemplate?.content || "",
      targetCount: campaign.targetCount || 0,
      targetType: campaign.target,
      selectedFilters: campaign.filters || null,
      scheduleType: campaign.scheduleType || EmailCampaignScheduleTypes.Now,
      scheduleDate: campaign.scheduleTime
        ? new Date(campaign.scheduleTime)
        : null,
      customFilterConditions: campaign.customFilterConditions
        ? campaign.customFilterConditions
        : DEFAULT_ROOT_GROUP,
      ctaLink: campaign.ctaLink || "",
      csvUrl: campaign.csvDataUrl || "",
    });
  },
  setCtaLink: (link: string) => set({ ctaLink: link }),

  resetOriginalState: () =>
    set({
      campaignId: null,
      campaignTitle: "",
      campaignSubject: "",
      designJson: null,
      html: null,
      content: "",
      ctaLink: "",
      targetCount: 0,
      targetType: null,
      selectedFilters: null,
      processedCSVRows: null,
      scheduleType: EmailCampaignScheduleTypes.Now,
      scheduleDate: null,
      customFilterConditions: DEFAULT_ROOT_GROUP, // Reset to default
      csvUrl: "",
    }),
}));

export default useOriginalCampaignStore;
