import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import BlockerLayout from "@/components/layouts/blockerLayout";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React from "react";

const PaymentPending: React.FC & {
  getLayout?: (page: React.ReactNode) => React.ReactNode;
} = () => {
  const router = useRouter();

  return (
    <div className="w-full max-w-xl rounded-lg border border-gray-300 bg-white p-8 shadow-sm">
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Payment setup is not required
        </h1>
        <p className="text-gray-600">
          Host onboarding now continues directly to the dashboard. Commission
          and payout setup will be handled separately.
        </p>
        <CButton
          variant={ButtonType.Primary}
          onClick={() => router.replace("/dashboard")}
        >
          Open Dashboard
        </CButton>
      </div>
    </div>
  );
};

PaymentPending.getLayout = function getLayout(page: React.ReactNode) {
  return <BlockerLayout>{page}</BlockerLayout>;
};

export default PaymentPending;

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

  return {
    redirect: {
      destination: "/dashboard",
      permanent: false,
    },
  };
};
