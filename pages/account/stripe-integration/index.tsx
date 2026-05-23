import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import BlockerLayout from "@/components/layouts/blockerLayout";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { GetServerSideProps } from "next";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

type NextPageWithLayout = React.FC & {
  getLayout?: (page: React.ReactNode) => React.ReactNode;
};

interface StripeIntegrationProps {}

const StripeIntegration: NextPageWithLayout = ({}: StripeIntegrationProps) => {
  const { back, replace } = useRouter();

  const [loading, setLoading] = useState(false);

  const connectHandler = async () => {
    setLoading(true);
    try {
      const response = await sdk.createStripeIntegration();

      if (response.createStripeIntegration) {
        replace(response.createStripeIntegration);
      } else {
        console.error("Failed to open stripe onboarding");
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Failed to open stripe onboarding", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-2 py-3 w-full max-w-xl mx-auto flex flex-col space-y-8">
        <div className="flex flex-col items-start text-start p-4 space-y-5">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Stripe Integration
          </h1>

          <p className="text-gray-600 mb-2">
            {`Hope you've completed the Stripe setup process. This process usually takes 1 to 4 hours. You'll receive an email if any additional information is needed.`}
          </p>
          <p className="text-gray-600 mb-2">
            {`In case you haven't completed the process, click `}
            <span
              className="font-medium underline text-primary cursor-pointer"
              onClick={() => {
                connectHandler();
              }}
            >
              here
            </span>
            {` to complete the process.`}
          </p>
          <div className="flex flex-col text-right w-full">
            <CButton
              variant={ButtonType.Secondary}
              onClick={() => {
                back();
              }}
              className="self-end"
            >
              Continue to Dashboard
            </CButton>
          </div>
        </div>
      </div>
    </div>
  );
};

StripeIntegration.getLayout = function getLayout(page: React.ReactNode) {
  return <BlockerLayout>{page}</BlockerLayout>;
};

StripeIntegration.getLayout = function getLayout(page: React.ReactNode) {
  return <BlockerLayout>{page}</BlockerLayout>;
};

export default StripeIntegration;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookieHeader = context.req.headers.cookie ?? "";
  const tokenExists = cookieHeader.includes("accessToken=");

  const accountId = (context.query as any)?.accountId;
  if (!accountId) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  if (!tokenExists) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };

  // try {
  //   const response = await sdk.verifyStripeIntegration(
  //     {
  //       accountId: accountId,
  //     },
  //     {
  //       cookie: context.req.headers.cookie?.toString() ?? "",
  //     }
  //   );

  //   if (response.verifyStripeIntegration) {
  //     return {
  //       props: {},
  //     };
  //   } else {
  //     return {
  //       props: {
  //         error:
  //           "Stripe is verifying your account. Please wait for a few minutes for the status to change.",
  //       },
  //     };
  //   }
  // } catch (error) {
  //   return {
  //     props: {
  //       error: extractErrorMessage(error),
  //     },
  //   };
  // }
};
