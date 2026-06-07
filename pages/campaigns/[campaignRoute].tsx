import NotFound from "@/components/common/notFound/notFound";
import { Card, OwnerButton, PageHeader } from "@/components/common/owner";
import CampaignLayout from "@/components/layouts/campaignNestedLayout";
import MainLayout from "@/components/layouts/mainBodyLayout";
import CustomCampaigns from "@/components/modules/campaign/table/customCampaign";
import PushCampaigns from "@/components/modules/campaign/push/PushCampaigns";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";

import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Bell, Instagram, MessageCircle, Send } from "lucide-react";

type UserRepo = {
  pagePath: string;
  _id: string;
  firstName: string;
  status: string;
};

const channelCopy: Record<
  string,
  { title: string; subtitle: string; icon: React.ReactNode; accent: string }
> = {
  whatsapp: {
    title: "WhatsApp campaigns",
    subtitle:
      "Reach opted-in customers and event buyers through Hoizr's WhatsApp campaign flow.",
    icon: <MessageCircle size={20} />,
    accent: "bg-owner-success-bg text-owner-success-text",
  },
  "meta-hoizr": {
    title: "Meta x Hoizr campaigns",
    subtitle:
      "Paid Facebook and Instagram campaigns run from Hoizr's Meta account. Marketing credit covers the ad cost plus 8%.",
    icon: <Instagram size={20} />,
    accent: "bg-owner-blue-050 text-owner-blue-500",
  },
  sms: {
    title: "SMS campaigns",
    subtitle:
      "SMS campaigns are not part of the current Hoizr campaign launch set.",
    icon: <Send size={20} />,
    accent: "bg-owner-blue-050 text-owner-blue-500",
  },
  push: {
    title: "Push campaigns",
    subtitle:
      "Push and in-app campaigns are planned as a free channel for opted-in customers.",
    icon: <Bell size={20} />,
    accent: "bg-owner-warning-bg text-owner-warning-text",
  },
  instagram: {
    title: "Instagram audiences",
    subtitle:
      "Instagram-connected audience insights should inform promoter, artist, and campaign recommendations before this channel goes live.",
    icon: <Instagram size={20} />,
    accent: "bg-owner-danger-bg text-owner-danger-text",
  },
};

const ChannelPlaceholder = ({ route }: { route: string }) => {
  const router = useRouter();
  const copy = channelCopy[route] ?? channelCopy.whatsapp;

  return (
    <div>
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
        actions={
          <OwnerButton
            variant="secondary"
            leadingIcon={<MessageCircle size={16} />}
            onClick={() => router.push("/campaigns/whatsapp")}
          >
            Use WhatsApp campaign
          </OwnerButton>
        }
      />
      <Card className="max-w-3xl">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-owner-md ${copy.accent}`}
          >
            {copy.icon}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-owner-fg-1">
              Channel setup pending
            </h2>
            <p className="owner-body mt-2">
              This page is intentionally not showing fake campaign rows. The
              channel will be enabled here once the host-facing builder is
              wired to the approved Hoizr-run campaign contract.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

const CampaignPage = ({ repo }: { repo?: UserRepo }) => {
  const { setSelectedSideBarMenu } = useGlobalStore();

  useEffect(() => {
    setSelectedSideBarMenu("Campaigns");
  }, [setSelectedSideBarMenu]);

  let childComponent;

  switch (repo?.pagePath) {
    case "email":
    case "custom-campaigns":
      childComponent = <CustomCampaigns />;
      break;
    case "sms":
    case "instagram":
      childComponent = <ChannelPlaceholder route={repo.pagePath} />;
      break;
    case "meta-hoizr":
      childComponent = <ChannelPlaceholder route={repo.pagePath} />;
      break;
    // whatsapp is served by the static page at /pages/campaigns/whatsapp.tsx
    // which takes precedence over this dynamic route in the Pages Router.
    case "push":
      childComponent = <PushCampaigns />;
      break;
    // case "automated-campaigns":
    //   childComponent = <AutomatedCampaign />;
    //   break;
    // case "user-based-campaigns":
    //   childComponent = <UserActionCampaigns />;
    //   break;

    default:
      childComponent = <NotFound />;
      break;
  }

  return <>{childComponent}</>;
};

CampaignPage.getLayout = function getLayout(page: React.ReactNode) {
  return (
    <MainLayout>
      <CampaignLayout>{page}</CampaignLayout>
    </MainLayout>
  );
};

export default CampaignPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookieHeader = context.req.headers.cookie ?? "";
  const tokenExists = cookieHeader.includes("accessToken=");

  if (!tokenExists) {
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
        }
      };
    }

    return {
      props: {
        repo: {
          pagePath: context.query["campaignRoute"]?.toString() ?? "",
          _id: "",
          firstName: "",
          status: journey.userStatus,
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
