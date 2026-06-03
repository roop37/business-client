"use client";

import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import ReusableModal from "@/components/common/modal/modal";
import AddPayoutModal from "@/components/modules/payment/host-payouts/addPayoutModal";
import useGlobalStore from "@/store/global";
import { Clock3, FileText, Megaphone } from "lucide-react";

/**
 * Global "you need a payout profile" prompt + the AddPayoutModal it
 * launches. Mounted once at the app root (both Pages Router _app.tsx
 * and App Router AppGlobals) so any route can trigger it via
 * `showPayoutPromptModal(true)`; historically it lived inside
 * MainLayout, which silently broke flows on routes that don't wrap
 * with MainLayout (event create/update, blocker layouts, etc.).
 */
const PayoutModals = () => {
  const {
    payoutPromptModal,
    showPayoutPromptModal,
    payoutFormModal,
    showPayoutFormModal,
    payoutPendingVerificationModal,
    showPayoutPendingVerificationModal,
    hostUnderReviewModal,
    showHostUnderReviewModal,
    payoutModalSaveDraftHandler,
  } = useGlobalStore();

  const runSaveDraft = () => {
    payoutModalSaveDraftHandler?.();
  };

  return (
    <>
      <ReusableModal
        isOpen={payoutPromptModal}
        onClose={() => showPayoutPromptModal(false)}
        title="Verified payout required to publish"
        width="md"
      >
        <div className="space-y-4 text-[#171614]">
          <p className="text-sm leading-6 text-[#6f6255]">
            Paid events need a primary payout account verified by our team.
            You can keep building this event and save it as a draft — once
            we verify your payout (usually within 1 to 4 hours), the event
            becomes publishable so customers can start buying tickets.
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <CButton
              variant={ButtonType.Secondary}
              type="button"
              onClick={() => showPayoutPromptModal(false)}
            >
              Cancel
            </CButton>
            {payoutModalSaveDraftHandler ? (
              <CButton
                variant={ButtonType.Secondary}
                type="button"
                onClick={() => {
                  showPayoutPromptModal(false);
                  runSaveDraft();
                }}
              >
                <span className="inline-flex items-center gap-2">
                  <FileText size={14} />
                  Save as draft
                </span>
              </CButton>
            ) : null}
            <CButton
              variant={ButtonType.Primary}
              type="button"
              onClick={() => {
                showPayoutPromptModal(false);
                showPayoutFormModal(true);
              }}
            >
              Add payout
            </CButton>
          </div>
        </div>
      </ReusableModal>

      <AddPayoutModal
        isOpen={payoutFormModal}
        onClose={() => showPayoutFormModal(false)}
        onCreated={() => showPayoutFormModal(false)}
      />

      <ReusableModal
        isOpen={payoutPendingVerificationModal}
        onClose={() => showPayoutPendingVerificationModal(false)}
        title="Payout being verified"
        width="md"
      >
        <div className="space-y-4 text-[#171614]">
          <div className="flex items-start gap-3 rounded-lg bg-[var(--owner-bg-subtle)] p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white text-[var(--owner-blue-500)]">
              <Clock3 size={18} />
            </span>
            <p className="text-sm leading-6 text-[#3d3328]">
              Our team verifies new payout profiles within 1 to 4 hours. Your
              event is safely saved as a draft and you can keep editing it.
              The moment your payout clears, the event becomes publishable.
            </p>
          </div>
          <p className="text-sm leading-6 text-[#6f6255]">
            While you wait, set up marketing so your event flies the moment
            it goes live — top up marketing credit, draft an email campaign,
            or line up an offer.
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <CButton
              variant={ButtonType.Secondary}
              type="button"
              onClick={() => showPayoutPendingVerificationModal(false)}
            >
              Stay on this page
            </CButton>
            {payoutModalSaveDraftHandler ? (
              <CButton
                variant={ButtonType.Secondary}
                type="button"
                onClick={() => {
                  showPayoutPendingVerificationModal(false);
                  runSaveDraft();
                }}
              >
                <span className="inline-flex items-center gap-2">
                  <FileText size={14} />
                  Save as draft
                </span>
              </CButton>
            ) : null}
            <CButton
              variant={ButtonType.Primary}
              type="button"
              onClick={() => {
                showPayoutPendingVerificationModal(false);
                if (typeof window !== "undefined") {
                  // window.location.assign side-steps the NextRouter-not-mounted
                  // prerender failure that useRouter() from next/router triggers
                  // when this global modal lands in the App Router fallback path.
                  window.location.assign("/campaigns");
                }
              }}
            >
              <span className="inline-flex items-center gap-2">
                <Megaphone size={14} />
                Explore marketing
              </span>
            </CButton>
          </div>
        </div>
      </ReusableModal>

      <ReusableModal
        isOpen={hostUnderReviewModal}
        onClose={() => showHostUnderReviewModal(false)}
        title="Account under review"
        width="md"
      >
        <div className="space-y-4 text-[#171614]">
          <div className="flex items-start gap-3 rounded-lg bg-[var(--owner-bg-subtle)] p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white text-[var(--owner-blue-500)]">
              <Clock3 size={18} />
            </span>
            <p className="text-sm leading-6 text-[#3d3328]">
              Your business account is still being verified by our team. You can build and save campaigns now —
              we&apos;ll publish them automatically the moment verification clears (usually within 1 to 4 hours).
            </p>
          </div>
          <p className="text-sm leading-6 text-[#6f6255]">
            In the meantime, draft your next campaign, polish your event listing, or finish your team setup.
          </p>
          <div className="flex justify-end">
            <CButton
              variant={ButtonType.Primary}
              type="button"
              onClick={() => showHostUnderReviewModal(false)}
            >
              Got it
            </CButton>
          </div>
        </div>
      </ReusableModal>
    </>
  );
};

export default PayoutModals;
