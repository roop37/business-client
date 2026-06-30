import type { GetServerSideProps } from "next";

// Legacy route. The /profile page has been replaced by the unified
// Settings modal — anyone hitting /profile (bookmark, old email link,
// etc.) is redirected to the dashboard with ?settings=account so the
// modal opens on the right tab.
const Profile = () => null;

export default Profile;

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: "/dashboard?settings=account",
    permanent: false,
  },
});
