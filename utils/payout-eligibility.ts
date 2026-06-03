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

// Event drafting only needs proof that the host has submitted payout
// details. Verification is intentionally handled later, at publish time.
export function hasAnyPayoutAccount(
  accounts: PayoutAccountForEligibility[] | null | undefined
): boolean {
  return Boolean(accounts && accounts.length > 0);
}

// Client-side mirror of validatePublishPayoutPrecondition in main-server.
// Returns true when the host has at least one primary, active,
// admin-verified payout. Razorpay X provisioning is intentionally
// excluded from this check on both client and server — provisioning is
// lazy (runs at first settlement transfer), so requiring it at publish
// would reject every host trying to publish their first paid event.
// Provisioning is enforced at the settlement-release gate instead.
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
// verified (PENDING). Useful for routes that want to distinguish
// "submitted, admin reviewing" from "no payout on file".
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
