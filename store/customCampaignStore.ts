import {
  ConditionGroup,
  DEFAULT_ROOT_GROUP,
} from "@/components/modules/campaignOnboarding/customFilterBuilder";
import {
  CustomCampaignFilter,
  CustomEmailTargetType,
  EmailCampaignPublicationStatus,
  EmailCampaignScheduleTypes,
} from "@/generated/graphql";
import { create } from "zustand";

interface CampaignState {
  selectedTemplate: string;
  designJson: any;
  html: any;
  content: any;
  campaignTitle: string;
  targetCount: number;
  campaignId: string | null;
  campaignSubject: string;
  targetType: CustomEmailTargetType;
  selectedFilters: CustomCampaignFilter[] | null;
  processedCSVRows: any[] | null;
  ctaLink: string;
  emailStatus: EmailCampaignPublicationStatus;
  csvUrl: string;

  customFilterConditions: ConditionGroup;
  setCustomFilterConditions: (conditions: ConditionGroup) => void;

  // Updated schedule-related fields
  scheduleType: EmailCampaignScheduleTypes;
  scheduleDate: Date | null; // Now stores both date and time

  setCtaLink: (link: string) => void;
  setCampaignDetails: (details: {
    title?: string;
    description?: string;
  }) => void;
  setTemplate: (
    templateName: string,
    designJson: any,
    html: any,
    content: any
  ) => void;
  setCsvUrl: (url: string) => void;
  setTargetType: (targetType: CustomEmailTargetType) => void;
  setSelectedFilters: (filters: CustomCampaignFilter[] | null) => void;
  toggleFilter: (filter: CustomCampaignFilter) => void;
  setProcessedCSVRows: (rows: any[] | null) => void;
  resetAudienceSelection: () => void;

  // Updated schedule-related methods
  setScheduleType: (type: EmailCampaignScheduleTypes) => void;
  setScheduleDateTime: (date: Date | null) => void;
  resetSchedule: () => void;
  resetCampaignState: () => void;
  setCampaignTargetCount: (number: any) => void;

  // Branding
  hostOnlineOrderingLink: string;
  setHostOnlineOrderingLink: (res: string) => void;

  hostPrimaryColor: string;
  setHostPrimaryColor: (color: string) => void;

  hostBackgroundColor: string;
  setHostBackgroundColor: (color: string) => void;

  uploadedCSVFile: File | null;
  setUploadedCSVFile: (file: File | null) => void;

  duplicateCampaign: boolean;
  setDuplicateCampaign: (dc: any) => void;

  // Optional event the campaign is being built around. Picking one
  // pre-fills merge tags (event flyer, title, date) and lets the
  // "Event Promotion" template show the actual event flyer.
  selectedEventId: string;
  selectedEventTitle: string;
  selectedEventFlyer: string;
  selectedEventDate: string;
  selectedEventSlug: string;
  setSelectedEvent: (event: {
    id?: string;
    title?: string;
    flyer?: string;
    date?: string;
    slug?: string;
  }) => void;
  clearSelectedEvent: () => void;
}

const useCampaignStore = create<CampaignState>((set) => ({
  campaignId: null,
  selectedTemplate: "",
  designJson: null,
  html: null,
  content: null,
  campaignTitle: "",
  targetCount: 0,
  emailStatus: EmailCampaignPublicationStatus.Drafted,

  campaignSubject: "",
  targetType: CustomEmailTargetType.AllCustomer,
  selectedFilters: [],
  processedCSVRows: null,

  ctaLink: "",
  csvUrl: "",
  setCsvUrl: (url: string) => set({ csvUrl: url }),

  // Initialize schedule-related fields
  scheduleType: EmailCampaignScheduleTypes.Now,
  scheduleDate: null,

  customFilterConditions: DEFAULT_ROOT_GROUP,
  setCustomFilterConditions: (conditions) =>
    set({ customFilterConditions: conditions }),

  setCampaignDetails: (details) =>
    set((state) => ({
      campaignTitle: details.title ?? state.campaignTitle,
      campaignSubject: details.description ?? state.campaignSubject,
    })),

  setTemplate: (templateName, designJson, html, content) =>
    set({
      selectedTemplate: templateName,
      designJson:
        typeof designJson === "string"
          ? designJson
          : JSON.stringify(designJson),
      html,
      content,
    }),

  setTargetType: (targetType) => set({ targetType }),

  setSelectedFilters: (filters) => set({ selectedFilters: filters }),

  toggleFilter: (filter) =>
    set((state) => ({
      selectedFilters:
        state.selectedFilters === null
          ? [filter]
          : state.selectedFilters.includes(filter)
          ? state.selectedFilters.filter((f) => f !== filter)
          : [...state.selectedFilters, filter],
    })),

  setProcessedCSVRows: (rows) => set({ processedCSVRows: rows }),

  resetAudienceSelection: () =>
    set({
      targetType: CustomEmailTargetType.AllCustomer,
      selectedFilters: [],
      processedCSVRows: null,
    }),

  // Updated schedule-related methods
  setScheduleType: (type) => set({ scheduleType: type }),

  setScheduleDateTime: (date) =>
    set({
      scheduleDate: date,
    }),
  setCampaignTargetCount: (number: any) =>
    set({
      targetCount: number,
    }),

  setCtaLink: (link: string) => set({ ctaLink: link }),
  setEmailStatus: (status: EmailCampaignPublicationStatus) =>
    set({ emailStatus: status }),

  resetSchedule: () =>
    set({
      scheduleType: EmailCampaignScheduleTypes.Now,
      scheduleDate: null,
    }),

  // Branding
  hostOnlineOrderingLink: "",
  setHostOnlineOrderingLink: (link) =>
    set({ hostOnlineOrderingLink: link }),

  hostPrimaryColor: "#2947c2",
  setHostPrimaryColor: (color) => set({ hostPrimaryColor: color }),

  hostBackgroundColor: "#ffffff",
  setHostBackgroundColor: (color) =>
    set({ hostBackgroundColor: color }),

  uploadedCSVFile: null,
  setUploadedCSVFile: (file) => set({ uploadedCSVFile: file }),

  resetCampaignState: () =>
    set({
      campaignId: null,
      selectedTemplate: "",
      designJson: null,
      html: null,
      content: null,
      campaignTitle: "",
      targetCount: 0,
      ctaLink: "",

      campaignSubject: "",
      targetType: CustomEmailTargetType.AllCustomer,
      selectedFilters: [],
      processedCSVRows: null,
      scheduleType: EmailCampaignScheduleTypes.Now,
      scheduleDate: null,
      uploadedCSVFile: null,
    }),

  duplicateCampaign: false,
  setDuplicateCampaign: (dc) => set({ duplicateCampaign: dc }),

  selectedEventId: "",
  selectedEventTitle: "",
  selectedEventFlyer: "",
  selectedEventDate: "",
  selectedEventSlug: "",
  setSelectedEvent: (event) =>
    set({
      selectedEventId: event.id ?? "",
      selectedEventTitle: event.title ?? "",
      selectedEventFlyer: event.flyer ?? "",
      selectedEventDate: event.date ?? "",
      selectedEventSlug: event.slug ?? "",
    }),
  clearSelectedEvent: () =>
    set({
      selectedEventId: "",
      selectedEventTitle: "",
      selectedEventFlyer: "",
      selectedEventDate: "",
      selectedEventSlug: "",
    }),
}));

export default useCampaignStore;
