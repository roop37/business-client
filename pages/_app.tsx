import PayoutModals from "@/components/common/payout/PayoutModals";
import Toast from "@/components/common/toast/toast";
import GlobalTopUpModal from "@/components/common/topup/GlobalTopUpModal";
import useGlobalStore from "@/store/global";
import { NextPage } from "next";
import { DefaultSeo } from "next-seo";
import { AppProps } from "next/app";
import {
  Bodoni_Moda,
  Figtree,
  Karla,
  Libre_Caslon_Display,
  Manrope,
  Roboto_Flex,
  Tenor_Sans,
} from "next/font/google";
import Head from "next/head";
import NextNProgress from "nextjs-progressbar";
import { ReactNode, useEffect } from "react";
import "../styles/globals.css";

const seo = {
  title: "Hoizr - Event Operations for Hosts and Venues",
  description:
    "Hoizr helps hosts, venues, and event teams manage onboarding, operations, payments, and growth.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://business.hoizr.com",
    site_name: "Hoizr - Event Operations for Hosts and Venues",
    images: [
      {
        url: "https://business.hoizr.com/opengraph-image.webp",
        width: 1200,
        height: 630,
        alt: "Hoizr - Event Operations for Hosts and Venues",
      },
    ],
    canonical: "./",
  },
};

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactNode) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};
const font = Roboto_Flex({
  subsets: ["latin"],
});
// Website Builder Fonts
const karla = Karla({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-karla",
  display: "swap",
});

const figtree = Figtree({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const libre = Libre_Caslon_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-libre",
  display: "swap",
});

const tenor = Tenor_Sans({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-tenor",
  display: "swap",
});

// Marketing-site fonts. Used only on /, /about, /product/*, /blog/*
// via the .hoizr-marketing wrapper. Bodoni Moda is the wordmark +
// display face; Manrope is the body face.
const bodoniModa = Bodoni_Moda({
  weight: ["400", "500", "700", "800"],
  subsets: ["latin"],
  variable: "--font-bodoni-moda",
  display: "swap",
  adjustFontFallback: false,
});
const manrope = Manrope({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout || ((page: ReactNode) => page);
  const { toastData } = useGlobalStore();

  useEffect(() => {
    const preventNumberWheel = (event: WheelEvent) => {
      const activeElement = document.activeElement as HTMLInputElement | null;
      if (activeElement?.tagName === "INPUT" && activeElement.type === "number") {
        event.preventDefault();
      }
    };

    document.addEventListener("wheel", preventNumberWheel, { passive: false });
    return () => document.removeEventListener("wheel", preventNumberWheel);
  }, []);

  return (
    <div
      className={`${font.className} ${karla.variable} ${tenor.variable} ${libre.variable} ${figtree.variable} ${bodoniModa.variable} ${manrope.variable}`}
    >
        <NextNProgress color="#191C24" />
        <Head>
          <meta
            name="viewport"
            content="width=device-width, height=device-height, initial-scale=1.0, user-scalable=no"
          />
          <meta name="mobile-web-app-capable" content="yes" />
        </Head>
        <DefaultSeo {...seo} />
        {getLayout(<Component {...pageProps} />)}
        <PayoutModals />
        <GlobalTopUpModal />
        {toastData && (
          <Toast message={toastData.message} type={toastData.type} />
        )}
    </div>
  );
}

export default MyApp;
