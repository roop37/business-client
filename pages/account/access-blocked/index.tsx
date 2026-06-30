import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import BlockerLayout from "@/components/layouts/blockerLayout";
import { PermissionTypeEnum, UserStatus } from "@/generated/graphql";
import { sdk } from "@/utils/graphqlClient";
import { hasAccess } from "@/utils/hasAccess";
import { redirectPathFromStatus } from "@/utils/redirectPathFromStatus";
import { formatPermissionType } from "@/utils/utilFUncs";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import blocked from "../../../assets/svg/blocked.svg";

type PermissionProps = {
  hasAccess: boolean;
  target: PermissionTypeEnum;
  message: string;
};

type NextPageWithLayout = React.FC<PermissionProps> & {
  getLayout?: (page: React.ReactNode) => React.ReactNode;
};

const AccessBlocked: NextPageWithLayout = ({ hasAccess, target, message }) => {
  const router = useRouter();

  const handleRedirectToDashboard = () => {
    router.push("/dashboard");
  };

  const handleContactSupport = () => {
    router.push("/support");
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="p-8 rounded-xl bg-white shadow-sm max-w-xl w-full mx-4">
        <div className="flex flex-col items-start">
          <Image
            src={blocked}
            alt="Blocked"
            width={70}
            height={70}
            className="mb-6"
          />

          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Access Restricted
          </h1>

          <p className="text-gray-600 mb-2">
            {`You don't have access to ${formatPermissionType(
              target
            )}. Please contact your administrator for access.`}
          </p>
          <br />
          <div className="flex justify-end items-center space-x-4 w-full">
            <CButton variant={ButtonType.Text} onClick={handleContactSupport}>
              Contact Support
            </CButton>
            <CButton
              variant={ButtonType.Secondary}
              onClick={handleRedirectToDashboard}
            >
              Continue to Dashboard
            </CButton>
          </div>
        </div>
      </div>
    </div>
  );
};

AccessBlocked.getLayout = function getLayout(page: React.ReactNode) {
  return <BlockerLayout>{page}</BlockerLayout>;
};

export default AccessBlocked;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookieHeader = context.req.headers.cookie ?? "";
  const tokenExists = cookieHeader.includes("accessToken=");
  const target = (context.query as any)?.target as PermissionTypeEnum;

  if (!tokenExists) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  if (!target || target.toString().length < 1) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  try {
    const response = await sdk.MeCheckUser(
      {},
      {
        cookie: context.req.headers.cookie?.toString() ?? "",
      }
    );

    if (!response || !response.meUser) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    const { permissions, status } = response.meUser;

    if (!hasAccess(permissions, target)) {
      return {
        props: {
          hasAccess: false,
          target,
          message: `Access to ${target?.toLowerCase()} module is restricted.`,
        },
      };
    }

    let redirectResult = redirectPathFromStatus(status, false);

    if (status === UserStatus.Active) {
      return redirectResult;
    }

    return {
      props: {
        hasAccess: true,
        target,
        message:
          "Complete your payment to access the dashboard and unlock event publishing.",
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
