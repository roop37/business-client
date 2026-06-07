import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: "/campaigns/email",
    permanent: false,
  },
});

const CampaignsIndex = () => null;

export default CampaignsIndex;
