import { MarketingCredit } from "@/components/modules/campaign/MarketingCredit";
import MainLayout from "@/components/layouts/mainBodyLayout";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { GetServerSideProps } from "next";
import React, { useEffect } from "react";

const MarketingCreditPage: React.FC & {
  getLayout?: (page: React.ReactNode) => React.ReactNode;
} = () => {
  const { setSelectedSideBarMenu } = useGlobalStore();

  useEffect(() => {
    setSelectedSideBarMenu("Campaigns");
  }, [setSelectedSideBarMenu]);

  return <MarketingCredit />;
};

MarketingCreditPage.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout>{page}</MainLayout>;
};

export default MarketingCreditPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookieHeader = context.req.headers.cookie ?? "";
  if (!cookieHeader.includes("accessToken=")) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  try {
    const journeyResponse = await sdk.MeUserJourney(
      {},
      {
        cookie: context.req.headers.cookie?.toString() ?? "",
      }
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

    return { props: {} };
  } catch {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
};
