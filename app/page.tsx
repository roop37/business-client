import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { AiSection } from "@/components/marketing/sections/AiSection";
import { Beliefs } from "@/components/marketing/sections/Beliefs";
// import { ComingSoon } from "@/components/marketing/sections/ComingSoon"; // hidden for now — not shown on the home page yet
import { EventFormats } from "@/components/marketing/sections/EventFormats";
import { FAQ } from "@/components/marketing/sections/FAQ";
import { FeatureBlocks } from "@/components/marketing/sections/FeatureBlocks";
import { FinalCTA } from "@/components/marketing/sections/FinalCTA";
import { FounderCard } from "@/components/marketing/sections/FounderCard";
import { FreeToStart } from "@/components/marketing/sections/FreeToStart";
import { GetPaidSection } from "@/components/marketing/sections/GetPaidSection";
import { Hero } from "@/components/marketing/sections/Hero";
import { ProblemSection } from "@/components/marketing/sections/ProblemSection";
import { TheShift } from "@/components/marketing/sections/TheShift";

export const metadata: Metadata = {
  title:
    "Hoizr — Event ticketing, fan CRM & marketing for Indian organizers",
  description:
    "Sell event tickets online or in cash, keep every buyer as your own customer, and run the door — even offline. Hoizr is the ticketing, fan CRM, and marketing platform built for Indian event organizers, venues, and promoters. Free to start, no subscription.",
  alternates: {
    canonical: "/",
    languages: { "en-IN": "/", "x-default": "/" },
  },
  // Next.js does not deep-merge `openGraph` — declaring it here
  // replaces the layout block in full, so the images array has to
  // be repeated explicitly or the home page ships with no OG image.
  openGraph: {
    title:
      "Hoizr — Event ticketing, fan CRM & marketing for Indian organizers",
    description:
      "Sell tickets, own every fan, and run the door. The event platform built for India's clubs, festivals, comedy, gigs, and house parties — not the marketplace.",
    url: "/",
    type: "website",
    siteName: "Hoizr",
    locale: "en_IN",
    countryName: "India",
    images: [
      {
        url: "/opengraph-image.webp",
        width: 1200,
        height: 630,
        alt: "Hoizr — India's event ticketing, fan CRM, and marketing platform for organizers",
      },
    ],
  },
};

export default function Home() {
  return (
    <MarketingShell>
      <Hero />
      <EventFormats />
      <ProblemSection />
      <TheShift />
      <FeatureBlocks />
      <GetPaidSection />
      <AiSection />
      <FreeToStart />
      {/* <ComingSoon /> */}{/* hidden for now — not shown on the home page yet */}
      <Beliefs />
      <FounderCard />
      <FAQ />
      <FinalCTA />
    </MarketingShell>
  );
}
