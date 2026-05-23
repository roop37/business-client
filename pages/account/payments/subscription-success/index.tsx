import { GetServerSideProps } from "next";

const LegacySubscriptionSuccessPage = () => null;

export default LegacySubscriptionSuccessPage;

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: "/dashboard",
    permanent: false,
  },
});
