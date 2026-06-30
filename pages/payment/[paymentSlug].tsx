import NotFound from "@/components/common/notFound/notFound";
import MainLayout from "@/components/layouts/mainBodyLayout";
import PaymentLayout from "@/components/layouts/paymentNestedLayout";
import HostPayouts from "@/components/modules/payment/host-payouts";
import SettlementHistory from "@/components/modules/payment/settlement-history";
import InvoicesTable from "@/components/modules/payment/tables/invoices";
import { PermissionTypeEnum } from "@/generated/graphql";
import { verificationGateRedirect } from "@/lib/auth/verificationGate";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { hasAccess } from "@/utils/hasAccess";
import { GetServerSideProps } from "next";
import { useEffect } from "react";

type UserRepo = {
  pagePath: string;
  _id: string;
  firstName: string;
  status: string;
};
const PaymentRoutes = ({ repo }: { repo?: UserRepo }) => {
  const { setSelectedSideBarMenu } = useGlobalStore();

  useEffect(() => {
    setSelectedSideBarMenu("Payment");
  }, [setSelectedSideBarMenu]);

  let childComponent;

  switch (repo?.pagePath) {
    case "invoices":
      childComponent = <InvoicesTable />;
      break;
    case "payouts":
      childComponent = <HostPayouts />;
      break;
    case "settlement-history":
      childComponent = <SettlementHistory />;
      break;
    default:
      childComponent = <NotFound />;
  }

  return <>{childComponent}</>;
};

PaymentRoutes.getLayout = function getLayout(page: React.ReactNode) {
  return (
    <MainLayout>
      <PaymentLayout>{page}</PaymentLayout>
    </MainLayout>
  );
};

export default PaymentRoutes;

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
    const [userResponse, journeyResponse] = await Promise.all([
      sdk.MeCheckUser(
        {},
        {
          cookie: context.req.headers.cookie?.toString() ?? "",
        }
      ),
      sdk.MeUserJourney(
        {},
        {
          cookie: context.req.headers.cookie?.toString() ?? "",
        }
      ),
    ]);

    const journey = journeyResponse.meUserJourney;
    if (!journey.hostOnboardingCompleted || !journey.hostId) {
      return {
        redirect: {
          destination: journey.suggestedRoute || "/onboarding-host/host-type",
          permanent: false,
        },
      };
    }

    // While verification is pending NO management page is reachable — the host
    // adds payout details via the modal popped over the blocker instead.
    const _vGate = verificationGateRedirect(journey);
    if (_vGate) return _vGate;

    if (userResponse && userResponse.meUser) {
      const { _id, firstName, status, permissions } = userResponse.meUser;

      const canAccessMenu = hasAccess(
        permissions,
        PermissionTypeEnum.PayoutManagement
      );
      if (!canAccessMenu) {
        return {
          redirect: {
            destination: `/account/access-blocked?target=${PermissionTypeEnum.PayoutManagement}`,
            permanent: false,
          },
        };
      }

      return {
        props: {
          repo: {
            pagePath: context.query["paymentSlug"]?.toString() ?? "",
            _id,
            firstName,
            status,
          },
        },
      };
    } else {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }
  } catch (error) {
    // console.error("Failed to fetch user details:", error);
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
};
