import type { Metadata } from "next";
import {
  Bodoni_Moda,
  Figtree,
  Karla,
  Libre_Caslon_Display,
  Manrope,
  Roboto_Flex,
  Tenor_Sans,
} from "next/font/google";
import { AppGlobals } from "./AppGlobals";
import "../styles/globals.css";

const font = Roboto_Flex({
  subsets: ["latin"],
});

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

// Marketing-only display + body faces. Exposed as CSS vars so the
// `.hoizr-marketing` wrapper (styles/marketing-tokens.css) can pick
// them up without polluting the dashboard's font stack.
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

export const metadata: Metadata = {
  metadataBase: new URL("https://business.hoizr.com"),
  title: {
    default:
      "Hoizr — Ticketing & marketing for Indian event organizers, venues, and promoters",
    template: "%s · Hoizr",
  },
  description:
    "Hoizr is the ticketing, marketing, and ops platform built for Indian event organizers, venues, and promoters. Lowest commission in India, owned fan CRM, AI event-specific pricing.",
  applicationName: "Hoizr",
  keywords: [
    // Audience-targeted
    "event organizers India",
    "event organizers in India",
    "Indian event promoters",
    "live music venues India",
    "nightclubs India",
    "festival organizers India",
    "club promoters India",
    "concert promoters India",
    // Product-targeted
    "event ticketing platform India",
    "ticketing platform for organizers",
    "concert ticketing software India",
    "festival ticketing software",
    "club night ticketing India",
    "event marketing platform India",
    "venue management software India",
    "fan CRM for events",
    "lowest commission ticketing India",
    "AI event pricing",
    // City-targeted (top metros for live nights)
    "event organizers Mumbai",
    "event organizers Bangalore",
    "event organizers Delhi",
    "event organizers Hyderabad",
    "event organizers Pune",
    "event organizers Chennai",
    "event organizers Goa",
    // Brand
    "Hoizr",
    "Hoizr Business",
    "Hoizr Technologies",
  ],
  authors: [
    { name: "Hoizr Technologies Pvt. Ltd.", url: "https://business.hoizr.com" },
  ],
  creator: "Hoizr Technologies Pvt. Ltd.",
  publisher: "Hoizr Technologies Pvt. Ltd.",
  category: "Events",
  alternates: {
    canonical: "/",
    languages: {
      "en-IN": "/",
      "x-default": "/",
    },
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://business.hoizr.com",
    siteName: "Hoizr",
    title:
      "Hoizr — Ticketing & marketing for Indian event organizers, venues, and promoters",
    description:
      "Direct ticketing, owned fan CRM, and event-specific AI pricing. Built for India's clubs, festivals, comedy promoters, and live music venues.",
    images: [
      {
        url: "/opengraph-image.webp",
        width: 1200,
        height: 630,
        alt: "Hoizr — India's ticketing and marketing platform for event organizers, venues, and promoters",
      },
    ],
    countryName: "India",
  },
  twitter: {
    card: "summary_large_image",
    site: "@hoizr",
    creator: "@hoizr",
    title:
      "Hoizr — Ticketing & marketing for Indian event organizers, venues, and promoters",
    description:
      "Direct ticketing, owned fan CRM, AI commission pricing. Built for India's live music, comedy, and festival circuit.",
    images: ["/opengraph-image.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  // Geo + audience targeting picked up by some crawlers + AI agents.
  // geo.region (ISO 3166-2) plus geo.placename keeps the location
  // signal explicit even on engines that don't fully parse OG.
  other: {
    "geo.region": "IN",
    "geo.placename": "India",
    "geo.position": "20.5937;78.9629",
    ICBM: "20.5937, 78.9629",
    "DC.coverage": "India",
    "DC.audience":
      "Event organizers, venues, promoters, festival hosts, comedy promoters, nightclub operators",
    "DC.language": "en-IN",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Hoizr Business Blog RSS"
          href="/rss.xml"
        />
      </head>
      <body
        className={`${font.className} ${karla.variable} ${tenor.variable} ${libre.variable} ${figtree.variable} ${bodoniModa.variable} ${manrope.variable}`}
      >
        <AppGlobals>{children}</AppGlobals>
      </body>
    </html>
  );
}
