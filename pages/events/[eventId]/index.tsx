import type { GetServerSideProps } from "next";

/**
 * The old Event Hub has been merged into Manage Event — an event now lives on
 * a single page (config + guest lists + activity: orders/offline/customers).
 * This route just redirects to /events/[id]/manage so old links/bookmarks
 * keep working.
 */
export default function EventHubRedirect() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const eventId =
    typeof context.params?.eventId === "string" ? context.params.eventId : "";
  return {
    redirect: {
      destination: eventId ? `/events/${eventId}/manage` : "/events",
      permanent: false,
    },
  };
};
