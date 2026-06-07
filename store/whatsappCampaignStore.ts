import {
  CustomCampaignFilter,
  CustomEmailTargetType,
  EmailCampaignScheduleTypes,
} from "@/generated/graphql";
import { create } from "zustand";

/**
 * Cross-step wizard state for the WhatsApp campaign builder. Mirrors
 * customCampaignStore in spirit but tracks WhatsApp-specific fields:
 *   - templateId (the chosen library template's _id)
 *   - templateVariables (the host's filled-in variable values)
 *   - headerMediaUrl (Cloudinary URL when the template has a media header)
 *   - ctaSlug (the dynamic URL-button path segment)
 *
 * Audience targeting uses the same enums as email (HostEmailTargetType,
 * HostCampaignAudienceFilter) so the server-side audience resolver +
 * filter chips are reused verbatim.
 */

export type WhatsAppTemplateVariableDraft = {
  position: number;
  value: string;
};

interface WhatsAppCampaignState {
  // Step 1 — basic
  campaignId: string | null;
  campaignName: string;
  objectiveTag: string;

  // Step 2 — template + content
  templateId: string | null;
  templateSlug: string | null;
  templateBodyPreview: string | null;
  templateVariables: WhatsAppTemplateVariableDraft[];
  headerMediaUrl: string;
  ctaSlug: string;

  // Step 3 — audience
  targetType: CustomEmailTargetType | null;
  selectedFilters: CustomCampaignFilter[];
  eventId: string | null;
  csvUrl: string;
  targetCount: number;

  // Step 4 — schedule
  scheduleType: EmailCampaignScheduleTypes;
  scheduleDate: Date | null;

  setCampaignId: (id: string | null) => void;
  setCampaignName: (name: string) => void;
  setObjectiveTag: (tag: string) => void;
  setTemplate: (input: {
    templateId: string;
    templateSlug: string;
    templateBodyPreview: string;
    variables: WhatsAppTemplateVariableDraft[];
  }) => void;
  setVariableValue: (position: number, value: string) => void;
  setHeaderMediaUrl: (url: string) => void;
  setCtaSlug: (slug: string) => void;
  setTargetType: (type: CustomEmailTargetType | null) => void;
  setSelectedFilters: (filters: CustomCampaignFilter[]) => void;
  toggleFilter: (filter: CustomCampaignFilter) => void;
  setEventId: (id: string | null) => void;
  setCsvUrl: (url: string) => void;
  setTargetCount: (count: number) => void;
  setScheduleType: (type: EmailCampaignScheduleTypes) => void;
  setScheduleDate: (date: Date | null) => void;
  reset: () => void;
  hydrate: (snapshot: Partial<WhatsAppCampaignState>) => void;
}

const initialState = {
  campaignId: null as string | null,
  campaignName: "",
  objectiveTag: "",
  templateId: null as string | null,
  templateSlug: null as string | null,
  templateBodyPreview: null as string | null,
  templateVariables: [] as WhatsAppTemplateVariableDraft[],
  headerMediaUrl: "",
  ctaSlug: "",
  targetType: null as CustomEmailTargetType | null,
  selectedFilters: [] as CustomCampaignFilter[],
  eventId: null as string | null,
  csvUrl: "",
  targetCount: 0,
  scheduleType: "Now" as EmailCampaignScheduleTypes,
  scheduleDate: null as Date | null,
};

const useWhatsAppCampaignStore = create<WhatsAppCampaignState>((set) => ({
  ...initialState,
  setCampaignId: (id) => set({ campaignId: id }),
  setCampaignName: (name) => set({ campaignName: name }),
  setObjectiveTag: (tag) => set({ objectiveTag: tag }),
  setTemplate: ({ templateId, templateSlug, templateBodyPreview, variables }) =>
    set({
      templateId,
      templateSlug,
      templateBodyPreview,
      templateVariables: variables,
    }),
  setVariableValue: (position, value) =>
    set((state) => ({
      templateVariables: state.templateVariables.map((v) =>
        v.position === position ? { ...v, value } : v
      ),
    })),
  setHeaderMediaUrl: (url) => set({ headerMediaUrl: url }),
  setCtaSlug: (slug) => set({ ctaSlug: slug }),
  setTargetType: (type) => set({ targetType: type }),
  setSelectedFilters: (filters) => set({ selectedFilters: filters }),
  toggleFilter: (filter) =>
    set((state) => ({
      selectedFilters: state.selectedFilters.includes(filter)
        ? state.selectedFilters.filter((f) => f !== filter)
        : [...state.selectedFilters, filter],
    })),
  setEventId: (id) => set({ eventId: id }),
  setCsvUrl: (url) => set({ csvUrl: url }),
  setTargetCount: (count) => set({ targetCount: count }),
  setScheduleType: (type) => set({ scheduleType: type }),
  setScheduleDate: (date) => set({ scheduleDate: date }),
  reset: () => set({ ...initialState }),
  hydrate: (snapshot) => set((state) => ({ ...state, ...snapshot })),
}));

export default useWhatsAppCampaignStore;
