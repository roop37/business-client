import MainLayout from "@/components/layouts/mainBodyLayout";
import LeaderboardTable from "@/components/modules/community/LeaderboardTable";
import { sdk } from "@/utils/graphqlClient";
import { verificationGateRedirect } from "@/lib/auth/verificationGate";
import { GetServerSideProps } from "next";

const Community = () => {
  return <LeaderboardTable />;
};

Community.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout>{page}</MainLayout>;
};

export default Community;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookieHeader = context.req.headers.cookie ?? "";
  const tokenExists = cookieHeader.includes("accessToken=");

  if (!tokenExists) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  try {
    // Ungated like coupons (D3 default): verify onboarding + verification only,
    // no per-teammate permission check.
    const journeyResponse = await sdk.MeUserJourney(
      {},
      { cookie: context.req.headers.cookie?.toString() ?? "" }
    );

    const journey = journeyResponse.meUserJourney;
    if (!journey.hostOnboardingCompleted || !journey.hostId) {
      return {
        redirect: {
          destination: journey.suggestedRoute || "/onboarding-host/host-type",
          permanent: false,
        },
      };
    }

    const _vGate = verificationGateRedirect(journey);
    if (_vGate) return _vGate;

    return { props: {} };
  } catch (error) {
    return { redirect: { destination: "/login", permanent: false } };
  }
};
