import { GetServerSideProps } from "next";

const LegacyVerificationPendingPage = () => null;

export default LegacyVerificationPendingPage;

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: "/blocker/admin-verification-pending",
    permanent: false,
  },
});
