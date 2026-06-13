import { create } from "zustand";

type ToastData = {
  message: string;
  type: "success" | "error" | "warning";
  title?: string;
};

type MenuState = {
  isShowTaxSettings: boolean;
  setIsShowTaxSettings: (isExpanded: boolean) => void;
  selectedSideBarMenu: string;
  isSidebarExpanded: boolean;
  isShowSetupPanel: boolean;
  isVerificationToHostAdd: boolean;
  setSelectedSideBarMenu: (menu: string) => void;
  toastData: ToastData | null;
  setToastData: (data: ToastData | null) => void;
  setIsSidebarExpanded: (isExpanded: boolean) => void;
  setIsShowSetupPanel: (e: boolean) => void;
  setisVerificationToHostAdd: (e: boolean) => void;
  manageSubscriptionLink: string;
  setManageSubscriptionLink: (link: string) => void;

  showMultiAccount: boolean;
  setShowMultiAccount: (value: boolean) => void;

  multiAccountModal: boolean;
  showMultiAccountModal: (value: boolean) => void;

  payoutPromptModal: boolean;
  showPayoutPromptModal: (value: boolean) => void;
  payoutFormModal: boolean;
  showPayoutFormModal: (value: boolean) => void;

  // Soft "your payout is awaiting verification" modal — shown when a
  // host tries to publish a paid event before admin has marked their
  // payout profile verified. Different from payoutPromptModal which is
  // for hosts who have no payout at all.
  payoutPendingVerificationModal: boolean;
  showPayoutPendingVerificationModal: (value: boolean) => void;

  // Optional callback registered by hosts of the payout modals (e.g.
  // EventJourney) so the modal can offer a "Save as draft" exit. When
  // unset, the Save-as-draft button is hidden. Set on page mount,
  // clear on unmount so the button never fires the wrong action from
  // a different route.
  payoutModalSaveDraftHandler: (() => void) | null;
  setPayoutModalSaveDraftHandler: (handler: (() => void) | null) => void;

  // Soft modal shown when an unverified host tries to activate (publish)
  // a campaign. Same UX vibe as payoutPendingVerificationModal.
  hostUnderReviewModal: boolean;
  showHostUnderReviewModal: (value: boolean) => void;

  // Marketing-credit top-up modal — mounted globally so any page can
  // open it via openTopUpModal(). presetAmount lets callers prefill the
  // amount (used by "you don't have enough credit" CTAs).
  topUpModalOpen: boolean;
  topUpPresetAmount: number | null;
  openTopUpModal: (presetAmount?: number) => void;
  closeTopUpModal: () => void;

  // Reactive refresh signal for marketing-credit balance. Any surface that
  // displays the balance or an insufficient-credit warning subscribes to
  // this counter and refetches when it bumps. The top-up modal calls
  // bumpMarketingCredit() on a verified top-up so stale "₹X more needed"
  // messages clear and balances update without a manual reload.
  marketingCreditVersion: number;
  bumpMarketingCredit: () => void;

  // Unified settings modal — replaces /profile and /org-settings.
  // `settingsModalTab` selects the initial tab; "account" lands the user
  // on the Personal info tab (used by the host-switcher's "Account
  // details" entry), "brand" opens the organisation tab (used by the
  // sidebar Settings entry).
  settingsModalOpen: boolean;
  settingsModalTab: "account" | "security" | "brand" | "alerts";
  openSettingsModal: (tab?: "account" | "security" | "brand" | "alerts") => void;
  closeSettingsModal: () => void;

  // Per-event "Run a Campaign" launcher — pops a compact channel
  // picker with the event pre-selected. Stores the eventId + a
  // display title so the modal can render context without a fetch.
  runCampaignModalEvent: { eventId: string; title: string } | null;
  openRunCampaignModal: (event: { eventId: string; title: string }) => void;
  closeRunCampaignModal: () => void;

  // Order receipt modal — mounted globally so the orders page (or any
  // surface) can open a full receipt by id via openOrderReceipt(orderId).
  // The modal fetches the detail itself on open.
  orderReceiptModalOpen: boolean;
  orderReceiptId: string | null;
  openOrderReceipt: (orderId: string) => void;
  closeOrderReceipt: () => void;
};

const useGlobalStore = create<MenuState>((set) => ({
  isShowTaxSettings: false,
  setIsShowTaxSettings: (show: boolean) => set({ isShowTaxSettings: show }),
  selectedSideBarMenu: "dashboard",
  manageSubscriptionLink: "",
  setManageSubscriptionLink: (link: string) =>
    set({ manageSubscriptionLink: link }),
  isSidebarExpanded: true,
  isShowSetupPanel: true,
  isVerificationToHostAdd: false,
  setSelectedSideBarMenu: (menu: string) => set({ selectedSideBarMenu: menu }),
  toastData: null, // Default toast data
  setToastData: (data: ToastData | null) => set({ toastData: data }),
  setIsSidebarExpanded: (isExpanded: boolean) =>
    set({ isSidebarExpanded: isExpanded }),
  setIsShowSetupPanel: (e: boolean) => set({ isShowSetupPanel: e }),
  setisVerificationToHostAdd: (e: boolean) =>
    set({ isVerificationToHostAdd: e }),

  showMultiAccount: false,
  setShowMultiAccount: (e: boolean) => set({ showMultiAccount: e }),

  multiAccountModal: false,
  showMultiAccountModal: (e: boolean) => set({ multiAccountModal: e }),

  payoutPromptModal: false,
  showPayoutPromptModal: (e: boolean) => set({ payoutPromptModal: e }),
  payoutFormModal: false,
  showPayoutFormModal: (e: boolean) => set({ payoutFormModal: e }),

  payoutPendingVerificationModal: false,
  showPayoutPendingVerificationModal: (e: boolean) =>
    set({ payoutPendingVerificationModal: e }),

  payoutModalSaveDraftHandler: null,
  setPayoutModalSaveDraftHandler: (handler) =>
    set({ payoutModalSaveDraftHandler: handler }),

  hostUnderReviewModal: false,
  showHostUnderReviewModal: (e: boolean) => set({ hostUnderReviewModal: e }),

  topUpModalOpen: false,
  topUpPresetAmount: null,
  openTopUpModal: (presetAmount?: number) =>
    set({
      topUpModalOpen: true,
      topUpPresetAmount:
        typeof presetAmount === "number" && Number.isFinite(presetAmount)
          ? Math.max(0, Math.ceil(presetAmount))
          : null,
    }),
  closeTopUpModal: () => set({ topUpModalOpen: false, topUpPresetAmount: null }),

  marketingCreditVersion: 0,
  bumpMarketingCredit: () =>
    set((state) => ({ marketingCreditVersion: state.marketingCreditVersion + 1 })),

  settingsModalOpen: false,
  settingsModalTab: "account",
  openSettingsModal: (tab) =>
    set({ settingsModalOpen: true, settingsModalTab: tab ?? "account" }),
  closeSettingsModal: () => set({ settingsModalOpen: false }),

  runCampaignModalEvent: null,
  openRunCampaignModal: (event) => set({ runCampaignModalEvent: event }),
  closeRunCampaignModal: () => set({ runCampaignModalEvent: null }),

  orderReceiptModalOpen: false,
  orderReceiptId: null,
  openOrderReceipt: (orderId: string) =>
    set({ orderReceiptModalOpen: true, orderReceiptId: orderId }),
  closeOrderReceipt: () =>
    set({ orderReceiptModalOpen: false, orderReceiptId: null }),
}));

export default useGlobalStore;
