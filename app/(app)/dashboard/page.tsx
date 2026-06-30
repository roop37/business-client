import { cookies } from "next/headers";
import { isRedirectError } from "next/dist/client/components/redirect";
import { redirect } from "next/navigation";
import { sdk } from "@/utils/graphqlClient";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const cookieHeader = cookies().toString();

  try {
    const response = await sdk.MeUserJourney({}, { cookie: cookieHeader });
    const journey = response.meUserJourney;

    if (!journey.hostOnboardingCompleted || !journey.hostId) {
      redirect(journey.suggestedRoute || "/onboarding-host/host-type");
    }
    if (journey.hostStatus === "BLOCKED") {
      redirect("/account/blocked");
    }
    if (!journey.isAdminVerified) {
      redirect("/blocker/admin-verification-pending");
    }

    return <DashboardClient />;
  } catch (error) {
    // `redirect()` throws a NEXT_REDIRECT signal — rethrow so the
    // framework can act on it. Only treat genuine errors (auth
    // failure, GraphQL crash) as "bounce to /login".
    if (isRedirectError(error)) {
      throw error;
    }
    redirect("/login");
  }
}
