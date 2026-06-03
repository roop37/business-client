"use client";

import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import ReusableModal from "@/components/common/modal/modal";
import AddPayoutModal from "@/components/modules/payment/host-payouts/addPayoutModal";
import useGlobalStore from "@/store/global";
import { Clock3, FileText, Mail, Megaphone, MessageCircle } from "lucide-react";

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
        title="Add a payout account to continue"
        width="md"
      >
        <div className="space-y-4 text-[#171614]">
          <p className="text-sm leading-6 text-[#6f6255]">
            Paid events need at least one payout account before you continue
            setup or publish. You can add the details now and keep building
            the event; our team only needs to verify the payout before you
            publish.
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
        title="Payout verification required to publish"
        width="md"
      >
        <div className="space-y-4 text-[#171614]">
          <div className="flex items-start gap-3 rounded-lg bg-[var(--owner-bg-subtle)] p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white text-[var(--owner-blue-500)]">
              <Clock3 size={18} />
            </span>
            <p className="text-sm leading-6 text-[#3d3328]">
              This payout is not verified yet. New payout profiles are usually
              reviewed within 1 to 4 hours. Your event can stay in draft and
              you can keep editing it, but paid events cannot publish until the
              primary payout is verified.
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
              Your business account is still being verified by our internal
              admin team. You can keep building drafts, but publishing is
              blocked until verification clears.
            </p>
          </div>
          <p className="text-sm leading-6 text-[#6f6255]">
            Need it resolved quickly? Contact us and we&apos;ll check the review
            queue for your account.
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <CButton
              variant={ButtonType.Secondary}
              type="button"
              onClick={() => showHostUnderReviewModal(false)}
            >
              Got it
            </CButton>
            <a
              href="mailto:contact@hoizr.com?subject=Host%20verification%20review"
              onClick={() => showHostUnderReviewModal(false)}
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-[#d9d2c4] px-4 py-2 text-sm font-semibold text-[#171614] transition hover:bg-[#f7f2e9]"
            >
              <span className="inline-flex items-center gap-2">
                <Mail size={14} />
                Email support
              </span>
            </a>
            <a
              href="https://wa.me/918910385523?text=Hi%20Hoizr%2C%20please%20help%20with%20my%20host%20verification."
              target="_blank"
              rel="noreferrer"
              onClick={() => showHostUnderReviewModal(false)}
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-[var(--owner-blue-500)] px-4 py-2 text-sm font-semibold text-[var(--owner-bg)] transition hover:opacity-90"
            >
              <span className="inline-flex items-center gap-2">
                <MessageCircle size={14} />
                WhatsApp
              </span>
            </a>
          </div>
        </div>
      </ReusableModal>
    </>
  );
};

export default PayoutModals;
