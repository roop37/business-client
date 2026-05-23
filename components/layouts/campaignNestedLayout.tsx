// import { AnimatePresence } from "framer-motion";
// import { useRouter } from "next/router";
// import { ReactNode } from "react";
// import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

// type Props = {
//   children: ReactNode;
// };

// const CampaignLayout = ({ children }: Props) => {
//   const router = useRouter();
//   const { query } = router;
//   const { campaignRoute } = query;

//   const items = [
//     { label: "Custom Campaigns", route: "custom-campaigns" },
//     { label: "Automated Campaigns", route: "automated-campaigns" },
//     { label: "User Based Campaigns", route: "user-based-campaigns" },
//   ];

//   return (
//     <Tabs defaultValue={campaignRoute?.toString()} className="w-full">
//       <div className="flex flex-col space-y-2">
//         <div className="flex space-x-3 justify-end items-center">
//           <div className="flex space-x-4"></div>
//         </div>

//         <div className="flex space-x-2 ">
//           <TabsList className="flex items-center justify-start flex-wrap h-auto  w-full md:w-max">
//             {items.map((tab, index) => (
//               <TabsTrigger
//                 asChild
//                 key={index.toString()}
//                 value={tab.route.toString()}
//               >
//                 <button onClick={() => router.push(tab.route)}>
//                   {tab.label}
//                 </button>
//               </TabsTrigger>
//             ))}
//           </TabsList>
//         </div>

//         <AnimatePresence mode="wait">{children}</AnimatePresence>
//       </div>
//     </Tabs>
//   );
// };

// export default CampaignLayout;

import useGlobalStore from "@/store/global";
import useUserStore from "@/store/user";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import Joyride, { STATUS } from "react-joyride";
import CustomJoyrideTooltip from "../joyride";
import { Tabs } from "../ui/tabs";

type Props = {
  children: ReactNode;
};

const walkthroughDone = (userId?: string, tour = "campaign") => {
  if (typeof window === "undefined" || !userId) return true;
  return localStorage.getItem(`hoizr.walkthrough.${userId}.${tour}`) === "done";
};

const markWalkthroughDone = (userId?: string, tour = "campaign") => {
  if (typeof window === "undefined" || !userId) return;
  localStorage.setItem(`hoizr.walkthrough.${userId}.${tour}`, "done");
};

const CampaignLayout = ({ children }: Props) => {
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [loading, setLoading] = useState(true);
  const { meUser } = useUserStore();
  const { setToastData } = useGlobalStore();
  const router = useRouter();
  const { query } = router;
  const { campaignRoute } = query;

  const items = [
    { label: "Custom Campaigns", route: "custom-campaigns" },
    { label: "Automated Campaigns", route: "automated-campaigns" },
    { label: "User Based Campaigns", route: "user-based-campaigns" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await sdk.MeUser();
        if (response?.meUser) {
          useUserStore.getState().setMeUser(response.meUser);
          setShowWalkthrough(!walkthroughDone(response.meUser._id, "campaign"));
        }
      } catch (error) {
        setToastData({ message: extractErrorMessage(error), type: "error" });
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <Tabs
      defaultValue={campaignRoute?.toString()}
      className="w-full min-w-0"
    >
      <Joyride
        steps={[
          {
            title: "Welcome to Campaigns",
            content:
              "Create campaigns, manage saved campaign work, and track engagement from one marketing area.",
            target: "body",
            placement: "center",
            disableBeacon: true,
          },
          {
            title: "Create Campaign",
            content:
              "Use this action to start a new campaign journey with audience, template, and schedule steps.",
            target: "#campaign-create-button",
            placement: "bottom",
          },
          {
            title: "Manage Campaigns",
            content:
              "Review drafts, scheduled sends, and completed campaigns from this page.",
            target: "body",
            placement: "center",
          },
          {
            title: "Track Campaigns",
            content:
              "Campaign performance is reflected in metrics and reports so you can improve future sends.",
            target: "#sidebar-reports",
            placement: "right",
          },
        ]}
        run={showWalkthrough && !loading && !!meUser}
        continuous
        disableCloseOnEsc={true}
        disableScrolling={true}
        disableOverlayClose={true}
        hideCloseButton={true}
        callback={async (data) => {
          const { status } = data;
          const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

          if (finishedStatuses.includes(status) && meUser) {
            markWalkthroughDone(meUser._id, "campaign");
            setShowWalkthrough(false);
          }
        }}
        tooltipComponent={CustomJoyrideTooltip}
      />
      <div className="flex min-w-0 flex-col">
        <div className="flex space-x-3 justify-end items-center">
          <div className="flex space-x-4"></div>
        </div>

        {/* <div className="flex space-x-2 ">
          <TabsList className="flex items-center justify-start flex-wrap h-auto w-full md:w-max">
            {items.map((tab, index) => (
              <TabsTrigger
                asChild
                key={index.toString()}
                value={tab.route.toString()}
              >
                <button
                  id={tab.route} // Added ID for Joyride targeting
                  onClick={() => router.push(tab.route)}
                >
                  {tab.label}
                </button>
              </TabsTrigger>
            ))}
          </TabsList>
        </div> */}

        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">{children}</AnimatePresence>
        </div>
      </div>
    </Tabs>
  );
};

export default CampaignLayout;
