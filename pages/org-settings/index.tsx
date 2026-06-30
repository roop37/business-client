import type { GetServerSideProps } from "next";

// Legacy route. The /org-settings page has been replaced by the
// unified Settings modal — anyone hitting /org-settings (bookmark, old
// email link, etc.) is redirected to the dashboard with ?settings=brand
// so the modal opens on the Organisation tab.
const OrgSettings = () => null;

export default OrgSettings;

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: "/dashboard?settings=brand",
    permanent: false,
  },
});
