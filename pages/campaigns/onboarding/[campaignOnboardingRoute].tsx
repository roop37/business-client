import NotFound from "@/components/common/notFound/notFound";
import OnboardingCampaignLayout from "@/components/layouts/campaignOnboarding";
import CampaignAudience from "@/components/modules/campaignOnboarding/campaignTarget";
import CampaignSchedule from "@/components/modules/campaignOnboarding/scheduleCampaign";
import TemplateEdit from "@/components/modules/campaignOnboarding/templateEdit";
import TemplateSelect from "@/components/modules/campaignOnboarding/templateSelect";
import { sdk } from "@/utils/graphqlClient";
import { verificationGateRedirect } from "@/lib/auth/verificationGate";
import { GetServerSideProps } from "next";

type CampaignOnboardingRepo = {
  pagePath: string;
};

const CampaignOnboardingPage = ({
  repo,
}: {
  repo?: CampaignOnboardingRepo;
}) => {
  let childComponent;

  switch (repo?.pagePath) {
    case "template-select":
      childComponent = <TemplateSelect />;
      break;
    case "template-edit":
      childComponent = <TemplateEdit />;
      break;
    case "template-target":
      childComponent = <CampaignAudience />;
      break;
    case "schedule":
      childComponent = <CampaignSchedule />;
      break;
    default:
      childComponent = <NotFound />;
      break;
  }

  return <OnboardingCampaignLayout>{childComponent}</OnboardingCampaignLayout>;
};

export default CampaignOnboardingPage;

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
    const response = await sdk.MeUserJourney(
      {},
      {
        cookie: context.req.headers.cookie?.toString() ?? "",
      }
    );

    const journey = response.meUserJourney;

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

    return {
      props: {
        repo: {
          pagePath:
            context.query["campaignOnboardingRoute"]?.toString() ?? "",
        },
      },
    };
  } catch (error) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
};
