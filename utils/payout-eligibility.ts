import { VerificationStatus } from "@/generated/graphql";

// Subset of fields returned by the `hostPayoutAccounts` query needed to
// decide whether the host may publish paid events. Pulled out as a type
// so callers can pass a freshly-fetched account list without massaging
// shape.
export type PayoutAccountForEligibility = {
  isPrimary?: boolean | null;
  isActive?: boolean | null;
  verificationStatus?: VerificationStatus | null;
};

// Client-side mirror of validatePublishPayoutPrecondition in main-server.
// Returns true when the host has at least one primary, active,
// admin-verified payout. The server enforces an additional Razorpay X
// provisioning check that the client never sees — so a `true` here does
// not guarantee publish will succeed; the EventJourney post-error catch
// is the safety net for that race.
export function hasVerifiedPrimaryPayout(
  accounts: PayoutAccountForEligibility[] | null | undefined
): boolean {
  if (!accounts || accounts.length === 0) return false;
  return accounts.some(
    (a) =>
      a.isPrimary === true &&
      a.isActive === true &&
      a.verificationStatus === VerificationStatus.Verified
  );
}

// True when the host has a primary payout that exists but is not yet
// verified (PENDING). Used by the EventJourney preflight to decide
// between PayoutPromptModal (no payout at all) and
// PayoutPendingVerificationModal (payout submitted, admin reviewing).
export function hasPendingPrimaryPayout(
  accounts: PayoutAccountForEligibility[] | null | undefined
): boolean {
  if (!accounts || accounts.length === 0) return false;
  return accounts.some(
    (a) =>
      a.isPrimary === true &&
      a.isActive === true &&
      a.verificationStatus === VerificationStatus.Pending
  );
}

// True when the GraphQL error message indicates the publish-payout gate
// blocked the request. Matches the new PAYOUT_NOT_VERIFIED: prefix
// thrown by main-server, plus the legacy "payout profile" substring
// for one release (in case a stale SDK is still in flight mid-deploy).
// Used by EventJourney catches to decide whether to open the payout
// modal vs. show a generic error toast.
export function isPayoutGateError(
  message: string | null | undefined
): boolean {
  if (!message) return false;
  if (message.startsWith("PAYOUT_NOT_VERIFIED:")) return true;
  return message.toLowerCase().includes("payout profile");
}
