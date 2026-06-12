import NotFound from "@/components/common/notFound/notFound";
import WhatsAppCampaignOnboardingLayout from "@/components/layouts/whatsappCampaignOnboarding";
import WhatsAppAudience from "@/components/modules/whatsappCampaignOnboarding/WhatsAppAudience";
import WhatsAppBasics from "@/components/modules/whatsappCampaignOnboarding/WhatsAppBasics";
import WhatsAppContent from "@/components/modules/whatsappCampaignOnboarding/WhatsAppContent";
import WhatsAppSchedule from "@/components/modules/whatsappCampaignOnboarding/WhatsAppSchedule";
import { sdk } from "@/utils/graphqlClient";
import { GetServerSideProps } from "next";

const WhatsAppOnboardingPage = ({ repo }: { repo?: { step: string } }) => {
  let child: React.ReactNode;
  switch (repo?.step) {
    case "basics":
      child = <WhatsAppBasics />;
      break;
    case "content":
      child = <WhatsAppContent />;
      break;
    case "audience":
      child = <WhatsAppAudience />;
      break;
    case "schedule":
      child = <WhatsAppSchedule />;
      break;
    default:
      child = <NotFound />;
      break;
  }
  return (
    <WhatsAppCampaignOnboardingLayout>{child}</WhatsAppCampaignOnboardingLayout>
  );
};

export default WhatsAppOnboardingPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookieHeader = context.req.headers.cookie ?? "";

  if (!cookieHeader.includes("accessToken=")) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  try {
    const response = await sdk.MeUserJourney(
      {},
      { cookie: context.req.headers.cookie?.toString() ?? "" }
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
    return {
      props: { repo: { step: context.query["step"]?.toString() ?? "" } },
    };
  } catch (error) {
    return { redirect: { destination: "/login", permanent: false } };
  }
};
