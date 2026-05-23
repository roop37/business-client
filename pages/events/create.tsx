import { GetServerSideProps } from "next";

const EventCreateRedirect = () => null;

export default EventCreateRedirect;

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: "/events?create=1",
    permanent: false,
  },
});
