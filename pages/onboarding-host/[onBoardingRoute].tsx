import NotFound from "@/components/common/notFound/notFound";
import OnboardingRestaurantLayout from "@/components/layouts/onboardingResLayout";
import HostTypeSelection from "@/components/modules/onboarding/hostTypeSelection";
import HostAddress from "@/components/modules/onboarding/hostAvailibility";
import HostAdditionalInformation from "@/components/modules/onboarding/hostAdditionalInfo";
import RestaurantOnboardingStore from "@/store/hostOnboarding";
import { sdk } from "@/utils/graphqlClient";
import { GetServerSideProps } from "next";
import { useEffect } from "react";

type HomePageProps = {
  repo: {
    pagePath: string;
    address?: any;
    name?: any;
    email?: any;
    phone?: any;
    description?: any;
    logo?: any;
    hostType?: any;
    venueType?: any;
    status?: any;
    onboardingCompleted?: boolean;
    isAdminVerified?: boolean;
    businessRegistrationNumber?: string | null;
    averageEventSize?: string | number | null;
    gstNumber?: string | null;
    websiteUrl?: string | null;
  };
};

const OnboardingPage = ({ repo }: HomePageProps) => {
  const {
    setHostType,
    setVenueType,
    setName,
    setEmail,
    setPhone,
    setDescription,
    setLogo,
    setAddressLine1,
    setAddressLine2,
    setCity,
    setState,
    setPincode,
    setCords,
    setPlace,
    setBusinessRegistrationNumber,
    setAverageEventSize,
    setGstNumber,
    setWebsiteUrl,
  } = RestaurantOnboardingStore();

  useEffect(() => {
    setHostType(repo?.hostType ?? "");
    setVenueType(repo?.venueType ?? "");
    setName(repo?.name ?? "");
    setEmail(repo?.email ?? "");
    setPhone(repo?.phone ?? "");
    setDescription(repo?.description ?? "");
    setLogo(repo?.logo ?? "");
    setAddressLine1(repo?.address?.addressLine1 ?? "");
    setAddressLine2(repo?.address?.addressLine2 ?? "");
    setCity(repo?.address?.city ?? "");
    setPincode(repo?.address?.pincode ?? "");
    setCords(repo?.address?.coordinate?.coordinates ?? []);
    setPlace(repo?.address?.place ?? { displayName: "", placeId: "" });
    setBusinessRegistrationNumber(repo?.businessRegistrationNumber ?? "");
    setAverageEventSize(
      repo?.averageEventSize !== null && repo?.averageEventSize !== undefined
        ? String(repo.averageEventSize)
        : ""
    );
    setGstNumber(repo?.gstNumber ?? "");
    setWebsiteUrl(repo?.websiteUrl ?? "");
    setState(
      repo?.address?.state
        ? typeof repo.address.state === "string"
          ? { id: repo.address.state, value: repo.address.state }
          : {
              id: repo.address.state.stateId ?? "",
              value: repo.address.state.stateName ?? "",
            }
        : null
    );
  }, [
    repo,
    setHostType,
    setVenueType,
    setName,
    setEmail,
    setPhone,
    setDescription,
    setLogo,
    setAddressLine1,
    setAddressLine2,
    setCity,
    setState,
    setPincode,
    setCords,
    setPlace,
    setBusinessRegistrationNumber,
    setAverageEventSize,
    setGstNumber,
    setWebsiteUrl,
  ]);

  let childComponent;

  switch (repo.pagePath) {
    case "host-type":
    case "host-basic-info":
      childComponent = <HostTypeSelection />;
      break;
    case "host-address":
      childComponent = <HostAddress />;
      break;
    case "host-additional-info":
      childComponent = <HostAdditionalInformation />;
      break;

    default:
      childComponent = <NotFound />;
      break;
  }

  return (
    <OnboardingRestaurantLayout>{childComponent}</OnboardingRestaurantLayout>
  );
};

export default OnboardingPage;

export const getServerSideProps: GetServerSideProps<HomePageProps> = async (
  context
) => {
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

  const pagePath = context.query["onBoardingRoute"]?.toString() ?? "";
  const wantsFreshHost = context.query["create"]?.toString() === "1";

  // When the user clicked "+ Add new host", skip reading the in-progress
  // onboarding data so the form renders blank. The HOST_ID_ONBOARDING cookie
  // is cleared by the sidebar's "+ Add new host" handler (browser-originated
  // mutation that propagates Set-Cookie back to the user's browser) BEFORE
  // it navigates here. Falling through to a blank `repo` for safety in case
  // someone landed here with `?create=1` directly.
  if (wantsFreshHost) {
    return { props: { repo: { pagePath } } };
  }

  try {
    const response = await sdk.hostOnboardingData(
      {},
      { cookie: context.req.headers.cookie?.toString() ?? "" }
    );

    if (response && response.hostOnboardingData) {
      const data = response.hostOnboardingData as any;
      return {
        props: {
          repo: {
            pagePath,
            address: data.address ?? null,
            name: data.name ?? null,
            email: data.email ?? null,
            phone: data.phone ?? null,
            description: data.description ?? null,
            logo: data.logo ?? null,
            hostType: data.hostType ?? null,
            venueType: data.venueType ?? null,
            status: data.status ?? null,
            onboardingCompleted: data.onboardingCompleted ?? false,
            isAdminVerified: data.isAdminVerified ?? false,
            businessRegistrationNumber:
              data.businessRegistrationNumber ?? null,
            averageEventSize: data.averageEventSize ?? null,
            gstNumber: data.gstNumber ?? null,
            websiteUrl: data.websiteUrl ?? null,
          },
        },
      };
    }

    return { props: { repo: { pagePath } } };
  } catch (error) {
    return { props: { repo: { pagePath } } };
  }
};
