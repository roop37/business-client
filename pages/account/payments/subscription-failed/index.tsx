import { GetServerSideProps } from "next";

const LegacySubscriptionFailedPage = () => null;

export default LegacySubscriptionFailedPage;

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: "/dashboard",
    permanent: false,
  },
});
