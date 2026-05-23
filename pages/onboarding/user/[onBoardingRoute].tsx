import { GetServerSideProps } from "next";

export default function LegacyBusinessOnboardingRedirect() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: "/onboarding-host/host-type",
    permanent: false,
  },
});
