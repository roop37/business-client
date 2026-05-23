import { GetServerSideProps } from "next";
import React from "react";

type NextPageWithLayout = React.FC & {
  getLayout?: (page: React.ReactNode) => React.ReactNode;
};

const Payment: NextPageWithLayout = () => {
  return null;
};

Payment.getLayout = function getLayout(page: React.ReactNode) {
  return page;
};

export default Payment;

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: "/payment/payouts",
    permanent: false,
  },
});
