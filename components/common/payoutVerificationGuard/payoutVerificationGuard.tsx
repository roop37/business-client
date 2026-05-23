import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import ReusableModal from "@/components/common/modal/modal";
import { useRouter } from "next/router";
import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Shown when a host attempts to publish a paid event without a verified payout
 * account. Non-blocking for free events and the rest of the dashboard.
 */
const PayoutVerificationGuard: React.FC<Props> = ({ isOpen, onClose }) => {
  const router = useRouter();

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title="Verified payout required"
      width="md"
      comments="Paid events can only be published once a payout account has been verified by Hoizr."
    >
      <div className="space-y-4">
        <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5 text-left">
          <li>Add your bank account under Payments → Payout Details.</li>
          <li>Verification usually completes within 1 to 4 hours.</li>
          <li>
            Free events can still be published while verification is in
            progress.
          </li>
        </ul>

        <div className="flex justify-end gap-2 pt-2">
          <CButton
            variant={ButtonType.Secondary}
            type="button"
            onClick={onClose}
          >
            Not now
          </CButton>
          <CButton
            variant={ButtonType.Primary}
            type="button"
            onClick={() => {
              onClose();
              router.push("/payment/payouts");
            }}
          >
            Set Up Payout
          </CButton>
        </div>
      </div>
    </ReusableModal>
  );
};

export default PayoutVerificationGuard;
