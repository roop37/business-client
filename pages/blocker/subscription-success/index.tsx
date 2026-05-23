import { GetServerSideProps } from "next";

const SubscriptionSuccess = () => null;

export default SubscriptionSuccess;

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: "/dashboard",
    permanent: false,
  },
});
