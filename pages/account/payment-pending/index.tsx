import { GetServerSideProps } from "next";

const LegacyPaymentPendingPage = () => null;

export default LegacyPaymentPendingPage;

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: "/dashboard",
    permanent: false,
  },
});
