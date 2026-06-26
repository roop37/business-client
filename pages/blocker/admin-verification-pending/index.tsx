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
          Verification in progress
        </h1>
        <p className="text-gray-600">
          Your profile is submitted and under internal review — usually within
          1–8 hours. You can add your payout details now so you&apos;re ready to
          go live the moment verification clears.
        </p>
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <CButton
            variant={ButtonType.Primary}
            className="w-full"
            onClick={() => router.push("/payment/payouts")}
          >
            Add payout details
          </CButton>
          <CButton
            variant={ButtonType.Secondary}
            className="w-full"
            onClick={() => router.push("/select-host")}
          >
            Switch organization
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

    // Not onboarded yet → finish onboarding first (the blocker is only for
    // onboarded-but-unverified hosts). suggestedRoute already points at the
    // right next onboarding step.
    if (!journey.hostOnboardingCompleted || !journey.hostId) {
      return {
        redirect: {
          destination: journey.suggestedRoute || "/onboarding-host/host-type",
          permanent: false,
        },
      };
    }

    // Already verified → no reason to sit on the blocker; go to the dashboard.
    if (journey.isAdminVerified) {
      return {
        redirect: {
          destination: "/dashboard",
          permanent: false,
        },
      };
    }

    // Onboarded but awaiting verification → render the blocker.
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
