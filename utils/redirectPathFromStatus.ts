import { UserStatus } from "@/generated/graphql";
import { GetServerSidePropsResult } from "next";

export const redirectPathFromStatus = (
  status: UserStatus,
  _isBusiness: boolean
): GetServerSidePropsResult<any> => {
  switch (status) {
    case UserStatus.Blocked:
      return {
        redirect: {
          destination: "/account/blocked",
          permanent: false,
        },
      };
    case UserStatus.OnboardingPending:
      return {
        redirect: {
          destination: "/onboarding-host/host-type",
          permanent: false,
        },
      };

    case UserStatus.InternalVerificationPending:
      return {
        redirect: {
          destination: "/dashboard",
          permanent: false,
        },
      };
    case UserStatus.Active:
      return {
        redirect: {
          destination: "/dashboard",
          permanent: false,
        },
      };
    default:
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
  }
};
