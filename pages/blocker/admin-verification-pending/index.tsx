import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import BlockerLayout from "@/components/layouts/blockerLayout";
import { sdk } from "@/utils/graphqlClient";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React from "react";

const AdminVerificationPending: React.FC & {
  getLayout?: (page: React.ReactNode) => React.ReactNode;
} = () => {
  const router = useRouter();

  return (
    <div className="w-full max-w-xl p-8 bg-white rounded-xl shadow-sm border border-gray-300">
      <div className="flex flex-col items-start space-y-5">
        <h1 className="text-2xl font-semibold text-gray-900">
          Business verification is pending
        </h1>
        <p className="text-gray-600">
          Your business onboarding has been submitted to the internal team. You
          can continue setting up the business profile while verification is in
          progress.
        </p>
        <div className="flex w-full gap-2">
          <CButton
            variant={ButtonType.Secondary}
            className="w-full"
            onClick={() => router.push("/dashboard")}
          >
            Open Dashboard
          </CButton>
          <CButton
            variant={ButtonType.Primary}
            className="w-full"
            onClick={() => router.push("/onboarding-host/host-type")}
          >
            Continue Business Setup
          </CButton>
        </div>
      </div>
    </div>
  );
};

AdminVerificationPending.getLayout = function getLayout(page: React.ReactNode) {
  return <BlockerLayout>{page}</BlockerLayout>;
};

export default AdminVerificationPending;

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
    if (!journey.businessOnboardingCompleted) {
      return {
        redirect: {
          destination: "/onboarding/user/business-details",
          permanent: false,
        },
      };
    }

    if (journey.isAdminVerified) {
      return {
        redirect: {
          destination: journey.hostOnboardingCompleted
            ? "/dashboard"
            : "/onboarding-host/host-type",
          permanent: false,
        },
      };
    }

    return { props: {} };
  } catch (error) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
};
