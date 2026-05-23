import MenuSection from "@/components/common/menuSection/menuSection";
import MainLayout from "@/components/layouts/mainBodyLayout";
import Loader from "@/components/loader";
import BusinessInformationForm from "@/components/modules/profile/forms/businessInformationForm";
import IdentityVerificationForm from "@/components/modules/profile/forms/identityVerificationForm";
import UserBasicInformationForm from "@/components/modules/profile/forms/userBasicInformationForm";
import {
  PermissionTypeEnum,
} from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import useProfileStore from "@/store/profile";
import { useBasicProfileStore } from "@/store/profileBasicEditStore";
import useUserStore from "@/store/user";
import { sdk } from "@/utils/graphqlClient";
import { hasAccess } from "@/utils/hasAccess";
import { GetServerSideProps } from "next";
import React, { useEffect, useState } from "react";

type NextPageWithLayout = React.FC & {
  getLayout?: (page: React.ReactNode) => React.ReactNode;
};

type UserRepo = {
  _id: string;
  firstName: string;
};

const Profile: NextPageWithLayout = ({ repo }: { repo?: UserRepo }) => {
  const { setSelectedSideBarMenu } = useGlobalStore();
  const [canUpdateBusinessDetails, setCanUpdateBusinessDetails] =
    useState(false);
  const { meUser } = useUserStore();

  const {
    setAddressLine1,
    setAddressLine2,
    setCity,
    setCords,
    setPlace,
    setZipcode,
    setState,
    setBusinessName,
    setBusinessType,
    // setEin,
    setid,
  } = useProfileStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // setSelectedSideBarMenu("");

    const fetchRestaurantDetails = async () => {
      try {
        const response = await sdk.MeUserforProfile();
        if (response && response.meUser) {
          const {
            _id,
            email,
            firstName,
            lastName,
            phone,
            enable2FA,
            accountPreferences,
          } = response.meUser;
          useBasicProfileStore.getState().setProfileData({
            _id: _id ?? "",
            email: email ?? "",
            firstName: firstName ?? "",
            lastName: lastName ?? "",
            phone: phone ?? "",
            accountPreferences: accountPreferences ?? undefined,
            twoFactorAuth: enable2FA ?? false,
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching host details:", error);
        setLoading(false);
      }
    };

    const fetchBusinessDetails = async () => {
      try {
        const response = await sdk.userBusinessDetails();
        const {
          businessType,
          name,
          address,
          // ein,
          _id,
        } = response.userBusinessDetails;

        setid(_id);
        setAddressLine1(address?.addressLine1 || "");
        setAddressLine2(address?.addressLine2 || "");
        setCity(address?.city || "");
        setCords(address?.coordinate?.coordinates || [0, 0]);
        setPlace({
          displayName: address?.place?.displayName || "",
          placeId: address?.place?.placeId || "",
        });
        setZipcode(address?.zipcode || 0);
        setState({
          id: address?.state?.stateId || "",
          value: address?.state?.stateName || "",
        });
        setBusinessName(name || "");
        setBusinessType(businessType || "");
        // setEin(ein || "");
        setLoading(false);
      } catch (error) {
        console.error("Error fetching business details:", error);
        setLoading(false);
      }
    };

    if ((meUser?.permissions?.length ?? 0) > 0) {
      const canUpdateRestaurant = hasAccess(
        meUser?.permissions ?? [],
        PermissionTypeEnum.UpdateHost
      );
      setCanUpdateBusinessDetails(canUpdateRestaurant);
    }

    fetchRestaurantDetails();
    fetchBusinessDetails();
  }, [
    meUser?.permissions,
    setAddressLine1,
    setAddressLine2,
    setBusinessName,
    setBusinessType,
    setCity,
    setCords,
    // setEin,
    setPlace,
    setState,
    setZipcode,
    setid,
  ]);
  if (loading) {
    return <Loader />;
  }

  const contentList = canUpdateBusinessDetails
    ? [
        {
          id: "userBasicInformation",
          title: "Personal",
          Component: UserBasicInformationForm,
        },
        {
          id: "businessInformation",
          title: "Billing",
          Component: BusinessInformationForm,
        },

        {
          id: "identityVerification",
          title: "Security",
          Component: IdentityVerificationForm,
        },
      ]
    : [
        {
          id: "userBasicInformation",
          title: "Personal",
          Component: UserBasicInformationForm,
        },
        {
          id: "identityVerification",
          title: "Security",
          Component: IdentityVerificationForm,
        },
      ];

  return (
    <div className="text-black">
      <MenuSection contentList={contentList} />
    </div>
  );
};

Profile.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout>{page}</MainLayout>;
};

export default Profile;
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

    if (userResponse && userResponse.meUser) {
      const { _id, firstName, status } = userResponse.meUser;
      // TODO:NEED TO DISCUSS TO GIVE ACCESS TO UPDATE PERSONAL INFORMATION TO SUB USERS
      // const canAccessProfile = hasAccess(permissions, PermissionTypeEnum.UpdateHost);
      // if (!canAccessProfile) {
      //   return {
      //     redirect: {
      //       destination: `/account/access-blocked?target=${PermissionTypeEnum.UpdateHost}`,
      //       permanent: false,
      //     },
      //   };
      // }
      return {
        props: {
          repo: {
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
