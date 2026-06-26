/**
 * Host verification SSR gate.
 *
 * A host that finishes onboarding has `hostOnboardingCompleted === true` and a
 * `hostId`, but stays `isAdminVerified === false` until an internal admin
 * verifies the organization. Until then we keep them out of the operational
 * dashboard and park them on the verification blocker (they can still prep
 * payout details and switch to a verified org).
 *
 * This module is intentionally PURE — it imports nothing from `next/*`. It is
 * consumed by Pages-Router `getServerSideProps`, which cannot use
 * `next/headers` (the home of the App-Router auth helpers in `serverAuth.ts`).
 * Keeping the gate here means `yarn tsc --noEmit` and the Pages bundle both
 * stay happy.
 *
 * `isAdminVerified` is a plain boolean on the MeUserJourney query (already in
 * the generated SDK) — unlike the `hostStatus` enum it is NOT key-serialized,
 * so a simple truthiness check is correct.
 */

export const VERIFICATION_BLOCKER_ROUTE = "/blocker/admin-verification-pending";

type JourneyVerificationFields = {
  hostOnboardingCompleted?: boolean | null;
  hostId?: string | null;
  isAdminVerified?: boolean | null;
};

/**
 * Onboarded host whose org isn't admin-verified yet → send to the verification
 * blocker. Returns a getServerSideProps redirect descriptor, or null.
 *
 * Call this AFTER the existing onboarding guard so incomplete onboarding still
 * routes to onboarding, not the blocker.
 */
export const verificationGateRedirect = (journey: JourneyVerificationFields) =>
  journey.hostOnboardingCompleted && journey.hostId && !journey.isAdminVerified
    ? ({ redirect: { destination: VERIFICATION_BLOCKER_ROUTE, permanent: false } } as const)
    : null;
