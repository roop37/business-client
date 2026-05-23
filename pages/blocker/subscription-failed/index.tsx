import { GetServerSideProps } from "next";

const SubscriptionFailed = () => null;

export default SubscriptionFailed;

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: "/dashboard",
    permanent: false,
  },
});
